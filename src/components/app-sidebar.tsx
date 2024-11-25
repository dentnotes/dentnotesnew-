"use client";
import { useState, useEffect } from 'react'
import { notesService } from '@/lib/supabase/notes-client';
import type { Note } from '@/types/notes';
import Link from 'next/link'
import { ChevronRight, ChevronDown, ChevronUp, Plus, Inbox, User2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import styles from './app-sidebar.module.css';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarGroupAction,
    SidebarProvider,
    SidebarTrigger,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

import Account from '@/components/sidebar-footer/account';
import Billing from '@/components/sidebar-footer/billing';
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { render } from 'react-dom';
import { createNote } from '@/app/notes/actions'


interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onComponentSelect: (component: string) => void;
  onNotesChange?: () => void;  // Add this line
}

// interface Note {
//   id: string;
//   title: string;
//   url: string;
//   icon: any;
// }

export function AppSidebar({ isOpen, onToggle, onComponentSelect, onNotesChange }: AppSidebarProps) {
  const [groupContent, setGroupContent] = useState<string[]>([]); 
  const [activeComponent, setActiveComponent] = useState<string | null>(null)
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user)
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const loadNotes = async () => {
    if (user) {
      const userNotes = await notesService.getNotesByUserId(user.id);
      setNotes(userNotes);
    }
  };

  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    console.log('Signed out')
  }

  const handleCreateNote = async () => {
    if (!user) {
      console.log('Client: No user found')
      return
    }
    
    try {
      const result = await notesService.createNote(user.id)
      
      if (result.error) {
        console.error('Client: Error creating note:', result.error)
        return
      }
  
      if (result.data) {
        console.log('Client: Note created, updating UI with:', result.data)
        setNotes(prevNotes => [result.data!, ...prevNotes])
        onNotesChange?.()
      }
    } catch (error) {
      console.error('Client: Unexpected error creating note:', error)
    }
  }
  
  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user, onNotesChange]);

  const handleDoubleClick = (index: number) => {
    setEditingIndex(index);
  };
  
  const handleRename = async (noteId: string, newTitle: string) => {
    const success = await notesService.updateNoteTitle(noteId, newTitle);
    if (success) {
      const updatedNotes = notes.map(note => 
        note.id === noteId ? { ...note, title: newTitle } : note
      );
      setNotes(updatedNotes);
    }
    setEditingIndex(null);
  };
  
  const handleDeleteClick = (index: number) => {
    setNoteToDelete(notes[index].id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (noteToDelete) {
      const success = await notesService.deleteNote(noteToDelete);
      if (success) {
        setNotes(notes.filter(note => note.id !== noteToDelete));
      }
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };
  
  useEffect(() => {
    console.log('Client: User state changed:', user)
  }, [user])

  return (
    <SidebarProvider>
      <div className="relative">
        <Sidebar className={isOpen ? "w-64" : "w-0"}>
          <SidebarContent>
          {/* Adding the title */} 
          <div className={styles.dentnotesTitle}> 
            dentnotes 
          </div>
          <button onClick={handleCreateNote} className={styles.newClinicBtn} > new clinic + </button>
          <div style={{ marginTop: '20px', marginLeft: '10px'}}>
            <SidebarGroup>
              <SidebarGroupLabel>Clinic Notes</SidebarGroupLabel>
              <SidebarGroupAction>
                {/* <Plus /> <span className="sr-only">Add Project</span> */}
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  {notes.map((note, index) => (
                    <div key={note.id} className="group relative">
                      <SidebarMenuItem
                        // icon={note.icon}
                        onDoubleClick={() => handleDoubleClick(index)}
                        className="pr-8" // Add padding-right to make space for delete icon
                      >
                        <SidebarMenuButton>  
                          {editingIndex === index ? (
                            <input
                              type="text"
                              defaultValue={note.title}
                              onBlur={(e) => handleRename(notes[index].id, e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleRename(notes[index].id, e.currentTarget.value);
                                }
                              }}
                              autoFocus
                              className="w-[calc(100%-24px)] bg-transparent outline-none"
                            />
                          ) : (
                            <span className="block truncate">{note.title}</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(index);
                            }}
                            className="absolute right-2 hidden group-hover:inline-flex items-center justify-center p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </div>
                  ))}

                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Note</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this note? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))} */}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                      <User2 /> Jed Hoo
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-popper-anchor-width]"
                  >
                    <DropdownMenuItem onClick={() => onComponentSelect('account')}>
                      <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onComponentSelect('billing')}>
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault()
                      handleSignOut()
                    }}>
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          {isOpen && (
            <div className="absolute right-3 top-7">
              <SidebarTrigger onClick={onToggle} className="bg-background border rounded-full p-1.5 hover:bg-accent">
                <ChevronRight className="h-4 w-4" />
              </SidebarTrigger>
            </div>
          )}
        </Sidebar>
        {!isOpen && (
          <div className="fixed left-7 top-7">
            <SidebarTrigger onClick={onToggle} className="bg-background border rounded-full p-1.5 hover:bg-accent">
              <ChevronRight className="h-4 w-4 rotate-180" />
            </SidebarTrigger>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}


