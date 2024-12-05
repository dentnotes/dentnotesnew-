import AuthForm from './auth-form'

export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  )
}

