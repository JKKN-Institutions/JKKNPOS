"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Users,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Award,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"

import { formatCurrency } from "@/lib/utils/currency"
import { initializeMockData, getFromStorage, saveToStorage, mockCustomers } from "@/lib/mock-data"

type MockCustomer = typeof mockCustomers[0]

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<MockCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchCustomers = useCallback(() => {
    initializeMockData()
    let allCustomers = getFromStorage('mock_customers', mockCustomers)

    if (search) {
      const searchLower = search.toLowerCase()
      allCustomers = allCustomers.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(searchLower)
      )
    }

    setCustomers(allCustomers)
    setLoading(false)
  }, [search])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    const allCustomers = getFromStorage('mock_customers', mockCustomers)
    const updated = allCustomers.filter(c => c.id !== id)
    saveToStorage('mock_customers', updated)
    toast.success("Customer deleted")
    fetchCustomers()
  }

  const totalCustomers = customers.length
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyalty_points, 0)
  const totalPurchases = customers.reduce((sum, c) => sum + c.total_purchases, 0)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-xl p-2 bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your customer database
          </p>
        </div>
        <Link href="/customers/add" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Customers
            </CardTitle>
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-orange-500 to-amber-500">
              <Users className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">Loyalty Points</span>
              <span className="sm:hidden">Points</span>
            </CardTitle>
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-yellow-500 to-orange-500">
              <Award className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">{totalLoyaltyPoints.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">Total Purchases</span>
              <span className="sm:hidden">Sales</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold text-primary">
              {formatCurrency(totalPurchases)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers - Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                icon={Users}
                title="No customers found"
                description="Add your first customer."
                action={{
                  label: "Add Customer",
                  onClick: () => router.push("/customers/add"),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{customer.name}</p>
                    <div className="flex flex-col gap-1 mt-1">
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {customer.loyalty_points} pts
                      </Badge>
                      <span className="text-sm font-medium text-primary">
                        {formatCurrency(customer.total_purchases)}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/customers/${customer.id}`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(customer.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Customers Table - Desktop */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Customers ({customers.length})</CardTitle>
          <CardDescription>
            A list of all customers in your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers found"
              description="Start building your customer database by adding your first customer."
              action={{
                label: "Add Customer",
                onClick: () => router.push("/customers/add"),
              }}
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Loyalty Points</TableHead>
                    <TableHead className="text-right">Total Purchases</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {customer.loyalty_points} pts
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(customer.total_purchases)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/customers/${customer.id}`)
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(customer.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
