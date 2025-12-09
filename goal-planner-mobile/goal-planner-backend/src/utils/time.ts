import { format, parse, addMinutes, startOfWeek, addDays, addWeeks } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

/**
 * Calculate the date for a specific day of the week in a given week
 */
export function getDateForWeekDay(
  weekNumber: number,
  dayOfWeek: number,
  baseDate: Date = new Date()
): Date {
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 }); // Sunday
  return addDays(addWeeks(weekStart, weekNumber - 1), dayOfWeek);
}

/**
 * Parse a time string (HH:mm) and combine with a date
 */
export function combineDateAndTime(date: Date, timeString: string): Date {
  const dateStr = format(date, 'yyyy-MM-dd');
  return parse(`${dateStr} ${timeString}`, 'yyyy-MM-dd HH:mm', new Date());
}

/**
 * Calculate end time given start time and duration
 */
export function calculateEndTime(startTime: Date, durationMinutes: number): Date {
  return addMinutes(startTime, durationMinutes);
}

/**
 * Format a date for Google Calendar API (with timezone)
 */
export function formatForGoogleCalendar(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

/**
 * Convert a UTC date to a specific timezone
 */
export function toTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone);
}

/**
 * Get the current week number relative to a start date
 */
export function getCurrentWeekNumber(startDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diffWeeks + 1);
}

/**
 * Format duration in minutes to a human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Get the name of a day from its number (0-6)
 */
export function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
}

/**
 * Validate that a time string is in HH:mm format
 */
export function isValidTimeString(time: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}

/**
 * Check if a time slot is within availability
 */
export function isWithinAvailability(
  time: string,
  duration: number,
  availability: { startTime: string; endTime: string }
): boolean {
  const [startHour, startMin] = time.split(':').map(Number);
  const [availStartHour, availStartMin] = availability.startTime.split(':').map(Number);
  const [availEndHour, availEndMin] = availability.endTime.split(':').map(Number);

  const taskStartMinutes = startHour * 60 + startMin;
  const taskEndMinutes = taskStartMinutes + duration;
  const availStartMinutes = availStartHour * 60 + availStartMin;
  const availEndMinutes = availEndHour * 60 + availEndMin;

  return taskStartMinutes >= availStartMinutes && taskEndMinutes <= availEndMinutes;
}
