import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Calendar, Clock, Users, MapPin, Zap, Plus, Filter, Search } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';
import type { TimelineEvent, AlternateEvent } from '@/types/world';

const { width: screenWidth } = Dimensions.get('window');

interface TimelineVisualizationProps {
  events: TimelineEvent[];
  onEventPress: (event: TimelineEvent) => void;
  zoomLevel: 'era' | 'year' | 'day';
}

const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  events,
  onEventPress,
  zoomLevel
}) => {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const getEventColor = (significance: string) => {
    switch (significance) {
      case 'worldchanging': return theme.colors.error;
      case 'major': return theme.colors.warning;
      case 'moderate': return theme.colors.primary;
      case 'minor': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    switch (zoomLevel) {
      case 'era': return d.getFullYear().toString();
      case 'year': return d.toLocaleDateString();
      case 'day': return d.toLocaleString();
      default: return d.toLocaleDateString();
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineContainer}>
      <View style={styles.timeline}>
        {sortedEvents.map((event, index) => (
          <TouchableOpacity
            key={event.id}
            style={[
              styles.timelineEvent,
              { backgroundColor: getEventColor(event.significance) }
            ]}
            onPress={() => onEventPress(event)}
          >
            <View style={styles.eventDot} />
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
              <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
              {event.era && <Text style={styles.eventEra}>{event.era}</Text>}
            </View>
            {index < sortedEvents.length - 1 && <View style={styles.timelineLine} />}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

interface AlternateTimelineProps {
  baseEvent: TimelineEvent;
  onCreateAlternate: (alternate: Partial<AlternateEvent>) => void;
}

const AlternateTimeline: React.FC<AlternateTimelineProps> = ({ baseEvent, onCreateAlternate }) => {
  const { generateContent } = useAI();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAlternateEvent = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Create an alternate version of this historical event: "${baseEvent.title}" - ${baseEvent.description}. 
      
      Generate a "what-if" scenario that could have happened instead. Include:
      1. A different title for the alternate event
      2. How it would have unfolded differently
      3. The probability of this alternate occurring (0-100)
      4. The consequences this would have had on the world
      
      Return as JSON with fields: title, description, probability, consequences (array)`;
      
      const result = await generateContent(prompt);
      const alternateData = JSON.parse(result);
      onCreateAlternate(alternateData);
    } catch (error) {
      console.error('Error generating alternate event:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.alternateContainer}>
      <Text style={styles.alternateTitle}>Alternate Timelines</Text>
      <Text style={styles.alternateSubtitle}>What if &quot;{baseEvent.title}&quot; happened differently?</Text>
      
      {baseEvent.alternateVersions?.map((alternate, index) => (
        <View key={alternate.id} style={styles.alternateEvent}>
          <Text style={styles.alternateEventTitle}>{alternate.title}</Text>
          <Text style={styles.alternateEventDescription}>{alternate.description}</Text>
          <Text style={styles.alternateProbability}>Probability: {alternate.probability}%</Text>
          <View style={styles.consequencesContainer}>
            <Text style={styles.consequencesTitle}>Consequences:</Text>
            {alternate.consequences.map((consequence, idx) => (
              <Text key={idx} style={styles.consequence}>• {consequence}</Text>
            ))}
          </View>
        </View>
      ))}
      
      <TouchableOpacity
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        onPress={generateAlternateEvent}
        disabled={isGenerating}
      >
        <Plus size={16} color={theme.colors.surface} />
        <Text style={styles.generateButtonText}>
          {isGenerating ? 'Generating...' : 'Generate Alternate Timeline'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const AdvancedTimeline: React.FC = () => {
  const { currentWorld, timelines, updateTimeline } = useWorld();
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'era' | 'year' | 'day'>('year');
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [filterEra, setFilterEra] = useState<string>('');

  const allEvents = useMemo(() => {
    return timelines.flatMap(timeline => timeline.events);
  }, [timelines]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      if (filterRegion && event.region !== filterRegion) return false;
      if (filterEra && event.era !== filterEra) return false;
      return true;
    });
  }, [allEvents, filterRegion, filterEra]);

  const regions = useMemo(() => {
    return [...new Set(allEvents.map(e => e.region).filter(Boolean))];
  }, [allEvents]);

  const eras = useMemo(() => {
    return [...new Set(allEvents.map(e => e.era).filter(Boolean))];
  }, [allEvents]);

  const handleCreateAlternate = async (eventId: string, alternateData: Partial<AlternateEvent>) => {
    const timeline = timelines.find(t => t.events.some(e => e.id === eventId));
    if (!timeline) return;

    const updatedEvents = timeline.events.map(event => {
      if (event.id === eventId) {
        const newAlternate: AlternateEvent = {
          id: Date.now().toString(),
          title: alternateData.title || '',
          description: alternateData.description || '',
          probability: alternateData.probability || 50,
          consequences: alternateData.consequences || []
        };
        
        return {
          ...event,
          alternateVersions: [...(event.alternateVersions || []), newAlternate]
        };
      }
      return event;
    });

    await updateTimeline(timeline.id, { events: updatedEvents });
  };

  if (!currentWorld) {
    return (
      <View style={styles.emptyContainer}>
        <Calendar size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyTitle}>No World Selected</Text>
        <Text style={styles.emptyText}>Select a world to view its timeline</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Advanced Timeline</Text>
        
        <View style={styles.controls}>
          <View style={styles.zoomControls}>
            {(['era', 'year', 'day'] as const).map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.zoomButton,
                  zoomLevel === level && styles.zoomButtonActive
                ]}
                onPress={() => setZoomLevel(level)}
              >
                <Text style={[
                  styles.zoomButtonText,
                  zoomLevel === level && styles.zoomButtonTextActive
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.filters}>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={16} color={theme.colors.primary} />
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TimelineVisualization
        events={filteredEvents}
        onEventPress={setSelectedEvent}
        zoomLevel={zoomLevel}
      />

      {selectedEvent && (
        <View style={styles.eventDetails}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventDetailTitle}>{selectedEvent.title}</Text>
            <TouchableOpacity onPress={() => setSelectedEvent(null)}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.eventDescription}>{selectedEvent.description}</Text>
          
          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{selectedEvent.date}</Text>
            </View>
            
            {selectedEvent.involvedCharacters.length > 0 && (
              <View style={styles.metaItem}>
                <Users size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>
                  {selectedEvent.involvedCharacters.join(', ')}
                </Text>
              </View>
            )}
            
            {selectedEvent.involvedLocations.length > 0 && (
              <View style={styles.metaItem}>
                <MapPin size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>
                  {selectedEvent.involvedLocations.join(', ')}
                </Text>
              </View>
            )}
            
            <View style={styles.metaItem}>
              <Zap size={16} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>
                {selectedEvent.significance} significance
              </Text>
            </View>
          </View>

          <AlternateTimeline
            baseEvent={selectedEvent}
            onCreateAlternate={(alternateData) => 
              handleCreateAlternate(selectedEvent.id, alternateData)
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoomControls: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 2,
  },
  zoomButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  zoomButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  zoomButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  zoomButtonTextActive: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.medium,
  },
  filters: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  filterButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
  },
  timelineContainer: {
    flex: 1,
  },
  timeline: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    minWidth: screenWidth * 2,
  },
  timelineEvent: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    position: 'relative',
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  eventContent: {
    alignItems: 'center',
    maxWidth: 120,
  },
  eventTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  eventDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  eventEra: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  timelineLine: {
    position: 'absolute',
    top: 6,
    left: '100%',
    width: theme.spacing.md * 2,
    height: 2,
    backgroundColor: theme.colors.border,
  },
  eventDetails: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  eventDetailTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textSecondary,
    paddingLeft: theme.spacing.md,
  },
  eventDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  eventMeta: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  alternateContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.lg,
  },
  alternateTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  alternateSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  alternateEvent: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  alternateEventTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  alternateEventDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  alternateProbability: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.sm,
  },
  consequencesContainer: {
    marginTop: theme.spacing.sm,
  },
  consequencesTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  consequence: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.surface,
  },
});