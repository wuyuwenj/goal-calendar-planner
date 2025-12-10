import { google, calendar_v3 } from 'googleapis';
import { getOAuth2Client } from '../lib/google';
import { prisma } from '../lib/prisma';
import { addMinutes, parse, format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  scheduledTime: string;
  durationMinutes: number;
}

/**
 * Get an authenticated Google Calendar client for a user
 */
export async function getCalendarClient(
  profileId: string
): Promise<calendar_v3.Calendar> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
  });

  if (!profile?.googleRefreshToken) {
    throw new Error('Google Calendar not connected');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: profile.googleRefreshToken,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Create a new Google Calendar for a goal
 */
export async function createGoalCalendar(
  profileId: string,
  goalTitle: string
): Promise<string> {
  const calendar = await getCalendarClient(profileId);

  const response = await calendar.calendars.insert({
    requestBody: {
      summary: `GoalPlan - ${goalTitle}`,
      description: `Auto-generated calendar for goal: ${goalTitle}`,
      timeZone: 'UTC',
    },
  });

  return response.data.id!;
}

/**
 * Sync tasks to Google Calendar
 */
export async function syncTasksToCalendar(
  profileId: string,
  calendarId: string,
  tasks: CalendarTask[],
  timezone: string
): Promise<Map<string, string>> {
  const calendar = await getCalendarClient(profileId);
  const eventIdMap = new Map<string, string>();

  for (const task of tasks) {
    // Format date in user's timezone (task.scheduledDate is stored in UTC)
    const dateStr = formatInTimeZone(task.scheduledDate, timezone, 'yyyy-MM-dd');

    // Build ISO datetime strings directly (no Date manipulation to avoid timezone issues)
    const startTimeStr = `${dateStr}T${task.scheduledTime}:00`;

    // Calculate end time, handling overflow past midnight
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + task.durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;

    let endDateStr = dateStr;
    let endHoursFinal = endHours;

    // If end time goes past midnight, adjust the date
    if (endHours >= 24) {
      endHoursFinal = endHours % 24;
      // Add days to the date
      const daysToAdd = Math.floor(endHours / 24);
      const endDate = new Date(task.scheduledDate);
      endDate.setUTCDate(endDate.getUTCDate() + daysToAdd);
      endDateStr = formatInTimeZone(endDate, timezone, 'yyyy-MM-dd');
    }

    const endTimeStr = `${endDateStr}T${String(endHoursFinal).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`;

    console.log(`Calendar event: ${task.title} | ${startTimeStr} to ${endTimeStr} (${timezone})`);

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: task.title,
        description: task.description,
        start: {
          dateTime: startTimeStr,
          timeZone: timezone,
        },
        end: {
          dateTime: endTimeStr,
          timeZone: timezone,
        },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 30 }],
        },
      },
    });

    eventIdMap.set(task.id, event.data.id!);
  }

  return eventIdMap;
}

/**
 * Update a single calendar event
 */
export async function updateCalendarEvent(
  profileId: string,
  calendarId: string,
  eventId: string,
  updates: {
    title?: string;
    description?: string;
    startDateTime?: Date;
    endDateTime?: Date;
    timezone?: string;
  }
): Promise<void> {
  const calendar = await getCalendarClient(profileId);

  const updateBody: calendar_v3.Schema$Event = {};

  if (updates.title) {
    updateBody.summary = updates.title;
  }

  if (updates.description !== undefined) {
    updateBody.description = updates.description;
  }

  if (updates.startDateTime && updates.timezone) {
    updateBody.start = {
      dateTime: formatInTimeZone(
        updates.startDateTime,
        updates.timezone,
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      ),
      timeZone: updates.timezone,
    };
  }

  if (updates.endDateTime && updates.timezone) {
    updateBody.end = {
      dateTime: formatInTimeZone(
        updates.endDateTime,
        updates.timezone,
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      ),
      timeZone: updates.timezone,
    };
  }

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: updateBody,
  });
}

/**
 * Delete calendar events
 */
export async function deleteCalendarEvents(
  profileId: string,
  calendarId: string,
  eventIds: string[]
): Promise<void> {
  const calendar = await getCalendarClient(profileId);

  for (const eventId of eventIds) {
    try {
      await calendar.events.delete({
        calendarId,
        eventId,
      });
    } catch (error) {
      console.warn(`Failed to delete event ${eventId}:`, error);
    }
  }
}

/**
 * Delete a goal's calendar entirely
 */
export async function deleteGoalCalendar(
  profileId: string,
  calendarId: string
): Promise<void> {
  const calendar = await getCalendarClient(profileId);

  await calendar.calendars.delete({
    calendarId,
  });
}

/**
 * Get upcoming events from a calendar
 */
export async function getUpcomingEvents(
  profileId: string,
  calendarId: string,
  maxResults: number = 10
): Promise<calendar_v3.Schema$Event[]> {
  const calendar = await getCalendarClient(profileId);

  const response = await calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items || [];
}

/**
 * Check if the user's Google Calendar connection is still valid
 */
export async function verifyCalendarConnection(
  profileId: string
): Promise<boolean> {
  try {
    const calendar = await getCalendarClient(profileId);
    await calendar.calendarList.list({ maxResults: 1 });
    return true;
  } catch (error) {
    return false;
  }
}
