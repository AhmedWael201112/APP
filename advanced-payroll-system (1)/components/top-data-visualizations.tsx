"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChartIcon,
  TrendingDown,
  Activity,
} from "lucide-react"

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

interface TopDataVisualizationsProps {
  payrollData: PayrollData[]
}

export function TopDataVisualizations({ payrollData }: TopDataVisualizationsProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  if (!payrollData || payrollData.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-600">
        <CardContent className="p-8 text-center">
          <p className="text-white/70">No payroll data available for visualization</p>
        </CardContent>
      </Card>
    )
  }

  const slides = [
    {
      id: "overview",
      title: "Payroll Overview",
      icon: "BarChart3",
      color: "from-blue-600 to-blue-700",
    },
    {
      id: "salary-distribution",
      title: "Salary Distribution",
      icon: "PieChartIcon",
      color: "from-green-600 to-green-700",
    },
    {
      id: "overtime-analysis",
      title: "Overtime Analysis",
      icon: "Clock",
      color: "from-purple-600 to-purple-700",
    },
    {
      id: "performance-metrics",
      title: "Performance Metrics",
      icon: "TrendingUp",
      color: "from-orange-600 to-orange-700",
    },
  ]

  const icons = {
    BarChart3,
    PieChartIcon,
    Clock,
    TrendingUp,
    Users,
    DollarSign,
    TrendingDown,
    Activity,
  }

  const renderIcon = (iconName: string, className = "w-5 h-5") => {
    const IconComponent = icons[iconName as keyof typeof icons]
    return IconComponent ? <IconComponent className={className} /> : null
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const safeAverage = (values: number[]) => {
    if (!values || values.length === 0) return 0
    const sum = values.reduce((acc, val) => acc + (val || 0), 0)
    return Math.round(sum / values.length)
  }

  const safeSum = (values: number[]) => {
    if (!values || values.length === 0) return 0
    return values.reduce((acc, val) => acc + (val || 0), 0)
  }

  const safeMax = (values: number[]) => {
    if (!values || values.length === 0) return 0
    return Math.max(...values.filter((val) => !isNaN(val) && val !== null && val !== undefined))
  }

  const safeMin = (values: number[]) => {
    if (!values || values.length === 0) return 0
    return Math.min(...values.filter((val) => !isNaN(val) && val !== null && val !== undefined))
  }

  // Data processing for charts
  const salaryData = payrollData.map((emp) => ({
    name: emp.employee_name?.split(" ")[0] || "Unknown",
    salary: emp.basic_salary || 0,
    netPay: emp.net_pay || 0,
    overtime: emp.ot_amount || 0,
  }))

  const salaryRanges = [
    {
      range: "50K-60K",
      count: payrollData.filter((emp) => (emp.basic_salary || 0) >= 50000 && (emp.basic_salary || 0) < 60000).length,
    },
    {
      range: "60K-70K",
      count: payrollData.filter((emp) => (emp.basic_salary || 0) >= 60000 && (emp.basic_salary || 0) < 70000).length,
    },
    {
      range: "70K-80K",
      count: payrollData.filter((emp) => (emp.basic_salary || 0) >= 70000 && (emp.basic_salary || 0) < 80000).length,
    },
    {
      range: "80K-90K",
      count: payrollData.filter((emp) => (emp.basic_salary || 0) >= 80000 && (emp.basic_salary || 0) < 90000).length,
    },
    { range: "90K+", count: payrollData.filter((emp) => (emp.basic_salary || 0) >= 90000).length },
  ]

  const overtimeData = payrollData.map((emp) => ({
    name: emp.employee_name?.split(" ")[0] || "Unknown",
    hours: emp.ot_hours || 0,
    amount: emp.ot_amount || 0,
  }))

  const performanceData = payrollData.map((emp) => {
    const basicSalary = emp.basic_salary || 1 // Prevent division by zero
    const grossPay = emp.gross_pay || 0
    const totalDeductions = emp.total_deductions || 0
    const efficiency = basicSalary > 0 ? ((grossPay - totalDeductions) / basicSalary) * 100 : 0

    return {
      name: emp.employee_name?.split(" ")[0] || "Unknown",
      efficiency: isNaN(efficiency) ? 0 : Math.round(efficiency),
      bonuses: emp.bonus || 0,
      trips: emp.number_of_business_trips || 0,
    }
  })

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  const renderSlideContent = () => {
    const slide = slides[currentSlide]

    switch (slide.id) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Salary vs Net Pay</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                  <Bar
                    dataKey="salary"
                    fill="#3B82F6"
                    name="Basic Salary"
                    animationDuration={1500}
                    animationBegin={0}
                  />
                  <Bar dataKey="netPay" fill="#10B981" name="Net Pay" animationDuration={1500} animationBegin={200} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Key Metrics</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-white/80">Total Employees</span>
                  </div>
                  <span className="text-white font-bold text-xl">{payrollData.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-white/80">Avg Salary</span>
                  </div>
                  <span className="text-white font-bold text-xl">
                    ${safeAverage(payrollData.map((emp) => emp.basic_salary)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-white/80">Total Payroll</span>
                  </div>
                  <span className="text-white font-bold text-xl">
                    ${safeSum(payrollData.map((emp) => emp.net_pay)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-white/80">Total OT Hours</span>
                  </div>
                  <span className="text-white font-bold text-xl">
                    {safeSum(payrollData.map((emp) => emp.ot_hours))}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        )

      case "salary-distribution":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Salary Range Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={salaryRanges}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ range, count }) => `${range}: ${count}`}
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {salaryRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Salary Statistics</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Highest Salary</span>
                  <span className="text-green-400 font-bold">
                    ${safeMax(payrollData.map((emp) => emp.basic_salary)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Lowest Salary</span>
                  <span className="text-red-400 font-bold">
                    ${safeMin(payrollData.map((emp) => emp.basic_salary)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Median Salary</span>
                  <span className="text-blue-400 font-bold">
                    ${(() => {
                      const sortedSalaries = payrollData.map((emp) => emp.basic_salary || 0).sort((a, b) => a - b)
                      const median = sortedSalaries[Math.floor(sortedSalaries.length / 2)] || 0
                      return median.toLocaleString()
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Salary Range</span>
                  <span className="text-white font-bold">
                    $
                    {(
                      safeMax(payrollData.map((emp) => emp.basic_salary)) -
                      safeMin(payrollData.map((emp) => emp.basic_salary))
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )

      case "overtime-analysis":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Overtime Hours by Employee</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={overtimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                  <defs>
                    <linearGradient id="overtimeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#F59E0B"
                    fill="url(#overtimeGradient)"
                    fillOpacity={0.6}
                    animationDuration={1500}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Overtime Insights</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total OT Hours</span>
                  <span className="text-orange-400 font-bold">{safeSum(payrollData.map((emp) => emp.ot_hours))}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Avg OT per Employee</span>
                  <span className="text-orange-400 font-bold">
                    {safeAverage(payrollData.map((emp) => emp.ot_hours))}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total OT Cost</span>
                  <span className="text-orange-400 font-bold">
                    ${safeSum(payrollData.map((emp) => emp.ot_amount)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Employees with OT</span>
                  <span className="text-orange-400 font-bold">
                    {payrollData.filter((emp) => (emp.ot_hours || 0) > 0).length}/{payrollData.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )

      case "performance-metrics":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Employee Performance Index</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#10B981"
                    strokeWidth={4}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#10B981", strokeWidth: 2, fill: "#fff" }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Performance Summary</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Top Performer</span>
                  <span className="text-green-400 font-bold">
                    {(() => {
                      const topPerformer = payrollData.reduce((prev, current) =>
                        (prev.net_pay || 0) > (current.net_pay || 0) ? prev : current,
                      )
                      return topPerformer.employee_name?.split(" ")[0] || "Unknown"
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total Bonuses</span>
                  <span className="text-green-400 font-bold">
                    ${safeSum(payrollData.map((emp) => emp.bonus)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Business Trips</span>
                  <span className="text-blue-400 font-bold">
                    {safeSum(payrollData.map((emp) => emp.number_of_business_trips))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Avg Efficiency</span>
                  <span className="text-green-400 font-bold">
                    {safeAverage(performanceData.map((emp) => emp.efficiency))}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-600">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {renderIcon(slides[currentSlide].icon, "w-6 h-6 text-white")}
            <CardTitle className="text-white text-xl">{slides[currentSlide].title}</CardTitle>
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
      </CardHeader>
      <CardContent>
        {renderSlideContent()}

        {/* Slide indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-white" : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
