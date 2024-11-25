'use server'

import { supabase } from '@/lib/supabase';
import { getUserNotes } from './notes';

export async function fetchSessionAndNotes() {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Fetched session:', session);
  
  if (!session) {
    return { session: null, notes: [] };
  }

  const userNotes = await getUserNotes();
  return { session, notes: userNotes };
}