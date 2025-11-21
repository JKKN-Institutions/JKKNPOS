"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Receipt,
  ShoppingCart,
  Barcode,
  X,
  History,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { useCartStore } from "@/store/cart-store"
import { formatCurrency } from "@/lib/utils/currency"
import { initializeMockData, getFromStorage, mockItems, mockCategories, mockCustomers } from "@/lib/mock-data"
import type { Profile } from "@/types"
import { PaymentModal } from "@/components/sales/payment-modal"

type MockItem = typeof mockItems[0]
type MockCategory = typeof mockCategories[0]
type MockCustomer = typeof mockCustomers[0]

export default function SalesPage() {
  const router = useRouter()
  const cart = useCartStore()

  const [items, setItems] = useState<MockItem[]>([])
  const [categories, setCategories] = useState<MockCategory[]>([])
  const [customers, setCustomers] = useState<MockCustomer[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState("")
  const [cartSheetOpen, setCartSheetOpen] = useState(false)

  useEffect(() => {
    initializeMockData()

    // Mock profile
    setProfile({
      id: "mock-user-id",
      business_id: "mock-business-id",
      full_name: "Test User",
      role: "OWNER",
      phone: null,
      permissions: {},
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile)

    setItems(getFromStorage('mock_items', mockItems).filter(i => i.is_active))
    setCategories(getFromStorage('mock_categories', mockCategories))
    setCustomers(getFromStorage('mock_customers', mockCustomers))
    setLoading(false)
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = !selectedCategory || item.category_id === selectedCategory

    return matchesSearch && matchesCategory && item.stock > 0
  })

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone?.includes(customerSearch)
  )

  const handleAddToCart = (item: MockItem) => {
    const existingItem = cart.items.find((i) => i.item_id === item.id)
    if (existingItem && existingItem.quantity >= item.stock) {
      toast.error("Not enough stock available")
      return
    }

    cart.addItem({
      id: `${item.id}-${Date.now()}`,
      item_id: item.id,
      name: item.name,
      price: item.price,
      image_url: null,
    })
  }

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error("Cart is empty")
      return
    }
    setPaymentOpen(true)
  }

  const handleSelectCustomer = (customer: MockCustomer) => {
    cart.setCustomer(customer)
    setCustomerDialogOpen(false)
    toast.success(`Customer: ${customer.name}`)
  }

  // Cart Content Component - reused for desktop and mobile
  const CartContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className={isMobile ? "p-4 border-b" : ""}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Receipt className="h-5 w-5" />
            Current Sale
          </div>
          {cart.items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={cart.clearCart}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Customer Selection */}
        <Button
          variant="outline"
          className="w-full justify-start mt-3"
          onClick={() => setCustomerDialogOpen(true)}
        >
          <User className="h-4 w-4 mr-2" />
          {cart.customer ? cart.customer.name : "Select Customer"}
        </Button>
      </div>

      <div className={`flex-1 flex flex-col ${isMobile ? "p-4" : "p-4 pt-0"}`}>
        {/* Cart Items */}
        <ScrollArea className={`flex-1 ${isMobile ? "" : "-mx-4 px-4"}`}>
          {cart.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Cart is empty</p>
              <p className="text-sm">Add items to start a sale</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        cart.updateQuantity(item.item_id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-medium text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        cart.updateQuantity(item.item_id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <p className="font-medium text-sm">{formatCurrency(item.total)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => cart.removeItem(item.item_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Totals */}
        <div className="border-t pt-4 mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(cart.getSubtotal())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (18%)</span>
            <span>{formatCurrency(cart.getTaxAmount())}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(cart.getDiscountAmount())}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(cart.getTotal())}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          className="w-full mt-4"
          size="lg"
          onClick={() => {
            if (isMobile) setCartSheetOpen(false)
            handleCheckout()
          }}
          disabled={cart.items.length === 0}
        >
          <Receipt className="h-5 w-5 mr-2" />
          Checkout ({cart.getItemCount()} items)
        </Button>
      </div>
    </>
  )

  return (
    <div className="h-[calc(100vh-7rem)] md:h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Left Side - Items */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Search & Filters */}
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Barcode className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/sales/history")}
              className="hidden sm:flex"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/sales/history")}
              className="sm:hidden shrink-0"
            >
              <History className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Tabs */}
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="whitespace-nowrap"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Items Grid */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items found
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer border-0 bg-gradient-to-br from-card to-muted/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] group overflow-hidden"
                  onClick={() => handleAddToCart(item)}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="rounded-xl p-3 bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                        <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-xs md:text-sm line-clamp-2 group-hover:text-primary transition-colors">{item.name}</h3>
                    <div className="flex items-center justify-between mt-2 md:mt-3">
                      <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-sm md:text-base">
                        {formatCurrency(item.price)}
                      </span>
                      <Badge className="text-[10px] md:text-xs px-1.5 md:px-2 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                        {item.stock} left
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Mobile Cart Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full h-16 w-16 shadow-xl shadow-emerald-500/30 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 relative transition-all duration-300 hover:scale-105">
              <ShoppingCart className="h-7 w-7" />
              {cart.items.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-7 w-7 rounded-full p-0 flex items-center justify-center bg-orange-500 border-2 border-white font-bold">
                  {cart.getItemCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
            <CartContent isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Cart */}
      <Card className="hidden lg:flex w-[380px] flex-col shrink-0 border-0 bg-gradient-to-br from-card to-muted/30 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg p-2 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
                <Receipt className="h-4 w-4 text-white" />
              </div>
              Current Sale
            </CardTitle>
            {cart.items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={cart.clearCart}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Customer Selection */}
          <Button
            variant="outline"
            className="w-full justify-start mt-2"
            onClick={() => setCustomerDialogOpen(true)}
          >
            <User className="h-4 w-4 mr-2" />
            {cart.customer ? cart.customer.name : "Select Customer"}
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4 pt-0">
          {/* Cart Items */}
          <ScrollArea className="flex-1 -mx-4 px-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Cart is empty</p>
                <p className="text-sm">Add items to start a sale</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          cart.updateQuantity(item.item_id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          cart.updateQuantity(item.item_id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="font-medium">{formatCurrency(item.total)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => cart.removeItem(item.item_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Totals */}
          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(cart.getSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (18%)</span>
              <span>{formatCurrency(cart.getTaxAmount())}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(cart.getDiscountAmount())}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(cart.getTotal())}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl"
            size="lg"
            onClick={handleCheckout}
            disabled={cart.items.length === 0}
          >
            <Receipt className="h-5 w-5 mr-2" />
            Checkout ({cart.getItemCount()} items)
          </Button>
        </CardContent>
      </Card>

      {/* Customer Selection Dialog */}
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search by name or phone..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    cart.setCustomer(null)
                    setCustomerDialogOpen(false)
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Walk-in Customer
                </Button>
                {filteredCustomers.map((customer) => (
                  <Button
                    key={customer.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="flex flex-col items-start">
                      <span>{customer.name}</span>
                      {customer.phone && (
                        <span className="text-xs text-muted-foreground">
                          {customer.phone}
                        </span>
                      )}
                    </div>
                    {customer.loyalty_points > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {customer.loyalty_points} pts
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        profile={profile}
        onSuccess={() => {
          setPaymentOpen(false)
          cart.clearCart()
          toast.success("Sale completed!")
        }}
      />
    </div>
  )
}
