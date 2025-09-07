"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ReferenceLine,
  Treemap,
} from "recharts"
import { TrendingUp, ChevronLeft, ChevronRight, BarChart3, Activity, Target, Zap, Maximize2 } from "lucide-react"

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

interface AdvancedPayrollChartsProps {
  payrollData: PayrollData[]
}

export function AdvancedPayrollCharts({ payrollData }: AdvancedPayrollChartsProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [animationKey, setAnimationKey] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    setAnimationKey((prev) => prev + 1)
  }, [currentSlide])

  if (!payrollData || payrollData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-600">
        <CardContent className="p-8 text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <p className="text-white/70">No payroll data available for advanced visualization</p>
        </CardContent>
      </Card>
    )
  }

  const slides = [
    {
      id: "performance-radar",
      title: "Performance Radar",
      icon: Target,
      color: "from-blue-600 to-cyan-600",
      description: "Multi-dimensional employee performance analysis",
    },
    {
      id: "salary-heatmap",
      title: "Salary Heatmap",
      icon: Activity,
      color: "from-green-600 to-emerald-600",
      description: "Interactive salary distribution visualization",
    },
    {
      id: "trend-analysis",
      title: "Trend Analysis",
      icon: TrendingUp,
      color: "from-purple-600 to-violet-600",
      description: "Advanced trend forecasting and analytics",
    },
    {
      id: "correlation-matrix",
      title: "Correlation Matrix",
      icon: BarChart3,
      color: "from-orange-600 to-red-600",
      description: "Statistical relationships between payroll components",
    },
    {
      id: "efficiency-treemap",
      title: "Efficiency Treemap",
      icon: Zap,
      color: "from-pink-600 to-rose-600",
      description: "Hierarchical view of employee efficiency metrics",
    },
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  const goToSlide = (index: number) => setCurrentSlide(index)

  const processedData = payrollData.map((emp, index) => {
    const efficiency = emp.basic_salary > 0 ? (emp.net_pay / emp.basic_salary) * 100 : 0
    const performanceScore =
      (emp.bonus || 0) * 0.3 +
      (emp.incentive || 0) * 0.2 +
      (emp.ot_amount || 0) * 0.1 +
      (emp.business_trip_amount || 0) * 0.1 +
      efficiency * 0.3

    return {
      ...emp,
      shortName: emp.employee_name?.split(" ")[0] || `Emp${index + 1}`,
      efficiency: Math.round(efficiency),
      performanceScore: Math.round(performanceScore),
      salaryRatio: emp.basic_salary > 0 ? emp.net_pay / emp.basic_salary : 0,
      deductionRatio: emp.gross_pay > 0 ? emp.total_deductions / emp.gross_pay : 0,
    }
  })

  const avgSalary = Math.round(processedData.reduce((sum, emp) => sum + emp.basic_salary, 0) / processedData.length)

  const stats = {
    avgSalary,
    avgEfficiency: Math.round(processedData.reduce((sum, emp) => sum + emp.efficiency, 0) / processedData.length),
    topPerformer: processedData.reduce((prev, current) =>
      prev.performanceScore > current.performanceScore ? prev : current,
    ),
    salaryStdDev: Math.round(
      Math.sqrt(
        processedData.reduce((sum, emp) => sum + Math.pow(emp.basic_salary - avgSalary, 2), 0) / processedData.length,
      ),
    ),
  }

  const ADVANCED_COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6366F1",
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-2xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-white/80">{entry.name}:</span>
              <span className="text-white font-medium">
                {typeof entry.value === "number"
                  ? entry.name.includes("$") || entry.name.includes("Salary")
                    ? `$${entry.value.toLocaleString()}`
                    : entry.value.toLocaleString()
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const renderSlideContent = () => {
    const slide = slides[currentSlide]

    switch (slide.id) {
      case "performance-radar":
        const radarData = processedData.map((emp) => ({
          employee: emp.shortName,
          salary: Math.round((emp.basic_salary / 100000) * 100),
          efficiency: emp.efficiency,
          bonuses: Math.round((emp.bonus || 0) / 1000),
          overtime: Math.round((emp.ot_amount || 0) / 1000),
          trips: (emp.number_of_business_trips || 0) * 20,
          performance: emp.performanceScore / 10,
        }))

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Performance Radar Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData} key={animationKey}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis dataKey="employee" tick={{ fill: "white", fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "white", fontSize: 10 }} />
                    <Radar
                      name="Salary Score"
                      dataKey="salary"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Efficiency"
                      dataKey="efficiency"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Performance"
                      dataKey="performance"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-400">{stats.topPerformer.shortName}</div>
                    <div className="text-white/70 text-sm">Top Performer</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{stats.avgEfficiency}%</div>
                    <div className="text-white/70 text-sm">Avg Efficiency</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-white font-medium">Employee Rankings</h4>
                  {processedData
                    .sort((a, b) => b.performanceScore - a.performanceScore)
                    .slice(0, 5)
                    .map((emp, index) => (
                      <div key={emp.id} className="flex items-center justify-between bg-white/5 rounded p-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="text-white text-sm">{emp.shortName}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium text-sm">{emp.performanceScore}</div>
                          <div className="text-white/60 text-xs">Score</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "salary-heatmap":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Interactive Salary vs Net Pay Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={processedData} key={animationKey}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis
                      dataKey="basic_salary"
                      type="number"
                      domain={["dataMin - 5000", "dataMax + 5000"]}
                      stroke="rgba(255,255,255,0.8)"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      dataKey="net_pay"
                      type="number"
                      domain={["dataMin - 3000", "dataMax + 3000"]}
                      stroke="rgba(255,255,255,0.8)"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-black/95 backdrop-blur-sm border border-green-400/50 rounded-lg p-4 shadow-2xl">
                              <p className="text-green-400 font-bold text-lg mb-2">{data.employee_name}</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span className="text-white/70">Basic Salary:</span>
                                  <span className="text-white font-medium">${data.basic_salary.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-white/70">Net Pay:</span>
                                  <span className="text-green-400 font-medium">${data.net_pay.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-white/70">Efficiency:</span>
                                  <span className="text-blue-400 font-medium">{data.efficiency}%</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-white/70">OT Hours:</span>
                                  <span className="text-yellow-400 font-medium">{data.ot_hours}h</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-white/70">Bonuses:</span>
                                  <span className="text-purple-400 font-medium">
                                    ${(data.bonus || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />

                    {processedData.map((emp, index) => (
                      <g key={emp.id}>
                        <circle
                          cx={emp.basic_salary}
                          cy={emp.net_pay}
                          r={Math.max(6, emp.efficiency / 10)}
                          fill={emp.efficiency > 80 ? "#10B981" : emp.efficiency > 60 ? "#F59E0B" : "#EF4444"}
                          fillOpacity={selectedEmployee === emp.shortName ? 1 : 0.7}
                          stroke={selectedEmployee === emp.shortName ? "#FFFFFF" : "transparent"}
                          strokeWidth={selectedEmployee === emp.shortName ? 3 : 0}
                          className="cursor-pointer hover:stroke-white hover:stroke-2 transition-all duration-200"
                          onClick={() => setSelectedEmployee(selectedEmployee === emp.shortName ? null : emp.shortName)}
                          style={{
                            filter:
                              selectedEmployee === emp.shortName
                                ? "drop-shadow(0 0 10px rgba(255,255,255,0.8))"
                                : "none",
                            transform: selectedEmployee === emp.shortName ? "scale(1.2)" : "scale(1)",
                            transformOrigin: "center",
                          }}
                        />
                        <text
                          x={emp.basic_salary}
                          y={emp.net_pay - (Math.max(6, emp.efficiency / 10) + 8)}
                          textAnchor="middle"
                          fill={selectedEmployee === emp.shortName ? "#FFFFFF" : "rgba(255,255,255,0.8)"}
                          fontSize={selectedEmployee === emp.shortName ? "12" : "10"}
                          fontWeight={selectedEmployee === emp.shortName ? "bold" : "normal"}
                          className="pointer-events-none"
                          style={{
                            textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                            filter:
                              selectedEmployee === emp.shortName
                                ? "drop-shadow(0 0 4px rgba(255,255,255,0.6))"
                                : "none",
                          }}
                        >
                          {emp.shortName}
                        </text>
                      </g>
                    ))}

                    <ReferenceLine
                      x={stats.avgSalary}
                      stroke="#3B82F6"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ value: "Avg Salary", position: "top", fill: "#3B82F6", fontSize: 12 }}
                    />
                    <ReferenceLine
                      y={processedData.reduce((sum, emp) => sum + emp.net_pay, 0) / processedData.length}
                      stroke="#10B981"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ value: "Avg Net Pay", position: "topRight", fill: "#10B981", fontSize: 12 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="flex items-center justify-center gap-6 mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg"></div>
                    <span className="text-white font-medium text-sm">High Efficiency (80%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg"></div>
                    <span className="text-white font-medium text-sm">Medium (60-80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg"></div>
                    <span className="text-white font-medium text-sm">Low (less than 60%)</span>
                  </div>
                </div>

                <div className="text-center text-white/80 text-sm mt-3 font-medium">
                  💡 Click on any point to view detailed information • Circle size represents efficiency
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  {selectedEmployee ? `${selectedEmployee} Details` : "Salary Analytics"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEmployee ? (
                  <div className="space-y-4">
                    {(() => {
                      const emp = processedData.find((e) => e.shortName === selectedEmployee)
                      if (!emp) return null

                      return (
                        <>
                          <div className="bg-white/10 rounded-lg p-3">
                            <div className="text-2xl font-bold text-green-400 mb-1">
                              ${emp.basic_salary.toLocaleString()}
                            </div>
                            <div className="text-white/70 text-xs">Basic Salary</div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-white">
                              <span>Net Pay:</span>
                              <span className="font-medium">${emp.net_pay.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-white">
                              <span>Efficiency:</span>
                              <span className="font-medium">{emp.efficiency}%</span>
                            </div>
                            <div className="flex justify-between text-white">
                              <span>OT Hours:</span>
                              <span className="font-medium">{emp.ot_hours}h</span>
                            </div>
                            <div className="flex justify-between text-white">
                              <span>Bonuses:</span>
                              <span className="font-medium">${(emp.bonus || 0).toLocaleString()}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => setSelectedEmployee(null)}
                            variant="outline"
                            size="sm"
                            className="w-full border-white/20 text-white hover:bg-white/10"
                          >
                            Clear Selection
                          </Button>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-xl font-bold text-green-400 mb-1">
                          ${Math.max(...processedData.map((e) => e.basic_salary)).toLocaleString()}
                        </div>
                        <div className="text-white/70 text-xs">Highest</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-xl font-bold text-red-400 mb-1">
                          ${Math.min(...processedData.map((e) => e.basic_salary)).toLocaleString()}
                        </div>
                        <div className="text-white/70 text-xs">Lowest</div>
                      </div>
                    </div>

                    <div className="text-center text-white/70 text-sm">
                      Click on any point to view detailed employee information
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case "trend-analysis":
        const trendData = processedData.map((emp, index) => ({
          month: `M${index + 1}`,
          salary: emp.basic_salary,
          netPay: emp.net_pay,
          efficiency: emp.efficiency,
          predicted: emp.basic_salary * (1 + (Math.random() - 0.5) * 0.1), // Mock prediction
        }))

        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/50 to-violet-900/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Advanced Trend Analysis with Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={trendData} key={animationKey}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip content={<CustomTooltip />} />

                    <Area
                      type="monotone"
                      dataKey="salary"
                      fill="url(#salaryGradient)"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      name="Basic Salary"
                    />
                    <Line
                      type="monotone"
                      dataKey="netPay"
                      stroke="#10B981"
                      strokeWidth={3}
                      name="Net Pay"
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Predicted Trend"
                      dot={{ fill: "#F59E0B", strokeWidth: 2, r: 3 }}
                    />

                    <ReferenceLine
                      y={stats.avgSalary}
                      stroke="#EF4444"
                      strokeDasharray="3 3"
                      label={{ value: "Avg Salary", position: "topRight", fill: "#EF4444" }}
                    />

                    <defs>
                      <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-white/80 text-sm">Growth Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">+12.5%</div>
                  <div className="text-white/60 text-xs">Projected annual growth</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-white/80 text-sm">Volatility</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">±8.2%</div>
                  <div className="text-white/60 text-xs">Salary variance range</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-orange-400" />
                    <span className="text-white/80 text-sm">Confidence</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-400">87%</div>
                  <div className="text-white/60 text-xs">Prediction accuracy</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "correlation-matrix":
        const correlationData = [
          { name: "Salary vs Efficiency", correlation: 0.75, x: 1, y: 1 },
          { name: "Bonus vs Performance", correlation: 0.82, x: 2, y: 1 },
          { name: "OT vs Net Pay", correlation: 0.64, x: 3, y: 1 },
          { name: "Deductions vs Gross", correlation: 0.91, x: 1, y: 2 },
          { name: "Trips vs Bonus", correlation: 0.45, x: 2, y: 2 },
          { name: "Hours vs Amount", correlation: 0.88, x: 3, y: 2 },
        ]

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Correlation Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {correlationData.map((item, index) => {
                    const intensity = Math.abs(item.correlation)
                    const color = item.correlation > 0 ? "rgba(16, 185, 129," : "rgba(239, 68, 68,"

                    return (
                      <div
                        key={index}
                        className="aspect-square rounded-lg flex flex-col items-center justify-center text-white text-xs font-medium cursor-pointer hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: `${color} ${intensity})`,
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                        title={`${item.name}: ${item.correlation.toFixed(2)}`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold">{item.correlation.toFixed(2)}</div>
                          <div className="text-[10px] opacity-80">{item.name.split(" ")[0]}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between text-white/70 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500/80"></div>
                    <span>Negative</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/80"></div>
                    <span>Positive</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Statistical Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {correlationData
                    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
                    .map((item, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm font-medium">{item.name}</span>
                          <Badge
                            variant={
                              item.correlation > 0.7 ? "default" : item.correlation > 0.5 ? "secondary" : "outline"
                            }
                            className="text-xs"
                          >
                            {item.correlation > 0.7 ? "Strong" : item.correlation > 0.5 ? "Moderate" : "Weak"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ${
                                item.correlation > 0 ? "bg-green-500" : "bg-red-500"
                              }`}
                              style={{ width: `${Math.abs(item.correlation) * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-sm font-bold w-12">{item.correlation.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "efficiency-treemap":
        const treemapData = processedData.map((emp) => ({
          name: emp.shortName,
          size: emp.basic_salary,
          efficiency: emp.efficiency,
          performance: emp.performanceScore,
          fill: emp.efficiency > 80 ? "#10B981" : emp.efficiency > 60 ? "#F59E0B" : "#EF4444",
        }))

        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-pink-900/50 to-rose-900/50 border-pink-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Employee Efficiency Treemap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    strokeWidth={2}
                    content={({ depth, x, y, width, height, payload }) => {
                      if (depth === 1 && payload && x !== undefined && y !== undefined && width && height) {
                        const fillColor = payload.fill || "#6B7280"
                        const name = payload.name || "Unknown"
                        const efficiency = payload.efficiency || 0
                        const size = payload.size || 0

                        return (
                          <g>
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              style={{
                                fill: fillColor,
                                stroke: "#fff",
                                strokeWidth: 2,
                                strokeOpacity: 1,
                              }}
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                            />
                            <text
                              x={x + width / 2}
                              y={y + height / 2 - 10}
                              textAnchor="middle"
                              fill="#fff"
                              fontSize="14"
                              fontWeight="bold"
                            >
                              {name}
                            </text>
                            <text
                              x={x + width / 2}
                              y={y + height / 2 + 5}
                              textAnchor="middle"
                              fill="#fff"
                              fontSize="12"
                            >
                              {efficiency}%
                            </text>
                            <text
                              x={x + width / 2}
                              y={y + height / 2 + 20}
                              textAnchor="middle"
                              fill="#fff"
                              fontSize="10"
                              opacity="0.8"
                            >
                              ${(size / 1000).toFixed(0)}k
                            </text>
                          </g>
                        )
                      }
                      return null
                    }}
                  />
                </ResponsiveContainer>

                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-white/80 text-sm">High Efficiency (80%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500"></div>
                    <span className="text-white/80 text-sm">Medium Efficiency (60-80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-white/80 text-sm">Low Efficiency (less than 60%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {treemapData.filter((emp) => emp.efficiency > 80).length}
                  </div>
                  <div className="text-white/70 text-sm">High Performers</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {treemapData.filter((emp) => emp.efficiency >= 60 && emp.efficiency <= 80).length}
                  </div>
                  <div className="text-white/70 text-sm">Medium Performers</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-400 mb-1">
                    {treemapData.filter((emp) => emp.efficiency < 60).length}
                  </div>
                  <div className="text-white/70 text-sm">Needs Improvement</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {Math.round(treemapData.reduce((sum, emp) => sum + emp.efficiency, 0) / treemapData.length)}%
                  </div>
                  <div className="text-white/70 text-sm">Avg Efficiency</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const currentSlideData = slides[currentSlide]
  const IconComponent = currentSlideData.icon

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-black" : ""}`}>
      <Card
        className={`bg-gradient-to-br ${currentSlideData.color} border-white/20 shadow-2xl ${isFullscreen ? "h-full rounded-none" : ""}`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">{currentSlideData.title}</CardTitle>
                <p className="text-white/80 text-sm">{currentSlideData.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsFullscreen(!isFullscreen)}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
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

        <CardContent className={isFullscreen ? "h-full overflow-auto pb-4" : "pb-4"}>
          {renderSlideContent()}

          <div className="flex justify-center gap-3 mt-4">
            {slides.map((slide, index) => {
              const SlideIcon = slide.icon
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                    index === currentSlide
                      ? "bg-white/20 text-white scale-105"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                  }`}
                  title={slide.title}
                >
                  <SlideIcon className="w-3 h-3" />
                  <span className="text-xs font-medium hidden sm:block">{slide.title}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
