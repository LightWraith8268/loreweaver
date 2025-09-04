import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Mic, MicOff, Play, Trash2, Save, Loader } from 'lucide-react-native';
import { useAI } from '@/hooks/ai-context';
import { useWorld } from '@/hooks/world-context';
import { theme } from '@/constants/theme';
import type { VoiceCapture } from '@/types/world';

interface VoiceCaptureComponentProps {
  onCaptureComplete: (capture: VoiceCapture) => void;
}

export const VoiceCaptureComponent: React.FC<VoiceCaptureComponentProps> = ({
  onCaptureComplete
}) => {
  const { currentWorld } = useWorld();
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
        transcript: 'Mock transcription text',
        audioUrl: recordingUri,
        processed: true,
        createdAt: new Date().toISOString()
      };

      onCaptureComplete(voiceCapture);
      
      setRecordingUri(null);
      setRecordingDuration(0);

      Alert.alert('Success', 'Voice note transcribed and saved!');
    } catch (error) {
      console.error('Failed to transcribe audio:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Voice Capture</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
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