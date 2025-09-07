"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  LucidePieChart as RechartsPieChart,
  Activity,
  Target,
  AlertTriangle,
  Award,
  Zap,
  Brain,
} from "lucide-react"
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
  AreaChart,
  Area,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts"

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

interface LeaveDataVisualizationsProps {
  leaveRecords: LeaveRecord[]
  selectedEmployee: string | null
}

export default function LeaveDataVisualizations({ leaveRecords, selectedEmployee }: LeaveDataVisualizationsProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Filter data based on selected employee
  const filteredData =
    selectedEmployee === "all" || selectedEmployee === null
      ? leaveRecords
      : leaveRecords.filter((record) => record.employeeId === selectedEmployee)

  const leaveTypeData = filteredData.reduce(
    (acc, record) => {
      acc.regular += record.regular || 0
      acc.emergency += record.emergency || 0
      acc.sick += record.sick || 0
      acc.unpaid += record.unpaid || 0
      acc.other += record.other || 0
      return acc
    },
    { regular: 0, emergency: 0, sick: 0, unpaid: 0, other: 0 },
  )

  const leaveTypeChartData = Object.entries(leaveTypeData)
    .filter(([_, days]) => days > 0)
    .map(([type, days]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: days,
      days: days,
    }))

  const statusData = filteredData.reduce(
    (acc, record) => {
      const status = record.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    name: status,
    value: count,
    count: count,
  }))

  const monthlyData = filteredData.reduce(
    (acc, record) => {
      const month = new Date(record.date).toLocaleString("default", { month: "short" })
      const totalDays =
        (record.regular || 0) +
        (record.emergency || 0) +
        (record.sick || 0) +
        (record.unpaid || 0) +
        (record.other || 0)
      acc[month] = (acc[month] || 0) + totalDays
      return acc
    },
    {} as Record<string, number>,
  )

  const monthlyChartData = Object.entries(monthlyData).map(([month, days]) => ({
    month,
    days,
  }))

  const employeeData =
    selectedEmployee === "all" || selectedEmployee === null
      ? leaveRecords.reduce(
          (acc, record) => {
            const name = record.employeeName
            const totalDays =
              (record.regular || 0) +
              (record.emergency || 0) +
              (record.sick || 0) +
              (record.unpaid || 0) +
              (record.other || 0)
            acc[name] = (acc[name] || 0) + totalDays
            return acc
          },
          {} as Record<string, number>,
        )
      : {}

  const employeeChartData = Object.entries(employeeData)
    .map(([name, days]) => ({
      name: name.split(" ")[0], // First name only for better display
      days,
    }))
    .slice(0, 8) // Top 8 employees

  const colors = [
    "#6366f1", // Indigo
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#f97316", // Orange
    "#ec4899", // Pink
    "#14b8a6", // Teal
  ]

  const totalDays = filteredData.reduce((sum, record) => {
    return (
      sum +
      (record.regular || 0) +
      (record.emergency || 0) +
      (record.sick || 0) +
      (record.unpaid || 0) +
      (record.other || 0)
    )
  }, 0)

  const uniqueEmployees = new Set(filteredData.map((r) => r.employeeId)).size
  const avgDaysPerEmployee =
    selectedEmployee === "all" || selectedEmployee === null
      ? uniqueEmployees > 0
        ? totalDays / uniqueEmployees
        : 0
      : totalDays || 0

  const pendingRequests = filteredData.filter((r) => r.status === "Pending").length
  const approvedRequests = filteredData.filter((r) => r.status === "Loaded" || r.status === "Success").length

  const advancedAnalytics = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    // Seasonal analysis
    const seasonalData = filteredData.reduce(
      (acc, record) => {
        const month = new Date(record.date).getMonth()
        const season = month < 3 ? "Winter" : month < 6 ? "Spring" : month < 9 ? "Summer" : "Fall"
        const totalDays =
          (record.regular || 0) +
          (record.emergency || 0) +
          (record.sick || 0) +
          (record.unpaid || 0) +
          (record.other || 0)
        acc[season] = (acc[season] || 0) + totalDays
        return acc
      },
      {} as Record<string, number>,
    )

    // Trend analysis (last 6 months)
    const trendData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthKey = date.toLocaleString("default", { month: "short", year: "2-digit" })
      const monthData = filteredData.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate.getMonth() === date.getMonth() && recordDate.getFullYear() === date.getFullYear()
      })
      const totalDays = monthData.reduce(
        (sum, record) =>
          sum +
          ((record.regular || 0) +
            (record.emergency || 0) +
            (record.sick || 0) +
            (record.unpaid || 0) +
            (record.other || 0)),
        0,
      )
      return { month: monthKey, days: totalDays, requests: monthData.length }
    }).reverse()

    // Risk analysis
    const riskMetrics = {
      highFrequencyEmployees: Object.entries(employeeData).filter(([_, days]) => days > avgDaysPerEmployee * 1.5)
        .length,
      emergencyLeaveRatio: (leaveTypeData.emergency / totalDays) * 100,
      unpaidLeaveRatio: (leaveTypeData.unpaid / totalDays) * 100,
      pendingRatio: (pendingRequests / filteredData.length) * 100,
    }

    return { seasonalData, trendData, riskMetrics }
  }, [filteredData, employeeData, avgDaysPerEmployee, totalDays, leaveTypeData, pendingRequests])

  const slides = [
    {
      title: "Advanced Analytics Dashboard",
      icon: "Brain",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={advancedAnalytics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
                      backdropFilter: "blur(16px)",
                      color: "white",
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="days"
                    fill="url(#advancedAreaGradient)"
                    stroke="#6366f1"
                    strokeWidth={3}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="requests"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  />
                  <defs>
                    <linearGradient id="advancedAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-blue-600/5 p-3 rounded-xl border border-blue-200/30 backdrop-blur-sm">
                <div className="text-xl font-bold text-blue-700">{totalDays}</div>
                <div className="text-xs text-blue-600/80 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Total Days
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-600/5 p-3 rounded-xl border border-emerald-200/30 backdrop-blur-sm">
                <div className="text-xl font-bold text-emerald-700">
                  {isNaN(avgDaysPerEmployee) ? "0" : avgDaysPerEmployee.toFixed(1)}
                </div>
                <div className="text-xs text-emerald-600/80 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Avg/Employee
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-600/5 p-3 rounded-xl border border-amber-200/30 backdrop-blur-sm">
                <div className="text-xl font-bold text-amber-700">
                  {advancedAnalytics.riskMetrics.emergencyLeaveRatio.toFixed(1)}%
                </div>
                <div className="text-xs text-amber-600/80 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Emergency Rate
                </div>
              </div>
              <div className="bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-violet-600/5 p-3 rounded-xl border border-violet-200/30 backdrop-blur-sm">
                <div className="text-xl font-bold text-violet-700">
                  {advancedAnalytics.riskMetrics.highFrequencyEmployees}
                </div>
                <div className="text-xs text-violet-600/80 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  High Risk
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 rounded-xl text-white">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Insights
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>
                    Peak leave season:{" "}
                    {Object.entries(advancedAnalytics.seasonalData).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>
                    Trend:{" "}
                    {advancedAnalytics.trendData.length > 1 &&
                    advancedAnalytics.trendData[advancedAnalytics.trendData.length - 1].days >
                      advancedAnalytics.trendData[0].days
                      ? "Increasing"
                      : "Stable"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>
                    Risk level:{" "}
                    {advancedAnalytics.riskMetrics.emergencyLeaveRatio > 20
                      ? "High"
                      : advancedAnalytics.riskMetrics.emergencyLeaveRatio > 10
                        ? "Medium"
                        : "Low"}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50/80 via-indigo-50/60 to-indigo-100/40 p-4 rounded-xl border border-indigo-200/40">
              <h4 className="font-semibold text-sm mb-3 text-indigo-800 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Recommendations
              </h4>
              <div className="space-y-2 text-xs text-indigo-700">
                {advancedAnalytics.riskMetrics.emergencyLeaveRatio > 15 && <div>• Review emergency leave policies</div>}
                {advancedAnalytics.riskMetrics.pendingRatio > 20 && <div>• Streamline approval process</div>}
                {advancedAnalytics.riskMetrics.highFrequencyEmployees > 0 && (
                  <div>• Monitor high-frequency employees</div>
                )}
                <div>• Plan for seasonal variations</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Seasonal & Pattern Analysis",
      icon: "Activity",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={Object.entries(advancedAnalytics.seasonalData).map(([season, days]) => ({
                  season,
                  days,
                  fullMark: Math.max(...Object.values(advancedAnalytics.seasonalData)),
                }))}
              >
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="season" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar
                  name="Leave Days"
                  dataKey="days"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "white",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(advancedAnalytics.seasonalData).map(([season, days], index) => (
                <div
                  key={season}
                  className="bg-gradient-to-br from-violet-500/15 via-violet-500/10 to-violet-600/5 p-3 rounded-xl border border-violet-200/30 backdrop-blur-sm"
                >
                  <div className="text-lg font-bold text-violet-700">{days}</div>
                  <div className="text-xs text-violet-600/80">{season}</div>
                  <div className="w-full bg-violet-200/30 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-violet-600 h-1.5 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(...Object.values(advancedAnalytics.seasonalData)) > 0 ? (days / Math.max(...Object.values(advancedAnalytics.seasonalData))) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-slate-50/80 via-slate-50/60 to-slate-100/40 p-4 rounded-xl border border-slate-200/40">
              <h4 className="font-semibold text-sm mb-3 text-slate-800">Pattern Insights</h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div>
                  • Highest activity:{" "}
                  {Object.entries(advancedAnalytics.seasonalData).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
                </div>
                <div>
                  • Lowest activity:{" "}
                  {Object.entries(advancedAnalytics.seasonalData).sort(([, a], [, b]) => a - b)[0]?.[0] || "N/A"}
                </div>
                <div>
                  • Seasonal variance:{" "}
                  {Object.values(advancedAnalytics.seasonalData).length > 0
                    ? (
                        ((Math.max(...Object.values(advancedAnalytics.seasonalData)) -
                          Math.min(...Object.values(advancedAnalytics.seasonalData))) /
                          Math.max(...Object.values(advancedAnalytics.seasonalData))) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Leave Types Distribution",
      icon: "RechartsPieChart",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveTypeChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {leaveTypeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {leaveTypeChartData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2.5 bg-gradient-to-r from-slate-50/80 to-slate-100/50 rounded-lg border border-slate-200/50 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="font-medium text-slate-700 text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800 text-sm">{item.value} days</div>
                  <div className="text-xs text-slate-500">
                    {totalDays > 0 ? ((item.value / totalDays) * 100).toFixed(1) : "0"}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Monthly Trends",
      icon: "TrendingUp",
      content: (
        <div className="space-y-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                />
                <Area type="monotone" dataKey="days" stroke="#10b981" fill="url(#areaGradient)" strokeWidth={2.5} />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-emerald-50/80 via-emerald-50/60 to-emerald-100/40 rounded-xl border border-emerald-200/40 backdrop-blur-sm">
              <div className="text-lg font-bold text-emerald-700">
                {Object.values(monthlyData).length > 0 ? Math.max(...Object.values(monthlyData)) : 0}
              </div>
              <div className="text-xs text-emerald-600">Peak Month</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-cyan-50/80 via-cyan-50/60 to-cyan-100/40 rounded-xl border border-cyan-200/40 backdrop-blur-sm">
              <div className="text-lg font-bold text-cyan-700">
                {Object.keys(monthlyData).length > 0
                  ? (Object.values(monthlyData).reduce((a, b) => a + b, 0) / Object.keys(monthlyData).length).toFixed(1)
                  : "0.0"}
              </div>
              <div className="text-xs text-cyan-600">Monthly Avg</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-violet-50/80 via-violet-50/60 to-violet-100/40 rounded-xl border border-violet-200/40 backdrop-blur-sm">
              <div className="text-lg font-bold text-violet-700">{Object.keys(monthlyData).length}</div>
              <div className="text-xs text-violet-600">Active Months</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: selectedEmployee === "all" || selectedEmployee === null ? "Employee Comparison" : "Request Status",
      icon: "Users",
      content:
        selectedEmployee === "all" || selectedEmployee === null ? (
          <div className="space-y-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#64748b" width={70} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <Bar dataKey="days" fill="url(#horizontalBarGradient)" radius={[0, 6, 6, 0]} />
                  <defs>
                    <linearGradient id="horizontalBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-xs text-slate-600">Showing top 8 employees by total leave days taken</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {statusChartData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2.5 bg-gradient-to-r from-slate-50/80 to-slate-100/50 rounded-lg border border-slate-200/50 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <span className="font-medium text-slate-700 text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800 text-sm">{item.value} requests</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
    },
  ]

  const icons = {
    BarChart3,
    RechartsPieChart,
    TrendingUp,
    Users,
    Calendar,
    Clock,
    Activity,
    Target,
    Brain,
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = icons[iconName as keyof typeof icons]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <Card className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm border border-white/10">
              {renderIcon(slides[currentSlide].icon)}
            </div>
            <CardTitle className="text-lg font-bold">{slides[currentSlide].title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="text-white hover:bg-white/20 h-7 w-7 p-0 rounded-lg"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <div className="flex gap-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white shadow-sm" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              className="text-white hover:bg-white/20 h-7 w-7 p-0 rounded-lg"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="min-h-[240px]">{slides[currentSlide].content}</div>
      </CardContent>
    </Card>
  )
}
