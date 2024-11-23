'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//     Command,
//     CommandEmpty,
//     CommandGroup,
//     CommandInput,
//     CommandItem,
// } from "@/components/ui/command"
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover"
// import { Check, ChevronsUpDown } from "lucide-react"
// import { cn } from "@/lib/utils"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

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
    setError(null)
    if (!validateSignUpForm()) return
  
    setIsLoading(true)
    try {
      // Log the data being sent to verify it's complete
      console.log('Sending sign-up data:', {
        email: signUpData.email,
        password: signUpData.password,
        metadata: {
          name: signUpData.name,
          university: signUpData.university,
          year: signUpData.year,
          program: signUpData.program,
        }
      })
  
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sign-up',
          email: signUpData.email,
          password: signUpData.password,
          metadata: {
            name: signUpData.name,
            university: signUpData.university,
            year: signUpData.year,
            program: signUpData.program,
          }
        })
      })
  
      const { data, error } = await response.json()
      if (error) {
        console.error('Sign-up error:', error)
        setError(error)
      } else if (data.user) {
        console.log('Sign-up successful:', data)
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Sign-up error:', error)
      setError('An error occurred during sign up')
    }
    setIsLoading(false)
  }
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sign-in',
          email: signInData.email,
          password: signInData.password,
        })
      })
  
      const { data, error } = await response.json()
      if (error) {
        setError(error)
      } else if (data.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred during sign in')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          {/* <CardTitle>Authentication</CardTitle>
          <CardDescription>Sign up or sign in to your account</CardDescription> */}
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