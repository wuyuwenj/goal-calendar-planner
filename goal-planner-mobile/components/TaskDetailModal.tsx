import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Pressable,
} from 'react-native';
import {
  X,
  XCircle,
  Clock,
  Calendar,
  ExternalLink,
  Play,
  BookOpen,
  CheckCircle,
  Info,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { Button } from './ui/Button';
import type { Task } from '../types';
import { getDayName, formatDate, formatTime } from '../utils/date';

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onToggleComplete: () => void;
  onMarkMissed: () => void;
}

interface ParsedResource {
  type: 'youtube' | 'link' | 'book' | 'app' | 'explanation';
  title: string;
  url?: string;
  content?: string;
}

/**
 * Parse task description to extract resources and explanations
 */
function parseTaskDescription(description: string | undefined): {
  mainDescription: string;
  resources: ParsedResource[];
  tips: string[];
} {
  if (!description) {
    return { mainDescription: '', resources: [], tips: [] };
  }

  const resources: ParsedResource[] = [];
  const tips: string[] = [];
  let mainDescription = description;

  // Helper to clean trailing punctuation from URLs
  const cleanUrl = (url: string): string => {
    return url.replace(/[).,;:!?\]}>'"]+$/, '');
  };

  // Extract Google search links (priority - these are our generated links)
  const googleSearchRegex = /https?:\/\/(?:www\.)?google\.com\/search\?q=([^\s).,;:!?\]}>'"]+)/gi;
  const googleMatches = description.matchAll(googleSearchRegex);
  for (const match of googleMatches) {
    if (match[0] && match[1]) {
      const searchQuery = decodeURIComponent(match[1].replace(/\+/g, ' '));
      const isYouTube = searchQuery.toLowerCase().includes('youtube');
      resources.push({
        type: isYouTube ? 'youtube' : 'link',
        title: searchQuery,
        url: cleanUrl(match[0]),
      });
    }
  }

  // Extract "search for X" or "watch X" patterns and create real search links
  const searchPatterns = [
    /(?:search|look up|find|watch|see)\s+(?:for\s+)?["']([^"']+)["']\s+(?:on\s+)?(?:youtube|video)/gi,
    /(?:youtube|video):\s*["']?([^"'\n]+)["']?/gi,
    /watch\s+["']([^"']+)["']/gi,
  ];

  searchPatterns.forEach((pattern) => {
    const matches = description.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 3) {
        resources.push({
          type: 'youtube',
          title: `Search: ${match[1].trim()}`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(match[1].trim())}`,
        });
      }
    }
  });

  // Extract YouTube links - but verify they look real (have valid video ID format)
  const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s).,;:!?\]}>'"]*)?/gi;
  const youtubeMatches = description.match(youtubeRegex);
  if (youtubeMatches) {
    youtubeMatches.forEach((url) => {
      const cleanedUrl = cleanUrl(url);
      // Only add if it has a valid 11-character video ID
      const videoIdMatch = cleanedUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (videoIdMatch) {
        resources.push({
          type: 'youtube',
          title: 'Watch Video',
          url: `https://www.youtube.com/watch?v=${videoIdMatch[1]}`,
        });
      }
    });
  }

  // Extract YouTube channel references and convert to search
  const channelRegex = /(?:youtube\.com\/(?:c\/|@))([^\s).,;:!?\]}>'"]+)/gi;
  const channelMatches = description.matchAll(channelRegex);
  for (const match of channelMatches) {
    if (match[1]) {
      resources.push({
        type: 'youtube',
        title: `Channel: ${match[1]}`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(match[1])}`,
      });
    }
  }

  // Extract other links - only keep well-known domains
  const trustedDomains = ['duolingo.com', 'coursera.org', 'udemy.com', 'khan', 'spotify.com', 'github.com', 'reddit.com', 'medium.com'];
  const linkRegex = /https?:\/\/(?!youtube|youtu\.be)[^\s).,;:!?\]}>'"]+/gi;
  const linkMatches = description.match(linkRegex);
  if (linkMatches) {
    linkMatches.forEach((url) => {
      const cleanedUrl = cleanUrl(url);
      const isTrusted = trustedDomains.some(domain => cleanedUrl.toLowerCase().includes(domain));
      if (isTrusted) {
        resources.push({
          type: 'link',
          title: extractDomainName(cleanedUrl),
          url: cleanedUrl,
        });
      }
    });
  }

  // Extract app mentions and create app store search links
  const appPatterns = [
    /(?:app|download|use)\s*[:\-]?\s*["']?([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)["']?/g,
    /["']([A-Z][a-zA-Z]+)["']\s+app/g,
  ];
  const knownApps = ['duolingo', 'anki', 'headspace', 'calm', 'strava', 'nike', 'fitbit', 'myfitnesspal', 'spotify', 'audible'];

  appPatterns.forEach((pattern) => {
    const matches = description.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && knownApps.some(app => match[1].toLowerCase().includes(app))) {
        resources.push({
          type: 'app',
          title: `App: ${match[1].trim()}`,
          url: `https://www.google.com/search?q=${encodeURIComponent(match[1].trim() + ' app')}`,
        });
      }
    }
  });

  // Extract book references (common patterns)
  const bookPatterns = [
    /(?:read|book|chapter|pages?)\s*[:\-]?\s*["']([^"'\n,]+)["']/gi,
    /["']([^"']+)["']\s*by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
  ];
  const seenBooks = new Set<string>();
  bookPatterns.forEach((pattern) => {
    const matches = description.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 5 && match[1].length < 100) {
        const bookTitle = match[1].trim();
        if (!seenBooks.has(bookTitle.toLowerCase())) {
          seenBooks.add(bookTitle.toLowerCase());
          resources.push({
            type: 'book',
            title: bookTitle,
            url: `https://www.google.com/search?q=${encodeURIComponent(bookTitle + ' book')}`,
          });
        }
      }
    }
  });

  // Extract "Search YouTube for X" patterns
  const ytSearchPattern = /search\s+(?:youtube|yt)\s+for\s+["']([^"']+)["']/gi;
  const ytSearchMatches = description.matchAll(ytSearchPattern);
  for (const match of ytSearchMatches) {
    if (match[1]) {
      resources.push({
        type: 'youtube',
        title: `Search: ${match[1]}`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(match[1])}`,
      });
    }
  }

  // Extract YouTube channel mentions
  const channelPatterns = [
    /([A-Z][a-zA-Z\s]+)\s+(?:youtube\s+)?channel/gi,
    /(?:youtube\s+channel|channel)\s*[:\-]?\s*["']?([A-Z][a-zA-Z\s]+)["']?/gi,
    /(?:watch|see|check out)\s+([A-Z][a-zA-Z\s]+)\s+(?:on\s+)?youtube/gi,
  ];
  const seenChannels = new Set<string>();
  channelPatterns.forEach((pattern) => {
    const matches = description.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 3 && match[1].length < 50) {
        const channelName = match[1].trim();
        if (!seenChannels.has(channelName.toLowerCase())) {
          seenChannels.add(channelName.toLowerCase());
          resources.push({
            type: 'youtube',
            title: `Channel: ${channelName}`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(channelName)}`,
          });
        }
      }
    }
  });

  // Extract tips (lines starting with - or *)
  const tipLines = description.split('\n').filter((line) =>
    line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•')
  );
  tipLines.forEach((tip) => {
    const cleanTip = tip.replace(/^[\-\*•]\s*/, '').trim();
    if (cleanTip.length > 10) {
      tips.push(cleanTip);
    }
  });

  // Clean main description (remove URLs for display)
  mainDescription = description
    .replace(googleSearchRegex, '')
    .replace(youtubeRegex, '')
    .replace(linkRegex, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('-') && !line.trim().startsWith('*'))
    .join('\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { mainDescription, resources, tips };
}

function extractDomainName(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return 'External Link';
  }
}

export function TaskDetailModal({
  visible,
  task,
  onClose,
  onToggleComplete,
  onMarkMissed,
}: TaskDetailModalProps) {
  if (!task) return null;

  const dayName = getDayName(task.scheduledDate);
  const formattedDate = formatDate(task.scheduledDate);

  const { mainDescription, resources: parsedResources, tips } = parseTaskDescription(task.description);
  const isCompleted = task.status === 'completed';
  const isMissed = task.status === 'missed';

  // Debug: log task data to see if resourceUrl is present
  console.log('TaskDetailModal - task:', task.id, 'resourceUrl:', task.resourceUrl);

  // If task has a dedicated resourceUrl, use that instead of parsed resources
  const resources: ParsedResource[] = task.resourceUrl
    ? [{
        type: task.resourceUrl.toLowerCase().includes('youtube') ? 'youtube' : 'link',
        title: decodeURIComponent(
          task.resourceUrl.match(/[?&]q=([^&]+)/)?.[1]?.replace(/\+/g, ' ') || 'View Resource'
        ),
        url: task.resourceUrl,
      }]
    : parsedResources;

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const getResourceIcon = (type: ParsedResource['type']) => {
    switch (type) {
      case 'youtube':
        return <Play size={18} color={COLORS.system.error} />;
      case 'book':
        return <BookOpen size={18} color={COLORS.primary.forest} />;
      default:
        return <ExternalLink size={18} color={COLORS.primary.sage} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.statusIndicator,
                  isCompleted && styles.statusCompleted,
                  isMissed && styles.statusMissed,
                ]}
              />
              <Text style={styles.headerTitle}>Task Details</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.neutral[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Task Title */}
            <Text style={styles.taskTitle}>{task.title}</Text>

            {/* Schedule Info */}
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleItem}>
                <Calendar size={16} color={COLORS.secondary.warm} />
                <Text style={styles.scheduleText}>
                  {dayName}, {formattedDate}
                </Text>
              </View>
              <View style={styles.scheduleItem}>
                <Clock size={16} color={COLORS.secondary.warm} />
                <Text style={styles.scheduleText}>
                  {formatTime(task.scheduledTime)} · {task.durationMinutes} min
                </Text>
              </View>
            </View>

            {/* Main Description */}
            {mainDescription && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Info size={18} color={COLORS.primary.forest} />
                  <Text style={styles.sectionTitle}>What to Do</Text>
                </View>
                <Text style={styles.description}>{mainDescription}</Text>
              </View>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ExternalLink size={18} color={COLORS.primary.forest} />
                  <Text style={styles.sectionTitle}>Resources</Text>
                </View>
                <View style={styles.resourcesList}>
                  {resources.map((resource, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.resourceItem,
                        resource.type === 'youtube' && styles.resourceYoutube,
                      ]}
                      onPress={() => resource.url && handleOpenLink(resource.url)}
                      disabled={!resource.url}
                    >
                      {getResourceIcon(resource.type)}
                      <View style={styles.resourceContent}>
                        <Text style={styles.resourceTitle}>{resource.title}</Text>
                        {resource.url && (
                          <Text style={styles.resourceUrl} numberOfLines={1}>
                            {resource.url}
                          </Text>
                        )}
                      </View>
                      {resource.url && (
                        <ExternalLink size={16} color={COLORS.neutral[400]} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Tips */}
            {tips.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <CheckCircle size={18} color={COLORS.primary.forest} />
                  <Text style={styles.sectionTitle}>Tips</Text>
                </View>
                <View style={styles.tipsList}>
                  {tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <View style={styles.tipBullet} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Week Info */}
            <View style={styles.weekBadge}>
              <Text style={styles.weekText}>Week {task.weekNumber}</Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            {!isMissed && !isCompleted && (
              <View style={styles.buttonRow}>
                <Button
                  onPress={() => {
                    onToggleComplete();
                    onClose();
                  }}
                  variant="primary"
                  fullWidth
                >
                  Mark as Complete
                </Button>
                <TouchableOpacity
                  onPress={() => {
                    onMarkMissed();
                    onClose();
                  }}
                  style={styles.missedButton}
                >
                  <XCircle size={18} color={COLORS.system.error} />
                  <Text style={styles.missedButtonText}>Mark as Missed</Text>
                </TouchableOpacity>
              </View>
            )}
            {isCompleted && !isMissed && (
              <View style={styles.buttonRow}>
                <Button
                  onPress={() => {
                    onToggleComplete();
                    onClose();
                  }}
                  variant="secondary"
                  fullWidth
                >
                  Mark as Incomplete
                </Button>
                <TouchableOpacity
                  onPress={() => {
                    onMarkMissed();
                    onClose();
                  }}
                  style={styles.missedButton}
                >
                  <XCircle size={18} color={COLORS.system.error} />
                  <Text style={styles.missedButtonText}>Mark as Missed</Text>
                </TouchableOpacity>
              </View>
            )}
            {isMissed && (
              <View style={styles.missedMessage}>
                <XCircle size={20} color={COLORS.system.error} />
                <Text style={styles.missedText}>
                  This task was missed. You can still review it during your weekly check-in.
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary.sand,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary.sage,
  },
  statusCompleted: {
    backgroundColor: COLORS.primary.forest,
  },
  statusMissed: {
    backgroundColor: COLORS.system.error,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.secondary.bark,
    marginBottom: 12,
    lineHeight: 28,
  },
  scheduleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary.sand,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    fontSize: 14,
    color: COLORS.secondary.warm,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.forest,
  },
  description: {
    fontSize: 15,
    color: COLORS.secondary.bark,
    lineHeight: 24,
  },
  resourcesList: {
    gap: 10,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: COLORS.secondary.cream,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary.sand,
  },
  resourceYoutube: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  resourceUrl: {
    fontSize: 12,
    color: COLORS.neutral[400],
    marginTop: 2,
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary.sage,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary.bark,
    lineHeight: 22,
  },
  weekBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary.light,
    borderRadius: 8,
    marginTop: 8,
  },
  weekText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary.forest,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary.sand,
  },
  buttonRow: {
    gap: 12,
  },
  missedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.red[200],
    backgroundColor: COLORS.system.errorLight,
  },
  missedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.system.error,
  },
  missedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.system.errorLight,
    borderRadius: 12,
  },
  missedText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.system.error,
  },
});
