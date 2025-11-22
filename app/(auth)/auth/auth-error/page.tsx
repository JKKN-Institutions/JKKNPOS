"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
        <CardDescription>
          There was a problem verifying your email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>This could be due to:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>The verification link has expired</li>
            <li>The link has already been used</li>
            <li>There was a network error</li>
          </ul>
        </div>

        <div className="pt-4 space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Please try signing up again or contact support if the issue persists.
          </p>

          <Link href="/signup" className="block">
            <Button className="w-full">
              Back to Sign Up
            </Button>
          </Link>

          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Go to Sign In
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
