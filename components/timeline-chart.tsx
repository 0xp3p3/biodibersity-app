"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

interface TimelineData {
  yearly: Array<{ year: number; count: number }>
  monthly: Array<{ month: string; count: number }>
  total_observations: number
  date_range: {
    earliest: number | null
    latest: number | null
  }
}

interface TimelineChartProps {
  data: TimelineData
}

export function TimelineChart({ data }: TimelineChartProps) {
  const chartData = useMemo(() => {
    // Use yearly data for the main chart
    return data.yearly.map((item) => ({
      year: item.year.toString(),
      observations: item.count,
    }))
  }, [data.yearly])

  const monthlyData = useMemo(() => {
    // Process monthly data for secondary chart
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return monthOrder
      .map((month) => {
        const found = data.monthly.find((item) => item.month === month)
        return {
          month,
          observations: found ? found.count : 0,
        }
      })
      .filter((item) => item.observations > 0)
  }, [data.monthly])

  if (!data || data.yearly.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No timeline data available</div>
  }

  return (
    <div className="w-full h-full space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-2xl font-bold text-blue-600">{data.total_observations}</div>
          <div className="text-sm text-gray-600">Total Observations</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-2xl font-bold text-green-600">{data.date_range.earliest}</div>
          <div className="text-sm text-gray-600">First Record</div>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <div className="text-2xl font-bold text-purple-600">{data.date_range.latest}</div>
          <div className="text-sm text-gray-600">Latest Record</div>
        </div>
      </div>

      {/* Yearly Timeline Chart */}
      <div className="h-48">
        <h4 className="text-sm font-medium mb-2">Observations by Year</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" fontSize={12} angle={-45} textAnchor="end" height={60} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value) => [value, "Observations"]} labelFormatter={(label) => `Year: ${label}`} />
            <Bar dataKey="observations" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Distribution */}
      {monthlyData.length > 0 && (
        <div className="h-32">
          <h4 className="text-sm font-medium mb-2">Seasonal Distribution</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => [value, "Observations"]} labelFormatter={(label) => `Month: ${label}`} />
              <Line
                type="monotone"
                dataKey="observations"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
