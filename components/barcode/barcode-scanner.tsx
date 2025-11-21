"use client"

import { useState, useRef, useEffect } from "react"
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library"
import { X, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  onScan: (barcode: string) => void
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    if (open && videoRef.current) {
      startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [open])

  const startScanning = async () => {
    try {
      setIsScanning(true)
      setError(null)

      // Initialize code reader
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader()
      }

      const codeReader = codeReaderRef.current

      // Get available video devices
      const videoInputDevices = await codeReader.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        throw new Error("No camera found on this device")
      }

      // Prefer back camera on mobile
      const selectedDevice = videoInputDevices.find(
        device => device.label.toLowerCase().includes('back')
      ) || videoInputDevices[0]

      // Start decoding from video device
      await codeReader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            const barcode = result.getText()
            console.log("[BarcodeScanner] Scanned:", barcode)

            // Call onScan callback
            onScan(barcode)

            // Show success toast
            toast.success(`Barcode detected: ${barcode}`)

            // Stop scanning and close
            stopScanning()
            onClose()
          }

          if (error && !(error instanceof NotFoundException)) {
            console.error("[BarcodeScanner] Decode error:", error)
          }
        }
      )
    } catch (err) {
      console.error("[BarcodeScanner] Start error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to start camera"
      setError(errorMessage)
      toast.error(errorMessage)
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
    }
    setIsScanning(false)
  }

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera preview */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Scanning overlay */}
            {isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Scanning frame */}
                <div className="relative w-64 h-40 border-2 border-primary rounded-lg">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

                  {/* Scanning line animation */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-scan" />
                </div>

                {/* Instructions */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white text-sm font-medium drop-shadow-lg">
                    Position barcode within the frame
                  </p>
                </div>
              </div>
            )}

            {/* Loading state */}
            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
                  <p className="text-white text-sm">Starting camera...</p>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center px-4">
                  <X className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <p className="text-white text-sm font-medium mb-3">{error}</p>
                  <Button
                    onClick={startScanning}
                    variant="outline"
                    size="sm"
                    className="bg-white"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Hold your device steady</p>
            <p>• Ensure good lighting</p>
            <p>• Keep barcode within the frame</p>
            <p>• Supports EAN, UPC, Code128, and more</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            {error && (
              <Button
                onClick={startScanning}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      <style jsx>{`
        @keyframes scan {
          0%, 100% {
            top: 0;
            opacity: 0.8;
          }
          50% {
            top: 100%;
            opacity: 0.3;
          }
        }

        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </Dialog>
  )
}
