import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Sparkles, RefreshCw, Copy, X } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAI } from '@/hooks/ai-context';
import type { EntityType } from '@/types/world';

interface NameGeneratorProps {
  visible: boolean;
  onClose: () => void;
  onSelectName: (name: string) => void;
  entityType: EntityType;
  genre?: string;
}

const namePatterns = {
  character: {
    fantasy: [
      'Aelindra', 'Theron', 'Lyralei', 'Gareth', 'Seraphina', 'Darius', 'Elara', 'Kael',
      'Morgana', 'Aldric', 'Celestine', 'Varian', 'Isolde', 'Tristan', 'Evangeline', 'Orion'
    ],
    'sci-fi': [
      'Zara-7', 'Commander Vex', 'Dr. Kaine', 'Nova Chen', 'Captain Rex', 'Aria Prime',
      'Cypher-9', 'Admiral Stark', 'Echo-3', 'Phoenix Liu', 'Quantum', 'Nexus-Alpha'
    ],
    cyberpunk: [
      'Neon', 'Razor', 'Ghost', 'Chrome', 'Viper', 'Synth', 'Blade', 'Matrix',
      'Cipher', 'Volt', 'Hack', 'Zero', 'Pulse', 'Glitch', 'Wire', 'Code'
    ],
    mythology: [
      'Artemisia', 'Thaddeus', 'Persephone', 'Achilles', 'Athena', 'Odysseus',
      'Cassandra', 'Perseus', 'Andromeda', 'Hermes', 'Hecate', 'Apollo'
    ]
  },
  location: {
    fantasy: [
      'Silverbrook', 'Dragonspire', 'Moonhaven', 'Ironhold', 'Starfall', 'Shadowmere',
      'Goldenvale', 'Stormwatch', 'Crystalfall', 'Thornwick', 'Brightwater', 'Darkwood'
    ],
    'sci-fi': [
      'New Terra', 'Orbital Station 7', 'Quantum City', 'Mars Colony Beta', 'Titan Base',
      'Nebula Outpost', 'Starport Prime', 'Void Station', 'Crystal Spire', 'Nova Hub'
    ],
    cyberpunk: [
      'Neo Tokyo', 'Chrome District', 'The Undergrid', 'Neon Alley', 'Data Haven',
      'Cyber Plaza', 'The Matrix', 'Ghost Town', 'Electric Avenue', 'Binary Heights'
    ],
    mythology: [
      'Mount Olympus', 'Elysian Fields', 'The Underworld', 'Valhalla', 'Asgard',
      'Atlantis', 'The Labyrinth', 'Temple of Apollo', 'Garden of Hesperides'
    ]
  },
  item: {
    fantasy: [
      'Moonblade', 'Dragon\'s Heart', 'Staff of Storms', 'Crown of Stars', 'Ring of Power',
      'Cloak of Shadows', 'Hammer of Thunder', 'Bow of the Hunt', 'Shield of Light'
    ],
    'sci-fi': [
      'Plasma Rifle', 'Quantum Core', 'Neural Interface', 'Gravity Generator', 'Phase Shifter',
      'Energy Shield', 'Nano Enhancer', 'Warp Drive', 'Bio Scanner', 'Fusion Cell'
    ],
    cyberpunk: [
      'Neural Jack', 'Data Chip', 'Cyber Implant', 'Holo Display', 'Memory Core',
      'Stealth Module', 'Combat Stim', 'Hack Tool', 'Virus Program', 'AI Assistant'
    ],
    mythology: [
      'Excalibur', 'Mjolnir', 'Aegis', 'Pandora\'s Box', 'Golden Fleece',
      'Trident of Poseidon', 'Helm of Hades', 'Caduceus', 'Bow of Artemis'
    ]
  },
  faction: {
    fantasy: [
      'Order of the Silver Dragon', 'Shadow Brotherhood', 'Circle of Mages', 'Iron Guard',
      'Moonlight Covenant', 'Crimson Blade', 'Golden Eagles', 'Storm Riders'
    ],
    'sci-fi': [
      'Galactic Federation', 'Stellar Alliance', 'Void Hunters', 'Quantum Corps',
      'Neural Network', 'Star Forge', 'Cosmic Order', 'Nebula Syndicate'
    ],
    cyberpunk: [
      'Ghost Protocol', 'Neon Runners', 'Data Pirates', 'Chrome Collective',
      'Binary Brotherhood', 'Cyber Syndicate', 'Digital Underground', 'Wire Wolves'
    ],
    mythology: [
      'Children of Olympus', 'Guardians of Valhalla', 'Disciples of Ra',
      'Order of the Phoenix', 'Servants of Fate', 'Keepers of Wisdom'
    ]
  }
};

export default function NameGenerator({
  visible,
  onClose,
  onSelectName,
  entityType,
  genre = 'fantasy'
}: NameGeneratorProps) {
  const { generateName, isGenerating } = useAI();
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  const getRandomNames = () => {
    const supportedTypes = ['character', 'location', 'item', 'faction'] as const;
    if (!supportedTypes.includes(entityType as any)) {
      return ['Mysterious Entity', 'Unknown Thing', 'Secret Name', 'Hidden Truth', 'Ancient Mystery', 'Lost Knowledge'];
    }
    
    const patterns = namePatterns[entityType as keyof typeof namePatterns]?.[genre as keyof typeof namePatterns.character] || 
                    namePatterns[entityType as keyof typeof namePatterns]?.fantasy || [];
    
    if (patterns.length === 0) return [];
    
    const shuffled = [...patterns].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  };

  const generateAINames = async () => {
    setIsGeneratingBatch(true);
    try {
      const names: string[] = [];
      for (let i = 0; i < 6; i++) {
        const name = await generateName(entityType);
        names.push(name);
      }
      setGeneratedNames(names);
    } catch {
      Alert.alert('Error', 'Failed to generate names');
      setGeneratedNames(getRandomNames());
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  const handleRefresh = () => {
    if (isGenerating || isGeneratingBatch) return;
    setGeneratedNames(getRandomNames());
  };

  const handleAIGenerate = () => {
    if (isGenerating || isGeneratingBatch) return;
    generateAINames();
  };

  const copyToClipboard = (name: string) => {
    // In a real app, you'd use expo-clipboard
    Alert.alert('Copied', `"${name}" copied to clipboard`);
  };

  React.useEffect(() => {
    if (visible && generatedNames.length === 0) {
      const names = getRandomNames();
      setGeneratedNames(names);
    }
  }, [visible, entityType, genre, generatedNames.length]);

  const getEntityTypeLabel = () => {
    const labels: Record<EntityType, string> = {
      character: 'Character',
      location: 'Location',
      item: 'Item',
      faction: 'Faction',
      lore: 'Lore',
      timeline: 'Timeline',
      snapshot: 'Snapshot'
    };
    return labels[entityType] || 'Entity';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {getEntityTypeLabel()} Name Generator
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.genreInfo}>
            <Text style={styles.genreText}>Genre: {genre}</Text>
          </View>

          <ScrollView style={styles.namesList} showsVerticalScrollIndicator={false}>
            {generatedNames.map((name, index) => (
              <View key={index} style={styles.nameItem}>
                <TouchableOpacity
                  style={styles.nameButton}
                  onPress={() => onSelectName(name)}
                >
                  <Text style={styles.nameText}>{name}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(name)}
                >
                  <Copy size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={isGenerating || isGeneratingBatch}
            >
              {isGeneratingBatch ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <RefreshCw size={20} color={theme.colors.text} />
              )}
              <Text style={styles.refreshButtonText}>Random</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiButton}
              onPress={handleAIGenerate}
              disabled={isGenerating || isGeneratingBatch}
            >
              {isGenerating || isGeneratingBatch ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <Sparkles size={20} color={theme.colors.background} />
              )}
              <Text style={styles.aiButtonText}>AI Generate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
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
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  genreInfo: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceLight,
  },
  genreText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  namesList: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  nameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  nameButton: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },
  nameText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  copyButton: {
    padding: theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  refreshButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  aiButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  aiButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.background,
  },
});
