import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

const COOKIE_NAME = 'turf_admin_session'

function expectedToken() {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  if (!username || !password) return null
  return createHmac('sha256', password).update(username).digest('hex')
}

export async function POST(request: Request) {
  const configuredUsername = process.env.ADMIN_USERNAME
  const configuredPassword = process.env.ADMIN_PASSWORD
  if (!configuredUsername || !configuredPassword) {
    return NextResponse.json({ error: 'Admin authentication is not configured.' }, { status: 503 })
  }

  let body: { username?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (body.username !== configuredUsername || body.password !== configuredPassword) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
  }

  const token = expectedToken()
  const response = NextResponse.json({ ok: true })
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const isHttps = forwardedProto
    ? forwardedProto.split(',')[0].trim() === 'https'
    : new URL(request.url).protocol === 'https:'
  response.cookies.set(COOKIE_NAME, token!, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
  return response
}

export function isAdminTokenValid(token: string | undefined) {
  const expected = expectedToken()
  if (!expected || !token || token.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}

export { COOKIE_NAME }
