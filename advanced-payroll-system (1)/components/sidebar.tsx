"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Users,
  DollarSign,
  FileText,
  Settings,
  Calendar,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  X,
  Clock,
} from "lucide-react"

const navItems = [
  { name: "Time Sheet", icon: Clock, href: "/timesheet" },
  { name: "Days Off", icon: Users, href: "/daysoff" },
  { name: "Payroll", icon: DollarSign, href: "/payroll", active: true },
  { name: "Reports", icon: FileText, href: "/reports" },
  { name: "Calendar", icon: Calendar, href: "/calendar" },
  { name: "Company", icon: Building2, href: "/company" },
  { name: "Settings", icon: Settings, href: "/settings" },
]

interface SidebarProps {
  onNavigate?: (view: string) => void
  currentView?: string
}

export function Sidebar({ onNavigate, currentView = "payroll" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const handleHelp = () => {
    setShowHelp(true)
  }

  const handleNavClick = (itemName: string) => {
    if (onNavigate) {
      const viewName = itemName.toLowerCase().replace(" ", "")
      onNavigate(viewName)
    }
  }

  return (
    <>
      <div
        className={`${isCollapsed ? "w-16" : "w-64"} bg-gradient-to-b from-gray-950 via-slate-900 to-gray-900 text-white transition-all duration-300 flex flex-col shadow-2xl border-r border-gray-800`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-900 to-slate-900">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Target HR
                </h1>
                <p className="text-sm text-gray-400">Payroll System</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.name.toLowerCase().replace(" ", "")
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start text-left transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-white hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/30 shadow-lg"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-700/50"
                }`}
                onClick={() => handleNavClick(item.name)}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-blue-400" : ""}`} />
                {!isCollapsed && item.name}
              </Button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50 space-y-2 bg-gradient-to-r from-gray-950 to-slate-950">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
            onClick={handleHelp}
          >
            <HelpCircle className="w-5 h-5 mr-3" />
            {!isCollapsed && "Help"}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-red-900/30 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {!isCollapsed && "Sign Out"}
          </Button>
        </div>
      </div>

      {showHelp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
            <div className="bg-gradient-to-r from-gray-800 to-slate-800 text-white p-6 flex items-center justify-between border-b border-gray-700">
              <h2 className="text-2xl font-bold">Payroll Dashboard Guide</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(false)}
                className="text-white hover:bg-gray-700/50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-900 text-gray-100">
              <div className="prose prose-invert max-w-none">
                <p className="text-lg mb-6">
                  <strong>Welcome to the Payroll Management System!</strong> This guide helps you manage payroll data
                  effectively.
                </p>

                <h3 className="text-xl font-semibold text-slate-700 mb-4">Key Actions</h3>
                <ul className="space-y-2 mb-6">
                  <li>
                    <strong>Submit (Ctrl+S):</strong> Saves changes to the database. Clears undo history for submitted
                    rows.
                  </li>
                  <li>
                    <strong>Undo (Ctrl+Z):</strong> Reverts the last unsaved cell edit (status: Modified or Pending).
                  </li>
                  <li>
                    <strong>Add Row:</strong> Adds a new row for an employee, marked as "Pending."
                  </li>
                  <li>
                    <strong>Refresh:</strong> Reloads database data, updates calculations, and clears unsaved changes
                    and formatting.
                  </li>
                  <li>
                    <strong>Bold/Highlight:</strong> Applies visual styling (not saved to database, cleared on refresh).
                  </li>
                  <li>
                    <strong>Search:</strong> Filter by employee name, ID, or payment date (YYYY-MM-DD).
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-700 mb-4">Days Off Management</h3>
                <ul className="space-y-2 mb-6">
                  <li>
                    <strong>Employee Selection:</strong> Choose specific employees or view all leave records.
                  </li>
                  <li>
                    <strong>Leave Types:</strong> Track Regular, Emergency, Sick, Deduction, Unpaid, and Other leave
                    types.
                  </li>
                  <li>
                    <strong>Leave Balance:</strong> Monitor entitled balance, consumed days, and remaining balance
                    automatically.
                  </li>
                  <li>
                    <strong>Status Tracking:</strong> View submission status for each leave record (Loaded, Modified,
                    Pending, Success, Failed).
                  </li>
                  <li>
                    <strong>Advanced Features:</strong> Use Bold/Highlight formatting, Undo/Redo functionality, and
                    comprehensive search.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-700 mb-4">Data Entry Requirements</h3>
                <ul className="space-y-2 mb-6">
                  <li>
                    <strong>payment_date:</strong> Required, format YYYY-MM-DD (e.g., 2025-07-23).
                  </li>
                  <li>
                    <strong>id:</strong> Required, unique integer (e.g., 1001).
                  </li>
                  <li>
                    <strong>employee_name:</strong> Required, text up to 100 characters (e.g., John Doe).
                  </li>
                  <li>
                    <strong>basic_salary:</strong> Optional, decimal (e.g., 5000.00).
                  </li>
                  <li>
                    <strong>incentive:</strong> Optional, decimal (e.g., 200.50).
                  </li>
                  <li>
                    <strong>special_bonus:</strong> Optional, decimal (e.g., 1000.00).
                  </li>
                  <li>
                    <strong>number_of_bonuses:</strong> Optional, decimal (e.g., 2.0).
                  </li>
                  <li>
                    <strong>number_of_business_trips:</strong> Optional, integer (e.g., 3).
                  </li>
                  <li>
                    <strong>ot_hours:</strong> Optional, decimal (e.g., 10.5).
                  </li>
                  <li>
                    <strong>social_insurance:</strong> Optional, decimal (e.g., 300.00).
                  </li>
                  <li>
                    <strong>advances:</strong> Optional, decimal (e.g., 500.00).
                  </li>
                  <li>
                    <strong>transportation_deductions:</strong> Optional, decimal (e.g., 100.00).
                  </li>
                  <li>
                    <strong>number_of_deductions:</strong> Optional, integer (e.g., 2).
                  </li>
                  <li>
                    <strong>Non-editable Columns:</strong> The following are auto-calculated and cannot be edited:
                    <ul className="ml-6 mt-2">
                      <li>
                        bonus_rate, bonus, business_trip_amount, ot_rate, ot_amount, deduction_rate, deductions,
                        gross_pay, total_deductions, net_pay, Status
                      </li>
                    </ul>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-700 mb-4">Payroll Calculations</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-3 text-left font-semibold">Field</th>
                        <th className="border border-slate-300 p-3 text-left font-semibold">Calculation Formula</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-3">bonus_rate</td>
                        <td className="border border-slate-300 p-3">basic_salary / 26</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">bonus</td>
                        <td className="border border-slate-300 p-3">bonus_rate × number_of_bonuses</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">business_trip_amount</td>
                        <td className="border border-slate-300 p-3">bonus_rate × number_of_business_trips</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">ot_rate</td>
                        <td className="border border-slate-300 p-3">basic_salary / 26 / 8</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">ot_amount</td>
                        <td className="border border-slate-300 p-3">ot_rate × ot_hours</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">deduction_rate</td>
                        <td className="border border-slate-300 p-3">basic_salary / 26</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">deductions</td>
                        <td className="border border-slate-300 p-3">deduction_rate × number_of_deductions</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">gross_pay</td>
                        <td className="border border-slate-300 p-3">
                          basic_salary + incentive + special_bonus + bonus + business_trip_amount + ot_amount
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">total_deductions</td>
                        <td className="border border-slate-300 p-3">
                          social_insurance + advances + transportation_deductions + deductions
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-3">net_pay</td>
                        <td className="border border-slate-300 p-3">gross_pay - total_deductions</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-slate-700 mb-4">Status Indicators</h3>
                <ul className="space-y-2 mb-6">
                  <li>
                    <strong>Loaded:</strong> Unchanged data from the database.
                  </li>
                  <li>
                    <strong>Modified:</strong> Edited, unsaved changes.
                  </li>
                  <li>
                    <strong>Pending:</strong> New row awaiting submission.
                  </li>
                  <li>
                    <strong>Success:</strong> Successfully saved to the database.
                  </li>
                  <li>
                    <strong>Failed:</strong> Submission failed (e.g., invalid data or duplicate ID).
                  </li>
                  <li>
                    <strong>Skipped:</strong> Empty row ignored during submission.
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-700 mb-4">Usage Tips</h3>
                <ul className="space-y-2 mb-6">
                  <li>Verify data formats before submission to avoid errors (e.g., use numbers for decimal fields).</li>
                  <li>Use 'Highlight' (Red, Yellow, Blue) to mark cells for review; clear formatting with 'Clear'.</li>
                  <li>Press SPACE to edit a selected cell quickly.</li>
                  <li>Save screenshots regularly for audit trails or reporting.</li>
                  <li>Check 'Status' column to confirm submission outcomes.</li>
                  <li>Ensure unique IDs to prevent duplicate entry errors.</li>
                  <li>Use 'Refresh' to reset unsaved changes if errors occur.</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-700 mb-4">Troubleshooting</h3>
                <ul className="space-y-2 mb-6">
                  <li>
                    <strong>Database Errors:</strong> Ensure database server is running and accessible.
                  </li>
                  <li>
                    <strong>Submission Failures:</strong> Check for valid data (e.g., correct date format, numeric
                    values) and unique IDs.
                  </li>
                  <li>
                    <strong>Search Issues:</strong> Use exact terms or partial matches for names, IDs, or dates.
                  </li>
                  <li>
                    <strong>Contact:</strong> Reach out to your system administrator for further assistance.
                  </li>
                </ul>

                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <p className="text-red-700 font-medium">
                    Tip: Submit changes frequently to save progress and avoid data loss.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 px-6 py-4 flex justify-end border-t border-gray-700">
              <Button onClick={() => setShowHelp(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
                Got It ✔
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
