"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Plus,
  Save,
  Undo2,
  Redo2,
  RefreshCw,
  Bold,
  Highlighter,
  Trash2,
  Calendar,
  User,
  Clock,
  Users,
  BarChart3,
  AlertCircle,
  Filter,
  Download,
  Edit3,
  ChevronDown,
  Gift,
  Calculator,
  TrendingDown,
  Minus,
  CheckCircle,
  ChevronRight,
  RotateCcw,
} from "lucide-react"

import LeaveDataVisualizations from "./leave-data-visualizations"

interface Employee {
  id: number
  name: string
  employeeId: string
  hireDate: string
  department: string
}

interface LeaveRecord {
  id: number
  employeeName: string
  employeeId: string
  description: string
  day: string
  date: string
  regular: number
  emergency: number
  sick: number
  deduction: number
  unpaid: number
  other: number
  status: "Loaded" | "Modified" | "Pending" | "Success" | "Failed" | string
}

interface LeaveSummary {
  previousYearBalance: { col1: number; col2: number }
  entitledBalance2025: { col1: number; col2: number }
  otherDaysEntitled: number
  totalEntitledBalance: { col1: number; col2: number }
  consumedBalance2025: {
    regular: number
    emergency: number
    sick: number
    deduction: number
    unpaid: number
    other: number
  }
  totalConsumedLeaves: number
  remainingBalance: { col1: number; col2: number }
}

export function DaysOffDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null)
  const [boldCells, setBoldCells] = useState<Set<string>>(new Set())
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set())
  const [undoHistory, setUndoHistory] = useState<LeaveRecord[][]>([])
  const [redoHistory, setRedoHistory] = useState<LeaveRecord[][]>([])
  const [editingDescription, setEditingDescription] = useState<{ rowIndex: number; description: string } | null>(null)
  const [leaveSummary, setLeaveSummary] = useState<LeaveSummary>({
    previousYearBalance: { col1: 0, col2: 0 },
    entitledBalance2025: { col1: 30, col2: 25 },
    otherDaysEntitled: 5,
    totalEntitledBalance: { col1: 35, col2: 25 },
    consumedBalance2025: {
      regular: 0,
      emergency: 0,
      sick: 0,
      deduction: 0,
      unpaid: 0,
      other: 0,
    },
    totalConsumedLeaves: 0,
    remainingBalance: { col1: 35, col2: 25 },
  })
  const { toast } = useToast()

  const [columnWidths, setColumnWidths] = useState({
    employeeName: 200,
    employeeId: 100,
    description: 150,
    day: 120,
    date: 130,
    regular: 60,
    emergency: 60,
    sick: 60,
    deduction: 60,
    unpaid: 60,
    other: 60,
    status: 120,
  })

  const [focusedCell, setFocusedCell] = useState<{ row: number; col: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [isResizing, setIsResizing] = useState(false)
  const [resizingColumn, setResizingColumn] = useState<string | null>(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [showLegend, setShowLegend] = useState(false)
  const tableRef = useRef<HTMLTableElement>(null)

  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isExpanded, setIsExpanded] = useState(true)
  const [animationKey, setAnimationKey] = useState(0)
  const [showTooltips, setShowTooltips] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const handleMouseDown = (e: React.MouseEvent, column: string) => {
    setIsResizing(true)
    setResizingColumn(column)
    setStartX(e.clientX)
    setStartWidth(columnWidths[column as keyof typeof columnWidths])
    e.preventDefault()
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizingColumn) return

      const diff = e.clientX - startX
      const newWidth = Math.max(60, startWidth + diff) // Minimum width of 60px

      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }))
    },
    [isResizing, resizingColumn, startX, startWidth],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    setResizingColumn(null)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  useEffect(() => {
    loadEmployees()
    loadLeaveRecords()
  }, [])

  useEffect(() => {
    if (selectedEmployee !== "all") {
      loadEmployeeLeaveRecords(selectedEmployee)
    }
  }, [selectedEmployee])

  useEffect(() => {
    calculateLeaveSummary()
  }, [leaveRecords, selectedEmployee])

  const loadEmployees = async () => {
    // Mock employee data
    const mockEmployees: Employee[] = [
      { id: 1, name: "John Doe", employeeId: "EMP001", hireDate: "2020-01-15", department: "Engineering" },
      { id: 2, name: "Jane Smith", employeeId: "EMP002", hireDate: "2019-03-20", department: "Marketing" },
      { id: 3, name: "Ahmed Hassan", employeeId: "EMP003", hireDate: "2021-06-10", department: "Sales" },
      { id: 4, name: "Sarah Johnson", employeeId: "EMP004", hireDate: "2018-11-05", department: "HR" },
      { id: 5, name: "Mohamed Ali", employeeId: "EMP005", hireDate: "2022-02-28", department: "Finance" },
    ]
    setEmployees(mockEmployees)
  }

  const loadLeaveRecords = async () => {
    setIsLoading(true)
    try {
      // Mock leave records data
      const mockRecords: LeaveRecord[] = [
        {
          id: 1,
          employeeName: "John Doe",
          employeeId: "EMP001",
          description: "Annual vacation",
          day: "Monday",
          date: "2024-01-15",
          regular: 5,
          emergency: 0,
          sick: 0,
          deduction: 0,
          unpaid: 0,
          other: 0,
          status: "Loaded",
        },
        {
          id: 2,
          employeeName: "Jane Smith",
          employeeId: "EMP002",
          description: "Medical appointment",
          day: "Wednesday",
          date: "2024-01-17",
          regular: 0,
          emergency: 0,
          sick: 1,
          deduction: 0,
          unpaid: 0,
          other: 0,
          status: "Loaded",
        },
        {
          id: 3,
          employeeName: "Ahmed Hassan",
          employeeId: "EMP003",
          description: "Family emergency",
          day: "Friday",
          date: "2024-01-19",
          regular: 0,
          emergency: 2,
          sick: 0,
          deduction: 0,
          unpaid: 0,
          other: 0,
          status: "Loaded",
        },
      ]
      setLeaveRecords(mockRecords)
      setUndoHistory([mockRecords])
      setRedoHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadEmployeeLeaveRecords = async (employeeId: string) => {
    const employee = employees.find((emp) => emp.employeeId === employeeId)
    if (!employee) return

    const filteredRecords = leaveRecords.filter((record) => record.employeeId === employeeId)
    // In a real app, this would fetch from the database
    console.log(`[v0] Loading leave records for employee: ${employee.name}`)
  }

  const filteredRecords = leaveRecords.filter((record) => {
    const matchesEmployee = selectedEmployee === "all" || record.employeeId === selectedEmployee

    if (!matchesEmployee) return false

    if (!searchQuery) return true
    return (
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.date.includes(searchQuery)
    )
  })

  const calculateLeaveSummary = useCallback(() => {
    const recordsToCalculate =
      selectedEmployee === "all"
        ? leaveRecords
        : leaveRecords.filter((record) => record.employeeId === selectedEmployee)

    const consumedBalance = recordsToCalculate.reduce(
      (acc, record) => ({
        regular: acc.regular + record.regular,
        emergency: acc.emergency + record.emergency,
        sick: acc.sick + record.sick,
        deduction: acc.deduction + record.deduction,
        unpaid: acc.unpaid + record.unpaid,
        other: acc.other + record.other,
      }),
      { regular: 0, emergency: 0, sick: 0, deduction: 0, unpaid: 0, other: 0 },
    )

    const totalConsumed = Object.values(consumedBalance).reduce((sum, val) => sum + val, 0)

    setLeaveSummary((prevSummary) => {
      const totalEntitledCol1 =
        prevSummary.previousYearBalance.col1 + prevSummary.entitledBalance2025.col1 + prevSummary.otherDaysEntitled
      const totalEntitledCol2 = prevSummary.previousYearBalance.col2 + prevSummary.entitledBalance2025.col2

      const newSummary = {
        ...prevSummary,
        totalEntitledBalance: { col1: totalEntitledCol1, col2: totalEntitledCol2 },
        consumedBalance2025: consumedBalance,
        totalConsumedLeaves: totalConsumed,
        remainingBalance: {
          col1: totalEntitledCol1 - totalConsumed,
          col2: totalEntitledCol2 - totalConsumed,
        },
      }

      if (autoSave) {
        setLastSaved(new Date())
      }

      setAnimationKey((prev) => prev + 1)

      return newSummary
    })
  }, [leaveRecords, selectedEmployee, autoSave])

  const validateInput = (value: string, fieldName: string): boolean => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue) || numValue < 0) {
      setValidationErrors((prev) => new Set(prev).add(fieldName))
      return false
    }
    setValidationErrors((prev) => {
      const newSet = new Set(prev)
      newSet.delete(fieldName)
      return newSet
    })
    return true
  }

  const handleSummaryInputChange = (field: string, subField: string | null, value: string) => {
    const fieldKey = subField ? `${field}.${subField}` : field

    if (!validateInput(value, fieldKey)) return

    const numValue = Number.parseFloat(value) || 0

    setLeaveSummary((prev) => {
      if (subField) {
        return {
          ...prev,
          [field]: {
            ...prev[field as keyof LeaveSummary],
            [subField]: numValue,
          },
        }
      } else {
        return {
          ...prev,
          [field]: numValue,
        }
      }
    })

    setTimeout(() => calculateLeaveSummary(), 100)
  }

  const handleSubmitSummary = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("[v0] Leave balance summary submitted:", leaveSummary)
    } catch (error) {
      console.error("[v0] Error submitting summary:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddRow = () => {
    const newRecord: LeaveRecord = {
      id: Date.now(),
      employeeName: "",
      employeeId: "",
      description: "",
      day: "",
      date: new Date().toISOString().split("T")[0],
      regular: 0,
      emergency: 0,
      sick: 0,
      deduction: 0,
      unpaid: 0,
      other: 0,
      status: "Pending",
    }

    const newRecords = [...leaveRecords, newRecord]
    setLeaveRecords(newRecords)
    setUndoHistory((prev) => [...prev, newRecords])
    setRedoHistory([])
  }

  const handleRemoveRow = () => {
    if (selectedCell) {
      const newRecords = leaveRecords.filter((_, index) => index !== selectedCell.row)
      setLeaveRecords(newRecords)
      setUndoHistory((prev) => [...prev, newRecords])
      setRedoHistory([])
      setSelectedCell(null)
      toast({
        title: "Row Removed",
        description: "Selected row has been removed",
      })
    } else {
      toast({
        title: "No Row Selected",
        description: "Please select a row to remove",
      })
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Submitting leave records to database...")

      let successCount = 0
      let failCount = 0

      const updatedRecords = await Promise.all(
        leaveRecords.map(async (record, index) => {
          if (record.status === "Loaded") return record

          if (!record.employeeName || !record.date) {
            failCount++
            return { ...record, status: "Failed: Missing required fields" }
          }

          try {
            // Simulate database operation
            await new Promise((resolve) => setTimeout(resolve, 100))
            successCount++
            return { ...record, status: "Success" }
          } catch (error) {
            failCount++
            return { ...record, status: "Failed: Database error" }
          }
        }),
      )

      setLeaveRecords(updatedRecords)
      setUndoHistory([updatedRecords])
      setRedoHistory([])

      toast({
        title: "Submit Complete",
        description: `Success: ${successCount}, Failed: ${failCount}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUndo = () => {
    if (undoHistory.length > 1) {
      const currentState = undoHistory[undoHistory.length - 1]
      const previousState = undoHistory[undoHistory.length - 2]

      setRedoHistory((prev) => [...prev, currentState])
      setLeaveRecords(previousState)
      setUndoHistory((prev) => prev.slice(0, -1))

      toast({
        title: "Undo Complete",
        description: "Reverted to previous state",
      })
    }
  }

  const handleRedo = () => {
    if (redoHistory.length > 0) {
      const nextState = redoHistory[redoHistory.length - 1]

      setUndoHistory((prev) => [...prev, nextState])
      setLeaveRecords(nextState)
      setRedoHistory((prev) => prev.slice(0, -1))

      toast({
        title: "Redo Complete",
        description: "Restored next state",
      })
    }
  }

  const handleBold = () => {
    if (!selectedCell) {
      toast({
        title: "No Cell Selected",
        description: "Please select a cell to apply bold formatting",
      })
      return
    }

    const cellId = `${selectedCell.row}-${selectedCell.col}`
    const newBoldCells = new Set(boldCells)

    if (newBoldCells.has(cellId)) {
      newBoldCells.delete(cellId)
    } else {
      newBoldCells.add(cellId)
    }

    setBoldCells(newBoldCells)
  }

  const handleHighlight = () => {
    if (!selectedCell) {
      toast({
        title: "No Cell Selected",
        description: "Please select a cell to apply highlight",
      })
      return
    }

    const cellId = `${selectedCell.row}-${selectedCell.col}`
    const newHighlightedCells = new Set(highlightedCells)

    if (newHighlightedCells.has(cellId)) {
      newHighlightedCells.delete(cellId)
    } else {
      newHighlightedCells.add(cellId)
    }

    setHighlightedCells(newHighlightedCells)
  }

  const handleCellEdit = (rowIndex: number, field: keyof LeaveRecord, value: any) => {
    const newRecords = [...leaveRecords]

    if (["regular", "emergency", "sick", "deduction", "unpaid", "other"].includes(field)) {
      const numValue = Number(value)

      if (numValue > 0) {
        // Clear all other day off fields when selecting one
        newRecords[rowIndex] = {
          ...newRecords[rowIndex],
          regular: field === "regular" ? 1 : 0,
          emergency: field === "emergency" ? 1 : 0,
          sick: field === "sick" ? 1 : 0,
          deduction: field === "deduction" ? 1 : 0,
          unpaid: field === "unpaid" ? 1 : 0,
          other: field === "other" ? 1 : 0,
          status: newRecords[rowIndex].status === "Loaded" ? "Modified" : newRecords[rowIndex].status,
        }
      } else {
        // Just clear the current field if deselecting
        newRecords[rowIndex] = {
          ...newRecords[rowIndex],
          [field]: 0,
          status: newRecords[rowIndex].status === "Loaded" ? "Modified" : newRecords[rowIndex].status,
        }
      }
    } else {
      newRecords[rowIndex] = {
        ...newRecords[rowIndex],
        [field]: value,
        status: newRecords[rowIndex].status === "Loaded" ? "Modified" : newRecords[rowIndex].status,
      }
    }
    setLeaveRecords(newRecords)
  }

  const handleDescriptionEdit = (rowIndex: number, newDescription: string) => {
    const newRecords = [...leaveRecords]
    newRecords[rowIndex] = {
      ...newRecords[rowIndex],
      description: newDescription,
      status: newRecords[rowIndex].status === "Loaded" ? "Modified" : newRecords[rowIndex].status,
    }
    setLeaveRecords(newRecords)
    setEditingDescription(null)
    toast({
      title: "Description Updated",
      description: "Leave description has been updated successfully",
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent, rowIndex: number, field: keyof LeaveRecord, value: any) => {
    if (e.key === "Enter") {
      handleCellEdit(rowIndex, field, value)
      e.preventDefault()
    }
  }

  const getDotColor = (description: string) => {
    if (description === "إجازة مسجلة من جدول الحضور") {
      return "bg-purple-500"
    }
    return description ? "bg-green-500" : "bg-red-500"
  }

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colKey: string) => {
    const columns = [
      "employeeName",
      "employeeId",
      "description",
      "day",
      "date",
      "regular",
      "emergency",
      "sick",
      "deduction",
      "unpaid",
      "other",
      "status",
    ]
    const currentColIndex = columns.indexOf(colKey)

    if (e.key === "ArrowUp" && rowIndex > 0) {
      e.preventDefault()
      setFocusedCell({ row: rowIndex - 1, col: colKey })
      setIsEditing(false)
    } else if (e.key === "ArrowDown" && rowIndex < filteredRecords.length - 1) {
      e.preventDefault()
      setFocusedCell({ row: rowIndex + 1, col: colKey })
      setIsEditing(false)
    } else if (e.key === "ArrowLeft" && currentColIndex > 0) {
      e.preventDefault()
      setFocusedCell({ row: rowIndex, col: columns[currentColIndex - 1] })
      setIsEditing(false)
    } else if (e.key === "ArrowRight" && currentColIndex < columns.length - 1) {
      e.preventDefault()
      setFocusedCell({ row: rowIndex, col: columns[currentColIndex + 1] })
      setIsEditing(false)
    } else if (e.key === "Enter") {
      e.preventDefault()
      setIsEditing(false)
      // Move to next row, same column
      if (rowIndex < filteredRecords.length - 1) {
        setFocusedCell({ row: rowIndex + 1, col: colKey })
      }
    } else if (e.key === "Escape") {
      setIsEditing(false)
    } else if (!isEditing && e.key.length === 1) {
      setIsEditing(true)
    }
  }

  const handleCellFocus = (rowIndex: number, colKey: string) => {
    setFocusedCell({ row: rowIndex, col: colKey })
    setIsEditing(false)
  }

  const handleCellClick = (rowIndex: number, colKey: string) => {
    setFocusedCell({ row: rowIndex, col: colKey })
    setIsEditing(true)
  }

  return (
    <div className="flex-1 p-6 space-y-8 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <LeaveDataVisualizations leaveRecords={leaveRecords} selectedEmployee={selectedEmployee} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Days Off</CardTitle>
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{leaveSummary.totalConsumedLeaves}</div>
            <p className="text-xs text-slate-500 mt-1">Days taken this year</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Hours</CardTitle>
            <div className="p-2 rounded-lg bg-green-50">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {(leaveSummary.totalConsumedLeaves * 8).toFixed(1)}h
            </div>
            <p className="text-xs text-slate-500 mt-1">8h per day</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Payroll</CardTitle>
            <div className="p-2 rounded-lg bg-purple-50">
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {(leaveSummary.totalConsumedLeaves * 240).toFixed(0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Impact on payroll</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Approvals</CardTitle>
            <div className="p-2 rounded-lg bg-orange-50">
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {leaveRecords.filter((r) => r.status === "Pending" || r.status === "Modified").length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
        {/* Employee Selection Section */}
        <div className="p-6 border-b border-slate-600/30 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg backdrop-blur-sm border border-slate-600/30">
                <Users className="w-5 h-5" />
              </div>
              Select Employee
            </h2>
            <div className="text-sm text-slate-200 bg-slate-700/40 px-3 py-1 rounded-full border border-slate-600/30">
              {selectedEmployee === "all"
                ? `Showing all employees (${filteredRecords.length} records)`
                : `Showing ${employees.find((emp) => emp.employeeId === selectedEmployee)?.name || "Unknown"} (${filteredRecords.length} records)`}
            </div>
          </div>

          <div className="relative max-w-md">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full px-4 py-3 bg-slate-800/60 border border-slate-600/40 rounded-lg cursor-pointer hover:bg-slate-700/60 transition-colors backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-300" />
                <span className="text-slate-100">
                  {selectedEmployee === "all"
                    ? "All Employees"
                    : employees.find((emp) => emp.employeeId === selectedEmployee)?.name || "Select Employee"}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-300 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-slate-600/40 rounded-lg shadow-2xl z-50 max-h-64 overflow-hidden backdrop-blur-xl">
                <div className="p-3 border-b border-slate-600/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search employees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-800/60 border-slate-600/40 text-slate-100 placeholder:text-slate-400"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto">
                  {/* All Employees Option */}
                  <div
                    onClick={() => {
                      setSelectedEmployee("all")
                      setIsDropdownOpen(false)
                      setSearchQuery("")
                    }}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      selectedEmployee === "all"
                        ? "bg-blue-600/30 text-blue-200 border-l-2 border-blue-400"
                        : "hover:bg-slate-800/60 text-slate-100"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <div>
                      <div className="font-medium">All Employees</div>
                      <div className="text-sm text-slate-400">{employees.length} total</div>
                    </div>
                  </div>

                  {/* Individual Employees */}
                  {employees
                    .filter(
                      (employee) =>
                        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((employee) => (
                      <div
                        key={employee.id}
                        onClick={() => {
                          setSelectedEmployee(employee.employeeId)
                          setIsDropdownOpen(false)
                          setSearchQuery("")
                        }}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          selectedEmployee === employee.employeeId
                            ? "bg-green-600/30 text-green-200 border-l-2 border-green-400"
                            : "hover:bg-slate-800/60 text-slate-100"
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-slate-400">{employee.employeeId}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedEmployee !== "all" && (
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2 text-slate-800 mb-4">
              <User className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Employee Information</h3>
            </div>
            {(() => {
              const emp = employees.find((e) => e.employeeId === selectedEmployee)
              return emp ? (
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Name</label>
                    <Input value={emp.name} readOnly className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Employee ID</label>
                    <Input value={emp.employeeId} readOnly className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Hire Date</label>
                    <Input value={emp.hireDate} readOnly className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Department</label>
                    <Input value={emp.department} readOnly className="mt-1" />
                  </div>
                </div>
              ) : null
            })()}
          </div>
        )}

        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
              Employee Leave Management System
            </h2>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Leave
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by Name, ID, Description, or Date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            {/* Filter button */}
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={handleAddRow} className="bg-slate-600 hover:bg-slate-700 text-white" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
              <Button onClick={handleRemoveRow} className="bg-red-600 hover:bg-red-700 text-white" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Row
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUndo}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                disabled={undoHistory.length <= 1}
              >
                <Undo2 className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button
                onClick={handleRedo}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                disabled={redoHistory.length === 0}
              >
                <Redo2 className="w-4 h-4 mr-2" />
                Redo
              </Button>
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
              <Button
                onClick={loadLeaveRecords}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200 mt-6 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-4 border-b border-slate-300">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Visual Guide & Legend
            </h3>
            <p className="text-sm text-slate-600 mt-1">Understanding the visual indicators in your leave records</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Description Dots Section */}
            <div>
              <h4 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Description Status Indicators
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
                  <div>
                    <span className="text-sm font-medium text-green-800">Complete Record</span>
                    <p className="text-xs text-green-600">Description provided with details</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
                  <div>
                    <span className="text-sm font-medium text-red-800">Missing Info</span>
                    <p className="text-xs text-red-600">No description available</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-4 h-4 rounded-full bg-purple-500 shadow-sm"></div>
                  <div>
                    <span className="text-sm font-medium text-purple-800">System Record</span>
                    <p className="text-xs text-purple-600">Auto-generated from attendance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Check Marks Section */}
            <div>
              <h4 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Leave Type Indicators
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium text-blue-800">Regular</span>
                    <p className="text-xs text-blue-600">Planned leave</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-8 h-8 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium text-red-800">Emergency</span>
                    <p className="text-xs text-red-600">Urgent leave</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-8 h-8 bg-amber-100 border-2 border-amber-300 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium text-amber-800">Sick</span>
                    <p className="text-xs text-amber-600">Medical leave</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-8 h-8 bg-purple-100 border-2 border-purple-300 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium text-purple-800">Deduction</span>
                    <p className="text-xs text-purple-600">Salary deduct</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-8 h-8 bg-orange-100 border-2 border-orange-300 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-700" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium text-orange-800">Unpaid</span>
                    <p className="text-xs text-orange-600">No salary</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-100 border-2 border-green-300 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-medium text-green-800">Other</span>
                    <p className="text-xs text-green-600">Special cases</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                Excel-like Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
                <div>
                  • <strong>Drag column borders</strong> to resize
                </div>
                <div>
                  • <strong>Click cells</strong> to edit values
                </div>
                <div>
                  • <strong>Press Enter</strong> to save changes
                </div>
                <div>
                  • <strong>Click checkboxes</strong> to toggle leave
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-100 via-blue-50 to-indigo-50 rounded-t-xl border-b border-slate-200/50">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              Leave Records
              <span className="ml-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full font-semibold shadow-lg">
                {filteredRecords.length} Records
              </span>
            </CardTitle>
            <div className="flex gap-3">
              <span className="px-3 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-sm rounded-full font-medium border border-green-300 shadow-sm">
                ✓ = Day Off Selected (Only One Per Row)
              </span>
              <span className="px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm rounded-full font-medium border border-gray-300 shadow-sm">
                ○ = No Leave
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto border-0 rounded-b-xl">
            <table
              ref={tableRef}
              className="w-full border-collapse"
              style={{ minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0) }}
            >
              <thead className="sticky top-0 z-20">
                <tr className="bg-slate-700 text-white border-b border-slate-600">
                  <th
                    className="border-r border-slate-600 px-4 py-3 text-left font-medium text-sm relative"
                    style={{ width: columnWidths.employeeName }}
                  >
                    Employee Name
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "employeeName")}
                    />
                  </th>
                  <th
                    className="border-r border-slate-600 px-3 py-3 text-left font-medium text-sm relative"
                    style={{ width: columnWidths.employeeId }}
                  >
                    ID
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "employeeId")}
                    />
                  </th>
                  <th
                    className="border-r border-slate-600 px-4 py-3 text-left font-medium text-sm relative"
                    style={{ width: columnWidths.description }}
                  >
                    Description
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "description")}
                    />
                  </th>
                  <th
                    className="border-r border-slate-600 px-3 py-3 text-left font-medium text-sm relative"
                    style={{ width: columnWidths.day }}
                  >
                    Day
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "day")}
                    />
                  </th>
                  <th
                    className="border-r border-slate-600 px-3 py-3 text-left font-medium text-sm relative"
                    style={{ width: columnWidths.date }}
                  >
                    Date
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "date")}
                    />
                  </th>
                  <th
                    className="border-r border-slate-600 px-2 py-3 text-center font-medium text-sm bg-blue-100 text-blue-800 relative"
                    style={{ width: columnWidths.regular }}
                  >
                    Reg
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "regular")}
                    />
                  </th>
                  <th
                    className="border-r border-slate-600 px-2 py-3 text-center font-medium text-sm bg-red-100 text-red-800 relative"
                    style={{ width: columnWidths.emergency }}
                  >
                    Emg
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "emergency")}
                    />
                  </th>
                  <th
                    className="border-r border-slate-600 px-2 py-3 text-center font-medium text-sm bg-amber-100 text-amber-800 relative"
                    style={{ width: columnWidths.sick }}
                  >
                    Sick
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "sick")}
                    />
                  </th>
                  <th
                    className="border-r border-slate-600 px-2 py-3 text-center font-medium text-sm bg-purple-100 text-purple-800 relative"
                    style={{ width: columnWidths.deduction }}
                  >
                    Ded
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "deduction")}
                    />
                  </th>
                  <th
                    className="border-r border-slate-600 px-2 py-3 text-center font-medium text-sm bg-orange-100 text-orange-800 relative"
                    style={{ width: columnWidths.unpaid }}
                  >
                    Unp
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "unpaid")}
                    />
                  </th>
                  <th
                    className="border-r border-slate-600 px-2 py-3 text-center font-medium text-sm bg-green-100 text-green-800 relative"
                    style={{ width: columnWidths.other }}
                  >
                    Oth
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, "other")}
                    />
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-sm" style={{ width: columnWidths.status }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } hover:bg-blue-50 transition-colors duration-200 border-b border-slate-100`}
                  >
                    <td className="border-r border-slate-100 px-4 py-3" style={{ width: columnWidths.employeeName }}>
                      <Input
                        value={record.employeeName}
                        onChange={(e) => handleCellEdit(index, "employeeName", e.target.value)}
                        onFocus={() => handleCellFocus(index, "employeeName")}
                        onClick={() => handleCellClick(index, "employeeName")}
                        onKeyDown={(e) => handleKeyDown(e, index, "employeeName")}
                        className={`border-0 bg-transparent focus:bg-white focus:shadow-sm transition-all ${
                          boldCells.has(`${index}-employeeName`) ? "font-bold" : ""
                        } ${highlightedCells.has(`${index}-employeeName`) ? "bg-yellow-100" : ""} ${
                          focusedCell?.row === index && focusedCell?.col === "employeeName"
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : ""
                        }`}
                        placeholder="Enter employee name"
                        ref={
                          focusedCell?.row === index && focusedCell?.col === "employeeName"
                            ? (el) => el?.focus()
                            : undefined
                        }
                      />
                    </td>
                    <td className="border-r border-slate-100 px-3 py-3" style={{ width: columnWidths.employeeId }}>
                      <Input
                        value={record.employeeId}
                        onChange={(e) => handleCellEdit(index, "employeeId", e.target.value)}
                        onFocus={() => handleCellFocus(index, "employeeId")}
                        onClick={() => handleCellClick(index, "employeeId")}
                        onKeyDown={(e) => handleKeyDown(e, index, "employeeId")}
                        className={`border-0 bg-transparent focus:bg-white focus:shadow-sm transition-all ${
                          boldCells.has(`${index}-employeeId`) ? "font-bold" : ""
                        } ${highlightedCells.has(`${index}-employeeId`) ? "bg-yellow-100" : ""} ${
                          focusedCell?.row === index && focusedCell?.col === "employeeId"
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : ""
                        }`}
                        placeholder="EMP001"
                        ref={
                          focusedCell?.row === index && focusedCell?.col === "employeeId"
                            ? (el) => el?.focus()
                            : undefined
                        }
                      />
                    </td>
                    <td className="border-r border-slate-100 px-4 py-3" style={{ width: columnWidths.description }}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getDotColor(record.description)}`}></div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-6 w-6 p-0 hover:bg-blue-100 transition-all ${
                            focusedCell?.row === index && focusedCell?.col === "description"
                              ? "ring-2 ring-blue-500 bg-blue-50"
                              : ""
                          }`}
                          onClick={() => {
                            setFocusedCell({ row: index, col: "description" })
                            setEditingDescription({ rowIndex: index, description: record.description })
                          }}
                          onKeyDown={(e) => handleKeyDown(e, index, "description")}
                        >
                          <Edit3 className="w-3 h-3 text-blue-600" />
                        </Button>
                      </div>
                    </td>
                    <td className="border-r border-slate-100 px-3 py-3" style={{ width: columnWidths.day }}>
                      <Select value={record.day} onValueChange={(value) => handleCellEdit(index, "day", value)}>
                        <SelectTrigger
                          className={`border-0 bg-transparent focus:bg-white focus:shadow-sm transition-all ${
                            focusedCell?.row === index && focusedCell?.col === "day"
                              ? "ring-2 ring-blue-500 bg-blue-50"
                              : ""
                          }`}
                          onFocus={() => handleCellFocus(index, "day")}
                          onKeyDown={(e) => handleKeyDown(e, index, "day")}
                        >
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monday">Monday</SelectItem>
                          <SelectItem value="Tuesday">Tuesday</SelectItem>
                          <SelectItem value="Wednesday">Wednesday</SelectItem>
                          <SelectItem value="Thursday">Thursday</SelectItem>
                          <SelectItem value="Friday">Friday</SelectItem>
                          <SelectItem value="Saturday">Saturday</SelectItem>
                          <SelectItem value="Sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border-r border-slate-100 px-3 py-3" style={{ width: columnWidths.date }}>
                      <Input
                        type="date"
                        value={record.date}
                        onChange={(e) => handleCellEdit(index, "date", e.target.value)}
                        onFocus={() => handleCellFocus(index, "date")}
                        onClick={() => handleCellClick(index, "date")}
                        onKeyDown={(e) => handleKeyDown(e, index, "date")}
                        className={`border-0 bg-transparent focus:bg-white focus:shadow-sm transition-all ${
                          boldCells.has(`${index}-date`) ? "font-bold" : ""
                        } ${highlightedCells.has(`${index}-date`) ? "bg-yellow-100" : ""} ${
                          focusedCell?.row === index && focusedCell?.col === "date"
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : ""
                        }`}
                        ref={
                          focusedCell?.row === index && focusedCell?.col === "date" ? (el) => el?.focus() : undefined
                        }
                      />
                    </td>

                    {[
                      { field: "regular", color: "blue", width: columnWidths.regular },
                      { field: "emergency", color: "red", width: columnWidths.emergency },
                      { field: "sick", color: "amber", width: columnWidths.sick },
                      { field: "deduction", color: "purple", width: columnWidths.deduction },
                      { field: "unpaid", color: "orange", width: columnWidths.unpaid },
                      { field: "other", color: "green", width: columnWidths.other },
                    ].map(({ field, color, width }) => (
                      <td key={field} className="border-r border-slate-100 px-2 py-3 text-center" style={{ width }}>
                        <button
                          onClick={() =>
                            handleCellEdit(
                              index,
                              field as keyof LeaveRecord,
                              record[field as keyof LeaveRecord] === 1 ? 0 : 1,
                            )
                          }
                          onFocus={() => handleCellFocus(index, field)}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault()
                              handleCellEdit(
                                index,
                                field as keyof LeaveRecord,
                                record[field as keyof LeaveRecord] === 1 ? 0 : 1,
                              )
                            } else {
                              handleKeyDown(e, index, field)
                            }
                          }}
                          className={`w-6 h-6 rounded-full border-2 transition-all duration-200 focus:outline-none ${
                            record[field as keyof LeaveRecord] === 1
                              ? `bg-${color}-500 border-${color}-500 text-white hover:bg-${color}-600`
                              : `border-${color}-300 hover:border-${color}-400 hover:bg-${color}-50`
                          } ${
                            focusedCell?.row === index && focusedCell?.col === field
                              ? "ring-2 ring-blue-500 ring-offset-1"
                              : ""
                          }`}
                        >
                          {record[field as keyof LeaveRecord] === 1 && "✓"}
                        </button>
                      </td>
                    ))}

                    <td className="px-3 py-3 text-center" style={{ width: columnWidths.status }}>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                          record.status === "New"
                            ? "bg-green-100 text-green-800"
                            : record.status === "Modified"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        } ${
                          focusedCell?.row === index && focusedCell?.col === "status"
                            ? "ring-2 ring-blue-500 ring-offset-1"
                            : ""
                        }`}
                        tabIndex={0}
                        onFocus={() => handleCellFocus(index, "status")}
                        onKeyDown={(e) => handleKeyDown(e, index, "status")}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={12} className="text-center py-8 text-gray-500">
                      No leave records found. Click "Add Row" to create a new record.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingDescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Edit Description</h3>
            <textarea
              value={editingDescription.description}
              onChange={(e) => setEditingDescription({ ...editingDescription, description: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  handleDescriptionEdit(editingDescription.rowIndex, editingDescription.description)
                  setEditingDescription(null)
                  e.preventDefault()
                }
              }}
              className="w-full h-32 p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditingDescription(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleDescriptionEdit(editingDescription.rowIndex, editingDescription.description)
                  setEditingDescription(null)
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Leave Balance Summary */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-xl shadow-2xl border border-slate-200 mb-4 overflow-hidden transition-all duration-500 hover:shadow-3xl">
        <div className="px-3 py-2 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-sm"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white hover:text-blue-200 transition-colors duration-200"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Advanced Leave Balance Summary
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTooltips(!showTooltips)}
                className="text-white/80 hover:text-white transition-colors duration-200 text-xs"
                title="Toggle Tooltips"
              ></button>
            </div>
          </div>
          <div className="relative z-10 mt-1">
            <p className="text-blue-100 text-xs flex items-center gap-2">
              <User className="w-3 h-3" />
              {selectedEmployee === "all"
                ? "All Employees Analysis"
                : employees.find((e) => e.id === selectedEmployee)?.name || "Selected Employee"}
              <div className="ml-auto flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-xs font-medium">live calculations</span>
                </div>
                {lastSaved && (
                  <span className="text-blue-200 text-xs">Last saved: {lastSaved.toLocaleTimeString()}</span>
                )}
              </div>
            </p>
          </div>
        </div>

        <div
          className={`transition-all duration-500 ease-in-out ${
            isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="p-3 space-y-2" key={animationKey}>
            {/* Previous Years Balance */}
            <div className="group relative grid grid-cols-12 gap-2 items-center p-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
              {showTooltips && (
                <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  Manual input for previous year carry-over balance
                </div>
              )}
              <div className="col-span-6">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Previous Years Balance
                </label>
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={leaveSummary.previousYearBalance.col1}
                  onChange={(e) => handleSummaryInputChange("previousYearBalance", "col1", e.target.value)}
                  className="w-full px-2 py-1 border rounded-md text-center text-xs font-medium border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400"
                  placeholder="0"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={leaveSummary.previousYearBalance.col2}
                  onChange={(e) => handleSummaryInputChange("previousYearBalance", "col2", e.target.value)}
                  className="w-full px-2 py-1 border rounded-md text-center text-xs font-medium border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400"
                  placeholder="0"
                />
              </div>
            </div>

            {/* 2025 Entitled Balance */}
            <div className="group relative grid grid-cols-12 gap-2 items-center p-2 bg-gradient-to-r from-emerald-50 to-green-100 rounded-lg shadow-sm border border-emerald-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
              {showTooltips && (
                <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  Annual leave entitlement for 2025
                </div>
              )}
              <div className="col-span-6">
                <label className="text-xs font-semibold text-emerald-700 flex items-center gap-2">
                  <Gift className="w-3 h-3 text-emerald-500" />
                  2025 Entitled Balance
                </label>
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={leaveSummary.entitledBalance2025.col1}
                  onChange={(e) => handleSummaryInputChange("entitledBalance2025", "col1", e.target.value)}
                  className="w-full px-2 py-1 border rounded-md text-center text-xs font-medium border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                  placeholder="0"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={leaveSummary.entitledBalance2025.col2}
                  onChange={(e) => handleSummaryInputChange("entitledBalance2025", "col2", e.target.value)}
                  className="w-full px-2 py-1 border rounded-md text-center text-xs font-medium border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-emerald-400"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Other Days Entitled */}
            <div className="group relative grid grid-cols-12 gap-2 items-center p-2 bg-gradient-to-r from-amber-50 to-yellow-100 rounded-lg shadow-sm border border-amber-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
              {showTooltips && (
                <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  Additional leave days (bonus, compensation, etc.)
                </div>
              )}
              <div className="col-span-6">
                <label className="text-xs font-semibold text-amber-700 flex items-center gap-2">
                  <Plus className="w-3 h-3 text-amber-500" />
                  Other Days Entitled
                </label>
              </div>
              <div className="col-span-6">
                <input
                  type="number"
                  value={leaveSummary.otherDaysEntitled}
                  onChange={(e) => handleSummaryInputChange("otherDaysEntitled", "", e.target.value)}
                  className="w-full px-2 py-1 border rounded-md text-center text-xs font-medium border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 hover:border-amber-400"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Total Entitled Balance - Calculated with advanced styling */}
            <div className="grid grid-cols-12 gap-2 items-center p-2 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-lg shadow-md border-2 border-blue-300 animate-pulse-subtle">
              <div className="col-span-6">
                <label className="text-xs font-bold text-blue-800 flex items-center gap-2">
                  <Calculator className="w-3 h-3 text-blue-600" />
                  Total Entitled Balance
                  <span className="text-xs bg-blue-200 text-blue-800 px-1 rounded">AUTO</span>
                </label>
              </div>
              <div className="col-span-3">
                <div className="w-full px-2 py-1 bg-gradient-to-r from-blue-200 to-blue-300 border-2 border-blue-400 rounded-md text-center text-xs font-bold text-blue-900 shadow-inner">
                  {leaveSummary.totalEntitledBalance.col1}
                </div>
              </div>
              <div className="col-span-3">
                <div className="w-full px-2 py-1 bg-gradient-to-r from-blue-200 to-blue-300 border-2 border-blue-400 rounded-md text-center text-xs font-bold text-blue-900 shadow-inner">
                  {leaveSummary.totalEntitledBalance.col2}
                </div>
              </div>
            </div>

            {/* Consumed Balance in 2025 - Advanced grid layout */}
            <div className="grid grid-cols-12 gap-2 items-center p-2 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-lg shadow-md border-2 border-orange-300">
              <div className="col-span-6">
                <label className="text-xs font-bold text-orange-800 flex items-center gap-2">
                  <TrendingDown className="w-3 h-3 text-orange-600" />
                  Consumed Balance 2025
                  <span className="text-xs bg-orange-200 text-orange-800 px-1 rounded">LIVE</span>
                </label>
              </div>
              <div className="col-span-6 grid grid-cols-6 gap-1">
                {Object.entries(leaveSummary.consumedBalance2025).map(([key, value], index) => (
                  <div key={key} className="text-center group relative">
                    <div className="text-xs font-medium text-orange-700 capitalize mb-1">{key.slice(0, 3)}</div>
                    <div
                      className={`px-1 py-1 rounded-md text-xs font-bold shadow-sm transition-all duration-200 hover:scale-110 ${
                        value > 0
                          ? "bg-gradient-to-b from-red-200 to-red-300 border border-red-400 text-red-900"
                          : "bg-gradient-to-b from-gray-100 to-gray-200 border border-gray-300 text-gray-600"
                      }`}
                    >
                      {value}
                    </div>
                    {showTooltips && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
                        {key} leave days used
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total Consumed Leaves - Enhanced display */}
            <div className="grid grid-cols-12 gap-2 items-center p-2 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg shadow-md border-2 border-purple-300">
              <div className="col-span-6">
                <label className="text-xs font-bold text-purple-800 flex items-center gap-2">
                  <Minus className="w-3 h-3 text-purple-600" />
                  Total Consumed Leaves
                  <span className="text-xs bg-purple-200 text-purple-800 px-1 rounded">SUM</span>
                </label>
              </div>
              <div className="col-span-6">
                <div className="w-full px-2 py-1 bg-gradient-to-r from-purple-200 to-purple-300 border-2 border-purple-400 rounded-md text-center text-xs font-bold text-purple-900 shadow-inner">
                  {leaveSummary.totalConsumedLeaves} days
                </div>
              </div>
            </div>

            {/* Remaining Balance - Advanced status indicators */}
            <div className="grid grid-cols-12 gap-2 items-center p-2 bg-gradient-to-r from-slate-100 to-gray-100 rounded-lg shadow-md border-2 border-slate-300">
              <div className="col-span-6">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-slate-600" />
                  Remaining Balance
                  <span
                    className={`text-xs px-1 rounded ${
                      leaveSummary.remainingBalance.col1 > 0
                        ? "bg-green-200 text-green-800"
                        : leaveSummary.remainingBalance.col1 < 0
                          ? "bg-red-200 text-red-800"
                          : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {leaveSummary.remainingBalance.col1 > 0
                      ? "POSITIVE"
                      : leaveSummary.remainingBalance.col1 < 0
                        ? "DEFICIT"
                        : "ZERO"}
                  </span>
                </label>
              </div>
              <div className="col-span-3">
                <div
                  className={`w-full px-2 py-1 border-2 rounded-md text-center text-xs font-bold shadow-inner ${
                    leaveSummary.remainingBalance.col1 > 0
                      ? "bg-gradient-to-r from-green-200 to-green-300 border-green-400 text-green-900"
                      : leaveSummary.remainingBalance.col1 < 0
                        ? "bg-gradient-to-r from-red-200 to-red-300 border-red-400 text-red-900"
                        : "bg-gradient-to-r from-gray-200 to-gray-300 border-gray-400 text-gray-900"
                  }`}
                >
                  {leaveSummary.remainingBalance.col1}
                </div>
              </div>
              <div className="col-span-3">
                <div
                  className={`w-full px-2 py-1 border-2 rounded-md text-center text-xs font-bold shadow-inner ${
                    leaveSummary.remainingBalance.col2 > 0
                      ? "bg-gradient-to-r from-green-200 to-green-300 border-green-400 text-green-900"
                      : leaveSummary.remainingBalance.col2 < 0
                        ? "bg-gradient-to-r from-red-200 to-red-300 border-red-400 text-red-900"
                        : "bg-gradient-to-r from-gray-200 to-gray-300 border-gray-400 text-gray-900"
                  }`}
                >
                  {leaveSummary.remainingBalance.col2}
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 pb-3 flex gap-2">
            <button
              onClick={handleSubmitSummary}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold py-2 px-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  Submit Summary
                </>
              )}
            </button>
            <button
              onClick={() => {
                setLeaveSummary({
                  previousYearBalance: { col1: 0, col2: 0 },
                  entitledBalance2025: { col1: 30, col2: 25 },
                  otherDaysEntitled: 5,
                  totalEntitledBalance: { col1: 35, col2: 25 },
                  consumedBalance2025: {
                    regular: 0,
                    emergency: 0,
                    sick: 0,
                    deduction: 0,
                    unpaid: 0,
                    other: 0,
                  },
                  totalConsumedLeaves: 0,
                  remainingBalance: { col1: 35, col2: 25 },
                })
              }}
              className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-bold py-2 px-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
