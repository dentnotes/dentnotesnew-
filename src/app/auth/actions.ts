'use server'

import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'

export async function signup({ 
  email, 
  password, 
  name, 
  university, 
  year, 
  program 
}: { 
  email: string
  password: string
  name: string
  university: string
  year: string
  program: string
}) {
  // First, sign up the user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        university,
        year,
        program
      }
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'No user data returned after signup' }
  }

  // Then, create their profile in the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      name,
      university,
      year,
      program
    })

  if (profileError) {
    // If profile creation fails, we should log this and handle it appropriately
    console.error('Error creating profile:', profileError)
    return { error: 'Failed to create user profile' }
  }

  return { message: 'Check your email for the confirmation link.' }
}

export async function login({ email, password }: { email: string; password: string }) {
  console.log('Attempting to log in with email:', email);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    return { error: error.message };
  }

  console.log('Login successful:', data.user);
  return { user: data.user };
}

export async function signOut() {
    const supabase = createServerActionClient({ cookies })
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: error.message }
    }
    return { message: 'Signed out successfully' }
  }
  