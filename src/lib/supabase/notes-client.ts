import { createClient } from '@/lib/supabase/client'
import type { Note } from '@/types/notes'

export const notesService = {
  async createNote(userId: string): Promise<{ data?: Note; error?: string }> {
    const supabase = createClient()
    
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
        return { error: error.message }
      }

      return { data }
    } catch (error) {
      return { error: 'Failed to create note' }
    }
  },

  async getNotesByUserId(userId: string): Promise<Note[]> {
    const supabase = createClient()
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return data || []
  },

  async deleteNote(noteId: string): Promise<boolean> {
    const supabase = createClient()
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
    const supabase = createClient()
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