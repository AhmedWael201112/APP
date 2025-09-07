"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  RefreshCw,
  Save,
  Search,
  Clock,
  BarChart3,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ChevronUp,
  ChevronDown,
  Edit3,
  Bold,
  Highlighter,
  Undo2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TimeSheetData {
  id: number
  name: string
  day: string
  date: string
  check_in: string
  check_out: string
  total_hours: string
  overtime: string
  wasted_time: string
  permission: number
  mission: number
  leave_type: number
  delay: number
  deduction: number
  bonus: number
  notes: string
  status: string
}

interface WeeklySummary {
  employee_name: string
  total_hours: number
  overtime_hours: number
  total_pay: number
  days_worked: number
}

export function TimeSheetDashboard() {
  const [timeSheetData, setTimeSheetData] = useState<TimeSheetData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedProject, setSelectedProject] = useState("all")
  const [approvalFilter, setApprovalFilter] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("entries")
  const [editingNotes, setEditingNotes] = useState<{ rowIndex: number; notes: string } | null>(null)
  const [boldCells, setBoldCells] = useState<Set<string>>(new Set())
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set())
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null)
  const [undoHistory, setUndoHistory] = useState<TimeSheetData[][]>([])
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    name: 180,
    day: 120,
    date: 140,
    check_in: 120,
    check_out: 120,
    total_hours: 130,
    overtime: 120,
    wasted_time: 130,
    permission: 120,
    mission: 120,
    leave_type: 130,
    delay: 120,
    deduction: 130,
    bonus: 120,
    notes: 200,
  })
  const [resizing, setResizing] = useState<{ column: string; startX: number; startWidth: number } | null>(null)
  const { toast } = useToast()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance"]
  const projects = ["Website Redesign", "Mobile App", "Marketing Campaign", "System Upgrade", "Training Program"]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizing) {
        const diff = e.clientX - resizing.startX
        const newWidth = Math.max(80, resizing.startWidth + diff)
        setColumnWidths((prev) => ({
          ...prev,
          [resizing.column]: newWidth,
        }))
      }
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [resizing])

  useEffect(() => {
    loadTimeSheetData()
  }, [])

  const calculateColumnSum = (column: keyof TimeSheetData) => {
    return timeSheetData.reduce((sum, entry) => {
      const value = entry[column]
      if (typeof value === "string" && value.includes(":")) {
        // Handle time format (HH:MM)
        const [hours, minutes] = value.split(":").map(Number)
        return sum + hours + minutes / 60
      } else if (typeof value === "number") {
        return sum + value
      }
      return sum
    }, 0)
  }

  const calculateNetValue = () => {
    const overtimeSum = calculateColumnSum("overtime")
    const wastedTimeSum = calculateColumnSum("wasted_time")
    return overtimeSum - wastedTimeSum
  }

  const loadTimeSheetData = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Loading advanced time sheet data...")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData: TimeSheetData[] = [
        {
          id: 1,
          name: "John Doe",
          day: "Monday",
          date: "2024-01-15",
          check_in: "09:00:00",
          check_out: "17:30:00",
          total_hours: "08:30:00",
          overtime: "00:30:00",
          wasted_time: "00:15:00",
          permission: 0.0,
          mission: 2.5,
          leave_type: 0.0,
          delay: 0.25,
          deduction: 15.0,
          bonus: 50.0,
          notes: "Completed all assigned tasks efficiently",
          status: "Active",
        },
        {
          id: 2,
          name: "Jane Smith",
          day: "Monday",
          date: "2024-01-15",
          check_in: "08:30:00",
          check_out: "18:00:00",
          total_hours: "09:00:00",
          overtime: "01:00:00",
          wasted_time: "00:30:00",
          permission: 1.0,
          mission: 0.0,
          leave_type: 0.0,
          delay: 0.0,
          deduction: 0.0,
          bonus: 75.0,
          notes: "Worked late to meet campaign deadline",
          status: "Active",
        },
        {
          id: 3,
          name: "Ahmed Hassan",
          day: "Monday",
          date: "2024-01-15",
          check_in: "09:15:00",
          check_out: "17:45:00",
          total_hours: "08:00:00",
          overtime: "00:00:00",
          wasted_time: "00:30:00",
          permission: 0.0,
          mission: 1.0,
          leave_type: 0.0,
          delay: 0.25,
          deduction: 10.0,
          bonus: 25.0,
          notes: "API endpoints completed successfully",
          status: "Active",
        },
        {
          id: 4,
          name: "Sarah Johnson",
          day: "Monday",
          date: "2024-01-15",
          check_in: "08:00:00",
          check_out: "19:00:00",
          total_hours: "10:00:00",
          overtime: "02:00:00",
          wasted_time: "01:00:00",
          permission: 0.0,
          mission: 3.0,
          leave_type: 0.0,
          delay: 0.0,
          deduction: 0.0,
          bonus: 100.0,
          notes: "Client meetings and system demonstrations",
          status: "Active",
        },
        {
          id: 5,
          name: "Mohamed Ali",
          day: "Monday",
          date: "2024-01-15",
          check_in: "09:30:00",
          check_out: "",
          total_hours: "00:00:00",
          overtime: "00:00:00",
          wasted_time: "00:00:00",
          permission: 0.0,
          mission: 0.0,
          leave_type: 4.0,
          delay: 0.5,
          deduction: 20.0,
          bonus: 0.0,
          notes: "Currently conducting training session",
          status: "Active",
        },
      ]

      setTimeSheetData(mockData)
      toast({
        title: "Time Sheet Loaded",
        description: "Advanced time sheet data loaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load time sheet data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproval = async (id: number, status: "approved" | "rejected") => {
    const updatedData = timeSheetData.map((entry) =>
      entry.id === id
        ? { ...entry, notes: `${entry.notes} - ${status === "approved" ? "Approved" : "Rejected"} by manager` }
        : entry,
    )
    setTimeSheetData(updatedData)

    toast({
      title: status === "approved" ? "Entry Approved" : "Entry Rejected",
      description: `Time sheet entry has been ${status}`,
    })
  }

  const handleExport = () => {
    const csvContent = [
      [
        "Name",
        "Day",
        "Date",
        "Check In",
        "Check Out",
        "Total Hours",
        "Overtime",
        "Wasted Time",
        "Permission",
        "Mission",
        "Leave Type",
        "Delay",
        "Deduction",
        "Bonus",
        "Notes",
      ],
      ...filteredData.map((entry) => [
        entry.name,
        entry.day,
        entry.date,
        entry.check_in,
        entry.check_out,
        entry.total_hours,
        entry.overtime,
        entry.wasted_time,
        entry.permission,
        entry.mission,
        entry.leave_type,
        entry.delay,
        entry.deduction,
        entry.bonus,
        entry.notes,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `timesheet-${selectedDate}.csv`
    a.click()

    toast({
      title: "Export Complete",
      description: "Time sheet data exported successfully",
    })
  }

  const handleSave = () => {
    // Placeholder for save functionality
    toast({
      title: "Save Complete",
      description: "Time sheet data saved successfully",
    })
  }

  const handleAddRow = () => {
    const newEntry: TimeSheetData = {
      id: Date.now(),
      name: "",
      day: "",
      date: new Date().toISOString().split("T")[0],
      check_in: "",
      check_out: "",
      total_hours: "",
      overtime: "",
      wasted_time: "",
      permission: 0,
      mission: 0,
      leave_type: 0,
      delay: 0,
      deduction: 0,
      bonus: 0,
      notes: "",
      status: "Active",
    }
    const newData = [...timeSheetData, newEntry]
    setTimeSheetData(newData)
    setHasUnsavedChanges(true)
    setUndoHistory((prev) => [...prev, newData])
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Submitting timesheet data...")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedData = timeSheetData.map((entry) => ({ ...entry, status: "Saved" }))
      setTimeSheetData(updatedData)
      setHasUnsavedChanges(false)
      setUndoHistory([updatedData])

      toast({
        title: "Timesheet Saved",
        description: `Successfully saved ${timeSheetData.length} timesheet entries`,
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save timesheet data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUndo = () => {
    if (undoHistory.length > 1) {
      const previousState = undoHistory[undoHistory.length - 2]
      setTimeSheetData(previousState)
      setUndoHistory((prev) => prev.slice(0, -1))
      setHasUnsavedChanges(false)
      toast({
        title: "Changes Undone",
        description: "Reverted to previous state",
      })
    }
  }

  const handleBold = () => {
    if (!selectedCell) {
      toast({
        title: "No Cell Selected",
        description: "Click on a cell first to apply bold formatting",
      })
      return
    }

    const cellId = `${selectedCell.row}-${selectedCell.col}`
    const newBoldCells = new Set(boldCells)

    if (newBoldCells.has(cellId)) {
      newBoldCells.delete(cellId)
      toast({
        title: "Bold Removed",
        description: "Bold formatting removed from selected cell",
      })
    } else {
      newBoldCells.add(cellId)
      toast({
        title: "Bold Applied",
        description: "Bold formatting applied to selected cell",
      })
    }

    setBoldCells(newBoldCells)
  }

  const handleHighlight = () => {
    if (!selectedCell) {
      toast({
        title: "No Cell Selected",
        description: "Click on a cell first to apply highlight",
      })
      return
    }

    const cellId = `${selectedCell.row}-${selectedCell.col}`
    const newHighlightedCells = new Set(highlightedCells)

    if (newHighlightedCells.has(cellId)) {
      newHighlightedCells.delete(cellId)
      toast({
        title: "Highlight Removed",
        description: "Highlight removed from selected cell",
      })
    } else {
      newHighlightedCells.add(cellId)
      toast({
        title: "Highlight Applied",
        description: "Highlight applied to selected cell",
      })
    }

    setHighlightedCells(newHighlightedCells)
  }

  const handleExportCSV = () => {
    try {
      const headers = [
        "Name",
        "Day",
        "Date",
        "Check In",
        "Check Out",
        "Total Hours",
        "Overtime",
        "Wasted Time",
        "Permission",
        "Mission",
        "Leave Type",
        "Delay",
        "Deduction",
        "Bonus",
        "Notes",
      ]

      const csvContent = [
        headers.join(","),
        ...timeSheetData.map((row) =>
          [
            `"${row.name}"`,
            `"${row.day}"`,
            row.date,
            row.check_in,
            row.check_out,
            row.total_hours,
            row.overtime,
            row.wasted_time,
            row.permission,
            row.mission,
            row.leave_type,
            row.delay,
            row.deduction,
            row.bonus,
            `"${row.notes}"`,
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `timesheet-data-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "CSV Exported",
        description: `Timesheet data exported with ${timeSheetData.length} records`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCellSelect = (rowIndex: number, columnKey: string) => {
    setSelectedCell({ row: rowIndex, col: columnKey })
  }

  const handleInputChange = (index: number, field: keyof TimeSheetData, value: string | number) => {
    const updatedData = [...timeSheetData]
    updatedData[index] = { ...updatedData[index], [field]: value }
    setTimeSheetData(updatedData)
    setHasUnsavedChanges(true)
    setUndoHistory((prev) => [...prev, updatedData])
  }

  const filteredData = timeSheetData.filter((entry) => {
    const matchesSearch =
      entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.notes.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || true // No department field in new schema
    const matchesProject = selectedProject === "all" || true // No project field in new schema
    const matchesEmployee = selectedEmployee === null || entry.id === selectedEmployee

    return matchesSearch && matchesDepartment && matchesProject && matchesEmployee
  })

  const analytics = {
    totalEmployees: new Set(timeSheetData.map((e) => e.name)).size,
    totalHours: timeSheetData.length,
    totalOvertimeHours: timeSheetData.filter((e) => e.overtime !== "00:00:00").length,
    totalPayroll: timeSheetData.reduce((sum, e) => sum + e.bonus - e.deduction, 0),
    pendingApprovals: timeSheetData.filter((e) => !e.notes.includes("Approved") && !e.notes.includes("Rejected"))
      .length,
    completedEntries: timeSheetData.filter((e) => e.check_out !== "").length,
  }

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -200, behavior: "smooth" })
    }
  }

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 200, behavior: "smooth" })
    }
  }

  const getWeeklySummary = () => {
    const summary: WeeklySummary[] = []
    const employeeNames = new Set(timeSheetData.map((e) => e.name))

    employeeNames.forEach((name) => {
      const employeeEntries = timeSheetData.filter((e) => e.name === name)
      const totalHours = employeeEntries.reduce((sum, e) => sum + Number.parseFloat(e.total_hours.split(":")[0]), 0)
      const overtimeHours = employeeEntries.reduce((sum, e) => sum + Number.parseFloat(e.overtime.split(":")[0]), 0)
      const totalPay = employeeEntries.reduce((sum, e) => sum + e.bonus - e.deduction, 0)
      const daysWorked = employeeEntries.filter((e) => e.check_out !== "").length

      summary.push({
        employee_name: name,
        total_hours: totalHours,
        overtime_hours: overtimeHours,
        total_pay: totalPay,
        days_worked: daysWorked,
      })
    })

    return summary
  }

  const getDotColor = (notes: string) => {
    if (notes.includes("Approved") || notes.includes("Rejected")) {
      return "bg-purple-500"
    }
    return notes ? "bg-green-500" : "bg-red-500"
  }

  const handleNotesEdit = (rowIndex: number, newNotes: string) => {
    const updatedData = [...timeSheetData]
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      notes: newNotes,
    }
    setTimeSheetData(updatedData)
    setEditingNotes(null)
    toast({
      title: "Notes Updated",
      description: "Time sheet notes have been updated successfully",
    })
  }

  const handleResizeStart = (column: string, e: React.MouseEvent) => {
    e.preventDefault()
    setResizing({
      column,
      startX: e.clientX,
      startWidth: columnWidths[column],
    })
  }

  const handleDayOffToggle = (id: number) => {
    setTimeSheetData((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, leave_type: entry.leave_type === 1 ? 0 : 1 } : entry)),
    )
  }

  const handleStatusChange = (id: number, newStatus: string) => {
    setTimeSheetData((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry)))
  }

  return (
    <div ref={scrollContainerRef} className="p-6 space-y-6 relative max-h-screen overflow-y-auto">
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-2">
        <Button
          onClick={scrollUp}
          size="sm"
          className="bg-slate-700 hover:bg-slate-600 text-white rounded-full p-2 shadow-lg"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          onClick={scrollDown}
          size="sm"
          className="bg-slate-700 hover:bg-slate-600 text-white rounded-full p-2 shadow-lg"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalHours}</div>
            <p className="text-xs text-muted-foreground">{analytics.totalOvertimeHours} with overtime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalPayroll.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingApprovals}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Time Entries</TabsTrigger>
          <TabsTrigger value="summary">Weekly Summary</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Advanced Time Sheet Management</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search employees, days, notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>

                <select
                  value={selectedEmployee || ""}
                  onChange={(e) => setSelectedEmployee(e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="text-slate-800">
                    All Employees
                  </option>
                  {timeSheetData.map((entry) => (
                    <option key={entry.id} value={entry.id} className="text-slate-800">
                      {entry.name || `Entry ${entry.id}`}
                    </option>
                  ))}
                </select>

                <Input
                  type="date"
                  placeholder="Filter by date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />

                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <p className="text-sm text-white/80 bg-white/10 px-3 py-2 rounded-md">
                  {selectedEmployee
                    ? `Showing data for: ${timeSheetData.find((e) => e.id === selectedEmployee)?.name || `Entry ${selectedEmployee}`} (${filteredData.length} records)`
                    : `Showing all entries (${filteredData.length} records)`}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button onClick={handleAddRow} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                    disabled={isLoading}
                    title="Ctrl+S"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                  <Button
                    onClick={handleUndo}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    disabled={undoHistory.length <= 1}
                    title="Ctrl+Z"
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    Undo
                  </Button>
                  <Button
                    onClick={loadTimeSheetData}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleBold}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Bold className="w-4 h-4 mr-2" />
                    Bold
                  </Button>
                  <Button
                    onClick={handleHighlight}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Highlighter className="w-4 h-4 mr-2" />
                    Highlight
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="h-[350px] overflow-auto border border-slate-200 rounded-lg">
                <table
                  className="w-full"
                  style={{ minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0) + 120 }}
                >
                  <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 sticky top-0 z-10">
                    <tr>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.name, minWidth: columnWidths.name }}
                      >
                        Name
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("name", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.day, minWidth: columnWidths.day }}
                      >
                        Day
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("day", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.date, minWidth: columnWidths.date }}
                      >
                        Date
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("date", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.check_in, minWidth: columnWidths.check_in }}
                      >
                        Check In
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("check_in", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.check_out, minWidth: columnWidths.check_out }}
                      >
                        Check Out
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("check_out", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.total_hours, minWidth: columnWidths.total_hours }}
                      >
                        Total Hours
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("total_hours", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.overtime, minWidth: columnWidths.overtime }}
                      >
                        Overtime
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("overtime", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.wasted_time, minWidth: columnWidths.wasted_time }}
                      >
                        Wasted Time
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("wasted_time", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.permission, minWidth: columnWidths.permission }}
                      >
                        Permission
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("permission", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.mission, minWidth: columnWidths.mission }}
                      >
                        Mission
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("mission", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.leave_type, minWidth: columnWidths.leave_type }}
                      >
                        Day Off
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("leave_type", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.delay, minWidth: columnWidths.delay }}
                      >
                        Delay
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("delay", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.deduction, minWidth: columnWidths.deduction }}
                      >
                        Deduction
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("deduction", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.bonus, minWidth: columnWidths.bonus }}
                      >
                        Bonus
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("bonus", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600 relative"
                        style={{ width: columnWidths.notes, minWidth: columnWidths.notes }}
                      >
                        Notes
                        <div
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-slate-400 transition-colors"
                          onMouseDown={(e) => handleResizeStart("notes", e)}
                        />
                      </th>
                      <th
                        className="px-4 py-3 text-center text-sm font-medium text-white border-b border-slate-600"
                        style={{ width: 120, minWidth: 120 }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((entry, index) => (
                      <tr key={entry.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td
                          className="px-4 py-3 text-center cursor-pointer"
                          style={{ width: columnWidths.name, minWidth: columnWidths.name }}
                          onClick={() => handleCellSelect(index, "name")}
                        >
                          <Input
                            type="text"
                            value={entry.name}
                            onChange={(e) => handleInputChange(index, "name", e.target.value)}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.day, minWidth: columnWidths.day }}
                          onClick={() => handleCellSelect(index, "day")}
                        >
                          <Input
                            type="text"
                            value={entry.day}
                            onChange={(e) => handleInputChange(index, "day", e.target.value)}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.date, minWidth: columnWidths.date }}
                          onClick={() => handleCellSelect(index, "date")}
                        >
                          <Input
                            type="date"
                            value={entry.date}
                            onChange={(e) => handleInputChange(index, "date", e.target.value)}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.check_in, minWidth: columnWidths.check_in }}
                          onClick={() => handleCellSelect(index, "check_in")}
                        >
                          <Input
                            type="time"
                            value={entry.check_in}
                            onChange={(e) => handleInputChange(index, "check_in", e.target.value)}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.check_out, minWidth: columnWidths.check_out }}
                          onClick={() => handleCellSelect(index, "check_out")}
                        >
                          <Input
                            type="time"
                            value={entry.check_out}
                            onChange={(e) => handleInputChange(index, "check_out", e.target.value)}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.total_hours, minWidth: columnWidths.total_hours }}
                          onClick={() => handleCellSelect(index, "total_hours")}
                        >
                          <Input
                            type="time"
                            value={entry.total_hours}
                            onChange={(e) => handleInputChange(index, "total_hours", e.target.value)}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.overtime, minWidth: columnWidths.overtime }}
                          onClick={() => handleCellSelect(index, "overtime")}
                        >
                          <Input
                            type="time"
                            value={entry.overtime}
                            onChange={(e) => handleInputChange(index, "overtime", e.target.value)}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm text-blue-600 w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.wasted_time, minWidth: columnWidths.wasted_time }}
                          onClick={() => handleCellSelect(index, "wasted_time")}
                        >
                          <Input
                            type="time"
                            value={entry.wasted_time}
                            onChange={(e) => handleInputChange(index, "wasted_time", e.target.value)}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm text-red-600 w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.permission, minWidth: columnWidths.permission }}
                          onClick={() => handleCellSelect(index, "permission")}
                        >
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.permission}
                            onChange={(e) =>
                              handleInputChange(index, "permission", Number.parseFloat(e.target.value) || 0)
                            }
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.mission, minWidth: columnWidths.mission }}
                          onClick={() => handleCellSelect(index, "mission")}
                        >
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.mission}
                            onChange={(e) =>
                              handleInputChange(index, "mission", Number.parseFloat(e.target.value) || 0)
                            }
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm w-full text-center"
                          />
                        </td>
                        <td className="px-4 py-3 text-center" style={{ width: columnWidths.leave_type }}>
                          <div className="flex justify-center">
                            <div className="relative group">
                              <input
                                type="checkbox"
                                checked={entry.leave_type === 1}
                                onChange={() => handleDayOffToggle(entry.id)}
                                className="sr-only"
                                id={`dayoff-${entry.id}`}
                              />
                              <label
                                htmlFor={`dayoff-${entry.id}`}
                                className={`
                                  relative flex items-center justify-center w-6 h-6 rounded-lg cursor-pointer
                                  transition-all duration-300 ease-in-out transform hover:scale-110
                                  ${
                                    entry.leave_type === 1
                                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 border-2 border-emerald-400"
                                      : "bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                  }
                                  group-hover:shadow-xl
                                `}
                              >
                                {entry.leave_type === 1 && (
                                  <svg
                                    className="w-4 h-4 text-white animate-pulse"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                                <div
                                  className={`
                                    absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20
                                    ${entry.leave_type === 1 ? "bg-white" : "bg-gray-200"}
                                    transition-opacity duration-200
                                  `}
                                />
                              </label>
                            </div>
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.delay, minWidth: columnWidths.delay }}
                          onClick={() => handleCellSelect(index, "delay")}
                        >
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.delay}
                            onChange={(e) => handleInputChange(index, "delay", Number.parseFloat(e.target.value) || 0)}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.deduction, minWidth: columnWidths.deduction }}
                          onClick={() => handleCellSelect(index, "deduction")}
                        >
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.deduction}
                            onChange={(e) =>
                              handleInputChange(index, "deduction", Number.parseFloat(e.target.value) || 0)
                            }
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm text-red-600 w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.bonus, minWidth: columnWidths.bonus }}
                          onClick={() => handleCellSelect(index, "bonus")}
                        >
                          <Input
                            type="number"
                            step="0.01"
                            value={entry.bonus}
                            onChange={(e) => handleInputChange(index, "bonus", Number.parseFloat(e.target.value) || 0)}
                            className="border-0 bg-transparent p-0 focus:ring-0 text-sm text-green-600 w-full text-center"
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          style={{ width: columnWidths.notes, minWidth: columnWidths.notes }}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getDotColor(entry.notes)}`}></div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-blue-100 transition-all"
                              onClick={() => {
                                setEditingNotes({ rowIndex: index, notes: entry.notes })
                              }}
                            >
                              <Edit3 className="w-3 h-3 text-blue-600" />
                            </Button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center" style={{ width: 120 }}>
                          <select
                            value={entry.status || "Active"}
                            onChange={(e) => handleStatusChange(entry.id, e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Rows Container - Enhanced with hidden scrollbar */}
              <div className="mt-4 mb-8 border border-slate-200 rounded-lg overflow-x-auto scrollbar-hide">
                <style jsx>{`
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                {/* الاجمالي (Total) Row - Simplified Design */}
                <div className="bg-slate-100 border-t-2 border-slate-400 rounded-lg mx-2 mb-2">
                  <table
                    className="w-full"
                    style={{ minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0) + 120 }}
                  >
                    <tbody>
                      <tr>
                        <td
                          className="px-4 py-2 text-center font-bold text-sm bg-slate-600 text-white border-r border-slate-300 rounded-l-lg"
                          style={{ width: columnWidths.name }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-base">∑</span>
                            <span>الاجمالي</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center" style={{ width: columnWidths.day }}>
                          <div className="bg-blue-600 text-white font-semibold rounded px-2 py-1">
                            <div className="text-xs mb-1">Hours</div>
                            <div className="text-sm font-bold">
                              {calculateColumnSum("total_hours").toFixed(1)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center" style={{ width: columnWidths.date }}>
                          <div className="bg-emerald-600 text-white font-semibold rounded px-2 py-1">
                            <div className="text-xs mb-1">Overtime</div>
                            <div className="text-sm font-bold">
                              {calculateColumnSum("overtime").toFixed(1)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center" style={{ width: columnWidths.check_in }}>
                          <div className="bg-red-600 text-white font-semibold rounded px-2 py-1">
                            <div className="text-xs mb-1">Wasted</div>
                            <div className="text-sm font-bold">
                              {calculateColumnSum("wasted_time").toFixed(1)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center" style={{ width: columnWidths.check_out }}>
                          <div className="bg-purple-600 text-white font-semibold rounded px-2 py-1">
                            <div className="text-xs mb-1">Permission</div>
                            <div className="text-sm font-bold">
                              {calculateColumnSum("permission").toFixed(1)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center" style={{ width: columnWidths.total_hours }}>
                          <div className="bg-indigo-600 text-white font-semibold rounded px-2 py-1">
                            <div className="text-xs mb-1">Mission</div>
                            <div className="text-sm font-bold">
                              {calculateColumnSum("mission").toFixed(1)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center" style={{ width: columnWidths.overtime }}>
                          <div className="bg-teal-600 text-white font-semibold rounded px-2 py-1">
                            <div className="text-xs mb-1">Day Off</div>
                            <div className="text-sm font-bold">
                              {calculateColumnSum("leave_type").toFixed(0)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center" style={{ width: columnWidths.wasted_time }}>
                          <div className="bg-orange-600 text-white font-semibold rounded px-2 py-1">
                            <div className="text-xs mb-1">Delay</div>
                            <div className="text-sm font-bold">
                              {calculateColumnSum("delay").toFixed(2)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center" style={{ width: columnWidths.permission }}>
                          <div className="bg-red-600 text-white font-semibold rounded px-2 py-1">
                            <div className="text-xs mb-1">Deduction</div>
                            <div className="text-sm font-bold">
                              {calculateColumnSum("deduction").toFixed(2)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center" style={{ width: columnWidths.mission }}>
                          <div className="bg-emerald-600 text-white font-semibold rounded px-2 py-1">
                            <div className="text-xs mb-1">Bonus</div>
                            <div className="text-sm font-bold">
                              {calculateColumnSum("bonus").toFixed(2)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: 60 }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: 60 }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: 60 }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: 60 }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: 60 }}>—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* الصافي (Net) Row - Simplified Design */}
                <div className="bg-slate-700 border-t-2 border-amber-400 rounded-lg mx-2 mb-4">
                  <table
                    className="w-full"
                    style={{ minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0) + 120 }}
                  >
                    <tbody>
                      <tr>
                        <td
                          className="px-4 py-2 text-center font-bold text-sm bg-amber-500 text-slate-900 border-r border-amber-300 rounded-l-lg"
                          style={{ width: columnWidths.name }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-base">📈</span>
                            <span>الصافي</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center" style={{ width: columnWidths.day }}>
                          <div className="bg-amber-500 text-slate-900 font-bold rounded px-3 py-2">
                            <div className="text-xs mb-1 font-semibold">NET VALUE</div>
                            <div className="text-base font-bold">
                              {calculateNetValue().toFixed(1)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: columnWidths.date }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: columnWidths.check_in }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: columnWidths.check_out }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: columnWidths.total_hours }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: columnWidths.overtime }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: columnWidths.wasted_time }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: columnWidths.permission }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: columnWidths.mission }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: 60 }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: 60 }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: 60 }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: 60 }}>—</td>
                        <td className="px-2 py-2 text-center text-slate-400 text-xs" style={{ width: 60 }}>—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              {filteredData.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No time sheet entries found</p>
                  <p className="text-sm">Add a new entry to get started</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Employee</th>
                      <th className="text-left p-2">Days Worked</th>
                      <th className="text-left p-2">Total Hours</th>
                      <th className="text-left p-2">Overtime Hours</th>
                      <th className="text-left p-2">Total Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getWeeklySummary().map((summary, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{summary.employee_name}</td>
                        <td className="p-2">{summary.days_worked}</td>
                        <td className="p-2">{summary.total_hours.toFixed(1)}h</td>
                        <td className="p-2">{summary.overtime_hours.toFixed(1)}h</td>
                        <td className="p-2 font-medium">${summary.total_pay.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Employee</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Notes</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSheetData
                      .filter((e) => !e.notes.includes("Approved") && !e.notes.includes("Rejected"))
                      .map((entry, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{entry.name}</td>
                          <td className="p-2">{entry.date}</td>
                          <td className="p-2">{entry.notes}</td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproval(entry.id, "approved")}
                                className="bg-green-500 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApproval(entry.id, "rejected")}
                                className="bg-red-500 hover:bg-red-700 text-white"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingNotes && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Notes</h2>
            <Input
              type="text"
              value={editingNotes.notes}
              onChange={(e) => setEditingNotes({ ...editingNotes, notes: e.target.value })}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditingNotes(null)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  editingNotes?.rowIndex !== undefined && handleNotesEdit(editingNotes.rowIndex, editingNotes.notes)
                }
              >
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )\
}
