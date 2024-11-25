"use client"

import { useState, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import styles from "./DiagnosticForm.module.css"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react" // Make sure you have lucide-react installed

import { supabase } from '@/lib/supabase';


export default function DiagnosticForm({ noteId }: { noteId: string }) {
  const [userYear, setUserYear] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [editableOutput, setEditableOutput] = useState('')
  const [formData, setFormData] = useState({
    department: '',
    clinic: '',
    appointmentType: '',
    colgateRinse: false,
    medicalHx: 'updated',
    supervisor: '',
    nv: '',
    generalWaitlist: false,
    other: ''
  })

  // Fetch existing note data when the component mounts
  useEffect(() => {
    const fetchNote = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (error) {
        console.error('Error fetching note:', error);
      } else if (data) {
        setFormData({
          department: data.department || '',
          clinic: data.clinic || '',
          appointmentType: data.appointmentType || '',
          colgateRinse: data.colgateRinse || false,
          medicalHx: data.medicalHx || 'updated',
          supervisor: data.supervisor || '',
          nv: data.nv || '',
          generalWaitlist: data.generalWaitlist || false,
          other: data.other || ''
        });
      }
    };

    fetchNote();
  }, [noteId]);

  // Update the database whenever formData changes
  useEffect(() => {
    const updateNote = async () => {
      const { error } = await supabase
        .from('notes')
        .update({
          ...formData,
          type: 'Diagnostic' // Ensure the type is set correctly
        })
        .eq('id', noteId);

      if (error) {
        console.error('Error updating note:', error);
      }
    };

    // Call the update function if formData changes
    updateNote();
  }, [formData, noteId]);

  useEffect(() => {
    setEditableOutput(generateOutput())
  }, [formData]) // This will run whenever formData changes

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleOutputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableOutput(e.target.value)
  }

  const handleCopy = () => {
    const output = generateOutput()
    navigator.clipboard.writeText(output)
      .then(() => {
        // You could add a toast notification here if you want
        console.log('Copied to clipboard')
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }

  // Modify handleChange to work with department tabs
  const handleDepartmentChange = (value: string) => {
    setFormData(prev => ({ ...prev, department: value }))
  }

  const generateOutput = () => {
    let output = `Pt. presented to Year ${userYear} ${formData.department} Clinic ${formData.clinic} for\n${formData.appointmentType}\n`
    output += "3C's confirmed."
    if (formData.colgateRinse) {
      output += " Colgate 1.5% Hydrogen Peroxide Mouth rinse given.\n"
    } else {
      output += "\n"
    }
    output += `Medical Hx ${formData.medicalHx}\n\n`
    output += `Supervisor: Dr ${formData.supervisor}\n`
    if (formData.generalWaitlist) {
      output += "Patient placed on general waitlist and seperated\n"
    } else if (formData.nv) {
      output += `N/V: ${formData.nv}\n`
    } else if (formData.other) {
      // Split long text into multiple lines
      const words = formData.other.split(' ')
      let currentLine = ''
      let formattedOther = ''
      
      words.forEach(word => {
        if ((currentLine + word).length > 45) { // Adjust 40 to desired line length
          formattedOther += currentLine + '\n'
          currentLine = word + ' '
        } else {
          currentLine += word + ' '
        }
      })
      formattedOther += currentLine
      output += formattedOther
    }
    return output
  }
  
  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className={styles.welcome}>
      <div className={styles.generate}>
        <div className={styles.box}>
          <h2 className="text-xl mb-4">Comprehensive Oral Examination</h2>
          <div className="space-y-2">
            <div className="container">
              <div className="form-container">
                {/* <h2 className="form-title">Dental Clinic Form</h2> */}
                {/* <form className="form"> */}
                <form className="space-y-3">
                  <div className="space-y-1">
                    <Label>Department</Label>
                    <Tabs
                      defaultValue="GDP"
                      value={formData.department || 'GDP'}
                      onValueChange={handleDepartmentChange}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="GDP">GDP</TabsTrigger>
                        <TabsTrigger value="Pros">Pros</TabsTrigger>
                        <TabsTrigger value="Endo">Endo</TabsTrigger>
                        <TabsTrigger value="Perio">Perio</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  {/* <div className="form-group"> */}
                  <div className="space-y-1">
                    <Label>Clinic</Label>
                    <Select onValueChange={(value) => handleChange('clinic', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {['2.1', '3.1', '3.2', '3.3', '3.4', '5.1', '5.2', '6.1', '6.2', '6.3'].map((clinic) => (
                          <SelectItem key={clinic} value={clinic}>{clinic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* <div className="form-group"> */}
                  <div className="space-y-1">
                    <Label>Appointment Type</Label>
                    <Select onValueChange={(value) => handleChange('appointmentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="011">011</SelectItem>
                        <SelectItem value="resto">resto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* <div className="form-group"> */}
                  <div className="space-y-5 space-x-2">
                    <Checkbox
                      id="colgateRinse"
                      checked={formData.colgateRinse}
                      onCheckedChange={(checked) => handleChange('colgateRinse', checked)}
                    />
                    <Label htmlFor="colgateRinse">Colgate 1.5% Hydrogen Peroxide Mouth rinse given</Label>
                  </div>

                  {/* <div className="form-group"> */}
                  <div className="space-y-1">
                    <Label>Medical History</Label>
                    <Select onValueChange={(value) => handleChange('medicalHx', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medical history status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="updated">updated</SelectItem>
                        <SelectItem value="verified">verified</SelectItem>
                        <SelectItem value="taken">taken</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* <div className="form-group"> */}
                  <div className="space-y-1">
                    <Label htmlFor="supervisor">Supervisor</Label>
                    <Input
                      id="supervisor"
                      placeholder="Dr "
                      value={formData.supervisor}
                      onChange={(e) => handleChange('supervisor', e.target.value)}
                    />
                  </div>

                  {/* <div className="form-group"> */}
                  <div className="space-y-1">
                    <Label htmlFor="nv">N/V</Label>
                    <Input
                      id="nv"
                      placeholder=""
                      value={formData.nv}
                      onChange={(e) => handleChange('nv', e.target.value)}
                    />
                  </div>

                  {/* <div className="form-group"> */}
                  <div className="space-y-5 space-x-2">
                    <Checkbox
                      id="generalWaitlist"
                      checked={formData.generalWaitlist}
                      onCheckedChange={(checked) => handleChange('generalWaitlist', checked)}
                    />
                    <Label htmlFor="generalWaitlist">Patient placed on general waitlist and seperated</Label>
                  </div>

                  {/* <div className="form-group"> */}
                  <div className="space-y-1">
                    <Label htmlFor="other">Other</Label>
                    <Textarea
                      id="other"
                      placeholder=""
                      value={formData.other}
                      onChange={(e) => handleChange('other', e.target.value)}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.box}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl">Generated Output</h2>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="output-container">
              <Textarea
                value={editableOutput}
                onChange={handleOutputChange}
                className="min-h-[688px] font-mono text-sm whitespace-pre-wrap"
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault()
                    const start = e.currentTarget.selectionStart
                    const end = e.currentTarget.selectionEnd
                    const value = e.currentTarget.value
                    e.currentTarget.value = value.substring(0, start) + '    ' + value.substring(end)
                    e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4
                    handleOutputChange(e as any)
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
