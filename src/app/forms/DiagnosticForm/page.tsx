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
import { Separator } from "@/components/ui/separator"
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
    eoe: {
      temporalis: false,
      masseter: false,
      tmj: false,
      salivaryGlands: false,
      lymphNodes: false,
      facialMuscles: false
    },
    eoeCustom: {
        temporalis: '',
        masseter: '',
        tmj: '',
        salivaryGlands: '',
        lymphNodes: '',
        facialMuscles: ''
    },
    ioe: {
        fom: false,
        tongue: false,
        palatalMucosa: false,
        buccalMucosa: false,
        hardTissue: false
    },
    ioeCustom: {
        fom: '',
        tongue: '',
        palatalMucosa: '',
        buccalMucosa: '',
        hardTissue: ''
    },
    xrays: '',
    provisionalTx: '',
    txOptions: '',
    systemicPhase: '',
    acutePhase: '',
    diseaseControl: '',
    definitivePhase: '',
    maintenancePhase: '',
    extraComment: '',
    supervisor: '',
    nv: '',
    generalWaitlist: false,
    other: ''
  };
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    const fetchUserYear = async () => {
        if (userId) {
            const { data, error } = await supabase
                .from('profiles')
                .select('year')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user year:', error);
                return;
            }

            if (data?.year) {
                setUserYear(data.year);
                // updateGeneratedOutput(formData);
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

  useEffect(() => {
    const fetchNote = async () => {
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
        setTitle(data.title || '');
        const parsedData = parseOutput(data.output);
        setFormData(parsedData);
        updateGeneratedOutput(parsedData);
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

  const parseOutput = (output: string | null) => {
    if (!output) {
      const defaultData = { ...defaultFormData };
      setFormData(defaultData);
      return defaultData; // Return defaultFormData instead of undefined
    }

    const lines = output?.split('\n') || [];
    
    // First line parsing
    const firstLine = lines[0] || '';
    // const departmentMatch = firstLine.match(/Year \d+ (\w+) Clinic/);
    const departmentMatch = firstLine.match(/Year \d*\s*(\w+)\s*Clinic/);
    const clinicMatch = firstLine.match(/Clinic ([^\s]+) for/);
    const appointmentMatch = firstLine.match(/for ([^\n]+)/);

    // E/OE parsing
    const eoeMatch = lines.find(line => line.startsWith('E/OE:'));
    const ioeMatch = lines.find(line => line.startsWith('I/OE:'));
    const medicalHxLine = lines.find(line => line.startsWith('Medical Hx'));
    const xraysLine = lines.find(line => line.match(/(?:OPG|BWs|x-rays)/));

    // Parse E/OE custom entries
    const eoeCustomEntries = {
      temporalis: '',
      masseter: '',
      tmj: '',
      salivaryGlands: '',
      lymphNodes: '',
      facialMuscles: ''
    };
  
    if (eoeMatch) {
      const customMatches = eoeMatch.matchAll(/(\w+):\s*([^,;]+)/g);
      for (const match of Array.from(customMatches)) {
          const key = match[1] as keyof typeof eoeCustomEntries;
          if (key in eoeCustomEntries) {
              eoeCustomEntries[key] = match[2].trim();
          }
      }
    }
    
    // Parse I/OE custom entries
    const ioeCustomEntries = {
      fom: '',
      tongue: '',
      palatalMucosa: '',
      buccalMucosa: '',
      hardTissue: ''
    };

    if (ioeMatch) {
      const customMatches = ioeMatch.matchAll(/(\w+):\s*([^,;]+)/g);
      for (const match of Array.from(customMatches)) {
          const key = match[1] as keyof typeof ioeCustomEntries;
          if (key in ioeCustomEntries) {
              ioeCustomEntries[key] = match[2].trim();
          }
      }
    }
    
    // Treatment phases parsing
    const provisionalTxLine = lines.find(line => line.startsWith('Provisional Tx:'));
    const txOptionsLine = lines.find(line => line.startsWith('Tx options'));
    const systemicPhaseLine = lines.find(line => line.startsWith('Systemic phase:'));
    const acutePhaseLine = lines.find(line => line.startsWith('Acute phase:'));
    const diseaseControlLine = lines.find(line => line.startsWith('Disease control:'));
    const definitivePhaseLine = lines.find(line => line.startsWith('Definitive phase:'));
    const maintenancePhaseLine = lines.find(line => line.startsWith('Maintenance phase:'));
    const extraCommentLine = lines.find(line => line.startsWith('Extra comment:'));
    
    const supervisorLine = lines.find(line => line.startsWith('Supervisor:'));
    const nvLine = lines.find(line => line.startsWith('N/V:'));
    const generalWaitlistLine = lines.find(line => line.includes('placed on general waitlist'));

    const newFormData = {
        ...formData,
        department: departmentMatch?.[1] || 'GDP',
        clinic: clinicMatch?.[1]?.trim() || '',
        appointmentType: appointmentMatch?.[1]?.trim() || '',
        colgateRinse: output.includes('Colgate 1.5% Hydrogen Peroxide Mouth rinse given.'),
        medicalHx: medicalHxLine ? medicalHxLine.split(' ')[2] : 'updated',
        eoe: {
            temporalis: eoeMatch?.includes('temporalis') || false,
            masseter: eoeMatch?.includes('masseter') || false,
            tmj: eoeMatch?.includes('TMJ') || false,
            salivaryGlands: eoeMatch?.includes('salivary glands') || false,
            lymphNodes: eoeMatch?.includes('lymph nodes') || false,
            facialMuscles: eoeMatch?.includes('muscles of facial expression') || false
        },
        eoeCustom: eoeCustomEntries,
        ioe: {
            fom: ioeMatch?.includes('FOM') || false,
            tongue: ioeMatch?.includes('tongue') || false,
            palatalMucosa: ioeMatch?.includes('palatal mucosa') || false,
            buccalMucosa: ioeMatch?.includes('buccal mucosa') || false,
            hardTissue: ioeMatch?.includes('Hard tissue') || false
        },
        ioeCustom: ioeCustomEntries,
        xrays: xraysLine?.trim() || '',
        provisionalTx: provisionalTxLine ? provisionalTxLine.replace('Provisional Tx:', '').trim() : '',
        txOptions: txOptionsLine ? txOptionsLine.replace('Tx options discussed and presented to pt:', '').trim() : '',
        systemicPhase: systemicPhaseLine ? systemicPhaseLine.replace('Systemic phase:', '').trim() : '',
        acutePhase: acutePhaseLine ? acutePhaseLine.replace('Acute phase:', '').trim() : '',
        diseaseControl: diseaseControlLine ? diseaseControlLine.replace('Disease control:', '').trim() : '',
        definitivePhase: definitivePhaseLine ? definitivePhaseLine.replace('Definitive phase:', '').trim() : '',
        maintenancePhase: maintenancePhaseLine ? maintenancePhaseLine.replace('Maintenance phase:', '').trim() : '',
        extraComment: extraCommentLine ? extraCommentLine.replace('Extra comment:', '').trim() : '',
        supervisor: supervisorLine ? supervisorLine.replace('Supervisor: Dr', '').trim() : '',
        nv: nvLine ? nvLine.replace('N/V:', '').trim() : '',
        generalWaitlist: !!generalWaitlistLine,
        other: ''
    };

    setFormData(newFormData);
    // updateGeneratedOutput(newFormData);
    return newFormData;
  };



  const handleChange = (
    field: string,
    value: string | boolean | Record<string, boolean> | Record<string, string>
) => { 
    setFormData(prev => { 
        const updatedData = {
            ...prev,
            [field]: value
        };
        updateGeneratedOutput(updatedData); 
        return updatedData; 
    }); 
};


  const updateGeneratedOutput = (updatedData: any) => {
    if (!updatedData) return;

    const department = updatedData.department || 'GDP';

    let output = `Pt. presented to Year ${userYear} ${department} Clinic ${updatedData.clinic} for ${updatedData.appointmentType}\n`;
    output += "3C's confirmed.";
    if (updatedData.colgateRinse) {
        output += " Colgate 1.5% Hydrogen Peroxide Mouth rinse given.";
    }
    output += "\n";
    
    output += `Medical Hx ${updatedData.medicalHx}\n\n`;

    // E/OE section
    const eoeItems: string[] = [];
    const eoeCustomItems: string[] = [];
    Object.entries(updatedData.eoe).forEach(([key, checked]) => {
        if (checked) {
            eoeItems.push(key === 'tmj' ? 'TMJ' : `${key} m.`);
        } else if (updatedData.eoeCustom[key]) {
            eoeCustomItems.push(`${key}: ${updatedData.eoeCustom[key]}`);
        }
    });
    
    if (eoeItems.length > 0 || eoeCustomItems.length > 0) {
        output += 'E/OE: ';
        if (eoeItems.length > 0) {
            output += `${eoeItems.join(', ')}- NAD`;
        }
        if (eoeCustomItems.length > 0) {
            if (eoeItems.length > 0) output += '; ';
            output += eoeCustomItems.join(', ');
        }
        output += '.\n';
    }

    // I/OE section
    const ioeItems: string[] = [];
    const ioeCustomItems: string[] = [];
    Object.entries(updatedData.ioe).forEach(([key, checked]) => {
        if (checked) {
            ioeItems.push(key === 'hardTissue' ? 'Hard tissue & PSR – as charted in ISOH' : key);
        } else if (updatedData.ioeCustom[key]) {
            ioeCustomItems.push(`${key}: ${updatedData.ioeCustom[key]}`);
        }
    });

    if (ioeItems.length > 0 || ioeCustomItems.length > 0) {
        output += 'I/OE: ';
        if (ioeItems.length > 0) {
            output += `${ioeItems.join(', ')}- NAD`;
        }
        if (ioeCustomItems.length > 0) {
            if (ioeItems.length > 0) output += '; ';
            output += ioeCustomItems.join(', ');
        }
        output += '.\n';
    }

    output += `${updatedData.xrays}\n`;

    // Add all the treatment phases if they have content
    if (updatedData.provisionalTx) output += `Provisional Tx: ${updatedData.provisionalTx}\n`;
    if (updatedData.txOptions) output += `Tx options discussed and presented to pt: ${updatedData.txOptions}\n`;
    if (updatedData.systemicPhase) output += `Systemic phase: ${updatedData.systemicPhase}\n`;
    if (updatedData.acutePhase) output += `Acute phase: ${updatedData.acutePhase}\n`;
    if (updatedData.diseaseControl) output += `Disease control: ${updatedData.diseaseControl}\n`;
    if (updatedData.definitivePhase) output += `Definitive phase: ${updatedData.definitivePhase}\n`;
    if (updatedData.maintenancePhase) output += `Maintenance phase: ${updatedData.maintenancePhase}\n`;
    if (updatedData.extraComment) output += `Extra comment: ${updatedData.extraComment}\n`;
    
    output += "\n";
    output += `Supervisor: Dr ${updatedData.supervisor}\n`;

    // Handle the three mutually exclusive options for the final line
    if (updatedData.generalWaitlist) {
        output += "Patient placed on general waitlist and separated\n";
    } else if (updatedData.nv) {
        output += `N/V: ${updatedData.nv}\n`;
    } else if (updatedData.other) {
        output += updatedData.other + '\n';
    }

    setGeneratedOutput(output);
  };

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

                {/* <form className="space-y-3"> */}
                <form className="flex flex-col gap-4">
                  {/* <div className="space-y-1"> */}
                  <div>
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
                      value={formData.department || 'GDP'}
                      onValueChange={(value) => {
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

                  <Separator className="space-y-8" />

                  {/* E/OE Checkboxes */}
                  <div className="space-y-2">
                    <Label>E/OE Examination</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries({
                        temporalis: "Temporalis m.",
                        masseter: "Masseter m.",
                        tmj: "TMJ",
                        salivaryGlands: "Salivary Glands",
                        lymphNodes: "Lymph Nodes",
                        facialMuscles: "Facial Muscles"
                      }).map(([key, label]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`eoe-${key}`}
                              checked={formData.eoe[key as keyof typeof formData.eoe]}
                              onCheckedChange={(checked) => 
                                  handleChange('eoe', { ...formData.eoe, [key]: !!checked })}
                            />
                            <Label htmlFor={`eoe-${key}`}>{label}</Label>
                          </div>
                          {!formData.eoe[key as keyof typeof formData.eoe] && (
                            <Input
                              placeholder={`Enter findings for ${label}`}
                              value={formData.eoeCustom[key as keyof typeof formData.eoeCustom]}
                              onChange={(e) => handleChange('eoeCustom', { 
                                ...formData.eoeCustom, 
                                [key]: e.target.value 
                              })}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* I/OE Checkboxes */}
                  <div className="space-y-4">
                    <Label>I/OE Examination</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries({
                        fom: "FOM",
                        tongue: "Tongue",
                        palatalMucosa: "Palatal Mucosa",
                        buccalMucosa: "Buccal Mucosa",
                        hardTissue: "Hard Tissue & PSR"
                      }).map(([key, label]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`ioe-${key}`}
                              checked={formData.ioe[key as keyof typeof formData.ioe]}
                              onCheckedChange={(checked) => 
                                  handleChange('ioe', { ...formData.ioe, [key]: !!checked })}
                            />
                            <Label htmlFor={`ioe-${key}`}>{label}</Label>
                          </div>
                          {!formData.ioe[key as keyof typeof formData.ioe] && (
                            <Input
                              placeholder={`Enter findings for ${label}`}
                              value={formData.ioeCustom[key as keyof typeof formData.ioeCustom]}
                              onChange={(e) => handleChange('ioeCustom', { 
                                ...formData.ioeCustom, 
                                [key]: e.target.value 
                              })}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* X-rays Selection */}
                  <div className="space-y-1">
                      <Label>X-rays</Label>
                      <Select value={formData.xrays} onValueChange={(value) => handleChange('xrays', value)}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select x-ray option" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="OPG & 2x BWs taken">OPG & 2x BWs taken</SelectItem>
                              <SelectItem value="2x BWs taken. No OPG Indicated">2x BWs taken. No OPG Indicated</SelectItem>
                              <SelectItem value="No x-rays taken">No x-rays taken</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>

                  {/* Treatment Phases */}
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <Label>Provisional Treatment</Label>
                          <Textarea
                              value={formData.provisionalTx}
                              onChange={(e) => handleChange('provisionalTx', e.target.value)}
                              placeholder="Enter provisional treatment..."
                          />
                      </div>

                      <div className="space-y-1">
                          <Label>Treatment Options</Label>
                          <Textarea
                              value={formData.txOptions}
                              onChange={(e) => handleChange('txOptions', e.target.value)}
                              placeholder="Enter treatment options discussed..."
                          />
                      </div>

                      <div className="space-y-1">
                          <Label>Systemic Phase</Label>
                          <Textarea
                              value={formData.systemicPhase}
                              onChange={(e) => handleChange('systemicPhase', e.target.value)}
                              placeholder="Enter systemic phase details..."
                          />
                      </div>

                      <div className="space-y-1">
                          <Label>Acute Phase</Label>
                          <Textarea
                              value={formData.acutePhase}
                              onChange={(e) => handleChange('acutePhase', e.target.value)}
                              placeholder="Enter acute phase details..."
                          />
                      </div>

                      <div className="space-y-1">
                          <Label>Disease Control</Label>
                          <Textarea
                              value={formData.diseaseControl}
                              onChange={(e) => handleChange('diseaseControl', e.target.value)}
                              placeholder="Enter disease control details..."
                          />
                      </div>

                      <div className="space-y-1">
                          <Label>Definitive Phase</Label>
                          <Textarea
                              value={formData.definitivePhase}
                              onChange={(e) => handleChange('definitivePhase', e.target.value)}
                              placeholder="Enter definitive phase details..."
                          />
                      </div>

                      <div className="space-y-1">
                          <Label>Maintenance Phase</Label>
                          <Textarea
                              value={formData.maintenancePhase}
                              onChange={(e) => handleChange('maintenancePhase', e.target.value)}
                              placeholder="Enter maintenance phase details..."
                          />
                      </div>

                      <div className="space-y-1">
                          <Label>Extra Comments</Label>
                          <Textarea
                              value={formData.extraComment}
                              onChange={(e) => handleChange('extraComment', e.target.value)}
                              placeholder="Enter any additional comments..."
                          />
                      </div>
                  </div>

                  <Separator className="my-1" />

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


