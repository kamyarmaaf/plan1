import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Target, TrendingUp, Trophy, ChevronLeft, ChevronRight } from "lucide-react"

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

// todo: remove mock functionality
const mockGoals: Goal[] = [
  { id: '1', title: 'Read 4 Books', category: 'learning', progress: 75, target: '4 books' },
  { id: '2', title: 'Run 100km', category: 'fitness', progress: 60, target: '100km total' },
  { id: '3', title: 'Complete React Course', category: 'career', progress: 45, target: '100% completion' },
  { id: '4', title: 'Meditation Streak', category: 'personal', progress: 85, target: '30 days' },
]

const mockMilestones: Milestone[] = [
  { id: '1', title: 'Complete morning routine for 7 days', date: '2024-01-15', completed: true, description: 'Build consistent wake-up habits' },
  { id: '2', title: 'Finish "Atomic Habits" book', date: '2024-01-20', completed: true, description: 'Apply key concepts to daily life' },
  { id: '3', title: 'Run first 10k of the month', date: '2024-01-25', completed: false, description: 'Improve cardiovascular fitness' },
  { id: '4', title: 'Complete 3 coding projects', date: '2024-01-30', completed: false, description: 'Build portfolio and skills' },
]

const categoryColors = {
  fitness: 'bg-chart-1',
  learning: 'bg-chart-2', 
  career: 'bg-chart-4',
  personal: 'bg-chart-5'
}

export function MonthlyPlanner() {
  const [currentMonth] = useState(new Date())

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monthly Overview</h1>
          <p className="text-muted-foreground">{monthYear} Planning & Goals</p>
        </div>
        <div className="flex gap-2">
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
          <div className="bg-accent/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">6-Month Projection</h3>
            <p className="text-sm text-muted-foreground">
              At your current pace, you'll complete 24 books this year, achieve a 5K personal best, 
              and master 3 new programming frameworks. Consistency in your morning routine is your key strength.
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">1-Year Vision</h3>
            <p className="text-sm text-muted-foreground">
              By maintaining these habits, you'll develop expertise in full-stack development, 
              complete a marathon, and establish yourself as a knowledge leader in your field.
            </p>
          </div>
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
            {mockGoals.map((goal) => (
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
            ))}
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
            {mockMilestones.map((milestone) => (
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
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}