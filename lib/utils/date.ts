import {
  format,
  formatDistanceToNow,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  isToday,
  isYesterday,
  parseISO,
} from 'date-fns'

export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy, hh:mm a')
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'hh:mm a')
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date

  if (isToday(d)) {
    return `Today at ${format(d, 'hh:mm a')}`
  }
  if (isYesterday(d)) {
    return `Yesterday at ${format(d, 'hh:mm a')}`
  }
  return formatDistanceToNow(d, { addSuffix: true })
}

export interface DateRange {
  start: Date
  end: Date
}

export function getDateRangePreset(preset: string): DateRange {
  const now = new Date()

  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'yesterday':
      const yesterday = subDays(now, 1)
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
    case 'last7days':
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) }
    case 'last30days':
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) }
    case 'thisWeek':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'lastMonth':
      const lastMonth = subMonths(now, 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    case 'thisYear':
      return { start: startOfYear(now), end: endOfYear(now) }
    default:
      return { start: startOfDay(now), end: endOfDay(now) }
  }
}

export const DATE_RANGE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
]
