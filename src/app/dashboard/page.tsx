"use client";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import styles from './page.module.css';

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="flex min-h-screen">
      <AppSidebar 
        isOpen={isOpen} 
        onToggle={() => setIsOpen(!isOpen)}
      />
      <main className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-0' : 'ml-0'}`}>
        <div className={styles.welcome}>
            <h1 className={styles.title}>Welcome Jed</h1>
            <p className={styles.subtitle}>Get started by selecting the procedure you want to notetake or the guide you want to follow.</p>
            <div className={styles.generate}>
            
            </div>
        </div>

      </main>
    </div>
  );
}
    