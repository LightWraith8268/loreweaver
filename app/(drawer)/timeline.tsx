import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Clock, Calendar, Users, MapPin, X, Save } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { theme } from '@/constants/theme';
import { SelectWorldPrompt } from '@/components/SelectWorldPrompt';
import type { TimelineEvent } from '@/types/world';

export default function TimelineScreen() {
  const { currentWorld, timelines, createTimeline, updateTimeline } = useWorld();
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventSignificance, setEventSignificance] = useState<TimelineEvent['significance']>('minor');
  const [isSaving, setIsSaving] = useState(false);
  
  const timeline = timelines.length > 0 ? timelines[0] : null;
  const events = timeline?.events || [];
  
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));
  
  const significanceColors = {
    minor: theme.colors.textTertiary,
    moderate: theme.colors.secondary,
    major: theme.colors.warning,
    worldchanging: theme.colors.error,
  };
  
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setEventDate('');
    setEventTitle('');
    setEventDescription('');
    setEventSignificance('minor');
    setShowEventModal(true);
  };
  
  const handleEditEvent = (event: TimelineEvent) => {
    setEditingEvent(event);
    setEventDate(event.date);
    setEventTitle(event.title);
    setEventDescription(event.description);
    setEventSignificance(event.significance);
    setShowEventModal(true);
  };
  
  const handleSaveEvent = async () => {
    if (!eventTitle.trim() || !eventDate.trim()) {
      Alert.alert('Error', 'Please enter both title and date');
      return;
    }
    
    if (!currentWorld) {
      Alert.alert('Error', 'No world selected');
      return;
    }
    
    setIsSaving(true);
    try {
      const newEvent: TimelineEvent = {
        id: editingEvent?.id || Date.now().toString(),
        date: eventDate,
        title: eventTitle,
        description: eventDescription,
        significance: eventSignificance,
        involvedCharacters: editingEvent?.involvedCharacters || [],
        involvedLocations: editingEvent?.involvedLocations || [],
      };
      
      if (timeline) {
        const updatedEvents = editingEvent
          ? timeline.events.map(e => e.id === editingEvent.id ? newEvent : e)
          : [...timeline.events, newEvent];
        
        await updateTimeline(timeline.id, { events: updatedEvents });
      } else {
        await createTimeline({
          worldId: currentWorld.id,
          events: [newEvent],
        });
      }
      
      setShowEventModal(false);
      resetModal();
    } catch {
      Alert.alert('Error', 'Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteEvent = (event: TimelineEvent) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (timeline) {
              const updatedEvents = timeline.events.filter(e => e.id !== event.id);
              await updateTimeline(timeline.id, { events: updatedEvents });
            }
          },
        },
      ]
    );
  };
  
  const resetModal = () => {
    setEventDate('');
    setEventTitle('');
    setEventDescription('');
    setEventSignificance('minor');
    setEditingEvent(null);
  };
  
  if (!currentWorld) {
    return (
      <SelectWorldPrompt
        title="No World Selected"
        description="Select or create a world to build and manage your timeline"
        customIcon={<Clock size={64} color={theme.colors.textTertiary} />}
        showCreateButton={false}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>World Timeline</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateEvent}
        >
          <Plus size={20} color={theme.colors.background} />
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sortedEvents.length > 0 ? (
          <View style={styles.timeline}>
            {sortedEvents.map((event, index) => (
              <View key={event.id} style={styles.eventContainer}>
                <View style={styles.eventLine}>
                  <View style={[styles.eventDot, { backgroundColor: significanceColors[event.significance] }]} />
                  {index < sortedEvents.length - 1 && <View style={styles.eventConnector} />}
                </View>
                
                <TouchableOpacity
                  style={styles.eventCard}
                  onPress={() => handleEditEvent(event)}
                  onLongPress={() => handleDeleteEvent(event)}
                >
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventDate}>{event.date}</Text>
                    <View style={[styles.significanceBadge, { backgroundColor: significanceColors[event.significance] }]}>
                      <Text style={styles.significanceText}>{event.significance}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  
                  {event.description && (
                    <Text style={styles.eventDescription} numberOfLines={3}>
                      {event.description}
                    </Text>
                  )}
                  
                  <View style={styles.eventMeta}>
                    {event.involvedCharacters.length > 0 && (
                      <View style={styles.metaItem}>
                        <Users size={14} color={theme.colors.primary} />
                        <Text style={styles.metaText}>{event.involvedCharacters.length} characters</Text>
                      </View>
                    )}
                    {event.involvedLocations.length > 0 && (
                      <View style={styles.metaItem}>
                        <MapPin size={14} color={theme.colors.secondary} />
                        <Text style={styles.metaText}>{event.involvedLocations.length} locations</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Events Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create your first timeline event to chronicle your world's history
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Event Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowEventModal(false);
          resetModal();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingEvent ? 'Edit Event' : 'New Event'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowEventModal(false);
                resetModal();
              }}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor={theme.colors.textTertiary}
              value={eventTitle}
              onChangeText={setEventTitle}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Date (e.g., Year 1234, Age of Heroes)"
              placeholderTextColor={theme.colors.textTertiary}
              value={eventDate}
              onChangeText={setEventDate}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Event Description"
              placeholderTextColor={theme.colors.textTertiary}
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.inputLabel}>Significance</Text>
            <View style={styles.significanceOptions}>
              {(['minor', 'moderate', 'major', 'worldchanging'] as const).map((significance) => (
                <TouchableOpacity
                  key={significance}
                  style={[
                    styles.significanceOption,
                    eventSignificance === significance && { backgroundColor: significanceColors[significance] }
                  ]}
                  onPress={() => setEventSignificance(significance)}
                >
                  <Text style={[
                    styles.significanceOptionText,
                    eventSignificance === significance && { color: theme.colors.background }
                  ]}>
                    {significance}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowEventModal(false);
                  resetModal();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleSaveEvent}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={theme.colors.background} />
                ) : (
                  <>
                    <Save size={16} color={theme.colors.background} />
                    <Text style={styles.confirmButtonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  emptyDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  selectWorldButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.lg,
  },
  selectWorldButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  addButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  timeline: {
    paddingLeft: theme.spacing.md,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  eventLine: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: theme.spacing.sm,
  },
  eventConnector: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  eventCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  eventDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  significanceBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  significanceText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
  eventTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  eventDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyStateDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  significanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  significanceOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  significanceOptionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  confirmButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
});