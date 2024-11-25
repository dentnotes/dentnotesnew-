'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
export async function handleCreateNote() {
    const note = await createNote();
    redirect(`/notes?id=${note.id}`);
  }

export async function createNote() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('notes')
    .insert([
      {
        user_id: session.user.id,
        title: 'Untitled Note',
        content: '',
        type: 'Diagnostic'
      }
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/notes')
  
  return data
}

export async function getNote(id: string) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateNote(id: string, title: string, content: string, type: string) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('notes')
    .update({ title, content, type })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/notes')
  
  return data
}

export async function getUserNotes() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

