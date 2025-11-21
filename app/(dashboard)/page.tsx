"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  IndianRupee,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils/currency"
import { initializeMockData, getFromStorage, mockItems, mockCustomers, mockSales } from "@/lib/mock-data"

interface DashboardStats {
  todaySales: number
  todayRevenue: number
  totalItems: number
  lowStockItems: number
  totalCustomers: number
  recentSales: {
    id: string
    sale_number: string
    total: number
    created_at: string
  }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayRevenue: 0,
    totalItems: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    recentSales: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeMockData()

    const items = getFromStorage('mock_items', mockItems)
    const customers = getFromStorage('mock_customers', mockCustomers)
    const sales = getFromStorage('mock_sales', mockSales)

    const todaySales = sales.filter(s => s.status === 'COMPLETED').length
    const todayRevenue = sales.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + s.total, 0)
    const totalItems = items.filter(i => i.is_active).length
    const lowStockItems = items.filter(i => i.is_active && i.stock <= i.min_stock).length
    const totalCustomers = customers.length
    const recentSales = sales.slice(0, 5).map(s => ({
      id: s.id,
      sale_number: s.sale_number,
      total: s.total,
      created_at: s.created_at,
    }))

    setStats({
      todaySales,
      todayRevenue,
      totalItems,
      lowStockItems,
      totalCustomers,
      recentSales,
    })
    setLoading(false)
  }, [])

  const statCards = [
    {
      title: "Today's Sales",
      value: stats.todaySales.toString(),
      description: "Transactions completed",
      icon: ShoppingCart,
      gradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/20",
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.todayRevenue),
      description: "Total revenue today",
      icon: IndianRupee,
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      title: "Inventory",
      value: stats.totalItems.toString(),
      description: "Products in stock",
      icon: Package,
      gradient: "from-violet-500 to-purple-500",
      shadowColor: "shadow-violet-500/20",
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toString(),
      description: "Registered customers",
      icon: Users,
      gradient: "from-orange-500 to-amber-500",
      shadowColor: "shadow-orange-500/20",
    },
  ]

  const quickActions = [
    {
      title: "New Sale",
      description: "Start POS",
      icon: Sparkles,
      href: "/sales",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Add Item",
      description: "Inventory",
      icon: Package,
      href: "/inventory/add",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "Customer",
      description: "New customer",
      icon: Users,
      href: "/customers/add",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      title: "Reports",
      description: "Analytics",
      icon: TrendingUp,
      href: "/reports",
      gradient: "from-indigo-500 to-blue-500",
    },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"} 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Here's what's happening at JKKN Dental Store today.
          </p>
        </div>
        <Link href="/sales">
          <Button
            size="lg"
            className="gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] w-full sm:w-auto"
          >
            <Zap className="h-5 w-5" />
            Start New Sale
          </Button>
        </Link>
      </div>

      {/* Stats Grid - Ultra Modern Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 group"
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 md:p-6 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-xl p-2 md:p-2.5 bg-gradient-to-br ${card.gradient} shadow-lg ${card.shadowColor}`}>
                <card.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-3xl font-bold tracking-tight">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions - Horizontal Scroll on Mobile */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Quick Actions</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="flex-shrink-0 w-[140px] md:w-auto">
              <Card className="h-full border-0 bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  <div className={`rounded-xl p-3 bg-gradient-to-br ${action.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {/* Low Stock Alert */}
        {stats.lowStockItems > 0 && (
          <Card className="border-orange-200/50 bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-orange-950/30 dark:to-amber-950/20 dark:border-orange-900/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-3 shadow-lg shadow-orange-500/20">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Low Stock Alert</CardTitle>
                <CardDescription>
                  {stats.lowStockItems} items need restocking
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/inventory?filter=lowstock">
                <Button variant="outline" className="w-full rounded-xl h-11 border-orange-200 hover:bg-orange-100 dark:border-orange-800 dark:hover:bg-orange-900/30">
                  View Low Stock Items
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Recent Sales */}
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 shadow-lg shadow-blue-500/20">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg">Recent Sales</CardTitle>
              </div>
              <Link href="/sales/history">
                <Button variant="ghost" size="sm" className="rounded-lg">
                  View All
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentSales.length > 0 ? (
              <div className="space-y-3">
                {stats.recentSales.map((sale, index) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm font-bold text-primary">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{sale.sale_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <Badge className="font-mono bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400">
                      {formatCurrency(sale.total)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No sales yet today</p>
                <p className="text-sm">Start your first sale!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
