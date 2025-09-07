"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, DollarSign, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

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

interface DataVisualizationsProps {
  payrollData: PayrollData[]
  leaveData?: any[]
}

const COLORS = ["#1e40af", "#059669", "#dc2626", "#7c3aed", "#ea580c"]

const icons = {
  DollarSign: DollarSign,
  Clock: Clock,
  TrendingUp: TrendingUp,
  Users: Users,
  Calendar: Calendar,
}

export function DataVisualizations({ payrollData, leaveData = [] }: DataVisualizationsProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  console.log("[v0] DataVisualizations component rendering with data:", {
    payrollDataLength: payrollData?.length || 0,
    leaveDataLength: leaveData?.length || 0,
    currentSlide,
    hasData: payrollData && payrollData.length > 0,
  })

  const slides = [
    {
      id: "salary-overview",
      title: "Salary Overview",
      description: "Employee salary distribution and comparison",
      icon: "DollarSign",
    },
    {
      id: "overtime-analysis",
      title: "Overtime Analysis",
      description: "Overtime hours and compensation trends",
      icon: "Clock",
    },
    {
      id: "deductions-breakdown",
      title: "Deductions Breakdown",
      description: "Analysis of various deduction categories",
      icon: "TrendingUp",
    },
    {
      id: "employee-performance",
      title: "Employee Performance",
      description: "Bonuses and incentives distribution",
      icon: "Users",
    },
    {
      id: "leave-summary",
      title: "Leave Summary",
      description: "Employee leave patterns and statistics",
      icon: "Calendar",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Data processing for charts
  const salaryData = payrollData.map((emp) => ({
    name: emp.employee_name.split(" ")[0],
    basic: emp.basic_salary,
    gross: emp.gross_pay,
    net: emp.net_pay,
  }))

  const overtimeData = payrollData.map((emp) => ({
    name: emp.employee_name.split(" ")[0],
    hours: emp.ot_hours,
    amount: emp.ot_amount,
  }))

  const deductionsData = [
    { name: "Social Insurance", value: payrollData.reduce((sum, emp) => sum + emp.social_insurance, 0) },
    { name: "Advances", value: payrollData.reduce((sum, emp) => sum + emp.advances, 0) },
    { name: "Transportation", value: payrollData.reduce((sum, emp) => sum + emp.transportation_deductions, 0) },
    { name: "Other Deductions", value: payrollData.reduce((sum, emp) => sum + emp.deductions, 0) },
  ]

  const bonusData = payrollData.map((emp) => ({
    name: emp.employee_name.split(" ")[0],
    bonus: emp.bonus,
    incentive: emp.incentive,
    special: emp.special_bonus,
  }))

  console.log("[v0] Processed chart data:", {
    salaryDataLength: salaryData.length,
    firstSalaryEntry: salaryData[0],
    overtimeDataLength: overtimeData.length,
    deductionsDataLength: deductionsData.length,
  })

  console.log("[v0] Chart rendering debug:", {
    salaryDataLength: salaryData.length,
    firstSalaryEntry: salaryData[0],
    overtimeDataLength: overtimeData.length,
    deductionsDataLength: deductionsData.length,
    currentSlideId: slides[currentSlide].id,
  })

  const renderSlideContent = () => {
    const slide = slides[currentSlide]

    switch (slide.id) {
      case "salary-overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Salary Range Distribution</CardTitle>
                <CardDescription className="text-white/70">Basic vs Gross vs Net Pay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salaryData.map((emp, index) => {
                    const maxSalary = Math.max(...salaryData.map((e) => Math.max(e.basic, e.gross, e.net)))
                    return (
                      <div key={index} className="space-y-2">
                        <div className="text-white text-sm font-medium">{emp.name}</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-16 text-xs text-blue-300">Basic</div>
                            <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-1000"
                                style={{ width: `${(emp.basic / maxSalary) * 100}%` }}
                              />
                            </div>
                            <div className="w-20 text-xs text-white text-right">${emp.basic.toLocaleString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 text-xs text-green-300">Gross</div>
                            <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                              <div
                                className="h-full bg-green-500 transition-all duration-1000"
                                style={{ width: `${(emp.gross / maxSalary) * 100}%` }}
                              />
                            </div>
                            <div className="w-20 text-xs text-white text-right">${emp.gross.toLocaleString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 text-xs text-red-300">Net</div>
                            <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                              <div
                                className="h-full bg-red-500 transition-all duration-1000"
                                style={{ width: `${(emp.net / maxSalary) * 100}%` }}
                              />
                            </div>
                            <div className="w-20 text-xs text-white text-right">${emp.net.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Salary Statistics</CardTitle>
                <CardDescription className="text-white/70">Key salary metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-white">
                  <span>Highest Salary</span>
                  <span className="font-bold text-green-400">
                    ${Math.max(...salaryData.map((emp) => emp.net)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>Lowest Salary</span>
                  <span className="font-bold text-red-400">
                    ${Math.min(...salaryData.map((emp) => emp.net)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>Median Salary</span>
                  <span className="font-bold text-blue-400">
                    $
                    {Math.round(salaryData.reduce((sum, emp) => sum + emp.net, 0) / salaryData.length).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>Salary Range</span>
                  <span className="font-bold text-cyan-400">
                    $
                    {(
                      Math.max(...salaryData.map((emp) => emp.net)) - Math.min(...salaryData.map((emp) => emp.net))
                    ).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "overtime-analysis":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Overtime Hours</CardTitle>
                <CardDescription className="text-white/70">Hours worked by employee</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overtimeData.map((emp, index) => {
                    const maxHours = Math.max(...overtimeData.map((e) => e.hours))
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 text-white text-sm font-medium">{emp.name}</div>
                        <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-1000 flex items-center justify-end pr-2"
                            style={{ width: `${maxHours > 0 ? (emp.hours / maxHours) * 100 : 0}%` }}
                          >
                            <span className="text-white text-xs font-medium">{emp.hours}h</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Overtime Compensation</CardTitle>
                <CardDescription className="text-white/70">Amount earned from overtime</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overtimeData.map((emp, index) => {
                    const maxAmount = Math.max(...overtimeData.map((e) => e.amount))
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 text-white text-sm font-medium">{emp.name}</div>
                        <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-red-500 transition-all duration-1000 flex items-center justify-end pr-2"
                            style={{ width: `${maxAmount > 0 ? (emp.amount / maxAmount) * 100 : 0}%` }}
                          >
                            <span className="text-white text-xs font-medium">${emp.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "deductions-breakdown":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Deductions Distribution</CardTitle>
                <CardDescription className="text-white/70">Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deductionsData.map((item, index) => {
                    const total = deductionsData.reduce((sum, d) => sum + d.value, 0)
                    const percentage = total > 0 ? (item.value / total) * 100 : 0
                    const colors = ["#3b82f6", "#10b981", "#ef4444", "#8b5cf6"]
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between text-white text-sm mb-1">
                            <span>{item.name}</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full transition-all duration-1000"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: colors[index % colors.length],
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-white text-sm font-medium w-20 text-right">
                          ${item.value.toLocaleString()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Total Deductions by Employee</CardTitle>
                <CardDescription className="text-white/70">Individual deduction amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payrollData.map((emp, index) => {
                    const maxDeductions = Math.max(...payrollData.map((e) => e.total_deductions))
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 text-white text-sm font-medium">{emp.employee_name.split(" ")[0]}</div>
                        <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 transition-all duration-1000 flex items-center justify-end pr-2"
                            style={{
                              width: `${maxDeductions > 0 ? (emp.total_deductions / maxDeductions) * 100 : 0}%`,
                            }}
                          >
                            <span className="text-white text-xs font-medium">
                              ${emp.total_deductions.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "employee-performance":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Bonus & Incentives</CardTitle>
                <CardDescription className="text-white/70">Performance rewards by employee</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bonusData.map((emp, index) => {
                    const maxTotal = Math.max(...bonusData.map((e) => e.bonus + e.incentive + e.special))
                    const total = emp.bonus + emp.incentive + emp.special
                    return (
                      <div key={index} className="space-y-2">
                        <div className="text-white text-sm font-medium">{emp.name}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden flex">
                            {emp.bonus > 0 && (
                              <div
                                className="h-full bg-blue-500 flex items-center justify-center"
                                style={{ width: `${maxTotal > 0 ? (emp.bonus / maxTotal) * 100 : 0}%` }}
                              >
                                <span className="text-white text-xs font-medium">${emp.bonus}</span>
                              </div>
                            )}
                            {emp.incentive > 0 && (
                              <div
                                className="h-full bg-green-500 flex items-center justify-center"
                                style={{ width: `${maxTotal > 0 ? (emp.incentive / maxTotal) * 100 : 0}%` }}
                              >
                                <span className="text-white text-xs font-medium">${emp.incentive}</span>
                              </div>
                            )}
                            {emp.special > 0 && (
                              <div
                                className="h-full bg-red-500 flex items-center justify-center"
                                style={{ width: `${maxTotal > 0 ? (emp.special / maxTotal) * 100 : 0}%` }}
                              >
                                <span className="text-white text-xs font-medium">${emp.special}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-white text-sm font-medium w-20 text-right">
                            ${total.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Business Trips</CardTitle>
                <CardDescription className="text-white/70">Travel compensation by employee</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ width: "100%", height: "300px" }} className="bg-slate-800/50 rounded">
                  {/* Placeholder for future implementation */}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "leave-summary":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Leave Statistics</CardTitle>
                <CardDescription className="text-white/70">Summary of employee leave data</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px]">
                <div className="text-center text-white">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-60" />
                  <p className="text-lg">Leave data visualization</p>
                  <p className="text-sm opacity-70">Connect to leave management system for detailed charts</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Stats</CardTitle>
                <CardDescription className="text-white/70">Key payroll metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-white">
                  <span>Total Employees:</span>
                  <span className="font-bold text-blue-400">{payrollData.length}</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>Total Gross Pay:</span>
                  <span className="font-bold text-green-400">
                    ${payrollData.reduce((sum, emp) => sum + emp.gross_pay, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>Total Net Pay:</span>
                  <span className="font-bold text-green-400">
                    ${payrollData.reduce((sum, emp) => sum + emp.net_pay, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>Total OT Hours:</span>
                  <span className="font-bold text-yellow-400">
                    {payrollData.reduce((sum, emp) => sum + emp.ot_hours, 0)} hrs
                  </span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span>Total Deductions:</span>
                  <span className="font-bold text-red-400">
                    ${payrollData.reduce((sum, emp) => sum + emp.total_deductions, 0).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = icons[iconName as keyof typeof icons]
    return IconComponent ? <IconComponent className="w-5 h-5 text-white" /> : null
  }

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg shadow-sm border border-white/20">
      <div className="hidden">{console.log("[v0] DataVisualizations render: Component is visible in DOM")}</div>

      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">{renderIcon(slides[currentSlide].icon)}</div>
            <div>
              <h3 className="text-lg font-semibold text-white">{slides[currentSlide].title}</h3>
              <p className="text-sm text-white/70">{slides[currentSlide].description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-white/70 text-sm px-2">
              {currentSlide + 1} / {slides.length}
            </span>
            <Button
              onClick={nextSlide}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{renderSlideContent()}</div>

      {/* Navigation Dots */}
      <div className="p-4 border-t border-white/20">
        <div className="flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-blue-500" : "bg-white/30 hover:bg-white/50"
              }`}
              title={slide.title}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
