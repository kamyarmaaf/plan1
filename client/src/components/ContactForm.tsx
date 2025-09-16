import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';
      
      const response = await fetch(`${API_BASE_URL}api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setFormData({ name: "", email: "", subject: "", category: "", message: "" });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Have questions, feedback, or need support? We're here to help you get the most out of your LifePlan experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-chart-2" />
                <h3 className="font-semibold">Email Support</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Get help with your account, billing, or technical issues
              </p>
              <p className="font-medium">kamyarmf1@gmail.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-chart-3" />
                <h3 className="font-semibold">Live Chat</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Quick questions? Chat with our support team
              </p>
              <p className="font-medium">Available 8 AM - ela</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-5 h-5 text-chart-4" />
                <h3 className="font-semibold">Phone Support</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                For urgent matters and detailed assistance
              </p>
              <p className="font-medium">+98 938 298 9027</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll respond as quickly as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      data-testid="input-contact-name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      data-testid="input-contact-email"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                      <SelectTrigger data-testid="select-contact-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing & Account</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feedback">General Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your inquiry"
                      value={formData.subject}
                      onChange={(e) => updateField('subject', e.target.value)}
                      data-testid="input-contact-subject"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide details about your inquiry, including any relevant information that might help us assist you better."
                    className="min-h-[120px]"
                    value={formData.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    data-testid="input-contact-message"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-send-message"
                >
                  {isLoading ? "Sending message..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">How does AI planning work?</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your profile, preferences, and goals to create personalized daily and monthly plans that adapt to your lifestyle and cultural context.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I modify AI suggestions?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! All AI-generated plans are fully customizable. You can edit, add, or remove tasks to fit your specific needs and preferences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is my data secure?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, we use enterprise-grade encryption and security measures to protect your personal information. Your data is never shared with third parties.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How accurate are progress predictions?</h3>
              <p className="text-sm text-muted-foreground">
                Our predictions improve over time as the AI learns your patterns. Initial estimates are based on proven methodologies and user data trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}