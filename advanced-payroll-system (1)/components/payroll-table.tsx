"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

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

interface PayrollTableProps {
  data: PayrollData[]
  onDataChange: (data: PayrollData[]) => void
  onUnsavedChanges: () => void
  onCellEdit?: (rowIndex: number, columnKey: string, oldValue: any, newValue: any) => void
  isLoading: boolean
  searchQuery: string
  boldCells: Set<string>
  highlightedCells: Set<string>
  selectedEmployee: number | null
  selectedCell: { row: number; col: string } | null
  onEmployeeSelect: (employeeId: number | null) => void
  onCellSelect: (rowIndex: number, columnKey: string) => void
}

export function PayrollTable({
  data,
  onDataChange,
  onUnsavedChanges,
  onCellEdit,
  isLoading,
  searchQuery,
  boldCells,
  highlightedCells,
  selectedEmployee,
  selectedCell,
  onEmployeeSelect,
  onCellSelect,
}: PayrollTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [originalRowData, setOriginalRowData] = useState<Map<number, PayrollData>>(new Map())
  const tableRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const columns = [
    { key: "id", label: "ID", editable: true, type: "number" },
    { key: "employee_name", label: "Employee Name", editable: true, type: "text" },
    { key: "payment_date", label: "Payment Date", editable: true, type: "date" },
    { key: "basic_salary", label: "Basic Salary", editable: true, type: "number" },
    { key: "incentive", label: "Incentive", editable: true, type: "number" },
    { key: "special_bonus", label: "Special Bonus", editable: true, type: "number" },
    { key: "number_of_bonuses", label: "# Bonuses", editable: true, type: "number" },
    { key: "bonus_rate", label: "Bonus Rate", editable: false, type: "number" },
    { key: "bonus", label: "Bonus", editable: false, type: "number" },
    { key: "number_of_business_trips", label: "# Business Trips", editable: true, type: "number" },
    { key: "business_trip_amount", label: "Business Trip Amount", editable: false, type: "number" },
    { key: "ot_hours", label: "OT Hours", editable: true, type: "number" },
    { key: "ot_rate", label: "OT Rate", editable: false, type: "number" },
    { key: "ot_amount", label: "OT Amount", editable: false, type: "number" },
    { key: "gross_pay", label: "Gross Pay", editable: false, type: "number" },
    { key: "social_insurance", label: "Social Insurance", editable: true, type: "number" },
    { key: "advances", label: "Advances", editable: true, type: "number" },
    { key: "transportation_deductions", label: "Transportation Deductions", editable: true, type: "number" },
    { key: "number_of_deductions", label: "# Deductions", editable: true, type: "number" },
    { key: "deduction_rate", label: "Deduction Rate", editable: false, type: "number" },
    { key: "deductions", label: "Deductions", editable: false, type: "number" },
    { key: "total_deductions", label: "Total Deductions", editable: false, type: "number" },
    { key: "net_pay", label: "Net Pay", editable: false, type: "number" },
    { key: "status", label: "Status", editable: false, type: "text" },
  ]

  useEffect(() => {
    const originalData = new Map()
    data.forEach((row, index) => {
      originalData.set(index, { ...row })
    })
    setOriginalRowData(originalData)
  }, [])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (editingCell) return

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const currentRow = selectedCell?.row ?? 0
      const currentColKey = selectedCell?.col ?? columns[0].key
      const currentColIndex = columns.findIndex((col) => col.key === currentColKey)

      if (e.key === "ArrowUp" && currentRow > 0) {
        e.preventDefault()
        onCellSelect(currentRow - 1, currentColKey)
      } else if (e.key === "ArrowDown" && currentRow < data.length - 1) {
        e.preventDefault()
        onCellSelect(currentRow + 1, currentColKey)
      } else if (e.key === "ArrowLeft" && currentColIndex > 0) {
        e.preventDefault()
        onCellSelect(currentRow, columns[currentColIndex - 1].key)
      } else if (e.key === "ArrowRight" && currentColIndex < columns.length - 1) {
        e.preventDefault()
        onCellSelect(currentRow, columns[currentColIndex + 1].key)
      } else if (e.key === "Enter" || e.key === "F2") {
        e.preventDefault()
        if (selectedCell) {
          handleCellClick(selectedCell.row, selectedCell.col)
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        if (selectedCell) {
          const column = columns.find((col) => col.key === selectedCell.col)
          if (column?.editable) {
            setEditingCell({ row: selectedCell.row, col: selectedCell.col })
            setEditValue(e.key)
          }
        }
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [selectedCell, editingCell, data.length, columns, onCellSelect])

  const calculateDerivedFields = (rowData: Partial<PayrollData>): PayrollData => {
    const basic_salary = rowData.basic_salary || 0
    const incentive = rowData.incentive || 0
    const special_bonus = rowData.special_bonus || 0
    const number_of_bonuses = rowData.number_of_bonuses || 0
    const number_of_business_trips = rowData.number_of_business_trips || 0
    const ot_hours = rowData.ot_hours || 0
    const social_insurance = rowData.social_insurance || 0
    const advances = rowData.advances || 0
    const transportation_deductions = rowData.transportation_deductions || 0
    const number_of_deductions = rowData.number_of_deductions || 0

    const bonus_rate = basic_salary > 0 ? basic_salary / 26 : 0
    const bonus = bonus_rate * number_of_bonuses
    const business_trip_amount = bonus_rate * number_of_business_trips
    const ot_rate = basic_salary > 0 ? basic_salary / 26 / 8 : 0
    const ot_amount = ot_rate * ot_hours
    const deduction_rate = basic_salary > 0 ? basic_salary / 26 : 0
    const deductions = deduction_rate * number_of_deductions

    const gross_pay = basic_salary + incentive + special_bonus + bonus + business_trip_amount + ot_amount
    const total_deductions = social_insurance + advances + transportation_deductions + deductions
    const net_pay = gross_pay - total_deductions

    return {
      ...rowData,
      bonus_rate: Number(bonus_rate.toFixed(2)),
      bonus: Number(bonus.toFixed(2)),
      business_trip_amount: Number(business_trip_amount.toFixed(2)),
      ot_rate: Number(ot_rate.toFixed(2)),
      ot_amount: Number(ot_amount.toFixed(2)),
      deduction_rate: Number(deduction_rate.toFixed(2)),
      deductions: Number(deductions.toFixed(2)),
      gross_pay: Number(gross_pay.toFixed(2)),
      total_deductions: Number(total_deductions.toFixed(2)),
      net_pay: Number(net_pay.toFixed(2)),
    } as PayrollData
  }

  const handleCellEdit = (rowIndex: number, columnKey: string, value: string) => {
    const column = columns.find((col) => col.key === columnKey)
    if (!column?.editable) return

    const oldValue = data[rowIndex][columnKey as keyof PayrollData]

    let parsedValue: any = value
    if (column.type === "number") {
      parsedValue = value === "" ? 0 : Number.parseFloat(value) || 0
    }

    const updatedData = [...data]
    const updatedRow = { ...updatedData[rowIndex], [columnKey]: parsedValue }

    const calculatedRow = calculateDerivedFields(updatedRow)
    calculatedRow.status = "Modified"

    updatedData[rowIndex] = calculatedRow
    onDataChange(updatedData)
    onUnsavedChanges()

    if (onCellEdit) {
      onCellEdit(rowIndex, columnKey, oldValue, parsedValue)
    }
  }

  const handleCellClick = (rowIndex: number, columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey)

    onCellSelect(rowIndex, columnKey)

    if (!column?.editable) return

    setEditingCell({ row: rowIndex, col: columnKey })
    setEditValue(String(data[rowIndex][columnKey as keyof PayrollData] || ""))
  }

  const handleCellBlur = () => {
    if (editingCell) {
      handleCellEdit(editingCell.row, editingCell.col, editValue)
      setEditingCell(null)
      setEditValue("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCellBlur()
      if (editingCell && editingCell.row < data.length - 1) {
        const nextRow = editingCell.row + 1
        const nextColumn = editingCell.col
        setTimeout(() => {
          onCellSelect(nextRow, nextColumn)
        }, 50)
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      handleCellBlur()
      if (editingCell) {
        const currentColIndex = columns.findIndex((col) => col.key === editingCell.col)
        const nextEditableCol = columns.slice(currentColIndex + 1).find((col) => col.editable)

        if (nextEditableCol) {
          setTimeout(() => {
            onCellSelect(editingCell.row, nextEditableCol.key)
          }, 50)
        } else if (editingCell.row < data.length - 1) {
          const firstEditableCol = columns.find((col) => col.editable)
          if (firstEditableCol) {
            setTimeout(() => {
              onCellSelect(editingCell.row + 1, firstEditableCol.key)
            }, 50)
          }
        }
      }
    } else if (e.key === "Escape") {
      setEditingCell(null)
      setEditValue("")
      if (selectedCell) {
        onCellSelect(selectedCell.row, selectedCell.col)
      }
    }
  }

  const handleRowNumberClick = (rowIndex: number) => {
    const employee = data[rowIndex]
    onEmployeeSelect(selectedEmployee === employee.id ? null : employee.id)
  }

  const getCellStyle = (rowIndex: number, columnKey: string) => {
    const cellId = `${rowIndex}-${columnKey}`
    let className = "cursor-pointer hover:bg-blue-50 transition-all duration-200 ease-in-out relative"

    const isRowSelected = selectedEmployee === data[rowIndex].id
    const isColumnHighlighted = columnKey === "net_pay" || columnKey === "total_deductions" || columnKey === "gross_pay"
    const isSpecialColumn = [
      "bonus_rate",
      "bonus",
      "business_trip_amount",
      "ot_rate",
      "ot_amount",
      "deduction_rate",
      "deductions",
    ].includes(columnKey)

    if (isRowSelected && isColumnHighlighted) {
      if (columnKey === "net_pay") {
        className += " bg-green-200"
      } else if (columnKey === "total_deductions") {
        className += " bg-red-200"
      } else if (columnKey === "gross_pay") {
        className += " bg-blue-200"
      }
    } else if (isRowSelected) {
      className += " bg-blue-100"
    } else if (columnKey === "net_pay") {
      className += " bg-green-100 hover:bg-green-200"
    } else if (columnKey === "total_deductions") {
      className += " bg-red-100 hover:bg-red-200"
    } else if (columnKey === "gross_pay") {
      className += " bg-blue-100 hover:bg-blue-200"
    } else if (isSpecialColumn) {
      className += " bg-gray-200 hover:bg-gray-300"
    }

    if (selectedCell?.row === rowIndex && selectedCell?.col === columnKey) {
      className += " ring-2 ring-blue-500 bg-blue-200"
    }
    if (boldCells.has(cellId)) {
      className += " font-bold"
    }
    if (highlightedCells.has(cellId)) {
      className += " bg-yellow-200"
    }

    return className
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Loaded":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Loaded
          </Badge>
        )
      case "Modified":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Modified
          </Badge>
        )
      case "Success":
        return (
          <Badge variant="default" className="bg-green-600 text-white">
            Success
          </Badge>
        )
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">New</Badge>
    }
  }

  const formatCellValue = (value: any, type: string) => {
    if (value === null || value === undefined || value === "") return ""

    if (type === "number") {
      return typeof value === "number" ? value.toFixed(2) : value
    }
    return String(value)
  }

  const handleDeleteRow = (rowIndex: number) => {
    const updatedData = data.filter((_, index) => index !== rowIndex)
    onDataChange(updatedData)
    onUnsavedChanges()

    toast({
      title: "Row Deleted",
      description: "Row has been successfully deleted",
    })
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
        <p className="mt-2 text-slate-600">Loading payroll data...</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto" ref={tableRef} tabIndex={0}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            <TableHead className="font-semibold text-white text-xs whitespace-nowrap w-16 text-center">Row #</TableHead>
            <TableHead className="font-semibold text-white text-xs whitespace-nowrap w-12">Actions</TableHead>
            {columns.map((column) => {
              const isSpecialColumn = [
                "bonus_rate",
                "bonus",
                "business_trip_amount",
                "ot_rate",
                "ot_amount",
                "deduction_rate",
                "deductions",
              ].includes(column.key)

              return (
                <TableHead
                  key={column.key}
                  className={`font-semibold text-white text-xs whitespace-nowrap ${
                    column.key === "employee_name" ? "min-w-[400px] w-[400px] max-w-[400px]" : ""
                  } ${
                    column.key === "net_pay"
                      ? "bg-green-600"
                      : column.key === "total_deductions"
                        ? "bg-red-600"
                        : column.key === "gross_pay"
                          ? "bg-blue-600"
                          : isSpecialColumn
                            ? "bg-gray-600"
                            : ""
                  }`}
                >
                  {column.label}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className={`hover:bg-slate-50 transition-colors ${selectedEmployee === row.id ? "bg-blue-100" : ""}`}
            >
              <TableCell
                className={`text-center font-medium cursor-pointer hover:bg-blue-200 transition-colors ${
                  selectedEmployee === row.id ? "bg-blue-300 text-blue-800" : ""
                }`}
                onClick={() => handleRowNumberClick(rowIndex)}
              >
                {rowIndex + 1}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRow(rowIndex)}
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  🗑️
                </Button>
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={getCellStyle(rowIndex, column.key)}
                  onClick={() => handleCellClick(rowIndex, column.key)}
                >
                  {editingCell?.row === rowIndex && editingCell?.col === column.key ? (
                    <Input
                      type={column.type === "number" ? "number" : column.type === "date" ? "date" : "text"}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleCellBlur}
                      onKeyDown={handleKeyPress}
                      className={`w-full border-2 border-blue-500 ${
                        column.key === "employee_name" ? "min-w-[380px] w-[380px]" : "min-w-[100px]"
                      }`}
                      autoFocus
                    />
                  ) : column.key === "status" ? (
                    getStatusBadge(row.status)
                  ) : (
                    <span
                      className={`block text-sm ${
                        column.key === "employee_name"
                          ? "min-w-[380px] w-[380px] whitespace-normal break-words overflow-hidden"
                          : "min-w-[80px] whitespace-nowrap"
                      }`}
                    >
                      {formatCellValue(row[column.key as keyof PayrollData], column.type)}
                    </span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
