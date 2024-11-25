'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Note, NewNote } from '@/types/notes'

const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Cookie setting not supported in Server Components
          return
        },
        remove(name: string, options: any) {
          // Cookie removal not supported in Server Components
          return
        },
      },
    },
  )
}

export async function createNewClinic(userId: string) {
  if (!userId) {
    return { error: 'No user found' }
  }
  
  try {
    const result = await notesService.createNote(userId)
    return result
  } catch (error) {
    console.error('Server: Unexpected error creating note:', error)
    return { error }
  }
}

export const notesService = {
  async createNote(userId: string): Promise<{ data?: Note; error?: string }> {
    console.log('Server: Creating new note for user:', userId)
    const supabase = await createClient()

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
  },

  async getNotesByUserId(userId: string): Promise<Note[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
      return []
    }

    return data || []
  },

  async deleteNote(noteId: string): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (error) {
      console.error('Error deleting note:', error)
      return false
    }

    return true
  },

  async updateNoteTitle(noteId: string, title: string): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('notes')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', noteId)

    if (error) {
      console.error('Error updating note title:', error)
      return false
    }

    return true
  }
}
