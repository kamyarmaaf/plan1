import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/LanguageContext"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';
const N8N_WEBHOOK_URL = "https://waxex65781.app.n8n.cloud/webhook-test/10c9fb43-e5ad-498d-aef3-6d7227d3c687";

interface ProfileData {
  workStudy: string
  hobbies: string
  sports: string
  location: string
  weight: string
  height: string
  age: string
  reading: string
  extraInformation: string
  extraWords: string
}

export function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()
  const [profileData, setProfileData] = useState<ProfileData>({
    workStudy: "",
    hobbies: "",
    sports: "",
    location: "",
    weight: "",
    height: "",
    age: "",
    reading: "",
    extraInformation: "",
    extraWords: ""
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast({
          title: "Error",
          description: "Please log in first",
          variant: "destructive",
        });
        return;
      }

      // Build payload from state
      const payload = {
        workStudy: profileData.workStudy,
        hobbies: profileData.hobbies,
        sports: profileData.sports,
        location: profileData.location,
        reading: profileData.reading || null,
        weight: profileData.weight ? parseInt(profileData.weight) : null,
        height: profileData.height ? parseInt(profileData.height) : null,
        age: profileData.age ? parseInt(profileData.age) : null,
        extraInformation: profileData.extraInformation || null,
        extraWords: profileData.extraWords || null,
        submittedAt: new Date().toISOString(),
      };

      // Save profile in app backend
      const profileResponse = await fetch(`${API_BASE_URL}api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }

      // Fire-and-forget: Post to n8n webhook with the same payload
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'profile-setup',
          data: payload,
        }),
      }).catch(err => console.warn('n8n webhook error:', err));

      // Fire-and-forget: Generate long-term goals (this happens on first profile completion)
      fetch(`${API_BASE_URL}api/goals/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }).catch(error => {
        console.warn('Failed to generate long-term goals:', error);
      });

      // Fire-and-forget: Generate daily plan
      const today = new Date().toISOString().slice(0, 10);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      fetch(`${API_BASE_URL}api/plan/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ date: today, timezone }),
      }).catch(error => {
        console.warn('Failed to generate daily plan:', error);
      });

      // Show success toast
      toast({
        title: "Profile Complete!",
        description: "Your AI-powered planning will begin shortly.",
      });

      // Call completion callback
      onComplete();

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
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>{t.profile_title}</CardTitle>
            <span className="text-sm text-muted-foreground">{t.profile_step_of.replace('{current}', step.toString()).replace('{total}', totalSteps.toString())}</span>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardDescription>
            {t.profile_description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Work & Study</h3>
              <div className="space-y-2">
                <Label htmlFor="work-study">What is your current work or study situation?</Label>
                <Textarea
                  id="work-study"
                  placeholder="e.g., Software engineer at tech company, Computer Science student, freelance designer..."
                  value={profileData.workStudy}
                  onChange={(e) => updateField('workStudy', e.target.value)}
                  data-testid="input-work-study"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hobbies">Hobbies and interests</Label>
                <Textarea
                  id="hobbies"
                  placeholder="e.g., Reading, photography, cooking, gaming, music production..."
                  value={profileData.hobbies}
                  onChange={(e) => updateField('hobbies', e.target.value)}
                  data-testid="input-hobbies"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Physical Activity & Location</h3>
              <div className="space-y-2">
                <Label htmlFor="sports">Preferred sports and exercises</Label>
                <Textarea
                  id="sports"
                  placeholder="e.g., Running, yoga, weightlifting, swimming, basketball..."
                  value={profileData.sports}
                  onChange={(e) => updateField('sports', e.target.value)}
                  data-testid="input-sports"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Where do you live?</Label>
                <Input
                  id="location"
                  placeholder="e.g., New York, USA or London, UK"
                  value={profileData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  data-testid="input-location"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Physical Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={profileData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    data-testid="input-age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={profileData.weight}
                    onChange={(e) => updateField('weight', e.target.value)}
                    data-testid="input-weight"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={profileData.height}
                    onChange={(e) => updateField('height', e.target.value)}
                    data-testid="input-height"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reading Preferences & Additional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="reading">What do you like to read?</Label>
                <Textarea
                  id="reading"
                  placeholder="Leave empty if you'd like AI book recommendations, or tell us your favorite genres, authors, or specific books..."
                  value={profileData.reading}
                  onChange={(e) => updateField('reading', e.target.value)}
                  data-testid="input-reading"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="extra-words">Extra words that each person needs to say</Label>
                <Textarea
                  id="extra-words"
                  placeholder="Any specific words, phrases, or expressions you'd like to include in your daily planning (optional)..."
                  value={profileData.extraWords}
                  onChange={(e) => updateField('extraWords', e.target.value)}
                  data-testid="input-extra-words"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="extra-information">Extra information</Label>
                <Textarea
                  id="extra-information"
                  placeholder="Any additional information you'd like to share about your goals, preferences, or anything else that might help with your planning..."
                  value={profileData.extraInformation}
                  onChange={(e) => updateField('extraInformation', e.target.value)}
                  data-testid="input-extra-information"
                />
              </div>
              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 Don't worry if you're not sure what to read - our AI will suggest books based on your interests and goals!
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              data-testid="button-previous"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.previous}
            </Button>
            
            {step < totalSteps ? (
              <Button onClick={nextStep} data-testid="button-next">
                {t.next}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                data-testid="button-complete"
              >
                {isLoading ? t.profile_creating : t.profile_complete}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}