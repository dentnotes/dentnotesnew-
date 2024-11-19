"use client"

import { useState } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import styles from "./DiagnosticForm.module.css"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"



export default function Account() {
  const [formData, setFormData] = useState({
    year: '',
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

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateOutput = () => {
    let output = `Pt. presented to ${formData.year} Year ${formData.department} Clinic ${formData.clinic} for\n${formData.appointmentType}\n`
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
                  {/* <div className="form-group"> */}
                  <div className="space-y-1">
                    <Label>Year</Label>
                    <Select onValueChange={(value) => handleChange('year', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3rd">3rd</SelectItem>
                        <SelectItem value="4th">4th</SelectItem>
                        <SelectItem value="5th">5th</SelectItem>
                      </SelectContent>
                    </Select> 
                  </div>
                  
                  {/* <div className="form-group"> */}
                  <div className="space-y-1">
                    <Label>Department</Label>
                    <Select onValueChange={(value) => handleChange('department', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GDP">GDP</SelectItem>
                        <SelectItem value="Pros">Pros</SelectItem>
                        <SelectItem value="Endo">Endo</SelectItem>
                        <SelectItem value="Perio">Perio</SelectItem>
                      </SelectContent>
                    </Select>
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
          <h2 className="text-xl mb-4">Generated Output</h2>
          <div className="space-y-2">
            <div className="output-container">
              {/* <h2 className="output-title">Generated Output</h2> */}
              <pre className="output">{generateOutput()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

