import { useState, useEffect } from "react"
import { Switch, Route } from "wouter"
import { queryClient } from "./lib/queryClient"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeProvider } from "./components/ThemeProvider"
import { ThemeToggle } from "./components/ThemeToggle"
import { LanguageProvider } from "./contexts/LanguageContext"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { LanguageToggle } from "./components/LanguageToggle"
import { AppSidebar } from "./components/AppSidebar"
import { AuthForm } from "./components/AuthForm"
import { ProfileSetup } from "./components/ProfileSetup"
import { DailyDashboard } from "./components/DailyDashboard"
import { MonthlyPlanner } from "./components/MonthlyPlanner"
import { Goals } from "./components/Goals"
import { ProgressTracking } from "./components/ProgressTracking"
import { ContactForm } from "./components/ContactForm"
import NotFound from "@/pages/not-found"

type AppState = 'auth' | 'profile-setup' | 'app'

function Router() {
  return (
    <Switch>
      <Route path="/" component={DailyDashboard} />
      <Route path="/dashboard" component={DailyDashboard} />
      <Route path="/monthly" component={MonthlyPlanner} />
      <Route path="/progress" component={ProgressTracking} />
      <Route path="/goals" component={Goals} />
      <Route path="/contact" component={ContactForm} />
      <Route path="/settings">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">Settings</h1>
          <p className="text-muted-foreground">Settings panel coming soon...</p>
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  )
}

function AppContent() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();
  const [appState, setAppState] = useState<AppState>('auth');
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';

  // Custom sidebar width for life planning application
  const style = {
    "--sidebar-width": "20rem",       // 320px for better content
    "--sidebar-width-icon": "4rem",   // default icon width
  }

  // Check if user has a profile when authenticated
  useEffect(() => {
    const checkProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const accessToken = localStorage.getItem('accessToken');
          const response = await fetch(`${API_BASE_URL}api/profile/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          
          if (response.ok) {
            setHasProfile(true);
            setAppState('app');
          } else if (response.status === 404) {
            setHasProfile(false);
            setAppState('profile-setup');
          } else {
            // If there's an auth error, logout
            logout();
          }
        } catch (error) {
          console.error('Error checking profile:', error);
          logout();
        }
      }
    };

    if (isAuthenticated) {
      checkProfile();
    } else {
      setHasProfile(null);
      setAppState('auth');
    }
  }, [isAuthenticated, user, logout]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle authentication success
  const handleAuthSuccess = (userData: any, accessToken: string, refreshToken: string) => {
    login(userData, accessToken, refreshToken);
  };

  if (appState === 'auth') {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  if (appState === 'profile-setup') {
    return <ProfileSetup onComplete={() => setAppState('app')} />
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              <Router />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="lifeplan-ui-theme">
            <TooltipProvider>
              <AppContent />
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}