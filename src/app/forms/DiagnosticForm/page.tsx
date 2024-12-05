"use client"

import { useState, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react" // Make sure you have lucide-react installed
import { supabase } from '@/lib/supabase';
import styles from "./DiagnosticForm.module.css"

export default function DiagnosticForm({ 
  noteId, 
  userId,
}: { 
  noteId: string; 
  userId: string;
}) {
  const [userYear, setUserYear] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedOutput, setGeneratedOutput] = useState<string>('')
  const [tooltipContent, setTooltipContent] = useState<string>("Copy to clipboard");
  const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('')
  const defaultFormData = {
    department: '',
    clinic: '',
    appointmentType: '',
    colgateRinse: false,
    medicalHx: 'updated',
    supervisor: '',
    nv: '',
    generalWaitlist: false,
    other: ''
  };
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    const fetchNote = async () => {
      // setFormData(defaultFormData);
      // setGeneratedOutput('');

      if (!noteId) return;

      const { data, error } = await supabase
        .from('notes')
        .select('output, title')
        .eq('id', noteId)
        .single();

      if (error) {
        console.error('Error fetching note:', error);
        setGeneratedOutput('');
      } else if (data) {
        setGeneratedOutput(data.output || '');
        setTitle(data.title || '');
        parseOutput(data.output);
      }
    };

    fetchNote();
  }, [noteId]);

  useEffect(() => {
    const updateNote = async () => {
        const { error } = await supabase
            .from('notes')
            .update({ 
                output: generatedOutput,
                title: title,
                updated_at: new Date().toISOString()
            })
            .eq('id', noteId);

        if (error) {
            console.error('Error updating note:', error);
        }
    };

    if (generatedOutput && noteId) {
        updateNote();
    }
  }, [generatedOutput, title, noteId]);

  useEffect(() => {
    const fetchUserYear = async () => {
        console.log('Starting to fetch user year with userId:', userId);
        
        if (userId) {
            const { data, error } = await supabase
                .from('profiles')
                .select('year')
                .eq('id', userId)
                .single();

            console.log('Supabase response - Data:', data);
            console.log('Supabase response - Error:', error);

            if (error) {
                console.error('Error fetching user year:', error);
                return;
            }

            if (data?.year) {
                console.log('Setting user year to:', data.year);
                setUserYear(data.year);
                // Update the generated output with the new year
                updateGeneratedOutput(formData);
            } else {
                console.log('No year data found in profile');
            }
        } else {
            console.log('No userId provided');
        }
    };

    if (userId) {
        fetchUserYear();
    }
  }, [userId]);

  const parseOutput = (output: string | null) => {
    if (!output) {
      setFormData(defaultFormData);
      return;
    }

    const lines = output?.split('\n') || [];
    const departmentLine = lines[0]?.match(/Year \d*\s*(\w+)\s*Clinic/);
    // console.log('Full first line:', lines[0]); // Debug the full line
    // console.log('Department match:', departmentLine); // Debug the match
    const clinicLine = lines[0]?.match(/Clinic ([^\s]+) for/);
    const appointmentTypeLine = lines[0]?.match(/for ([^\n]+)/);
    const medicalHxLine = lines.find(line => line?.startsWith('Medical Hx'));
    const supervisorLine = lines.find(line => line?.startsWith('Supervisor:'));
    const nvLine = lines.find(line => line?.startsWith('N/V:'));
    const generalWaitlistLine = lines.find(line => line?.includes('placed on general waitlist'));

    const newFormData = {
      department: departmentLine?.[1] || 'GDP',
      clinic: clinicLine?.[1]?.trim() || '',
      appointmentType: appointmentTypeLine?.[1]?.trim() || '',
      colgateRinse: output.includes('Colgate 1.5% Hydrogen Peroxide Mouth rinse given.'),
      medicalHx: medicalHxLine ? medicalHxLine.split(' ')[2] : 'updated',
      supervisor: supervisorLine ? supervisorLine.replace('Supervisor: Dr ', '').trim() : '',
      nv: nvLine ? nvLine.replace('N/V: ', '').trim() : '',
      generalWaitlist: !!generalWaitlistLine,
      other: ''
    };

    console.log('Setting form data:', newFormData); // Debug log
    setFormData(newFormData);
    updateGeneratedOutput(newFormData);
    return newFormData;
  };


  const handleChange = (field: string, value: string | boolean) => { 
    console.log(`Changing ${field} to:`, value); // Debug log
    setFormData(prev => { 
      const updatedData = { ...prev, [field]: value }; 
      console.log('Updated form data:', updatedData); // Debug log
      updateGeneratedOutput(updatedData); 
      return updatedData; 
    }); 
  }

  const updateGeneratedOutput = (updatedData: any) => {
    if (!userYear) {
      console.log('Waiting for userYear before updating output');
      return;
    }

    console.log('Updating generated output with:', { updatedData, userYear });
    
    const department = updatedData.department || 'GDP';
    
    let output = `Pt. presented to Year ${userYear} ${department} Clinic ${updatedData.clinic || ''} for ${updatedData.appointmentType || ''}\n`;
    output += "3C's confirmed.";
    if (updatedData.colgateRinse) {
        output += " Colgate 1.5% Hydrogen Peroxide Mouth rinse given.\n";
    } else {
        output += "\n";
    }
    output += `Medical Hx ${updatedData.medicalHx || 'updated'}\n\n`;
    output += `Supervisor: Dr ${updatedData.supervisor || ''}\n`;
    if (updatedData.generalWaitlist) {
        output += "Patient placed on general waitlist and separated\n";
    } else if (updatedData.nv) {
        output += `N/V: ${updatedData.nv}\n`;
    }

    setGeneratedOutput(output);
  };

  // Add a useEffect to monitor userYear changes
  useEffect(() => {
    console.log('userYear changed:', userYear);
  }, [userYear]);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default button behavior
    setIsTooltipOpen(true); // Keep tooltip visible
    
    navigator.clipboard.writeText(generatedOutput)
      .then(() => {
        setTooltipContent("Copied!"); // Change tooltip text on successful copy
        setTimeout(() => {
          setIsTooltipOpen(false); // Hide tooltip after delay
        }, 2000);
      });
  };


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

                <form className="space-y-3">
                  <div className="space-y-1">
                    <Label>Note Title</Label>
                    <Input
                      placeholder="Note Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mb-4"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Department</Label>
                    <Tabs
                      defaultValue="GDP"
                      value={formData.department || 'GDP'}
                      onValueChange={(value) => {
                          console.log('Tab changing to:', value);
                          const updatedData = { ...formData, department: value };
                          setFormData(updatedData);
                          updateGeneratedOutput(updatedData);
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-4">
                          {['GDP', 'Pros', 'Endo', 'Perio'].map((dept) => (
                              <TabsTrigger 
                                  key={dept} 
                                  value={dept}
                                  disabled={false}
                              >
                                  {dept}
                              </TabsTrigger>
                          ))}
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="space-y-1">
                    <Label>Clinic</Label>
                    <Select value={formData.clinic} onValueChange={(value) => handleChange('clinic', value)}>
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

                  <div className="space-y-1">
                    <Label>Appointment Type</Label>
                    <Select value={formData.appointmentType} onValueChange={(value) => handleChange('appointmentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="011">011</SelectItem>
                        <SelectItem value="resto">resto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-5 space-x-2">
                    <Checkbox
                      id="colgateRinse"
                      checked={formData.colgateRinse}
                      onCheckedChange={(checked) => handleChange('colgateRinse', checked)}
                    />
                    <Label htmlFor="colgateRinse">Colgate 1.5% Hydrogen Peroxide Mouth rinse given</Label>
                  </div>

                  <div className="space-y-1">
                    <Label>Medical History</Label>
                    <Select value={formData.medicalHx} onValueChange={(value) => handleChange('medicalHx', value)}>
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

                  <div className="space-y-1">
                    <Label htmlFor="supervisor">Supervisor</Label>
                    <Input
                      id="supervisor"
                      placeholder="Dr "
                      value={formData.supervisor}
                      onChange={(e) => handleChange('supervisor', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="nv">N/V</Label>
                    <Input
                      id="nv"
                      placeholder=""
                      value={formData.nv}
                      onChange={(e) => handleChange('nv', e.target.value)}
                    />
                  </div>

                  <div className="space-y-5 space-x-2">
                    <Checkbox
                      id="generalWaitlist"
                      checked={formData.generalWaitlist}
                      onCheckedChange={(checked) => handleChange('generalWaitlist', checked)}
                    />
                    <Label htmlFor="generalWaitlist">Patient placed on general waitlist and seperated</Label>
                  </div>

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
            <TooltipProvider>
            <Tooltip open={isTooltipOpen}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            value={generatedOutput}
            readOnly
            className="min-h-[688px] font-mono text-sm whitespace-pre-wrap"
          />
        </div>
      </div>
    </div>
  )
}


