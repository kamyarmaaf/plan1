import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Target, TrendingUp, Trophy, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface Goal {
  id: string
  title: string
  category: 'fitness' | 'learning' | 'career' | 'personal'
  progress: number
  target: string
}

interface Milestone {
  id: string
  title: string
  date: string
  completed: boolean
  description: string
}

interface AIVision {
  six_month_projection: string
  one_year_vision: string
}

const categoryColors = {
  fitness: 'bg-chart-1',
  learning: 'bg-chart-2', 
  career: 'bg-chart-4',
  personal: 'bg-chart-5'
}

export function MonthlyPlanner() {
  const [currentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<Goal[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [aiVision, setAiVision] = useState<AIVision | null>(null)
  const { toast } = useToast()

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  useEffect(() => {
    const fetchMonthlyPlan = async () => {
      try {
        setLoading(true)
        const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string) || '/').replace(/\/?$/, '/')
        const accessToken = localStorage.getItem('accessToken')

        // First try to get existing data from comprehensive endpoint
        let response = await fetch(`${API_BASE_URL}api/plan/comprehensive`, {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        })

        let monthlyData = null
        if (response.ok) {
          const data = await response.json()
          monthlyData = data?.data?.monthly_plan
        }

        // If no existing monthly data, generate new AI-powered plan
        if (!monthlyData) {
          response = await fetch(`${API_BASE_URL}api/ai/monthly-planning`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          })

          if (!response.ok) {
            throw new Error(`Failed to generate monthly plan: ${response.status}`)
          }

          const data = await response.json()
          monthlyData = data?.data
        }

        if (monthlyData) {
          // Set AI vision
          if (monthlyData.ai_vision) {
            setAiVision(monthlyData.ai_vision)
          }

          // Set goals
          if (Array.isArray(monthlyData.monthly_goals)) {
            setGoals(monthlyData.monthly_goals)
          }

          // Set milestones
          if (Array.isArray(monthlyData.milestones)) {
            setMilestones(monthlyData.milestones)
          }
        } else {
          // Fallback to basic structure if no data available
          setAiVision({
            six_month_projection: "Complete your profile to get personalized AI recommendations for your 6-month goals and achievements.",
            one_year_vision: "With consistent effort and the right planning, you'll achieve significant progress in your chosen areas of focus."
          })
        }

      } catch (error) {
        console.error('Error fetching monthly plan:', error)
        toast({
          title: "Failed to load monthly plan",
          description: "Please try again or complete your profile for AI recommendations.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyPlan()
  }, [toast])

  const generateNewPlan = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string) || '/').replace(/\/?$/, '/')
      const accessToken = localStorage.getItem('accessToken')

      const response = await fetch(`${API_BASE_URL}api/ai/monthly-planning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to generate monthly plan: ${response.status}`)
      }

      const data = await response.json()
      const monthlyData = data?.data

      if (monthlyData) {
        if (monthlyData.ai_vision) {
          setAiVision(monthlyData.ai_vision)
        }
        if (Array.isArray(monthlyData.monthly_goals)) {
          setGoals(monthlyData.monthly_goals)
        }
        if (Array.isArray(monthlyData.milestones)) {
          setMilestones(monthlyData.milestones)
        }

        toast({
          title: "New plan generated!",
          description: "Your monthly goals and milestones have been updated with AI recommendations.",
        })
      }
    } catch (error) {
      console.error('Error generating new plan:', error)
      toast({
        title: "Failed to generate plan",
        description: "Please try again or complete your profile for better AI recommendations.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monthly Overview</h1>
          <p className="text-muted-foreground">{monthYear} Planning & Goals</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={generateNewPlan} 
            disabled={loading}
            data-testid="button-generate-plan"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            {loading ? "Generating..." : "Regenerate AI Plan"}
          </Button>
          <Button variant="outline" size="icon" data-testid="button-prev-month">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" data-testid="button-next-month">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Vision */}
      <Card className="border-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-foreground" />
            AI-Powered Vision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading AI insights...</span>
            </div>
          ) : (
            <>
              <div className="bg-accent/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">6-Month Projection</h3>
                <p className="text-sm text-muted-foreground">
                  {aiVision?.six_month_projection || "Complete your profile to get personalized AI recommendations."}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">1-Year Vision</h3>
                <p className="text-sm text-muted-foreground">
                  {aiVision?.one_year_vision || "With consistent effort and planning, you'll achieve your long-term goals."}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Monthly Goals
            </CardTitle>
            <CardDescription>Track your progress this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading goals...</span>
              </div>
            ) : goals.length > 0 ? (
              goals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{goal.title}</h3>
                    <Badge 
                      variant="secondary" 
                      className={`${categoryColors[goal.category]}/20 text-foreground`}
                    >
                      {goal.category}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{goal.target}</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${categoryColors[goal.category]}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Complete your profile to get AI-generated monthly goals
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Key Milestones
            </CardTitle>
            <CardDescription>Important achievements this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading milestones...</span>
              </div>
            ) : milestones.length > 0 ? (
              milestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    milestone.completed ? 'bg-chart-1/10 border-chart-1/30' : 'bg-muted/30'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                    milestone.completed ? 'bg-chart-1 text-white' : 'bg-muted-foreground/30'
                  }`}>
                    {milestone.completed && <Trophy className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${milestone.completed ? 'text-chart-1' : ''}`}>
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {milestone.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(milestone.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Complete your profile to get AI-generated milestones
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}