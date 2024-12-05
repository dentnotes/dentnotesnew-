"use client";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChevronRight } from "lucide-react";
import styles from './page.module.css';
import { useRouter } from 'next/navigation'

import DiagnosticForm from '@/app/forms/DiagnosticForm/page';
import PreventiveForm from '@/app/forms/PreventiveForm';
import PsrScores from '@/components/guides/PsrScores';

import Account from '@/components/sidebar-footer/account';
import Billing from '@/components/sidebar-footer/billing';

import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { createNote, getUserNotes, handleCreateNote } from '@/app/actions/notes'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { useUser } from '@supabase/auth-helpers-react';


export default function Dashboard() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter()

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
      case 'null':
        return null;
      case 'account':
        return <Account />;
      case 'billing':
        return <Billing />;
      case 'diagnostic':
        return <DiagnosticForm noteId={currentNoteId || ''} />;
      case 'preventive':
        return <PreventiveForm />;
      case 'psr-scores':
        return <PsrScores />;
      // Add cases for all other components
      default:
        return null;
    }
  };

  const handleNoteClick = (noteType: string, noteId: string) => {
    console.log('Note Type:', noteType, 'Note ID:', noteId);
    switch (noteType) {
      case 'null':
        setActiveComponent(null);
        break;
      case 'Diagnostic':
        setActiveComponent('diagnostic');
        setCurrentNoteId(noteId);
        break;
      case 'Preventive':
        setActiveComponent('preventive');
        setCurrentNoteId(noteId);
        break;
      // Add more cases for other note types
      default:
        console.warn('Unknown note type:', noteType);
    }
  };

  const refreshNotes = () => {
    setRefreshKey(prev => prev + 1); // Add this function
  };

  const handleGenerateNote = async (type: string) => {
    const noteId = await createNote (type);
    console.log('Generated Note ID:', noteId);
    if (typeof noteId === 'string') {
      handleNoteClick(type.charAt(0).toUpperCase() + type.slice(1), noteId);
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
            <h1 className={styles.title}>Welcome</h1>
            <p className={styles.subtitle}>Get started by selecting the procedure you want to notetake or the guide you want to follow.</p>
            <div className={styles.generate}>
              <div className={styles.box}>
                <h2 className="text-xl font-bold mb-4">Generate Notes</h2>
                <div className="space-y-2">
                  {generateNotesItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleGenerateNote(item.label)}
                      className={styles.listButton}
                    >
                      <ChevronRight size={20} />
                      {item.label}
                    </button>
                  ))}
                </div>
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