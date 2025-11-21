import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  // Prototype mode - skip login
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">JKKN Dental Store POS</h1>
      <p className="text-muted-foreground">Prototype Mode</p>
      <Link href="/">
        <Button size="lg">Enter Dashboard</Button>
      </Link>
    </div>
  )
}
