"use client"

import { ReceiptData, formatReceiptDate } from "@/lib/utils/receipt"
import { formatCurrency } from "@/lib/utils/currency"
import { Separator } from "@/components/ui/separator"

interface ReceiptPreviewProps {
  data: ReceiptData
  compact?: boolean
}

export function ReceiptPreview({ data, compact = false }: ReceiptPreviewProps) {
  return (
    <div
      className={`bg-white text-black font-mono ${compact ? "text-[10px]" : "text-xs"} w-full max-w-[300px] mx-auto p-4`}
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="font-bold text-sm">{data.storeName}</h2>
        <p className="text-[10px]">{data.storeAddress}</p>
        <p className="text-[10px]">Tel: {data.storePhone}</p>
        {data.storeGST && <p className="text-[10px]">GSTIN: {data.storeGST}</p>}
      </div>

      <Separator className="my-2 border-dashed border-black" />

      <div className="text-center font-bold">TAX INVOICE</div>

      <Separator className="my-2 border-dashed border-black" />

      {/* Receipt Info */}
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span>Receipt No:</span>
          <span>{data.receiptNo}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatReceiptDate(data.date)}</span>
        </div>
        {data.customerName && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{data.customerName}</span>
          </div>
        )}
        {data.cashierName && (
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{data.cashierName}</span>
          </div>
        )}
      </div>

      <Separator className="my-2 border-dashed border-black" />

      {/* Items Header */}
      <div className="flex justify-between font-bold">
        <span>Item</span>
        <span>Amount</span>
      </div>

      <Separator className="my-1 border-dashed border-black" />

      {/* Items */}
      <div className="space-y-1">
        {data.items.map((item, index) => (
          <div key={index}>
            <div className="truncate">{item.name}</div>
            <div className="flex justify-between text-[10px] pl-2">
              <span>
                {item.quantity} x {formatCurrency(item.price)}
              </span>
              <span>{formatCurrency(item.total)}</span>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-2 border-dashed border-black" />

      {/* Totals */}
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(data.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST ({data.taxRate}%):</span>
          <span>{formatCurrency(data.taxAmount)}</span>
        </div>
        {data.discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount:</span>
            <span>-{formatCurrency(data.discount)}</span>
          </div>
        )}
      </div>

      <Separator className="my-2 border-black" />

      {/* Grand Total */}
      <div className="flex justify-between font-bold text-sm">
        <span>TOTAL:</span>
        <span>{formatCurrency(data.total)}</span>
      </div>

      <Separator className="my-2 border-black" />

      {/* Payment */}
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span>Payment:</span>
          <span>{data.paymentMethod}</span>
        </div>
        {data.amountPaid && (
          <div className="flex justify-between">
            <span>Paid:</span>
            <span>{formatCurrency(data.amountPaid)}</span>
          </div>
        )}
        {data.change !== undefined && data.change > 0 && (
          <div className="flex justify-between">
            <span>Change:</span>
            <span>{formatCurrency(data.change)}</span>
          </div>
        )}
      </div>

      <Separator className="my-2 border-dashed border-black" />

      {/* Footer */}
      <div className="text-center space-y-1 text-[10px]">
        <p>Thank you for your purchase!</p>
        <p>Visit again!</p>
      </div>
    </div>
  )
}
