import { ProfileSetup } from '../ProfileSetup'

export default function ProfileSetupExample() {
  return (
    <ProfileSetup onComplete={() => console.log('Profile setup completed')} />
  )
}