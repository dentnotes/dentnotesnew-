'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

type SignUpData = {
  email: string
  password: string
  metadata: {
    name: string
    university: string
    year: string
    program: string
  }
}

export async function signup({ email, password, metadata }: SignUpData) {
  const supabase = await createClient(cookies())
  
  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  // Then create the profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user!.id,
      email,
      name: metadata.name,
      university: metadata.university,
      year: metadata.year,
      program: metadata.program,
    })

  if (profileError) {
    return { error: profileError.message }
  }

  console.log('Signed up successfully')

  return { message: 'Check your email for the confirmation link.' }
}

export async function signin({ email, password }: { email: string; password: string }) {
  console.log('Server: Starting signin action')
  const supabase = await createClient(cookies())
  
  try {
    console.log('Server: Attempting signInWithPassword')
    const { data: { session, user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    console.log('Server: Sign in response:', { 
      sessionExists: !!session,
      userId: user?.id,
      error: error?.message 
    })

    if (error) {
      console.error('Server: Sign in error:', error.message)
      return { error: error.message }
    }

    if (!session) {
      console.error('Server: No session created')
      return { error: 'No session created' }
    }

    // Set the auth cookie
    const cookieStore = await cookies()
    cookieStore.set('sb-access-token', session.access_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return { 
      success: true,
      data: {
        session,
        user
      }
    }
  } catch (e) {
    console.error('Server: Unexpected error:', e)
    return { error: 'An unexpected error occurred' }
  }
}

