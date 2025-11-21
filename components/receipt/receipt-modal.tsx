"use client"

import { useState, useRef } from "react"
import { Printer, Download, MessageCircle, Mail, X, Check, Share2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReceiptPreview } from "./receipt-preview"
import { ReceiptData, generateWhatsAppMessage, generateReceiptText } from "@/lib/utils/receipt"

interface ReceiptModalProps {
  open: boolean
  onClose: () => void
  data: ReceiptData
}

export function ReceiptModal({ open, onClose, data }: ReceiptModalProps) {
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = receiptRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast.error("Please allow popups for printing")
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${data.receiptNo}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              margin: 0;
              padding: 10px;
              width: 80mm;
            }
            .receipt {
              width: 100%;
            }
            .text-center { text-align: center; }
            .flex { display: flex; justify-content: space-between; }
            .font-bold { font-weight: bold; }
            .separator { border-top: 1px dashed #000; margin: 8px 0; }
            .separator-solid { border-top: 1px solid #000; margin: 8px 0; }
            .text-sm { font-size: 14px; }
            .text-xs { font-size: 10px; }
            .pl-2 { padding-left: 8px; }
            .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .space-y > * + * { margin-top: 2px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="text-center">
              <div class="font-bold text-sm">${data.storeName}</div>
              <div class="text-xs">${data.storeAddress}</div>
              <div class="text-xs">Tel: ${data.storePhone}</div>
              ${data.storeGST ? `<div class="text-xs">GSTIN: ${data.storeGST}</div>` : ""}
            </div>
            <div class="separator"></div>
            <div class="text-center font-bold">TAX INVOICE</div>
            <div class="separator"></div>
            <div class="space-y">
              <div class="flex"><span>Receipt No:</span><span>${data.receiptNo}</span></div>
              <div class="flex"><span>Date:</span><span>${new Date(data.date).toLocaleString("en-IN")}</span></div>
              ${data.customerName ? `<div class="flex"><span>Customer:</span><span>${data.customerName}</span></div>` : ""}
              ${data.cashierName ? `<div class="flex"><span>Cashier:</span><span>${data.cashierName}</span></div>` : ""}
            </div>
            <div class="separator"></div>
            <div class="flex font-bold"><span>Item</span><span>Amount</span></div>
            <div class="separator"></div>
            ${data.items
              .map(
                (item) => `
              <div>
                <div class="truncate">${item.name}</div>
                <div class="flex text-xs pl-2">
                  <span>${item.quantity} x ₹${item.price.toFixed(2)}</span>
                  <span>₹${item.total.toFixed(2)}</span>
                </div>
              </div>
            `
              )
              .join("")}
            <div class="separator"></div>
            <div class="space-y">
              <div class="flex"><span>Subtotal:</span><span>₹${data.subtotal.toFixed(2)}</span></div>
              <div class="flex"><span>GST (${data.taxRate}%):</span><span>₹${data.taxAmount.toFixed(2)}</span></div>
              ${data.discount > 0 ? `<div class="flex"><span>Discount:</span><span>-₹${data.discount.toFixed(2)}</span></div>` : ""}
            </div>
            <div class="separator-solid"></div>
            <div class="flex font-bold text-sm"><span>TOTAL:</span><span>₹${data.total.toFixed(2)}</span></div>
            <div class="separator-solid"></div>
            <div class="space-y">
              <div class="flex"><span>Payment:</span><span>${data.paymentMethod}</span></div>
              ${data.amountPaid ? `<div class="flex"><span>Paid:</span><span>₹${data.amountPaid.toFixed(2)}</span></div>` : ""}
              ${data.change && data.change > 0 ? `<div class="flex"><span>Change:</span><span>₹${data.change.toFixed(2)}</span></div>` : ""}
            </div>
            <div class="separator"></div>
            <div class="text-center text-xs">
              <p>Thank you for your purchase!</p>
              <p>Visit again!</p>
            </div>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)

    toast.success("Printing receipt...")
  }

  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 200],
      })

      const text = generateReceiptText(data)
      const lines = text.split("\n")

      doc.setFontSize(8)
      doc.setFont("courier", "normal")

      let y = 10
      lines.forEach((line) => {
        if (y > 190) {
          doc.addPage()
          y = 10
        }
        doc.text(line, 5, y)
        y += 4
      })

      doc.save(`receipt-${data.receiptNo}.pdf`)
      toast.success("PDF downloaded!")
    } catch {
      toast.error("Failed to generate PDF")
    }
  }

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage(data)
    const phone = data.customerPhone?.replace(/\D/g, "") || ""
    const url = phone
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
    toast.success("Opening WhatsApp...")
  }

  const handleEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address")
      return
    }

    setSending(true)
    // Mock email sending - in production, call your API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSending(false)
    setShowEmailInput(false)
    setEmail("")
    toast.success(`Receipt sent to ${email}`)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-500" />
            Payment Successful!
          </DialogTitle>
          <DialogDescription>
            Receipt #{data.receiptNo}
          </DialogDescription>
        </DialogHeader>

        {/* Receipt Preview */}
        <div
          ref={receiptRef}
          className="max-h-[400px] overflow-y-auto border rounded-lg bg-white"
        >
          <ReceiptPreview data={data} compact />
        </div>

        {/* Email Input */}
        {showEmailInput && (
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleEmail} disabled={sending}>
              {sending ? "Sending..." : "Send"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmailInput(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowEmailInput(true)}
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>

        <Button onClick={onClose} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
          Done
        </Button>
      </DialogContent>
    </Dialog>
  )
}
