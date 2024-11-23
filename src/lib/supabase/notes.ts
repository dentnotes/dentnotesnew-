import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NewNote, Note } from '@/types/notes';

const supabase = createClientComponentClient();

export const notesService = {
  async createNote(note: NewNote): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return null;
    }

    return data;
  },

  async getNotesByUserId(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }

    return data;
  },

  async deleteNote(noteId: string): Promise<boolean> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
      return false;
    }

    return true;
  },

  async updateNoteTitle(noteId: string, title: string): Promise<boolean> {
    const { error } = await supabase
      .from('notes')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', noteId);

    if (error) {
      console.error('Error updating note title:', error);
      return false;
    }

    return true;
  }
};
