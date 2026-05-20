// Browser uses NEXT_PUBLIC_API_URL; SSR inside Docker uses SERVER_API_URL (service name)
export const API_URL =
  typeof window === 'undefined'
    ? (process.env.SERVER_API_URL ?? process.env.NEXT_PUBLIC_API_URL!)
    : process.env.NEXT_PUBLIC_API_URL!

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cimarket.mx'
