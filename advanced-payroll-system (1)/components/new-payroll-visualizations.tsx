"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock, ChevronLeft, ChevronRight, BarChart3, PieChartIcon } from "lucide-react"

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

interface NewPayrollVisualizationsProps {
  payrollData: PayrollData[]
}

export function NewPayrollVisualizations({ payrollData }: NewPayrollVisualizationsProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)

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
      icon: BarChart3,
      color: "from-blue-600 to-blue-700",
    },
    {
      id: "salary-distribution",
      title: "Salary Distribution",
      icon: PieChartIcon,
      color: "from-green-600 to-green-700",
    },
    {
      id: "overtime-analysis",
      title: "Overtime Analysis",
      icon: Clock,
      color: "from-purple-600 to-purple-700",
    },
    {
      id: "performance-metrics",
      title: "Performance Metrics",
      icon: TrendingUp,
      color: "from-orange-600 to-orange-700",
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

  // Data processing functions
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

  // Data processing for visualizations
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
    const basicSalary = emp.basic_salary || 1
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

  const renderSlideContent = () => {
    const slide = slides[currentSlide]

    switch (slide.id) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Interactive Salary vs Net Pay Chart</h4>
              <div className="relative h-64 bg-slate-800/50 rounded-lg p-4">
                <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
                  {/* Chart Grid Lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <g key={i}>
                      <line
                        x1="40"
                        y1={40 + i * 32}
                        x2="360"
                        y2={40 + i * 32}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                      <text x="35" y={45 + i * 32} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="end">
                        {100 - i * 25}K
                      </text>
                    </g>
                  ))}

                  {/* Interactive Bar Chart */}
                  {salaryData.map((emp, index) => {
                    const maxValue = Math.max(...salaryData.map((e) => Math.max(e.salary, e.netPay)))
                    const barWidth = 25
                    const spacing = 45
                    const x = 50 + index * spacing
                    const salaryHeight = (emp.salary / maxValue) * 120
                    const netPayHeight = (emp.netPay / maxValue) * 120
                    const isHovered = hoveredItem === index

                    return (
                      <g key={index}>
                        {/* Salary Bar */}
                        <rect
                          x={x}
                          y={168 - salaryHeight}
                          width={barWidth / 2}
                          height={salaryHeight}
                          fill={isHovered ? "#60A5FA" : "#3B82F6"}
                          className="transition-all duration-300 cursor-pointer"
                          onMouseEnter={() => setHoveredItem(index)}
                          onMouseLeave={() => setHoveredItem(null)}
                        />
                        {/* Net Pay Bar */}
                        <rect
                          x={x + barWidth / 2 + 2}
                          y={168 - netPayHeight}
                          width={barWidth / 2}
                          height={netPayHeight}
                          fill={isHovered ? "#34D399" : "#10B981"}
                          className="transition-all duration-300 cursor-pointer"
                          onMouseEnter={() => setHoveredItem(index)}
                          onMouseLeave={() => setHoveredItem(null)}
                        />
                        {/* Employee Name */}
                        <text
                          x={x + barWidth / 2}
                          y={185}
                          fill="rgba(255,255,255,0.8)"
                          fontSize="10"
                          textAnchor="middle"
                          className="font-medium"
                        >
                          {emp.name}
                        </text>
                        {/* Hover Tooltip */}
                        {isHovered && (
                          <g>
                            <rect
                              x={x - 20}
                              y={140 - Math.max(salaryHeight, netPayHeight)}
                              width="70"
                              height="35"
                              fill="rgba(0,0,0,0.8)"
                              rx="4"
                            />
                            <text
                              x={x + 15}
                              y={155 - Math.max(salaryHeight, netPayHeight)}
                              fill="white"
                              fontSize="9"
                              textAnchor="middle"
                            >
                              Salary: ${(emp.salary / 1000).toFixed(0)}K
                            </text>
                            <text
                              x={x + 15}
                              y={167 - Math.max(salaryHeight, netPayHeight)}
                              fill="white"
                              fontSize="9"
                              textAnchor="middle"
                            >
                              Net: ${(emp.netPay / 1000).toFixed(0)}K
                            </text>
                          </g>
                        )}
                      </g>
                    )
                  })}

                  {/* Legend */}
                  <g>
                    <rect x="50" y="15" width="12" height="12" fill="#3B82F6" />
                    <text x="67" y="25" fill="rgba(255,255,255,0.8)" fontSize="11">
                      Salary
                    </text>
                    <rect x="120" y="15" width="12" height="12" fill="#10B981" />
                    <text x="137" y="25" fill="rgba(255,255,255,0.8)" fontSize="11">
                      Net Pay
                    </text>
                  </g>
                </svg>
              </div>
            </div>
            {/* Right section unchanged */}
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Key Metrics</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total Employees</span>
                  <span className="text-white font-bold text-xl">{payrollData.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Avg Salary</span>
                  <span className="text-white font-bold text-xl">
                    ${safeAverage(payrollData.map((emp) => emp.basic_salary)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total Payroll</span>
                  <span className="text-white font-bold text-xl">
                    ${safeSum(payrollData.map((emp) => emp.net_pay)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total OT Hours</span>
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
              <h4 className="text-white font-medium mb-3">Interactive Salary Distribution Pie Chart</h4>
              <div className="relative h-64 bg-slate-800/50 rounded-lg p-4 flex items-center justify-center">
                <svg width="220" height="220" viewBox="0 0 220 220">
                  {(() => {
                    const centerX = 110
                    const centerY = 110
                    const radius = 80
                    const total = salaryRanges.reduce((sum, range) => sum + range.count, 0)
                    let currentAngle = -90
                    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

                    return salaryRanges.map((range, index) => {
                      if (range.count === 0) return null

                      const percentage = (range.count / total) * 100
                      const angle = (range.count / total) * 360
                      const startAngle = currentAngle
                      const endAngle = currentAngle + angle
                      currentAngle += angle

                      const startAngleRad = (startAngle * Math.PI) / 180
                      const endAngleRad = (endAngle * Math.PI) / 180

                      const x1 = centerX + radius * Math.cos(startAngleRad)
                      const y1 = centerY + radius * Math.sin(startAngleRad)
                      const x2 = centerX + radius * Math.cos(endAngleRad)
                      const y2 = centerY + radius * Math.sin(endAngleRad)

                      const largeArcFlag = angle > 180 ? 1 : 0

                      const pathData = [
                        `M ${centerX} ${centerY}`,
                        `L ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        "Z",
                      ].join(" ")

                      const isHovered = hoveredItem === index
                      const hoverRadius = isHovered ? radius + 10 : radius

                      // Calculate label position
                      const labelAngle = (startAngle + endAngle) / 2
                      const labelAngleRad = (labelAngle * Math.PI) / 180
                      const labelX = centerX + (hoverRadius + 20) * Math.cos(labelAngleRad)
                      const labelY = centerY + (hoverRadius + 20) * Math.sin(labelAngleRad)

                      return (
                        <g key={index}>
                          <path
                            d={pathData}
                            fill={colors[index]}
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="2"
                            className="transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoveredItem(index)}
                            onMouseLeave={() => setHoveredItem(null)}
                            style={{
                              filter: isHovered ? "brightness(1.2)" : "brightness(1)",
                              transform: isHovered ? "scale(1.05)" : "scale(1)",
                              transformOrigin: `${centerX}px ${centerY}px`,
                            }}
                          />
                          {isHovered && (
                            <g>
                              <circle
                                cx={labelX}
                                cy={labelY}
                                r="25"
                                fill="rgba(0,0,0,0.8)"
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth="1"
                              />
                              <text
                                x={labelX}
                                y={labelY - 5}
                                fill="white"
                                fontSize="10"
                                textAnchor="middle"
                                className="font-medium"
                              >
                                {range.range}
                              </text>
                              <text x={labelX} y={labelY + 8} fill="white" fontSize="9" textAnchor="middle">
                                {percentage.toFixed(1)}%
                              </text>
                            </g>
                          )}
                        </g>
                      )
                    })
                  })()}

                  {/* Center Circle */}
                  <circle
                    cx="110"
                    cy="110"
                    r="30"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                  />
                  <text x="110" y="110" fill="white" fontSize="12" textAnchor="middle" className="font-bold">
                    {payrollData.length}
                  </text>
                  <text x="110" y="125" fill="rgba(255,255,255,0.7)" fontSize="10" textAnchor="middle">
                    Employees
                  </text>
                </svg>
              </div>
            </div>
            {/* Right section unchanged */}
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
              <h4 className="text-white font-medium mb-3">Interactive Overtime Trend Chart</h4>
              <div className="relative h-64 bg-slate-800/50 rounded-lg p-4">
                <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
                  {/* Chart Grid */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <g key={i}>
                      <line
                        x1="40"
                        y1={40 + i * 32}
                        x2="360"
                        y2={40 + i * 32}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                      <text x="35" y={45 + i * 32} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="end">
                        {Math.max(...overtimeData.map((e) => e.hours)) -
                          i * (Math.max(...overtimeData.map((e) => e.hours)) / 4)}
                        h
                      </text>
                    </g>
                  ))}

                  {/* Interactive Line Chart */}
                  {(() => {
                    const maxHours = Math.max(...overtimeData.map((e) => e.hours))
                    const points = overtimeData.map((emp, index) => {
                      const x = 50 + (index * 280) / (overtimeData.length - 1)
                      const y = 168 - (emp.hours / maxHours) * 120
                      return { x, y, emp, index }
                    })

                    const pathData = points
                      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
                      .join(" ")

                    return (
                      <g>
                        {/* Line Path */}
                        <path d={pathData} fill="none" stroke="#F97316" strokeWidth="3" className="drop-shadow-lg" />

                        {/* Interactive Points */}
                        {points.map((point, index) => (
                          <g key={index}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r={hoveredItem === index ? "8" : "5"}
                              fill="#F97316"
                              stroke="white"
                              strokeWidth="2"
                              className="transition-all duration-300 cursor-pointer drop-shadow-lg"
                              onMouseEnter={() => setHoveredItem(index)}
                              onMouseLeave={() => setHoveredItem(null)}
                            />

                            {/* Employee Name */}
                            <text
                              x={point.x}
                              y={185}
                              fill="rgba(255,255,255,0.8)"
                              fontSize="10"
                              textAnchor="middle"
                              className="font-medium"
                            >
                              {point.emp.name}
                            </text>

                            {/* Hover Tooltip */}
                            {hoveredItem === index && (
                              <g>
                                <rect
                                  x={point.x - 25}
                                  y={point.y - 35}
                                  width="50"
                                  height="25"
                                  fill="rgba(0,0,0,0.8)"
                                  rx="4"
                                />
                                <text
                                  x={point.x}
                                  y={point.y - 20}
                                  fill="white"
                                  fontSize="10"
                                  textAnchor="middle"
                                  className="font-medium"
                                >
                                  {point.emp.hours}h
                                </text>
                                <text x={point.x} y={point.y - 8} fill="white" fontSize="9" textAnchor="middle">
                                  ${point.emp.amount.toLocaleString()}
                                </text>
                              </g>
                            )}
                          </g>
                        ))}
                      </g>
                    )
                  })()}
                </svg>
              </div>
            </div>
            {/* Right section unchanged */}
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
              <h4 className="text-white font-medium mb-3">Interactive Performance Radar Chart</h4>
              <div className="relative h-64 bg-slate-800/50 rounded-lg p-4 flex items-center justify-center">
                <svg width="220" height="220" viewBox="0 0 220 220">
                  {(() => {
                    const centerX = 110
                    const centerY = 110
                    const maxRadius = 80
                    const metrics = ["Efficiency", "Bonuses", "Trips", "Overtime", "Salary"]
                    const angles = metrics.map((_, i) => (i * 360) / metrics.length - 90)

                    // Sample employee data for radar chart
                    const selectedEmp = performanceData[hoveredItem || 0] || performanceData[0]
                    const values = [
                      selectedEmp?.efficiency || 0,
                      (selectedEmp?.bonuses || 0) / 1000, // Scale down bonuses
                      (selectedEmp?.trips || 0) * 20, // Scale up trips
                      overtimeData.find((emp) => emp.name === selectedEmp?.name)?.hours || 0,
                      80, // Fixed salary metric for demo
                    ]
                    const maxValues = [100, 10, 100, 50, 100]

                    return (
                      <g>
                        {/* Grid circles */}
                        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
                          <circle
                            key={i}
                            cx={centerX}
                            cy={centerY}
                            r={maxRadius * scale}
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                          />
                        ))}

                        {/* Grid lines */}
                        {angles.map((angle, i) => {
                          const radian = (angle * Math.PI) / 180
                          const x = centerX + maxRadius * Math.cos(radian)
                          const y = centerY + maxRadius * Math.sin(radian)
                          return (
                            <line
                              key={i}
                              x1={centerX}
                              y1={centerY}
                              x2={x}
                              y2={y}
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="1"
                            />
                          )
                        })}

                        {/* Data polygon */}
                        <polygon
                          points={angles
                            .map((angle, i) => {
                              const radian = (angle * Math.PI) / 180
                              const normalizedValue = Math.min(values[i] / maxValues[i], 1)
                              const radius = maxRadius * normalizedValue
                              const x = centerX + radius * Math.cos(radian)
                              const y = centerY + radius * Math.sin(radian)
                              return `${x},${y}`
                            })
                            .join(" ")}
                          fill="rgba(59, 130, 246, 0.3)"
                          stroke="#3B82F6"
                          strokeWidth="2"
                          className="transition-all duration-300"
                        />

                        {/* Data points */}
                        {angles.map((angle, i) => {
                          const radian = (angle * Math.PI) / 180
                          const normalizedValue = Math.min(values[i] / maxValues[i], 1)
                          const radius = maxRadius * normalizedValue
                          const x = centerX + radius * Math.cos(radian)
                          const y = centerY + radius * Math.sin(radian)

                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#3B82F6"
                              stroke="white"
                              strokeWidth="2"
                              className="cursor-pointer transition-all duration-300"
                            />
                          )
                        })}

                        {/* Labels */}
                        {angles.map((angle, i) => {
                          const radian = (angle * Math.PI) / 180
                          const labelRadius = maxRadius + 20
                          const x = centerX + labelRadius * Math.cos(radian)
                          const y = centerY + labelRadius * Math.sin(radian)

                          return (
                            <text
                              key={i}
                              x={x}
                              y={y}
                              fill="rgba(255,255,255,0.8)"
                              fontSize="10"
                              textAnchor="middle"
                              className="font-medium"
                            >
                              {metrics[i]}
                            </text>
                          )
                        })}

                        {/* Employee selector */}
                        <text
                          x={centerX}
                          y={centerY - 5}
                          fill="white"
                          fontSize="12"
                          textAnchor="middle"
                          className="font-bold"
                        >
                          {selectedEmp?.name || "Select"}
                        </text>
                        <text
                          x={centerX}
                          y={centerY + 10}
                          fill="rgba(255,255,255,0.7)"
                          fontSize="9"
                          textAnchor="middle"
                        >
                          Click employees →
                        </text>
                      </g>
                    )
                  })()}
                </svg>

                {/* Employee selector buttons */}
                <div className="absolute bottom-2 left-2 right-2 flex gap-1 justify-center flex-wrap">
                  {performanceData.slice(0, 4).map((emp, index) => (
                    <button
                      key={index}
                      onClick={() => setHoveredItem(index)}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        (hoveredItem || 0) === index
                          ? "bg-blue-500 text-white"
                          : "bg-white/20 text-white/80 hover:bg-white/30"
                      }`}
                    >
                      {emp.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Right section unchanged */}
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
            {(() => {
              const IconComponent = slides[currentSlide].icon
              return IconComponent ? <IconComponent className="w-6 h-6 text-white" /> : null
            })()}
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
