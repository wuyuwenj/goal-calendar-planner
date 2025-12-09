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
    // Combine date and time
    const dateStr = format(task.scheduledDate, 'yyyy-MM-dd');
    const startDateTime = parse(
      `${dateStr} ${task.scheduledTime}`,
      'yyyy-MM-dd HH:mm',
      new Date()
    );
    const endDateTime = addMinutes(startDateTime, task.durationMinutes);

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: task.title,
        description: task.description,
        start: {
          dateTime: formatInTimeZone(
            startDateTime,
            timezone,
            "yyyy-MM-dd'T'HH:mm:ssXXX"
          ),
          timeZone: timezone,
        },
        end: {
          dateTime: formatInTimeZone(
            endDateTime,
            timezone,
            "yyyy-MM-dd'T'HH:mm:ssXXX"
          ),
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
