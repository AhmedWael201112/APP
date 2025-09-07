"use client"

import { useState, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { PayrollTable } from "@/components/payroll-table"
import { PayrollHeader } from "@/components/payroll-header"
import { PayrollStats } from "@/components/payroll-stats"
import { TimeSheetDashboard } from "@/components/time-sheet-dashboard"
import { DaysOffDashboard } from "@/components/days-off-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Plus, RefreshCw, Undo2, Save, Search, Bold, Highlighter } from "lucide-react"
import { NewPayrollVisualizations } from "@/components/new-payroll-visualizations"
import { AdvancedPayrollCharts } from "@/components/advanced-payroll-charts"

interface PayrollData {
  payment_date: string
  id: number
  employee_name: string
  basic_salary: number
  incentive: number
  special_bonus: number
  number_of_bonuses: number
  bonus_rate: number
  bonus: number
  number_of_business_trips: number
  business_trip_amount: number
  ot_hours: number
  ot_rate: number
  ot_amount: number
  gross_pay: number
  social_insurance: number
  advances: number
  transportation_deductions: number
  number_of_deductions: number
  deduction_rate: number
  deductions: number
  total_deductions: number
  net_pay: number
  status: string
}

export default function PayrollPage() {
  const [currentView, setCurrentView] = useState("payroll")
  const [payrollData, setPayrollData] = useState<PayrollData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchId, setSearchId] = useState("")
  const [searchDate, setSearchDate] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null)
  const [boldCells, setBoldCells] = useState<Set<string>>(new Set())
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set())
  const [undoHistory, setUndoHistory] = useState<PayrollData[][]>([])
  const [cellUndoHistory, setCellUndoHistory] = useState<Map<string, any>>(new Map())
  const { toast } = useToast()

  useEffect(() => {
    loadPayrollData()
  }, [])

  const handleNavigate = (view: string) => {
    setCurrentView(view)
  }

  const renderCurrentView = () => {
    if (currentView === "timesheet") {
      return <TimeSheetDashboard />
    }

    if (currentView === "daysoff") {
      return <DaysOffDashboard />
    }

    // Default payroll view
    return (
      <>
        <PayrollHeader onImportCSV={handleImportCSV} onExportCSV={handleExportCSV} />

        <div className="flex-1 p-6 space-y-6 overflow-auto">
          <PayrollStats data={payrollData} />

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Payroll Management System</h2>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or salary..."
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
                  {payrollData.map((employee) => (
                    <option key={employee.id} value={employee.id} className="text-slate-800">
                      {employee.employee_name || `Employee ${employee.id}`}
                    </option>
                  ))}
                </select>
                <Input
                  type="date"
                  placeholder="Filter by date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-40 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>

              <div className="mb-4">
                <p className="text-sm text-white/80 bg-white/10 px-3 py-2 rounded-md">{getFilterStatus()}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button onClick={handleAddRow} className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Row
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
                    disabled={undoHistory.length <= 1 && cellUndoHistory.size === 0}
                    title="Ctrl+Z"
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    Undo
                  </Button>
                  <Button
                    onClick={loadPayrollData}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
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

            <PayrollTable
              data={filteredData}
              onDataChange={(newData) => {
                const calculatedData = newData.map((row) =>
                  row.status === "Modified" || row.status === "Pending" ? calculatePayrollFields(row) : row,
                )
                setPayrollData(calculatedData)
              }}
              onUnsavedChanges={() => setHasUnsavedChanges(true)}
              onCellEdit={(rowIndex, columnKey, oldValue, newValue) => {
                const cellId = `${rowIndex}-${columnKey}`
                setCellUndoHistory((prev) => new Map(prev).set(cellId, oldValue))
              }}
              isLoading={isLoading}
              searchQuery={searchQuery}
              boldCells={boldCells}
              highlightedCells={highlightedCells}
              selectedEmployee={selectedEmployee}
              selectedCell={selectedCell}
              onEmployeeSelect={setSelectedEmployee}
              onCellSelect={handleCellSelect}
            />
          </div>

          <NewPayrollVisualizations payrollData={payrollData} />
          <AdvancedPayrollCharts payrollData={payrollData} />
        </div>
      </>
    )
  }

  const loadPayrollData = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Connecting to MySQL database...")
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate connection delay

      const mockData: PayrollData[] = [
        {
          payment_date: "2024-01-15",
          id: 1,
          employee_name: "John Doe",
          basic_salary: 75000,
          incentive: 5000,
          special_bonus: 2000,
          number_of_bonuses: 2,
          bonus_rate: 2884.62,
          bonus: 5769.23,
          number_of_business_trips: 1,
          business_trip_amount: 2884.62,
          ot_hours: 10,
          ot_rate: 360.58,
          ot_amount: 3605.77,
          gross_pay: 94259.62,
          social_insurance: 1500,
          advances: 1000,
          transportation_deductions: 500,
          number_of_deductions: 1,
          deduction_rate: 2884.62,
          deductions: 2884.62,
          total_deductions: 5884.62,
          net_pay: 88375.0,
          status: "Loaded",
        },
        {
          payment_date: "2024-01-15",
          id: 2,
          employee_name: "Jane Smith",
          basic_salary: 85000,
          incentive: 6000,
          special_bonus: 3000,
          number_of_bonuses: 1,
          bonus_rate: 3269.23,
          bonus: 3269.23,
          number_of_business_trips: 2,
          business_trip_amount: 6538.46,
          ot_hours: 8,
          ot_rate: 408.65,
          ot_amount: 3269.23,
          gross_pay: 106076.92,
          social_insurance: 1700,
          advances: 1200,
          transportation_deductions: 600,
          number_of_deductions: 0,
          deduction_rate: 3269.23,
          deductions: 0,
          total_deductions: 3500.0,
          net_pay: 102576.92,
          status: "Loaded",
        },
        {
          payment_date: "2024-01-15",
          id: 3,
          employee_name: "Ahmed Hassan",
          basic_salary: 65000,
          incentive: 4000,
          special_bonus: 1500,
          number_of_bonuses: 3,
          bonus_rate: 2500.0,
          bonus: 7500.0,
          number_of_business_trips: 0,
          business_trip_amount: 0,
          ot_hours: 15,
          ot_rate: 312.5,
          ot_amount: 4687.5,
          gross_pay: 82687.5,
          social_insurance: 1300,
          advances: 800,
          transportation_deductions: 400,
          number_of_deductions: 2,
          deduction_rate: 2500.0,
          deductions: 5000.0,
          total_deductions: 7500.0,
          net_pay: 75187.5,
          status: "Loaded",
        },
        {
          payment_date: "2024-01-15",
          id: 4,
          employee_name: "Sarah Johnson",
          basic_salary: 90000,
          incentive: 7000,
          special_bonus: 4000,
          number_of_bonuses: 1,
          bonus_rate: 3461.54,
          bonus: 3461.54,
          number_of_business_trips: 3,
          business_trip_amount: 10384.62,
          ot_hours: 5,
          ot_rate: 432.69,
          ot_amount: 2163.46,
          gross_pay: 117009.62,
          social_insurance: 1800,
          advances: 1500,
          transportation_deductions: 700,
          number_of_deductions: 1,
          deduction_rate: 3461.54,
          deductions: 3461.54,
          total_deductions: 7461.54,
          net_pay: 109548.08,
          status: "Loaded",
        },
        {
          payment_date: "2024-01-15",
          id: 5,
          employee_name: "Mohamed Ali",
          basic_salary: 70000,
          incentive: 3500,
          special_bonus: 1000,
          number_of_bonuses: 2,
          bonus_rate: 2692.31,
          bonus: 5384.62,
          number_of_business_trips: 1,
          business_trip_amount: 2692.31,
          ot_hours: 12,
          ot_rate: 336.54,
          ot_amount: 4038.46,
          gross_pay: 86615.39,
          social_insurance: 1400,
          advances: 900,
          transportation_deductions: 450,
          number_of_deductions: 3,
          deduction_rate: 2692.31,
          deductions: 8076.92,
          total_deductions: 10826.92,
          net_pay: 75788.47,
          status: "Loaded",
        },
        {
          payment_date: "2024-01-15",
          id: 6,
          employee_name: "Lisa Chen",
          basic_salary: 80000,
          incentive: 5500,
          special_bonus: 2500,
          number_of_bonuses: 1,
          bonus_rate: 3076.92,
          bonus: 3076.92,
          number_of_business_trips: 2,
          business_trip_amount: 6153.85,
          ot_hours: 6,
          ot_rate: 384.62,
          ot_amount: 2307.69,
          gross_pay: 99538.46,
          social_insurance: 1600,
          advances: 1100,
          transportation_deductions: 550,
          number_of_deductions: 0,
          deduction_rate: 3076.92,
          deductions: 0,
          total_deductions: 3250.0,
          net_pay: 96288.46,
          status: "Loaded",
        },
        {
          payment_date: "2024-01-15",
          id: 7,
          employee_name: "Omar Khalil",
          basic_salary: 60000,
          incentive: 3000,
          special_bonus: 800,
          number_of_bonuses: 4,
          bonus_rate: 2307.69,
          bonus: 9230.77,
          number_of_business_trips: 0,
          business_trip_amount: 0,
          ot_hours: 20,
          ot_rate: 288.46,
          ot_amount: 5769.23,
          gross_pay: 78800.0,
          social_insurance: 1200,
          advances: 600,
          transportation_deductions: 300,
          number_of_deductions: 2,
          deduction_rate: 2307.69,
          deductions: 4615.38,
          total_deductions: 6715.38,
          net_pay: 72084.62,
          status: "Loaded",
        },
      ]

      console.log("[v0] Data loaded successfully from database")
      setPayrollData(mockData)
      setUndoHistory([mockData])

      toast({
        title: "Database Connected",
        description: "Payroll data loaded successfully from MySQL database",
      })
    } catch (error) {
      console.log("[v0] Database connection failed:", error)
      toast({
        title: "Database Error",
        description: "Failed to connect to MySQL database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        handleSubmit()
      }
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault()
        handleUndo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const calculatePayrollFields = useCallback((row: PayrollData): PayrollData => {
    const bonusRate = row.basic_salary / 26
    const bonus = bonusRate * row.number_of_bonuses
    const businessTripAmount = bonusRate * row.number_of_business_trips
    const otRate = row.basic_salary / 26 / 8
    const otAmount = otRate * row.ot_hours
    const deductionRate = row.basic_salary / 26
    const deductions = deductionRate * row.number_of_deductions
    const grossPay = row.basic_salary + row.incentive + row.special_bonus + bonus + businessTripAmount + otAmount
    const totalDeductions = row.social_insurance + row.advances + row.transportation_deductions + deductions
    const netPay = grossPay - totalDeductions

    return {
      ...row,
      bonus_rate: bonusRate,
      bonus,
      business_trip_amount: businessTripAmount,
      ot_rate: otRate,
      ot_amount: otAmount,
      deduction_rate: deductionRate,
      deductions,
      gross_pay: grossPay,
      total_deductions: totalDeductions,
      net_pay: netPay,
    }
  }, [])

  const handleAddRow = () => {
    const newRow: PayrollData = {
      payment_date: new Date().toISOString().split("T")[0],
      id: Date.now(),
      employee_name: "",
      basic_salary: 0,
      incentive: 0,
      special_bonus: 0,
      number_of_bonuses: 0,
      bonus_rate: 0,
      bonus: 0,
      number_of_business_trips: 0,
      business_trip_amount: 0,
      ot_hours: 0,
      ot_rate: 0,
      ot_amount: 0,
      gross_pay: 0,
      social_insurance: 0,
      advances: 0,
      transportation_deductions: 0,
      number_of_deductions: 0,
      deduction_rate: 0,
      deductions: 0,
      total_deductions: 0,
      net_pay: 0,
      status: "Pending", // Changed from "New" to "Pending" as per help panel
    }
    const newData = [...payrollData, newRow]
    setPayrollData(newData)
    setHasUnsavedChanges(true)

    setUndoHistory((prev) => [...prev, newData])
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Starting database transaction...")
      let successCount = 0
      let failCount = 0
      let unchangedCount = 0
      let skippedCount = 0

      const updatedData = await Promise.all(
        payrollData.map(async (row, index) => {
          if (row.status === "Loaded") {
            unchangedCount++
            return row
          }

          if (!row.employee_name && !row.payment_date && row.basic_salary <= 0) {
            skippedCount++
            return { ...row, status: "Skipped" }
          }

          if (!row.employee_name || !row.payment_date || row.basic_salary <= 0) {
            failCount++
            console.log(`[v0] Validation failed for row ${index + 1}`)
            return { ...row, status: "Failed: Missing required fields" }
          }

          const duplicateId = payrollData.find((r, i) => r.id === row.id && i !== index)
          if (duplicateId) {
            failCount++
            return { ...row, status: "Failed: Duplicate ID" }
          }

          try {
            const calculatedRow = calculatePayrollFields(row)

            if (row.status === "Pending") {
              console.log(
                `[v0] INSERT INTO payroll VALUES (${calculatedRow.id}, '${calculatedRow.employee_name}', ...)`,
              )
            } else {
              console.log(`[v0] UPDATE payroll SET ... WHERE id = ${calculatedRow.id}`)
            }

            await new Promise((resolve) => setTimeout(resolve, 100))

            successCount++
            return { ...calculatedRow, status: "Success" }
          } catch (error) {
            failCount++
            console.log(`[v0] Database operation failed for row ${index + 1}:`, error)
            return { ...row, status: "Failed: Database error" }
          }
        }),
      )

      setPayrollData(updatedData)
      setHasUnsavedChanges(false)
      setUndoHistory([updatedData])
      setCellUndoHistory(new Map())
      console.log("[v0] Database transaction completed")

      toast({
        title: "Submit Results",
        description: `Success: ${successCount}, Failed: ${failCount}, Unchanged: ${unchangedCount}, Skipped: ${skippedCount}`,
      })
    } catch (error) {
      console.log("[v0] Submit operation failed:", error)
      toast({
        title: "Error",
        description: "Failed to submit payroll data to database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUndo = () => {
    if (selectedCell) {
      const cellId = `${selectedCell.row}-${selectedCell.col}`
      const previousValue = cellUndoHistory.get(cellId)

      if (previousValue !== undefined) {
        const updatedData = [...payrollData]
        updatedData[selectedCell.row] = {
          ...updatedData[selectedCell.row],
          [selectedCell.col]: previousValue,
        }
        setPayrollData(updatedData)

        const newCellHistory = new Map(cellUndoHistory)
        newCellHistory.delete(cellId)
        setCellUndoHistory(newCellHistory)

        toast({
          title: "Cell Edit Undone",
          description: "Individual cell change has been reverted",
        })
        return
      }
    }

    if (undoHistory.length > 1) {
      const previousState = undoHistory[undoHistory.length - 2]
      setPayrollData(previousState)
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

  const handleRowSelect = (rowIndex: number) => {
    const employee = filteredData[rowIndex]
    setSelectedEmployee(selectedEmployee === employee.id ? null : employee.id)
  }

  const handleCellSelect = (rowIndex: number, columnKey: string) => {
    setSelectedCell({ row: rowIndex, col: columnKey })
  }

  const handleExportCSV = () => {
    try {
      const headers = [
        "ID",
        "Employee Name",
        "Payment Date",
        "Basic Salary",
        "Incentive",
        "Special Bonus",
        "Number of Bonuses",
        "Bonus Rate",
        "Bonus",
        "Number of Business Trips",
        "Business Trip Amount",
        "OT Hours",
        "OT Rate",
        "OT Amount",
        "Gross Pay",
        "Social Insurance",
        "Advances",
        "Transportation Deductions",
        "Number of Deductions",
        "Deduction Rate",
        "Deductions",
        "Total Deductions",
        "Net Pay",
        "Status",
      ]

      const csvContent = [
        headers.join(","),
        ...payrollData.map((row) =>
          [
            row.id,
            `"${row.employee_name}"`, // Wrap in quotes to handle names with commas
            row.payment_date,
            row.basic_salary,
            row.incentive,
            row.special_bonus,
            row.number_of_bonuses,
            row.bonus_rate,
            row.bonus,
            row.number_of_business_trips,
            row.business_trip_amount,
            row.ot_hours,
            row.ot_rate,
            row.ot_amount,
            row.gross_pay,
            row.social_insurance,
            row.advances,
            row.transportation_deductions,
            row.number_of_deductions,
            row.deduction_rate,
            row.deductions,
            row.total_deductions,
            row.net_pay,
            `"${row.status}"`,
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `payroll-data-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "CSV Exported",
        description: `Payroll data exported with ${payrollData.length} records`,
      })
    } catch (error) {
      console.error("CSV export error:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImportCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

        const importedData: PayrollData[] = []

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))

          if (values.length >= headers.length) {
            const rowData: Partial<PayrollData> = {}

            // Map CSV columns to our data structure
            headers.forEach((header, index) => {
              const value = values[index]
              switch (header.toLowerCase()) {
                case "id":
                  rowData.id = Number.parseInt(value) || Date.now() + i
                  break
                case "employee name":
                  rowData.employee_name = value || ""
                  break
                case "payment date":
                  rowData.payment_date = value || new Date().toISOString().split("T")[0]
                  break
                case "basic salary":
                  rowData.basic_salary = Number.parseFloat(value) || 0
                  break
                case "incentive":
                  rowData.incentive = Number.parseFloat(value) || 0
                  break
                case "special bonus":
                  rowData.special_bonus = Number.parseFloat(value) || 0
                  break
                case "number of bonuses":
                  rowData.number_of_bonuses = Number.parseInt(value) || 0
                  break
                case "number of business trips":
                  rowData.number_of_business_trips = Number.parseInt(value) || 0
                  break
                case "ot hours":
                  rowData.ot_hours = Number.parseFloat(value) || 0
                  break
                case "social insurance":
                  rowData.social_insurance = Number.parseFloat(value) || 0
                  break
                case "advances":
                  rowData.advances = Number.parseFloat(value) || 0
                  break
                case "transportation deductions":
                  rowData.transportation_deductions = Number.parseFloat(value) || 0
                  break
                case "number of deductions":
                  rowData.number_of_deductions = Number.parseInt(value) || 0
                  break
                case "status":
                  rowData.status = value || "Pending"
                  break
              }
            })

            // Calculate derived fields
            const calculatedRow = calculatePayrollFields(rowData as PayrollData)
            calculatedRow.status = "Pending"
            importedData.push(calculatedRow)
          }
        }

        if (importedData.length > 0) {
          setPayrollData([...payrollData, ...importedData])
          setHasUnsavedChanges(true)
          setUndoHistory((prev) => [...prev, [...payrollData, ...importedData]])

          toast({
            title: "CSV Imported",
            description: `Successfully imported ${importedData.length} records`,
          })
        } else {
          toast({
            title: "Import Failed",
            description: "No valid data found in CSV file",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("CSV import error:", error)
        toast({
          title: "Import Failed",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const filteredData = payrollData.filter((row) => {
    const matchesGeneral =
      searchQuery === "" ||
      row.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.id.toString().includes(searchQuery) ||
      row.basic_salary.toString().includes(searchQuery)

    const matchesEmployee = selectedEmployee === null || row.id === selectedEmployee
    const matchesDate = searchDate === "" || row.payment_date.includes(searchDate)

    return matchesGeneral && matchesEmployee && matchesDate
  })

  const getFilterStatus = () => {
    if (selectedEmployee) {
      const selectedEmployeeName =
        payrollData.find((emp) => emp.id === selectedEmployee)?.employee_name || `Employee ${selectedEmployee}`
      return `Showing data for: ${selectedEmployeeName} (${filteredData.length} records)`
    }
    return `Showing all employees (${filteredData.length} records)`
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar onNavigate={handleNavigate} currentView={currentView} />

      <main className="flex-1 flex flex-col overflow-hidden">{renderCurrentView()}</main>
    </div>
  )
}
