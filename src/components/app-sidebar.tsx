"use client";

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, ChevronUp, Plus, Inbox, User2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { useRouter } from 'next/navigation'
import { Button } from './ui/button';
import styles from './app-sidebar.module.css';
import { signOut } from '@/app/auth/actions'
import { redirect } from 'next/navigation'
import { deleteNote, handleCreateNote, updateNote } from '@/app/actions/notes';
import { fetchSessionAndNotes } from '@/app/actions/session';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import Link from 'next/link'
import Account from '@/components/sidebar-footer/account';
import Billing from '@/components/sidebar-footer/billing';
import { supabase } from '@/lib/supabase'
import { createNote, getUserNotes } from '@/app/actions/notes'

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

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { render } from 'react-dom';


interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onComponentSelect: (component: string) => void;
  onNotesChange?: () => void;
  passNoteId: (noteId: string) => void;
}

export function AppSidebar({ isOpen, onToggle, onComponentSelect, onNotesChange, passNoteId }: AppSidebarProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [groupContent, setGroupContent] = useState<string[]>([]); 
  const [activeComponent, setActiveComponent] = useState<string | null>(null) 
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const router = useRouter()

  useEffect(() => {
    const loadSessionAndNotes = async () => {
      const { session, notes: userNotes } = await fetchSessionAndNotes();
      
      if (!session) {
        redirect('/auth');
      } else {
        setUser(session.user);
        setNotes(userNotes);
      }
    };

    loadSessionAndNotes();
  }, []);

  async function onCreateNote() {
    router.push('/dashboard');
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.error) {
      console.error('Error signing out:', result.error)
    } else {
      router.push('/auth')
    }
    router.push('/')
  }

  const handleNoteClick = (note: any) => {
    onComponentSelect(note.type);
    passNoteId(note.id);
  };

  const handleDoubleClick = (index: number) => {
    setEditingIndex(index);
  };
  
  const handleRename = async (noteId: string, newTitle: string) => {
    const note = notes.find(note => note.id === noteId);
    if (note) {
      await updateNote(noteId, newTitle, note.content, note.type);
      setNotes((prevNotes) => 
        prevNotes.map(n => n.id === noteId ? { ...n, title: newTitle } : n)
      );
    }
  };
  
  const handleDeleteClick = (index: number) => {
    setNoteToDelete(notes[index].id);
    setIsDeleteDialogOpen(true);
  };
  
  async function handleConfirmDelete() {
    if (noteToDelete) {
      await deleteNote(noteToDelete);
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
      setNotes((prevNotes) => prevNotes.filter(note => note.id !== noteToDelete));
    }
  }

  return (
    <SidebarProvider>
      <div className="relative">
        <Sidebar className={isOpen ? "w-64" : "w-0"}>
          <SidebarContent>
          {/* Adding the title */} 
          <Link href="/outer-dashboard" className={styles.dentnotesTitle} onClick={() => onComponentSelect('null')}> 
            dentnotes 
          </Link>
          <button onClick={onCreateNote} className={styles.newClinicBtn} > new clinic + </button>
          <div style={{ marginTop: '20px', marginLeft: '10px'}}>
            <SidebarGroup>
              <SidebarGroupLabel>All Clinic Notes</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>

                  {notes.map((note, index) => (
                    <div key={note.id} className="group relative" onClick={() => handleNoteClick(note)}>
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
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(index);
                            }}
                            className="absolute right-2 hidden group-hover:inline-flex items-center justify-center p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </span>
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
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

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


