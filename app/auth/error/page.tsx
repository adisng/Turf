import { Suspense } from 'react'

import AuthErrorClient from './auth-error-client'

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-background px-5 py-16" />}> 
      <AuthErrorClient />
    </Suspense>
  )
}
