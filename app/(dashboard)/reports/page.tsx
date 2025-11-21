"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  ArrowUpRight,
  Calendar,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils/currency"
import { getDateRangePreset, DATE_RANGE_PRESETS } from "@/lib/utils/date"

interface ReportStats {
  totalSales: number
  totalRevenue: number
  totalCustomers: number
  totalItems: number
  averageSale: number
  salesByDay: { date: string; total: number; count: number }[]
}

export default function ReportsPage() {
  const supabase = getClient()
  const [dateRange, setDateRange] = useState("thisMonth")
  const [stats, setStats] = useState<ReportStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalItems: 0,
    averageSale: 0,
    salesByDay: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const range = getDateRangePreset(dateRange)

        // Fetch sales in date range
        const { data: salesData } = await supabase
          .from("sales")
          .select("total, created_at")
          .eq("status", "COMPLETED")
          .gte("created_at", range.start.toISOString())
          .lte("created_at", range.end.toISOString())

        type SaleRow = { total: number; created_at: string }
        const typedSalesData = (salesData || []) as SaleRow[]
        const totalSales = typedSalesData.length
        const totalRevenue = typedSalesData.reduce((sum, s) => sum + s.total, 0)
        const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0

        // Group sales by day
        const salesByDay: Record<string, { total: number; count: number }> = {}
        typedSalesData.forEach((sale) => {
          const date = new Date(sale.created_at).toISOString().split("T")[0]
          if (!salesByDay[date]) {
            salesByDay[date] = { total: 0, count: 0 }
          }
          salesByDay[date].total += sale.total
          salesByDay[date].count += 1
        })

        const salesByDayArray = Object.entries(salesByDay).map(([date, data]) => ({
          date,
          ...data,
        })).sort((a, b) => a.date.localeCompare(b.date))

        // Fetch totals
        const { count: totalCustomers } = await supabase
          .from("customers")
          .select("*", { count: "exact", head: true })

        const { count: totalItems } = await supabase
          .from("items")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)

        setStats({
          totalSales,
          totalRevenue,
          totalCustomers: totalCustomers || 0,
          totalItems: totalItems || 0,
          averageSale,
          salesByDay: salesByDayArray,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase, dateRange])

  const statCards = [
    {
      title: "Total Sales",
      value: stats.totalSales.toString(),
      description: "Number of transactions",
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.totalRevenue),
      description: "Total revenue",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Average Sale",
      value: formatCurrency(stats.averageSale),
      description: "Per transaction",
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toString(),
      description: "Total customers",
      icon: Users,
      color: "text-orange-500",
    },
  ]

  const reportLinks = [
    {
      title: "Sales Report",
      description: "Detailed sales analysis with charts",
      href: "/dashboard/reports/sales",
      icon: TrendingUp,
    },
    {
      title: "Inventory Report",
      description: "Stock levels and movement analysis",
      href: "/dashboard/reports/inventory",
      icon: Package,
    },
    {
      title: "Profit & Loss",
      description: "Financial performance overview",
      href: "/dashboard/reports/profit-loss",
      icon: BarChart3,
    },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Analyze your business performance
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-3 w-3 md:h-4 md:w-4 ${card.color}`} />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-lg md:text-2xl font-bold">
                {loading ? "..." : card.value}
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Daily sales for selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : stats.salesByDay.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No sales data for this period
            </div>
          ) : (
            <div className="h-[300px] flex items-end gap-2">
              {stats.salesByDay.map((day) => {
                const maxTotal = Math.max(...stats.salesByDay.map((d) => d.total))
                const height = maxTotal > 0 ? (day.total / maxTotal) * 250 : 0
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                      style={{ height: `${Math.max(height, 4)}px` }}
                      title={`${day.date}: ${formatCurrency(day.total)} (${day.count} sales)`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Links */}
      <div className="grid gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-3">
        {reportLinks.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <report.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="mt-3 md:mt-4 text-base md:text-lg">{report.title}</CardTitle>
                <CardDescription className="text-xs md:text-sm">{report.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
