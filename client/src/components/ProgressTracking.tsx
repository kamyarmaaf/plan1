import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Award, Calendar, Target } from "lucide-react"

// todo: remove mock functionality  
const mockWeeklyData = [
  { name: 'Mon', completed: 8, planned: 10 },
  { name: 'Tue', completed: 9, planned: 10 },
  { name: 'Wed', completed: 7, planned: 10 },
  { name: 'Thu', completed: 10, planned: 10 },
  { name: 'Fri', completed: 6, planned: 10 },
  { name: 'Sat', completed: 8, planned: 8 },
  { name: 'Sun', completed: 7, planned: 8 },
]

const mockMonthlyProgress = [
  { month: 'Oct', fitness: 85, learning: 75, work: 90, personal: 70 },
  { month: 'Nov', fitness: 88, learning: 82, work: 85, personal: 78 },
  { month: 'Dec', fitness: 92, learning: 88, work: 88, personal: 85 },
  { month: 'Jan', fitness: 90, learning: 95, work: 92, personal: 88 },
]

const mockCategoryBreakdown = [
  { name: 'Work/Study', value: 35, color: 'hsl(var(--chart-4))' },
  { name: 'Fitness', value: 25, color: 'hsl(var(--chart-1))' },
  { name: 'Learning', value: 20, color: 'hsl(var(--chart-2))' },
  { name: 'Personal', value: 20, color: 'hsl(var(--chart-5))' },
]

const achievements = [
  { title: '7-Day Streak', description: 'Completed morning routine for a week', date: '2024-01-15', type: 'consistency' },
  { title: 'Reading Goal Met', description: 'Finished 3 books this month', date: '2024-01-12', type: 'learning' },
  { title: 'Fitness Milestone', description: 'Ran 50km total this month', date: '2024-01-10', type: 'fitness' },
  { title: 'Work Excellence', description: 'Delivered project ahead of schedule', date: '2024-01-08', type: 'career' },
]

export function ProgressTracking() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Progress Tracking</h1>
        <p className="text-muted-foreground">Visualize your journey and celebrate achievements</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-chart-1" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">+5% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">91%</p>
              </div>
              <Calendar className="w-8 h-8 text-chart-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Goals Met</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              <Target className="w-8 h-8 text-chart-3" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">3 this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">{achievements.length}</p>
              </div>
              <Award className="w-8 h-8 text-chart-5" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Latest today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList data-testid="tabs-progress">
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Task Completion</CardTitle>
              <CardDescription>Planned vs completed tasks this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockWeeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="planned" fill="hsl(var(--muted))" name="Planned" />
                  <Bar dataKey="completed" fill="hsl(var(--chart-1))" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Progress Trends</CardTitle>
              <CardDescription>Performance across different life areas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockMonthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Line type="monotone" dataKey="fitness" stroke="hsl(var(--chart-1))" name="Fitness" strokeWidth={2} />
                  <Line type="monotone" dataKey="learning" stroke="hsl(var(--chart-2))" name="Learning" strokeWidth={2} />
                  <Line type="monotone" dataKey="work" stroke="hsl(var(--chart-4))" name="Work" strokeWidth={2} />
                  <Line type="monotone" dataKey="personal" stroke="hsl(var(--chart-5))" name="Personal" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>How you spend your planned time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockCategoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {mockCategoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {mockCategoryBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your latest milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-chart-1/20 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-chart-1" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}