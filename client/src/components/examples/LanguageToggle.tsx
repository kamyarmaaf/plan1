import { LanguageToggle } from '../LanguageToggle'
import { LanguageProvider } from '@/contexts/LanguageContext'

export default function LanguageToggleExample() {
  return (
    <LanguageProvider>
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Language Toggle</h2>
        <LanguageToggle />
        <p className="text-muted-foreground">Click the language button to switch between English and Persian</p>
      </div>
    </LanguageProvider>
  )
}