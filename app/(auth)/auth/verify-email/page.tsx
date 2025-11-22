"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to your email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {email && (
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-sm font-medium">{email}</p>
          </div>
        )}

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>To complete your registration:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Check your email inbox</li>
            <li>Click the verification link in the email</li>
            <li>You&apos;ll be redirected back to sign in</li>
          </ol>
        </div>

        <div className="pt-4 space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            Didn&apos;t receive the email? Check your spam folder or contact support.
          </p>

          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
