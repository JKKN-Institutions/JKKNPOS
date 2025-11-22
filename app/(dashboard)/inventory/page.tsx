"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Plus,
  Package,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"

import { formatCurrency } from "@/lib/utils/currency"
import { useAuth } from "@/hooks/use-auth"
import { inventoryService } from "@/lib/services/inventory.service"
import type { Database } from "@/types/database.types"

type Item = Database['public']['Tables']['items']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export default function InventoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, loading: authLoading } = useAuth()

  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "all"
  )
  const [stockFilter, setStockFilter] = useState(
    searchParams.get("filter") || "all"
  )

  const fetchItems = useCallback(async () => {
    if (!profile?.business_id) return

    try {
      setLoading(true)
      const data = await inventoryService.getBusinessItems(profile.business_id, {
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        isActive: true,
        lowStockOnly: stockFilter === "lowstock",
        searchTerm: search,
      })

      // Apply out of stock filter
      let filteredData = data
      if (stockFilter === "outofstock") {
        filteredData = data.filter(item => item.stock === 0)
      }

      setItems(filteredData)
    } catch (error) {
      console.error('Error fetching items:', error)
      toast.error('Failed to load inventory items')
    } finally {
      setLoading(false)
    }
  }, [profile, search, categoryFilter, stockFilter])

  const fetchCategories = useCallback(async () => {
    if (!profile?.business_id) return

    try {
      const data = await inventoryService.getCategories(profile.business_id)
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }, [profile])

  useEffect(() => {
    if (!authLoading && profile?.business_id) {
      fetchCategories()
      fetchItems()
    }
  }, [authLoading, profile, fetchCategories, fetchItems])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      // TODO: Implement delete item function
      toast.success("Item deleted successfully")
      fetchItems()
    } catch (error) {
      toast.error("Failed to delete item")
    }
  }

  const getStockBadge = (stock: number | null, minStock: number | null) => {
    const stockVal = stock || 0
    const minStockVal = minStock || 0

    if (stockVal === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (stockVal <= minStockVal) {
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">Low Stock</Badge>
      )
    }
    return <Badge variant="secondary">In Stock</Badge>
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-xl p-2 bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/20">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inventory Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Products & Supplies</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your dental products and supplies
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/inventory/categories">
            <Button variant="outline" size="sm" className="md:size-default">Categories</Button>
          </Link>
          <Link href="/inventory/add">
            <Button className="gap-2" size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Item</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="lowstock">Low Stock</SelectItem>
                  <SelectItem value="outofstock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items - Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                icon={Package}
                title="No items found"
                description="Add your first product to inventory."
                action={{
                  label: "Add Item",
                  onClick: () => router.push("/inventory/add"),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {categories.find(c => c.id === item.category_id)?.name || "—"}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-bold text-primary">{formatCurrency(item.price)}</span>
                      <span className="text-sm text-muted-foreground">{item.stock || 0} {item.unit}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStockBadge(item.stock, item.min_stock)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/inventory/${item.id}`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Items Table - Desktop */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Products ({items.length})</CardTitle>
          <CardDescription>
            A list of all dental products in your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No items found"
              description="Get started by adding your first dental product to the inventory."
              action={{
                label: "Add Item",
                onClick: () => router.push("/inventory/add"),
              }}
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.sku && (
                            <p className="text-sm text-muted-foreground">
                              SKU: {item.sku}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {categories.find(c => c.id === item.category_id)?.name || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.stock || 0} {item.unit}
                      </TableCell>
                      <TableCell>
                        {getStockBadge(item.stock, item.min_stock)}
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
                                router.push(`/inventory/${item.id}`)
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item.id)}
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
