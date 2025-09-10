import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Mic, MicOff, Play, Trash2, Save, Loader, X } from 'lucide-react-native';
import { useAI } from '@/hooks/ai-context';
import { useWorld } from '@/hooks/world-context';
import { useAuth } from '@/hooks/auth-context';
import { firebaseService } from '@/services/firebase-advanced';
import { theme } from '@/constants/theme';
import type { VoiceCapture } from '@/types/world';

interface VoiceCaptureComponentProps {
  visible: boolean;
  onClose: () => void;
  onCaptureComplete: (capture: VoiceCapture) => void;
}

export const VoiceCaptureComponent: React.FC<VoiceCaptureComponentProps> = ({
  visible,
  onClose,
  onCaptureComplete
}) => {
  const { currentWorld, createVoiceCapture } = useWorld();
  const { user } = useAuth();
  const { isGenerating, isRecording, setIsRecording } = useAI();
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setRecordingDuration(0);

      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setRecordingUri('mock-recording-uri');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const deleteRecording = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setRecordingUri(null);
            setRecordingDuration(0);
          }
        }
      ]
    );
  };

  const transcribeAndSave = async () => {
    if (!recordingUri || !currentWorld) return;

    try {
      const voiceCapture: VoiceCapture = {
        id: Date.now().toString(),
        worldId: currentWorld.id,
        title: `Voice Note - ${new Date().toLocaleDateString()}`,
        transcript: 'Transcribing...', // Will be updated after AI processing
        audioUrl: recordingUri,
        processed: false,
        createdAt: new Date().toISOString()
      };

      // Create voice capture through world context (handles local + Firebase sync)
      await createVoiceCapture({
        worldId: currentWorld.id,
        title: voiceCapture.title,
        transcript: voiceCapture.transcript,
        audioUrl: voiceCapture.audioUrl,
        processed: voiceCapture.processed,
      });

      // Upload to Firebase Storage if user is authenticated
      if (user) {
        // Note: In a real implementation, recordingUri would contain the actual audio blob
        const mockAudioBlob = new Blob(['mock audio data'], { type: 'audio/wav' });
        await firebaseService.syncVoiceRecording(voiceCapture, mockAudioBlob);
      }

      onCaptureComplete(voiceCapture);
      
      setRecordingUri(null);
      setRecordingDuration(0);
      onClose();

      const message = user 
        ? 'Voice note uploaded and will be transcribed!'
        : 'Voice note saved locally!';
      Alert.alert('Success', message);
    } catch (error) {
      console.error('Failed to save voice recording:', error);
      Alert.alert('Error', 'Failed to save voice recording. Please try again.');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Quick Voice Capture</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.container}>
          <Text style={styles.subtitle}>Record ideas, notes, or descriptions</Text>

      <View style={styles.recordingArea}>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
            <Text style={styles.duration}>{formatDuration(recordingDuration)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isGenerating}
        >
          {isRecording ? (
            <MicOff size={32} color={theme.colors.surface} />
          ) : (
            <Mic size={32} color={theme.colors.surface} />
          )}
        </TouchableOpacity>

        <Text style={styles.recordButtonText}>
          {isRecording ? 'Tap to Stop' : 'Tap to Record'}
        </Text>
        
        {!user && (
          <Text style={styles.offlineNote}>
            Sign in to sync voice recordings across devices
          </Text>
        )}
      </View>

      {recordingUri && (
        <View style={styles.playbackArea}>
          <Text style={styles.playbackTitle}>Recording Ready</Text>
          <Text style={styles.playbackDuration}>
            Duration: {formatDuration(recordingDuration)}
          </Text>

          <View style={styles.playbackControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => console.log('Play recording')}
            >
              <Play size={20} color={theme.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={deleteRecording}
            >
              <Trash2 size={20} color={theme.colors.error} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isGenerating && styles.saveButtonDisabled]}
              onPress={transcribeAndSave}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader size={20} color={theme.colors.surface} />
              ) : (
                <Save size={20} color={theme.colors.surface} />
              )}
              <Text style={styles.saveButtonText}>
                {isGenerating ? 'Transcribing...' : 'Save & Transcribe'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  recordingArea: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.error,
  },
  recordingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    fontWeight: theme.fontWeight.medium,
  },
  duration: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.large,
  },
  recordButtonActive: {
    backgroundColor: theme.colors.error,
  },
  recordButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  offlineNote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  playbackArea: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.lg,
  },
  playbackTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  playbackDuration: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.surface,
  },
});