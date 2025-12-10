/**
 * Date utilities that properly handle timezone conversion
 *
 * Task dates are stored as UTC midnight (e.g., "2025-12-10T00:00:00Z")
 * This represents the "logical date" Dec 10, regardless of timezone.
 *
 * When displaying, we need to show "Dec 10" in the user's timezone,
 * not let JavaScript convert it to "Dec 9" because of timezone offset.
 */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Parse a date string and get the logical date components
 * Since dates are stored as UTC midnight, we extract the UTC date parts
 * to get the intended "logical date"
 */
export function getLogicalDate(dateString: string): {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
} {
  const date = new Date(dateString);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    dayOfWeek: date.getUTCDay(),
  };
}

/**
 * Get the day name for a task date
 */
export function getDayName(dateString: string): string {
  const { dayOfWeek } = getLogicalDate(dateString);
  return DAYS[dayOfWeek] || '';
}

/**
 * Get short day name (Mon, Tue, etc.)
 */
export function getShortDayName(dateString: string): string {
  return getDayName(dateString).slice(0, 3);
}

/**
 * Format date as "Mon, Dec 10"
 */
export function formatDateWithDay(dateString: string): string {
  const { month, day, dayOfWeek } = getLogicalDate(dateString);
  const dayName = DAYS[dayOfWeek]?.slice(0, 3) || '';
  return `${dayName}, ${MONTHS[month]} ${day}`;
}

/**
 * Format date as "Dec 10"
 */
export function formatDate(dateString: string): string {
  const { month, day } = getLogicalDate(dateString);
  return `${MONTHS[month]} ${day}`;
}

/**
 * Format date as "December 10, 2025"
 */
export function formatDateLong(dateString: string): string {
  const { year, month, day } = getLogicalDate(dateString);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[month]} ${day}, ${year}`;
}

/**
 * Check if a date string represents today (in local timezone)
 */
export function isToday(dateString: string): boolean {
  const { year, month, day } = getLogicalDate(dateString);
  const now = new Date();
  return (
    year === now.getFullYear() &&
    month === now.getMonth() &&
    day === now.getDate()
  );
}

/**
 * Check if a date string represents tomorrow (in local timezone)
 */
export function isTomorrow(dateString: string): boolean {
  const { year, month, day } = getLogicalDate(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    year === tomorrow.getFullYear() &&
    month === tomorrow.getMonth() &&
    day === tomorrow.getDate()
  );
}

/**
 * Format date with Today/Tomorrow labels
 */
export function formatDateSmart(dateString: string): string {
  if (isToday(dateString)) return 'Today';
  if (isTomorrow(dateString)) return 'Tomorrow';
  return formatDateWithDay(dateString);
}

/**
 * Format time from "17:00" to "5:00 PM"
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
