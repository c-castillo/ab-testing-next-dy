import { NextRequest, NextResponse } from 'next/server'
import { choose } from '@lib/ab-testing'
import { MARKETING_BUCKETS } from '@lib/buckets'

type Route = {
  page: string
  cookie: string
  buckets: readonly string[]
}

const ROUTES: Record<string, Route | undefined> = {
  '/abtesting': {
    page: '/abtesting',
    cookie: 'bucket-marketing',
    buckets: MARKETING_BUCKETS,
  },
}

export const config = {
  matcher: ['/home', '/abtesting'],
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const route = ROUTES[pathname]
  const apiKey = process.env.NEXT_PUBLIC_DY_API_KEY || '';
  const selectors = [`${process.env.NEXT_PUBLIC_SELECTOR}`] || [''];


  if (!route) return

  // Get the bucket from the cookie
  let bucket = req.cookies.get(route.cookie)?.value
  let hasBucket = !!bucket

  const dyContext = {
    page: {
      location: req.url,
      referrer: req.referrer,
      data: [],
      type: 'HOMEPAGE'
    },
    device: {
      userAgent: req.headers.get('user-agent') || '',
      ip: req.ip,
    },
  }

  if (!bucket || !route.buckets.includes(bucket as any)) {
    bucket = await choose(apiKey, dyContext, selectors)
    hasBucket = false
  }

  // Create a rewrite to the page matching th bucket
  const url = req.nextUrl.clone()
  url.pathname = `${route.page}/${bucket}`
  const res = NextResponse.rewrite(url)

  // Add the bucket to the response cookies if it's not there
  // or if its value was invalid
  if (!hasBucket) {
    res.cookies.set(route.cookie, bucket)
  }

  return res
}
