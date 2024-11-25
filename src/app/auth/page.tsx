'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

import { signup, signin } from './actions'

const universities = [
    "Charles Sturt University",
    "James Cook University",
    "Griffith University",
    "La Trobe University",
    "University of Adelaide",
    "University of Melbourne",
    "University of Queensland",
    "University of Sydney",
    "University of Western Australia",
]

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    university: '',
    year: '',
    program: '',
    password: '',
    confirmPassword: '',
  })

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  })

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value })
  }

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInData({ ...signInData, [e.target.name]: e.target.value })
  }
  

  const handleUniversityChange = (value: string) => {
    setSignUpData({ ...signUpData, university: value })
  }

  const validateSignUpForm = () => {
    if (!signUpData.name || !signUpData.email || !signUpData.university || !signUpData.year || !signUpData.program || !signUpData.password || !signUpData.confirmPassword) {
      setError('All fields are required')
      return false
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    return true
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateSignUpForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await signup({
        email: signUpData.email,
        password: signUpData.password,
        metadata: {
          name: signUpData.name,
          university: signUpData.university,
          year: signUpData.year,
          program: signUpData.program,
        },
      })

      if (result.error) {
        setError(result.error)
        return
      }

      router.push('/dashboard')
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    console.log('Client: Starting sign in process...')

    try {
      const result = await signin({
        email: signInData.email,
        password: signInData.password,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      // Get the client-side Supabase instance
      const supabase = createClient()
      
      // Force a session refresh
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('Failed to establish session')
        return
      }

      console.log('Client: Session established, redirecting...')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Client: Sign in error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-[350px]">
        <CardHeader>
          {/* <CardTitle className="text-2xl font-semibold text-center">dentnotes</CardTitle>
          <CardDescription className="text-center">Sign up or sign in to continue</CardDescription> */}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input id="signup-name" name="name" required onChange={handleSignUpChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" required onChange={handleSignUpChange} />
                </div>
                <div className="space-y-2">
                  <Label>University</Label>
                  <Select
                    value={signUpData.university}
                    onValueChange={handleUniversityChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((university) => (
                        <SelectItem key={university} value={university}>
                          {university}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-year">Year</Label>
                  <Input id="signup-year" name="year" required onChange={handleSignUpChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-program">Program</Label>
                  <Input id="signup-program" name="program" required onChange={handleSignUpChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" name="password" type="password" required onChange={handleSignUpChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input id="signup-confirm-password" name="confirmPassword" type="password" required onChange={handleSignUpChange} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" name="email" type="email" required onChange={handleSignInChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" name="password" type="password" required onChange={handleSignInChange} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardFooter>
      </Card>
    </div>
  )
}