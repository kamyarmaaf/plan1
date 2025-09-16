import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"

interface AuthResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

export function AuthForm({ onAuthSuccess }: { onAuthSuccess: (user: any, accessToken: string, refreshToken: string) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleLogin = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data as AuthResponse;
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data as AuthResponse;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget);
      const isLogin = activeTab === "login";
      
      let response: AuthResponse;
      
      if (isLogin) {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        response = await handleLogin(email, password);
      } else {
        const name = formData.get("name") as string;
        const email = formData.get("reg-email") as string;
        const password = formData.get("reg-password") as string;
        response = await handleRegister(name, email, password);
      }

      // Show success toast
      toast({
        title: t.success,
        description: response.message,
      });

      // Call success callback with user data and tokens
      onAuthSuccess(response.user, response.accessToken, response.refreshToken);
    } catch (error) {
      // Show error toast
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t.auth_title}</CardTitle>
          <CardDescription className="text-center">
            {t.auth_description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">{t.auth_login}</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">{t.auth_register}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.auth_email}</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="your@email.com"
                    data-testid="input-email"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t.auth_password}</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password"
                    data-testid="input-password"
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? t.auth_signing_in : t.auth_signin}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.auth_name}</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="John Doe"
                    data-testid="input-name"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">{t.auth_email}</Label>
                  <Input 
                    id="reg-email" 
                    name="reg-email"
                    type="email" 
                    placeholder="your@email.com"
                    data-testid="input-register-email"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">{t.auth_password}</Label>
                  <Input 
                    id="reg-password" 
                    name="reg-password"
                    type="password"
                    data-testid="input-register-password"
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? t.auth_creating_account : t.auth_create_account}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}