"use client";
import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, ChevronUp, Plus, Inbox, User2 } from "lucide-react";
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
}

interface Item { 
  title: string; 
  url: string; 
  icon: React.ElementType; 
}

export function AppSidebar({ isOpen, onToggle, onComponentSelect }: AppSidebarProps) {
  const [groupContent, setGroupContent] = useState<string[]>([]); 
  const [items, setItems] = useState<Item[]>([]);
  const [activeComponent, setActiveComponent] = useState<string | null>(null)

  const addNewClinic = () => { 
    const newContent = "New Clinic Content"; 
    setGroupContent([...groupContent, newContent]); 
    setItems([...items, { title: newContent, url: "#", icon: Inbox }]); 
  };
  
  return (
    <SidebarProvider>
      <div className="relative">
        <Sidebar className={isOpen ? "w-64" : "w-0"}>
          <SidebarContent>
          {/* Adding the title */} 
          <div className={styles.dentnotesTitle}> 
            dentnotes 
          </div>
          <button onClick={addNewClinic} className={styles.newClinicBtn} > new clinic + </button>
          <div style={{ marginTop: '20px', marginLeft: '10px'}}>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupAction>
                {/* <Plus /> <span className="sr-only">Add Project</span> */}
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
                    <DropdownMenuItem asChild>
                      <Link href="/">
                        <span>Sign out</span>
                      </Link>
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


