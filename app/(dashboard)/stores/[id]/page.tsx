"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Store, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

import { getClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database.types"

type Business = Database['public']['Tables']['businesses']['Row']

export default function EditStorePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [store, setStore] = useState<Business | null>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
    gst_type: "REGULAR" as const,
    currency: "INR",
    tax_rate: "18",
    is_active: true,
  })

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setFetchLoading(true)
        const supabase = getClient()
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        if (data) {
          setStore(data)
          setForm({
            name: data.name,
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            gstin: data.gstin || "",
            gst_type: (data.gst_type || "REGULAR") as "REGULAR" | "COMPOSITION",
            currency: data.currency || "INR",
            tax_rate: String(data.tax_rate || 18),
            is_active: data.is_active,
          })
        }
      } catch (error) {
        console.error('Error fetching store:', error)
        toast.error('Failed to load store')
      } finally {
        setFetchLoading(false)
      }
    }

    if (params.id) {
      fetchStore()
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name) {
      toast.error("Store name is required")
      return
    }

    setLoading(true)

    try {
      const supabase = getClient()
      const { error } = await supabase
        .from('businesses')
        .update({
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          address: form.address || null,
          gstin: form.gstin || null,
          gst_type: form.gst_type,
          currency: form.currency,
          tax_rate: parseFloat(form.tax_rate) || 18,
          is_active: form.is_active,
        })
        .eq('id', params.id)

      if (error) throw error

      toast.success("Store updated successfully")
      router.push("/stores")
    } catch (error) {
      console.error('Error updating store:', error)
      toast.error("Failed to update store")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to deactivate this store?")) return

    try {
      const supabase = getClient()
      const { error } = await supabase
        .from('businesses')
        .update({ is_active: false })
        .eq('id', params.id)

      if (error) throw error
      toast.success("Store deactivated")
      router.push("/stores")
    } catch (error) {
      toast.error("Failed to deactivate store")
    }
  }

  if (fetchLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!store) {
    return <div className="p-8 text-center">Store not found</div>
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
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                  placeholder="33AABCU9603R1ZM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gst_type">GST Type</Label>
                <Select value={form.gst_type} onValueChange={(v: "REGULAR" | "COMPOSITION") => setForm({ ...form, gst_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">Regular</SelectItem>
                    <SelectItem value="COMPOSITION">Composition</SelectItem>
                  </SelectContent>
                </Select>
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
