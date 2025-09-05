import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, PanResponder } from 'react-native';
import { Users, Heart, Sword, Shield, Crown, Zap, Plus } from 'lucide-react-native';
import { useWorld } from '@/hooks/world-context';
import { useAI } from '@/hooks/ai-context';
import { theme } from '@/constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface NetworkNode {
  id: string;
  name: string;
  type: 'character' | 'faction';
  x: number;
  y: number;
  connections: NetworkConnection[];
  color: string;
}

interface NetworkConnection {
  targetId: string;
  type: 'ally' | 'enemy' | 'neutral' | 'family' | 'romantic' | 'mentor' | 'rival';
  strength: number;
  description: string;
}

interface RelationshipGraphProps {
  nodes: NetworkNode[];
  onNodePress: (node: NetworkNode) => void;
  selectedNode?: NetworkNode;
}

const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  nodes,
  onNodePress,
  selectedNode
}) => {
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        setPanOffset({
          x: panOffset.x + gestureState.dx,
          y: panOffset.y + gestureState.dy
        });
      },
    })
  ).current;

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'ally': return theme.colors.success;
      case 'enemy': return theme.colors.error;
      case 'family': return theme.colors.warning;
      case 'romantic': return '#FF69B4';
      case 'mentor': return theme.colors.primary;
      case 'rival': return '#FF8C00';
      default: return theme.colors.textSecondary;
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'ally': return Shield;
      case 'enemy': return Sword;
      case 'family': return Users;
      case 'romantic': return Heart;
      case 'mentor': return Crown;
      case 'rival': return Zap;
      default: return Users;
    }
  };

  const renderConnections = () => {
    const connections: React.ReactElement[] = [];
    
    nodes.forEach(node => {
      node.connections.forEach(connection => {
        const targetNode = nodes.find(n => n.id === connection.targetId);
        if (!targetNode) return;

        const x1 = node.x + panOffset.x;
        const y1 = node.y + panOffset.y;
        const x2 = targetNode.x + panOffset.x;
        const y2 = targetNode.y + panOffset.y;

        const strokeWidth = Math.max(1, connection.strength * 3);
        const color = getConnectionColor(connection.type);

        connections.push(
          <View
            key={`${node.id}-${connection.targetId}`}
            style={[
              styles.connection,
              {
                position: 'absolute',
                left: Math.min(x1, x2),
                top: Math.min(y1, y2),
                width: Math.abs(x2 - x1),
                backgroundColor: color,
                opacity: 0.6,
                height: strokeWidth,
                transform: [
                  {
                    rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad`
                  }
                ]
              }
            ]}
          />
        );
      });
    });

    return connections;
  };

  return (
    <View style={styles.graphContainer} {...panResponder.panHandlers}>
      <ScrollView
        style={styles.graphScrollView}
        contentContainerStyle={styles.graphContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {renderConnections()}
        
        {nodes.map(node => {
          const IconComponent = node.type === 'character' ? Users : Crown;
          const isSelected = selectedNode?.id === node.id;
          
          return (
            <TouchableOpacity
              key={node.id}
              style={[
                styles.node,
                {
                  left: node.x + panOffset.x,
                  top: node.y + panOffset.y,
                  backgroundColor: node.color,
                  borderColor: isSelected ? theme.colors.primary : 'transparent',
                  borderWidth: isSelected ? 3 : 0,
                }
              ]}
              onPress={() => onNodePress(node)}
            >
              <IconComponent size={20} color={theme.colors.surface} />
              <Text style={styles.nodeLabel} numberOfLines={1}>
                {node.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

interface RelationshipDetailsProps {
  node: NetworkNode;
  allNodes: NetworkNode[];
  onAddRelationship: (fromId: string, toId: string, type: string, description: string) => void;
}

const RelationshipDetails: React.FC<RelationshipDetailsProps> = ({
  node,
  allNodes,
  onAddRelationship
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'ally': return Shield;
      case 'enemy': return Sword;
      case 'family': return Users;
      case 'romantic': return Heart;
      case 'mentor': return Crown;
      case 'rival': return Zap;
      default: return Users;
    }
  };

  return (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>{node.name}</Text>
      <Text style={styles.detailsType}>
        {node.type === 'character' ? 'Character' : 'Faction'}
      </Text>
      
      <View style={styles.connectionsSection}>
        <Text style={styles.sectionTitle}>Relationships</Text>
        
        {node.connections.map((connection, index) => {
          const targetNode = allNodes.find(n => n.id === connection.targetId);
          if (!targetNode) return null;
          
          const IconComponent = getConnectionIcon(connection.type);
          
          return (
            <View key={index} style={styles.connectionItem}>
              <View style={styles.connectionHeader}>
                <IconComponent size={16} color={theme.colors.primary} />
                <Text style={styles.connectionTarget}>{targetNode.name}</Text>
                <Text style={styles.connectionType}>{connection.type}</Text>
              </View>
              <Text style={styles.connectionDescription}>{connection.description}</Text>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    { width: `${connection.strength * 100}%` }
                  ]}
                />
              </View>
            </View>
          );
        })}
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} color={theme.colors.primary} />
          <Text style={styles.addButtonText}>Add Relationship</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const RelationshipNetworkVisualization: React.FC = () => {
  const { currentWorld, characters, factions } = useWorld();
  const { generateContent } = useAI();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'character' | 'faction'>('all');

  const networkNodes = useMemo(() => {
    const nodes: NetworkNode[] = [];
    
    // Add character nodes
    characters.forEach((character, index) => {
      const connections: NetworkConnection[] = [];
      
      // Add relationships from character data
      character.relationships.forEach(rel => {
        connections.push({
          targetId: rel.characterId,
          type: rel.type.toLowerCase() as any,
          strength: 0.8,
          description: rel.description
        });
      });
      
      // Add faction connections
      character.factionIds.forEach(factionId => {
        connections.push({
          targetId: factionId,
          type: 'ally',
          strength: 0.6,
          description: 'Member of faction'
        });
      });

      nodes.push({
        id: character.id,
        name: character.name,
        type: 'character',
        x: (index % 5) * 120 + 60,
        y: Math.floor(index / 5) * 120 + 60,
        connections,
        color: theme.colors.primary
      });
    });

    // Add faction nodes
    factions.forEach((faction, index) => {
      const connections: NetworkConnection[] = [];
      
      // Add ally/enemy relationships
      faction.allies.forEach(allyId => {
        connections.push({
          targetId: allyId,
          type: 'ally',
          strength: 0.7,
          description: 'Allied faction'
        });
      });
      
      faction.enemies.forEach(enemyId => {
        connections.push({
          targetId: enemyId,
          type: 'enemy',
          strength: 0.9,
          description: 'Enemy faction'
        });
      });

      nodes.push({
        id: faction.id,
        name: faction.name,
        type: 'faction',
        x: (index % 4) * 150 + 300,
        y: Math.floor(index / 4) * 150 + 200,
        connections,
        color: theme.colors.warning
      });
    });

    return nodes;
  }, [characters, factions]);

  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return networkNodes;
    return networkNodes.filter(node => node.type === filterType);
  }, [networkNodes, filterType]);

  const handleAddRelationship = async (fromId: string, toId: string, type: string, description: string) => {
    // Implementation would update the character/faction data
    console.log('Adding relationship:', { fromId, toId, type, description });
  };

  const generateRelationshipSuggestions = async () => {
    if (!currentWorld) return;
    
    const prompt = `Based on this world data, suggest interesting relationships between characters and factions:
    
    Characters: ${characters.map(c => `${c.name} (${c.role})`).join(', ')}
    Factions: ${factions.map(f => `${f.name} (${f.type})`).join(', ')}
    
    Suggest 5 compelling relationships that would add depth to the world. Include:
    1. Who is involved
    2. Type of relationship (ally, enemy, family, romantic, mentor, rival)
    3. Brief description of the relationship
    4. Why this relationship is interesting
    
    Return as JSON array with fields: from, to, type, description, reasoning`;
    
    try {
      const suggestions = await generateContent(prompt);
      console.log('Relationship suggestions:', suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  if (!currentWorld) {
    return (
      <View style={styles.emptyContainer}>
        <Users size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyTitle}>No World Selected</Text>
        <Text style={styles.emptyText}>Select a world to view relationship networks</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relationship Network</Text>
        
        <View style={styles.controls}>
          <View style={styles.filterControls}>
            {(['all', 'character', 'faction'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  filterType === type && styles.filterButtonActive
                ]}
                onPress={() => setFilterType(type)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterType === type && styles.filterButtonTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.suggestButton}
            onPress={generateRelationshipSuggestions}
          >
            <Zap size={16} color={theme.colors.primary} />
            <Text style={styles.suggestButtonText}>Suggest</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <RelationshipGraph
          nodes={filteredNodes}
          onNodePress={setSelectedNode}
          selectedNode={selectedNode || undefined}
        />
        
        {selectedNode && (
          <View style={styles.sidebar}>
            <RelationshipDetails
              node={selectedNode}
              allNodes={networkNodes}
              onAddRelationship={handleAddRelationship}
            />
          </View>
        )}
      </View>
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
  filterControls: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 2,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.medium,
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  suggestButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  graphContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  graphScrollView: {
    flex: 1,
  },
  graphContent: {
    minWidth: screenWidth * 2,
    minHeight: screenHeight * 2,
  },
  connection: {
    position: 'absolute',
  },
  node: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  nodeLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
    marginTop: 2,
  },
  sidebar: {
    width: 300,
    backgroundColor: theme.colors.background,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
  },
  detailsContainer: {
    padding: theme.spacing.lg,
  },
  detailsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  detailsType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  connectionsSection: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  connectionItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  connectionTarget: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    flex: 1,
  },
  connectionType: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    textTransform: 'capitalize',
  },
  connectionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  strengthBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  addButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
  },
});