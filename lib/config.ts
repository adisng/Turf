// Central, database-ready configuration for the facility.
// Replace these static values with data-layer reads once the database is connected —
// consuming components should never hardcode sport, pricing, or scheduling values directly.

export type SportId = 'cricket' | 'football'

export interface Sport {
  id: SportId
  name: string
  tagline: string
  description: string
  image: string
  surface: string
  maxPlayers: string
}

export const SPORTS: Sport[] = [
  {
    id: 'cricket',
    name: 'Cricket',
    tagline: 'Match-ready pitch, night lights included',
    description:
      'A full-size cricket turf with a synthetic pitch, boundary netting, and floodlights for after-dark matches. Ideal for nets practice, box cricket, and weekend tournaments.',
    image: '/turf-cricket.png',
    surface: 'Synthetic turf pitch',
    maxPlayers: 'Up to 22 players',
  },
  {
    id: 'football',
    name: 'Football',
    tagline: 'FIFA-spec turf for 5v5 to 7v7',
    description:
      'A premium artificial-grass football turf built to FIFA-quality standards, with regulation goals, perimeter boarding, and floodlighting for evening fixtures.',
    image: '/turf-football.png',
    surface: 'FIFA-quality artificial grass',
    maxPlayers: 'Up to 14 players',
  },
]

export const OPERATING_HOURS = {
  open: '06:00',
  close: '00:00',
  label: '6:00 AM – 12:00 AM, every day',
}

export interface DurationOption {
  minutes: number
  label: string
}

export const DURATION_OPTIONS: DurationOption[] = [
  { minutes: 30, label: '30 minutes' },
  { minutes: 60, label: '1 hour' },
  { minutes: 90, label: '1.5 hours' },
  { minutes: 120, label: '2 hours' },
]

export interface PricingWindow {
  id: string
  label: string
  range: string
  hourlyRate: number
}

export const PRICING_WINDOWS: PricingWindow[] = [
  {
    id: 'day',
    label: 'Day rate',
    range: '6:00 AM – 6:00 PM',
    hourlyRate: 1000,
  },
  {
    id: 'night',
    label: 'Night rate',
    range: '6:00 PM – 12:00 AM',
    hourlyRate: 1300,
  },
]

export const CURRENCY = '₹'

export function formatPriceForDuration(hourlyRate: number, minutes: number) {
  const amount = Math.round((hourlyRate * minutes) / 60)
  return `${CURRENCY}${amount.toLocaleString('en-IN')}`
}

export const CONTACT_INFO = {
  address: 'Facility address placeholder — add your turf location here',
  phone: '+91 00000 00000',
  email: 'contact@turfbooking.example',
  hours: OPERATING_HOURS.label,
}

export const SITE = {
  name: 'TurfBooking',
  tagline: 'Premium turf, booked in minutes.',
}
