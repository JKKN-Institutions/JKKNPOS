"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Store,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Users,
  Package,
  IndianRupee,
  ShoppingCart,
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
import { getClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database.types"

type Business = Database['public']['Tables']['businesses']['Row']

export default function StoresPage() {
  const router = useRouter()
  const [stores, setStores] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = getClient()

      let query = supabase
        .from('businesses')
        .select('*')
        .order('name')

      if (search) {
        query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setStores(data || [])
    } catch (error) {
      console.error('Error fetching stores:', error)
      toast.error('Failed to load stores')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this store?")) return

    try {
      const supabase = getClient()
      const { error } = await supabase
        .from('businesses')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      toast.success("Store deactivated")
      fetchStores()
    } catch (error) {
      toast.error("Failed to deactivate store")
    }
  }

  const totalStores = stores.filter(s => s.is_active).length

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-xl p-2 bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/20">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Multi-Store Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Stores</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your store locations
          </p>
        </div>
        <Link href="/stores/add" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 shadow-lg shadow-indigo-500/25">
            <Plus className="h-4 w-4" />
            Add Store
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              Active Stores
            </CardTitle>
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-indigo-500 to-blue-500">
              <Store className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">{totalStores}</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">Total Stores</span>
              <span className="sm:hidden">Total</span>
            </CardTitle>
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500">
              <Store className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">GST Enabled</span>
              <span className="sm:hidden">GST</span>
            </CardTitle>
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-orange-500 to-amber-500">
              <IndianRupee className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">
              {stores.filter(s => s.gstin).length}
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
              placeholder="Search stores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stores - Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                icon={Store}
                title="No stores found"
                description="Add your first store location."
                action={{
                  label: "Add Store",
                  onClick: () => router.push("/stores/add"),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          stores.map((store) => (
            <Card key={store.id} className={!store.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{store.name}</p>
                    </div>
                    {store.gstin && (
                      <p className="text-xs text-muted-foreground mt-1">GST: {store.gstin}</p>
                    )}
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{store.address || "—"}</span>
                      </div>
                      {store.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {store.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant={store.is_active ? "default" : "secondary"} className="text-xs">
                        {store.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {store.gst_type && (
                        <Badge variant="outline" className="text-xs">
                          {store.gst_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/stores/${store.id}`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(store.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stores Table - Desktop */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Stores ({stores.length})</CardTitle>
          <CardDescription>
            Manage all your store locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : stores.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No stores found"
              description="Add your first store to manage multiple locations."
              action={{
                label: "Add Store",
                onClick: () => router.push("/stores/add"),
              }}
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id} className={!store.is_active ? "opacity-60" : ""}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {store.address || "—"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {store.phone && (
                            <span className="text-sm">{store.phone}</span>
                          )}
                          {store.email && (
                            <span className="text-xs text-muted-foreground">{store.email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{store.gstin || "—"}</span>
                          {store.gst_type && (
                            <Badge variant="outline" className="w-fit text-xs">
                              {store.gst_type}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {store.tax_rate}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={store.is_active ? "default" : "secondary"}>
                          {store.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/stores/${store.id}`)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(store.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deactivate
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
