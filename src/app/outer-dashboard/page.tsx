"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChevronRight } from "lucide-react";
import styles from './page.module.css';
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchSessionAndNotes } from "../actions/session";
import { redirect } from 'next/navigation'

import DiagnosticForm from '@/app/forms/DiagnosticForm/page';
import PreventiveForm from '@/app/forms/PreventiveForm';
import PsrScores from '@/components/guides/PsrScores';
// etc...
import Account from '@/components/sidebar-footer/account';
import Billing from '@/components/sidebar-footer/billing';


export default function outerDashboard() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter()
  const [user, setUser] = useState<any>(null);

  const generateNotesItems = [
    { id: 'diagnostic', label: 'Diagnostic' },
    { id: 'preventive', label: 'Preventive' },
    { id: 'periodontics', label: 'Periodontics' },
    { id: 'oral-surgery', label: 'Oral surgery' },
    { id: 'endodontics', label: 'Endodontics' },
    { id: 'restorative', label: 'Restorative' },
    { id: 'prosthodontics-fixed', label: 'Prosthodontics - Fixed' },
    { id: 'prosthodontics-removable', label: 'Prosthodontics - Removable' },
    { id: 'other-services', label: 'Other services' },
  ];

  const guidesItems = [
    { id: 'psr-scores', label: 'PSR Scores & PERO instruments' },
    { id: 'icdas', label: 'ICDAS Scoring System' },
    { id: 'la', label: 'LA Information' },
    { id: 'classification', label: 'AAP/EFP Periodontal Classification' },
    { id: 'eruption', label: 'Eruption Times' },
    { id: 'equipment', label: 'Equipment List' },
    { id: 'schedule', label: 'Age Schedule of Dental Services and Glossary' },
    { id: 'ada', label: 'Year 4 ADA Code List' },
    { id: 'denture', label: 'Denture Guides' },
  ];

  const renderComponent = () => {
    switch (activeComponent) {
      case 'account':
        return <Account />;
      case 'billing':
        return <Billing />;
      case 'diagnostic':
        return <DiagnosticForm 
          noteId={currentNoteId || ''} 
          userId={user?.id || ''} // Add this line
        />;
      case 'preventive':
        return <PreventiveForm />;
      case 'psr-scores':
        return <PsrScores />;
      default:
        return null;
    }
  };

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

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveComponent(null);
      }
    };
  
    // Add event listener when component mounts
    document.addEventListener('keydown', handleEscapeKey);
  
    // Remove event listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []); // Empty dependency array means this effect runs once on mount
  

  const refreshNotes = () => {
    setRefreshKey(prev => prev + 1); // Add this function
  };

  const handleNoteClick = (noteType: string, noteId: string) => {
    switch (noteType) {
      case 'Diagnostic':
        setActiveComponent('diagnostic');
        setCurrentNoteId(noteId); // Set the current note ID
        break;
      case 'Preventive':
        setActiveComponent('preventive');
        setCurrentNoteId(noteId); // Set the current note ID
        break;
      // Add more cases for other note types
      default:
        console.warn('Unknown note type:', noteType);
    }
  };

  return (
    <div className="flex min-h-screen">
      {!activeComponent && (
        <AppSidebar 
          isOpen={isOpen} 
          onToggle={() => setIsOpen(!isOpen)}
          onComponentSelect={(component: string) => handleNoteClick(component, '')}
          passNoteId={(noteId: string) => setCurrentNoteId(noteId)}
          onNotesChange={refreshNotes}
        />
      )}
      <main className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-0' : 'ml-0'}`}>
        {!activeComponent ? (
          <div className={styles.welcome}>
            <h1 className={styles.title}>Welcome {user?.name}</h1>
            <p className={styles.subtitle}>Get started by creating a new note or selecting the guide you want to follow.</p>
            <div className={styles.generate}>
              <div className={styles.lbox}>
                <h2 className="text-xl font-bold mb-4">Recently Used</h2>
                {notes
                  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .slice(0, 4)
                  .map((note) => (
                    <div key={note.id} onClick={() => handleNoteClick(note.type, note.id)} className="block mb-4 cursor-pointer">                      <Card>
                        <CardHeader>
                          <CardTitle className={styles.title}>{note.title}</CardTitle>
                          <CardDescription className={styles.description}>{note.type}</CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  ))}
              </div>
              <div className={styles.box}>
                <h2 className="text-xl font-bold mb-4">Guides</h2>
                <div className="space-y-2">
                  {guidesItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveComponent(item.id)}
                      className={styles.listButton}
                    >
                      <ChevronRight size={20} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 w-full">
            <div className="mb-4">
              <button
                onClick={() => setActiveComponent(null)}
                className="px-4 py-2 rounded hover:bg-gray-50 transition-colors flex items-center"
              >
                <ChevronRight size={16} className="rotate-180 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <div className="flex gap-8 justify-center px-4">
              {renderComponent()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}