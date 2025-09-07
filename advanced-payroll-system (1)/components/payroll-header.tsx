"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Upload } from "lucide-react"

interface PayrollHeaderProps {
  onImportCSV?: (file: File) => void
  onExportCSV?: () => void
}

export function PayrollHeader({ onImportCSV, onExportCSV }: PayrollHeaderProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv" && onImportCSV) {
      onImportCSV(file)
    }
    // Reset input value to allow re-uploading the same file
    event.target.value = ""
  }

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="Search days off..." className="pl-10 w-64" />
            </div>

            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days Off</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="csv-upload"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </label>
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={onExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
