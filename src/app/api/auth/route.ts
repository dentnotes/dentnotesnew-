import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { SignUpData, SignInData } from '@/types/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const body = await request.json()
  const { action } = body

  if (action === 'sign-up') {
    const { email, password, metadata } = body as SignUpData
    try {
      // 1. First create the user in auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata // This stores the metadata in auth.users
        }
      })

      if (authError) throw authError

      // 2. If auth successful, create the profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            name: metadata.name,
            university: metadata.university,
            year: metadata.year,
            program: metadata.program,
            updated_at: new Date().toISOString(),
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // If profile creation fails, we should probably delete the auth user
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw profileError
        }
      }

      return NextResponse.json({ data: authData, error: null })
    } catch (error: unknown) {
      console.error('Sign-up error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      return NextResponse.json({ data: null, error: errorMessage })
    }
  }

  if (action === 'sign-in') {
    const { email, password } = body as SignInData
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return NextResponse.json({ data, error: null })
    } catch (error: unknown) {
        console.error('Sign-up error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
        return NextResponse.json({ data: null, error: errorMessage })
    }
  }

  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  )
}
