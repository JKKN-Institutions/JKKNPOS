"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, CreditCard, Wallet, Smartphone, Banknote } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import { getClient } from "@/lib/supabase/client"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency } from "@/lib/utils/currency"
import { ReceiptModal } from "@/components/receipt"
import { generateReceiptNo, type ReceiptData } from "@/lib/utils/receipt"
import { useStoreContext } from "@/store/store-context"
import type { Profile, PaymentMethod } from "@/types"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  profile: Profile | null
  onSuccess: () => void
}

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "CASH", label: "Cash", icon: <Banknote className="h-5 w-5" /> },
  { value: "CARD", label: "Card", icon: <CreditCard className="h-5 w-5" /> },
  { value: "UPI", label: "UPI", icon: <Smartphone className="h-5 w-5" /> },
  { value: "WALLET", label: "Wallet", icon: <Wallet className="h-5 w-5" /> },
]

export function PaymentModal({ open, onClose, profile, onSuccess }: PaymentModalProps) {
  const supabase = getClient()
  const cart = useCartStore()
  const { currentStore } = useStoreContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("CASH")
  const [amountPaid, setAmountPaid] = useState("")
  const [reference, setReference] = useState("")
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)

  const total = cart.getTotal()
  const paid = parseFloat(amountPaid) || 0
  const change = paid - total

  const handlePayment = async () => {
    if (!profile?.business_id) {
      toast.error("Business not found")
      return
    }

    if (selectedMethod === "CASH" && paid < total) {
      toast.error("Insufficient payment amount")
      return
    }

    setIsSubmitting(true)
    try {
      // Generate sale number
      const today = new Date()
      const dateStr = today.toISOString().slice(2, 10).replace(/-/g, "")
      const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, "0")
      const saleNumber = `INV-${dateStr}-${randomNum}`

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          business_id: profile.business_id,
          sale_number: saleNumber,
          customer_id: cart.customer?.id || null,
          user_id: profile.id,
          subtotal: cart.getSubtotal(),
          discount: cart.getDiscountAmount(),
          discount_type: cart.discountType,
          tax: cart.getTaxAmount(),
          total: cart.getTotal(),
          status: "COMPLETED",
          notes: cart.notes || null,
        } as never)
        .select()
        .single()

      if (saleError) throw saleError

      const typedSale = sale as { id: string }
      // Create sale items
      const saleItems = cart.items.map((item) => ({
        sale_id: typedSale.id,
        item_id: item.item_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        tax: item.tax,
        total: item.total,
      }))

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItems as never)
      if (itemsError) throw itemsError

      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        sale_id: typedSale.id,
        method: selectedMethod,
        amount: selectedMethod === "CASH" ? paid : total,
        reference: reference || null,
      } as never)
      if (paymentError) throw paymentError

      // Stock is updated via database trigger on sale_items insert

      // Create receipt data
      const newReceiptData: ReceiptData = {
        receiptNo: saleNumber,
        date: new Date(),
        storeName: currentStore?.name || "JKKN POS",
        storeAddress: currentStore?.address || "",
        storePhone: currentStore?.phone || "",
        storeGST: currentStore?.gstin || "",
        customerName: cart.customer?.name || undefined,
        customerPhone: cart.customer?.phone || undefined,
        items: cart.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        subtotal: cart.getSubtotal(),
        taxRate: 18,
        taxAmount: cart.getTaxAmount(),
        discount: cart.getDiscountAmount(),
        total: cart.getTotal(),
        paymentMethod: selectedMethod,
        amountPaid: selectedMethod === "CASH" ? paid : total,
        change: selectedMethod === "CASH" ? Math.max(0, change) : 0,
        cashierName: profile?.full_name,
      }

      setReceiptData(newReceiptData)
      setReceiptOpen(true)
    } catch (error: any) {
      console.error("Payment error:", error)
      toast.error(error.message || "Failed to process payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedMethod("CASH")
    setAmountPaid("")
    setReference("")
    onClose()
  }

  const handleReceiptClose = () => {
    setReceiptOpen(false)
    setReceiptData(null)
    onSuccess()
  }

  return (
    <>
    <Dialog open={open && !receiptOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total */}
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(total)}</p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-4 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method.value}
                  type="button"
                  variant={selectedMethod === method.value ? "default" : "outline"}
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => setSelectedMethod(method.value)}
                >
                  {method.icon}
                  <span className="text-xs">{method.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Cash Payment */}
          {selectedMethod === "CASH" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount Received</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="text-lg"
                />
              </div>

              {paid > 0 && (
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Received</span>
                    <span>{formatCurrency(paid)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Change Due</span>
                    <span className={change >= 0 ? "text-green-600" : "text-destructive"}>
                      {formatCurrency(Math.max(0, change))}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[total, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .slice(0, 4)
                  .map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmountPaid(amount.toString())}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          {/* Reference for non-cash */}
          {selectedMethod !== "CASH" && (
            <div className="space-y-2">
              <Label>Transaction Reference (Optional)</Label>
              <Input
                placeholder="Enter transaction ID or reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isSubmitting || (selectedMethod === "CASH" && paid < total)}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Receipt Modal */}
    {receiptData && (
      <ReceiptModal
        open={receiptOpen}
        onClose={handleReceiptClose}
        data={receiptData}
      />
    )}
    </>
  )
}
