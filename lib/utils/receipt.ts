import { formatCurrency } from "./currency"

export interface ReceiptItem {
  name: string
  quantity: number
  price: number
  total: number
}

export interface ReceiptData {
  receiptNo: string
  date: Date
  storeName: string
  storeAddress: string
  storePhone: string
  storeGST?: string
  customerName?: string
  customerPhone?: string
  items: ReceiptItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  total: number
  paymentMethod: string
  amountPaid?: number
  change?: number
  cashierName?: string
}

export function generateReceiptNo(): string {
  const date = new Date()
  const prefix = "INV"
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
  return `${prefix}-${dateStr}-${random}`
}

export function formatReceiptDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function generateReceiptText(data: ReceiptData): string {
  const width = 48
  const line = "=".repeat(width)
  const dottedLine = "-".repeat(width)

  const center = (text: string) => {
    const padding = Math.max(0, Math.floor((width - text.length) / 2))
    return " ".repeat(padding) + text
  }

  const row = (left: string, right: string) => {
    const space = width - left.length - right.length
    return left + " ".repeat(Math.max(1, space)) + right
  }

  let receipt = ""
  receipt += center(data.storeName) + "\n"
  receipt += center(data.storeAddress) + "\n"
  receipt += center(`Tel: ${data.storePhone}`) + "\n"
  if (data.storeGST) {
    receipt += center(`GSTIN: ${data.storeGST}`) + "\n"
  }
  receipt += line + "\n"
  receipt += center("TAX INVOICE") + "\n"
  receipt += line + "\n"
  receipt += row("Receipt No:", data.receiptNo) + "\n"
  receipt += row("Date:", formatReceiptDate(data.date)) + "\n"
  if (data.customerName) {
    receipt += row("Customer:", data.customerName) + "\n"
  }
  if (data.cashierName) {
    receipt += row("Cashier:", data.cashierName) + "\n"
  }
  receipt += dottedLine + "\n"

  // Items header
  receipt += row("Item", "Amount") + "\n"
  receipt += dottedLine + "\n"

  // Items
  data.items.forEach((item) => {
    receipt += item.name.slice(0, 30) + "\n"
    receipt += row(`  ${item.quantity} x ${formatCurrency(item.price)}`, formatCurrency(item.total)) + "\n"
  })

  receipt += dottedLine + "\n"
  receipt += row("Subtotal:", formatCurrency(data.subtotal)) + "\n"
  receipt += row(`GST (${data.taxRate}%):`, formatCurrency(data.taxAmount)) + "\n"
  if (data.discount > 0) {
    receipt += row("Discount:", `-${formatCurrency(data.discount)}`) + "\n"
  }
  receipt += line + "\n"
  receipt += row("TOTAL:", formatCurrency(data.total)) + "\n"
  receipt += line + "\n"
  receipt += row("Payment:", data.paymentMethod) + "\n"
  if (data.amountPaid && data.change !== undefined) {
    receipt += row("Paid:", formatCurrency(data.amountPaid)) + "\n"
    receipt += row("Change:", formatCurrency(data.change)) + "\n"
  }
  receipt += "\n"
  receipt += center("Thank you for your purchase!") + "\n"
  receipt += center("Visit again!") + "\n"
  receipt += "\n"

  return receipt
}

export function generateWhatsAppMessage(data: ReceiptData): string {
  let msg = `🧾 *Receipt from ${data.storeName}*\n\n`
  msg += `📋 Receipt No: ${data.receiptNo}\n`
  msg += `📅 Date: ${formatReceiptDate(data.date)}\n\n`
  msg += `*Items:*\n`
  data.items.forEach((item) => {
    msg += `• ${item.name} (${item.quantity}x) - ${formatCurrency(item.total)}\n`
  })
  msg += `\n💰 *Total: ${formatCurrency(data.total)}*\n`
  msg += `💳 Paid via: ${data.paymentMethod}\n\n`
  msg += `Thank you for shopping with us! 🙏`
  return msg
}
