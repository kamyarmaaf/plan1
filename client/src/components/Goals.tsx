import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Target, Trophy, Calendar, TrendingUp, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string) || '/').replace(/\/?$/, '/')

interface LongTermGoal {
  id: number
  title: string
  description: string
  category: 'fitness' | 'learning' | 'career' | 'personal' | 'financial'
  priority: number
  targetTimeframe: string
  progress: number
  status: 'active' | 'completed' | 'paused' | 'archived'
  aiContext?: string
  createdAt: string
  updatedAt: string
}

const categoryColors = {
  fitness: 'bg-chart-1 text-chart-1-foreground',
  learning: 'bg-chart-2 text-chart-2-foreground', 
  career: 'bg-chart-4 text-chart-4-foreground',
  personal: 'bg-chart-5 text-chart-5-foreground',
  financial: 'bg-chart-3 text-chart-3-foreground'
}

const categoryIcons = {
  fitness: TrendingUp,
  learning: Target,
  career: Trophy,
  personal: Target,
  financial: Calendar
}

const statusColors = {
  active: 'bg-green-500/10 text-green-700 dark:text-green-400',
  completed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  paused: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  archived: 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
}

export function Goals() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Fetch long-term goals
  const { data: goalsData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/goals'],
    queryFn: async () => {
      const accessToken = localStorage.getItem('accessToken')
      const response = await fetch(`${API_BASE_URL}api/goals`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch goals')
      }
      const data = await response.json()
      return data.goals as LongTermGoal[]
    }
  })

  // Auto-generate goals when none exist
  useEffect(() => {
    const autoGenerate = async () => {
      if (!goalsData || goalsData.length > 0) return
      try {
        const accessToken = localStorage.getItem('accessToken')
        const res = await fetch(`${API_BASE_URL}api/goals/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        })
        if (res.ok) {
          await refetch()
          toast({ title: 'Goals Generated', description: 'Your goals were created automatically.' })
        }
      } catch {}
    }
    autoGenerate()
  }, [goalsData])

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, updates }: { goalId: number, updates: Partial<LongTermGoal> }) => {
      const accessToken = localStorage.getItem('accessToken')
      const response = await fetch(`${API_BASE_URL}api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error('Failed to update goal')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] })
      toast({
        title: "Goal Updated",
        description: "Goal has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update goal",
        variant: "destructive",
      })
    }
  })

  // Generate goals mutation (if no goals exist)
  const generateGoalsMutation = useMutation({
    mutationFn: async () => {
      const accessToken = localStorage.getItem('accessToken')
      const response = await fetch(`${API_BASE_URL}api/goals/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      })
      if (!response.ok) {
        throw new Error('Failed to generate goals')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] })
      toast({
        title: "Goals Generated",
        description: "Your personalized long-term goals have been created!",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate goals",
        variant: "destructive",
      })
    }
  })

  const handleProgressUpdate = (goalId: number, progress: number) => {
    updateGoalMutation.mutate({ goalId, updates: { progress } })
  }

  const handleStatusUpdate = (goalId: number, status: LongTermGoal['status']) => {
    updateGoalMutation.mutate({ goalId, updates: { status } })
  }

  const handleGenerateGoals = () => {
    generateGoalsMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" data-testid="loader-goals" />
          <span className="text-muted-foreground">Loading your goals...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Failed to load goals</h3>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" data-testid="button-retry">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  const goals = goalsData || []

  if (goals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Your Long-Term Goals</h1>
          <p className="text-muted-foreground">
            Set meaningful goals to guide your personal and professional growth
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>No Goals Yet</CardTitle>
            <CardDescription>
              Get started by generating personalized long-term goals based on your profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleGenerateGoals}
              disabled={generateGoalsMutation.isPending}
              size="lg"
              data-testid="button-generate-goals"
            >
              {generateGoalsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Goals...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Generate My Goals
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Group goals by status
  const activeGoals = goals.filter(goal => goal.status === 'active')
  const completedGoals = goals.filter(goal => goal.status === 'completed')
  const otherGoals = goals.filter(goal => !['active', 'completed'].includes(goal.status))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Long-Term Goals</h1>
          <p className="text-muted-foreground">
            Track your progress towards meaningful life objectives
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" data-testid="badge-goals-count">
            {goals.length} Goals
          </Badge>
          <Button onClick={() => refetch()} variant="outline" size="sm" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Active Goals ({activeGoals.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => {
              const CategoryIcon = categoryIcons[goal.category]
              return (
                <Card key={goal.id} className="h-full" data-testid={`card-goal-${goal.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4" />
                        <Badge className={categoryColors[goal.category]} data-testid={`badge-category-${goal.id}`}>
                          {goal.category}
                        </Badge>
                      </div>
                      <Badge className="text-xs" data-testid={`badge-priority-${goal.id}`}>
                        Priority {goal.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight" data-testid={`title-goal-${goal.id}`}>
                      {goal.title}
                    </CardTitle>
                    <CardDescription className="text-sm" data-testid={`description-goal-${goal.id}`}>
                      {goal.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span data-testid={`progress-text-${goal.id}`}>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" data-testid={`progress-bar-${goal.id}`} />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span data-testid={`timeframe-${goal.id}`}>{goal.targetTimeframe}</span>
                      </div>
                      <Select
                        value={goal.progress.toString()}
                        onValueChange={(value) => handleProgressUpdate(goal.id, parseInt(value))}
                        disabled={updateGoalMutation.isPending}
                      >
                        <SelectTrigger className="w-24 h-7" data-testid={`select-progress-${goal.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 10, 25, 50, 75, 90, 100].map((progress) => (
                            <SelectItem key={progress} value={progress.toString()}>
                              {progress}%
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between items-center">
                      <Select
                        value={goal.status}
                        onValueChange={(value) => handleStatusUpdate(goal.id, value as LongTermGoal['status'])}
                        disabled={updateGoalMutation.isPending}
                      >
                        <SelectTrigger className="w-28 h-7" data-testid={`select-status-${goal.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {goal.aiContext && (
                        <div className="text-xs text-muted-foreground italic max-w-[150px] truncate" title={goal.aiContext}>
                          AI: {goal.aiContext}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Completed Goals ({completedGoals.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => {
              const CategoryIcon = categoryIcons[goal.category]
              return (
                <Card key={goal.id} className="h-full opacity-75" data-testid={`card-completed-goal-${goal.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4" />
                        <Badge className={categoryColors[goal.category]}>
                          {goal.category}
                        </Badge>
                      </div>
                      <Badge className={statusColors[goal.status]}>
                        ✓ Completed
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {goal.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {goal.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={100} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Completed in {goal.targetTimeframe}</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Other Goals (Paused/Archived) */}
      {otherGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Other Goals ({otherGoals.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherGoals.map((goal) => {
              const CategoryIcon = categoryIcons[goal.category]
              return (
                <Card key={goal.id} className="h-full opacity-60" data-testid={`card-other-goal-${goal.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4" />
                        <Badge className={categoryColors[goal.category]}>
                          {goal.category}
                        </Badge>
                      </div>
                      <Badge className={statusColors[goal.status]}>
                        {goal.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {goal.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={goal.progress} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{goal.targetTimeframe}</span>
                        <span>{goal.progress}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}