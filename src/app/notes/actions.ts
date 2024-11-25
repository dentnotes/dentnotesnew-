'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function createNote(userId: string) {
  console.log('Server: Creating new note for user:', userId)
  const supabase = createClient(cookies())

  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        user_id: userId,
        title: `New Note ${new Date().toLocaleString()}`,
        content: '',
        type: 'clinic'
      }])
      .select()
      .single()

    if (error) {
      console.error('Server: Error creating note:', error.message)
      return { error: error.message }
    }

    console.log('Server: Note created successfully:', data)
    return { data }
  } catch (error) {
    console.error('Server: Unexpected error:', error)
    return { error: 'Failed to create note' }
  }
}