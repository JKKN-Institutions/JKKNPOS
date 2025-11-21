"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Store, Save, Trash2, MapPin, Phone, Mail, Clock, Users, Package, IndianRupee, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

import { formatCurrency } from "@/lib/utils/currency"
import { getFromStorage, saveToStorage, mockStores } from "@/lib/mock-data"

type MockStore = typeof mockStores[0]

export default function EditStorePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [store, setStore] = useState<MockStore | null>(null)
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "retail",
    address: "",
    manager: "",
    phone: "",
    email: "",
    tax_rate: "18",
    hours: "",
    is_active: true,
  })

  useEffect(() => {
    const allStores = getFromStorage('mock_stores', mockStores)
    const found = allStores.find((s: MockStore) => s.id === params.id)
    if (found) {
      setStore(found)
      setForm({
        name: found.name,
        code: found.code,
        type: found.type,
        address: found.address,
        manager: found.manager,
        phone: found.phone,
        email: found.email,
        tax_rate: String(found.tax_rate),
        hours: found.hours,
        is_active: found.is_active,
      })
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.code) {
      toast.error("Store name and code are required")
      return
    }

    setLoading(true)

    const allStores = getFromStorage('mock_stores', mockStores)
    const updated = allStores.map((s: MockStore) =>
      s.id === params.id
        ? {
            ...s,
            ...form,
            tax_rate: parseFloat(form.tax_rate) || 18,
          }
        : s
    )
    saveToStorage('mock_stores', updated)

    toast.success("Store updated successfully")
    router.push("/stores")
  }

  const handleDelete = () => {
    if (!confirm("Are you sure you want to deactivate this store?")) return

    const allStores = getFromStorage('mock_stores', mockStores)
    const updated = allStores.map((s: MockStore) =>
      s.id === params.id ? { ...s, is_active: false } : s
    )
    saveToStorage('mock_stores', updated)
    toast.success("Store deactivated")
    router.push("/stores")
  }

  if (!store) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/stores">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="rounded-xl p-2 bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/20">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Edit Store</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{store.name}</h1>
          </div>
        </div>
        <Badge variant={store.is_active ? "default" : "secondary"}>
          {store.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <IndianRupee className="h-4 w-4" />
              <span className="text-xs">Today's Sales</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(store.today_sales)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs">Orders</span>
            </div>
            <p className="text-xl font-bold">{store.today_orders}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Staff</span>
            </div>
            <p className="text-xl font-bold">{store.staff_count}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              <span className="text-xs">Items</span>
            </div>
            <p className="text-xl font-bold">{store.inventory_items}</p>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Update store details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Store Code *</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Store Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail Store</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="kiosk">Kiosk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager Name</Label>
                <Input
                  id="manager"
                  value={form.manager}
                  onChange={(e) => setForm({ ...form, manager: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  value={form.tax_rate}
                  onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Operating Hours</Label>
                <Input
                  id="hours"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Store Status</Label>
                <p className="text-sm text-muted-foreground">Enable or disable this store</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/stores")}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
              >
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} className="ml-auto gap-2">
                <Trash2 className="h-4 w-4" />
                Deactivate
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
