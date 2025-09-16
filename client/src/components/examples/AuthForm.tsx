import { AuthForm } from '../AuthForm'

export default function AuthFormExample() {
  return (
    <AuthForm onAuthSuccess={() => console.log('Auth success triggered')} />
  )
}