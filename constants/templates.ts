import type { WorldTemplate, CharacterArchetype, GovernmentStructure, MagicFramework } from '@/types/world';

export const CHARACTER_ARCHETYPES: CharacterArchetype[] = [
  {
    id: 'hero',
    name: 'The Hero',
    description: 'A brave protagonist who rises to face challenges',
    commonTraits: ['Courageous', 'Determined', 'Loyal', 'Selfless'],
    typicalRoles: ['Protagonist', 'Leader', 'Champion'],
    motivations: ['Justice', 'Protecting others', 'Fulfilling destiny'],
    flaws: ['Reckless', 'Overly trusting', 'Burden of responsibility']
  },
  {
    id: 'mentor',
    name: 'The Mentor',
    description: 'A wise guide who helps others grow',
    commonTraits: ['Wise', 'Patient', 'Experienced', 'Caring'],
    typicalRoles: ['Teacher', 'Advisor', 'Elder'],
    motivations: ['Passing on knowledge', 'Guiding the next generation'],
    flaws: ['Secretive past', 'Overprotective', 'Cryptic communication']
  },
  {
    id: 'trickster',
    name: 'The Trickster',
    description: 'A clever character who uses wit and cunning',
    commonTraits: ['Clever', 'Unpredictable', 'Charismatic', 'Mischievous'],
    typicalRoles: ['Thief', 'Spy', 'Entertainer'],
    motivations: ['Personal gain', 'Chaos', 'Freedom'],
    flaws: ['Untrustworthy', 'Selfish', 'Commitment issues']
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    description: 'A protector who defends what they value',
    commonTraits: ['Protective', 'Strong', 'Dutiful', 'Reliable'],
    typicalRoles: ['Bodyguard', 'Soldier', 'Parent'],
    motivations: ['Protecting loved ones', 'Duty', 'Honor'],
    flaws: ['Inflexible', 'Overprotective', 'Difficulty trusting others']
  },
  {
    id: 'rebel',
    name: 'The Rebel',
    description: 'A character who challenges the status quo',
    commonTraits: ['Independent', 'Passionate', 'Defiant', 'Idealistic'],
    typicalRoles: ['Revolutionary', 'Outlaw', 'Activist'],
    motivations: ['Freedom', 'Change', 'Justice'],
    flaws: ['Stubborn', 'Reckless', 'Difficulty with authority']
  }
];

export const GOVERNMENT_STRUCTURES: GovernmentStructure[] = [
  {
    type: 'monarchy',
    description: 'Rule by a single sovereign, often hereditary',
    powerStructure: ['King/Queen', 'Royal Council', 'Nobles', 'Commoners'],
    laws: ['Divine right of kings', 'Hereditary succession', 'Noble privileges'],
    institutions: ['Royal Court', 'Noble Houses', 'Royal Guard']
  },
  {
    type: 'democracy',
    description: 'Rule by the people through elected representatives',
    powerStructure: ['Elected Leaders', 'Representatives', 'Citizens'],
    laws: ['Universal suffrage', 'Term limits', 'Separation of powers'],
    institutions: ['Parliament/Congress', 'Courts', 'Electoral Commission']
  },
  {
    type: 'theocracy',
    description: 'Rule by religious authority',
    powerStructure: ['High Priest/Prophet', 'Religious Council', 'Clergy', 'Faithful'],
    laws: ['Religious law supreme', 'Blasphemy forbidden', 'Tithing required'],
    institutions: ['Temple Hierarchy', 'Religious Courts', 'Inquisition']
  },
  {
    type: 'empire',
    description: 'Rule over multiple territories and peoples',
    powerStructure: ['Emperor', 'Provincial Governors', 'Local Rulers', 'Subjects'],
    laws: ['Imperial decree', 'Provincial autonomy', 'Tribute system'],
    institutions: ['Imperial Court', 'Provincial Administration', 'Imperial Army']
  }
];

export const MAGIC_FRAMEWORKS: MagicFramework[] = [
  {
    type: 'hard',
    description: 'Magic with strict rules and limitations',
    guidelines: [
      'Clear source of power',
      'Defined limitations',
      'Consistent rules',
      'Logical consequences'
    ],
    restrictions: [
      'Limited energy/mana',
      'Specific components required',
      'Training necessary',
      'Physical/mental cost'
    ],
    consequences: [
      'Exhaustion after use',
      'Potential backlash',
      'Addiction to power',
      'Social stigma'
    ]
  },
  {
    type: 'soft',
    description: 'Magic that is mysterious and wonder-focused',
    guidelines: [
      'Emphasize wonder and mystery',
      'Vague limitations',
      'Emotional/thematic power',
      'Symbolic meaning'
    ],
    restrictions: [
      'Rare and special',
      'Tied to character growth',
      'Moral limitations',
      'Narrative necessity'
    ],
    consequences: [
      'Character development',
      'Moral choices',
      'Unintended effects',
      'Greater responsibility'
    ]
  }
];

export const WORLD_TEMPLATES: WorldTemplate[] = [
  {
    id: 'high-fantasy',
    name: 'High Fantasy',
    genre: 'fantasy',
    description: 'Epic fantasy with magic, mythical creatures, and grand quests',
    presetCharacters: [
      {
        name: 'The Chosen One',
        role: 'Prophesied Hero',
        traits: ['Brave', 'Determined', 'Pure-hearted'],
        archetype: CHARACTER_ARCHETYPES[0]
      },
      {
        name: 'Ancient Wizard',
        role: 'Wise Mentor',
        traits: ['Wise', 'Mysterious', 'Powerful'],
        archetype: CHARACTER_ARCHETYPES[1]
      }
    ],
    presetLocations: [
      {
        name: 'The Capital City',
        type: 'Metropolis',
        description: 'A grand city with towering spires and bustling markets',
        significance: 'Political and economic center'
      },
      {
        name: 'The Dark Forest',
        type: 'Wilderness',
        description: 'An ancient forest filled with magical creatures and hidden dangers',
        significance: 'Source of ancient magic and mystery'
      }
    ],
    presetFactions: [
      {
        name: 'The Royal Guard',
        type: 'Military Order',
        ideology: 'Protect the realm and maintain order',
        goals: ['Defend the kingdom', 'Uphold justice']
      },
      {
        name: 'The Shadow Cult',
        type: 'Secret Society',
        ideology: 'Embrace darkness and forbidden knowledge',
        goals: ['Summon ancient evils', 'Overthrow the light']
      }
    ],
    governmentStructure: GOVERNMENT_STRUCTURES[0],
    magicFramework: MAGIC_FRAMEWORKS[0]
  },
  {
    id: 'space-opera',
    name: 'Space Opera',
    genre: 'space-opera',
    description: 'Epic science fiction with galactic empires and space adventures',
    presetCharacters: [
      {
        name: 'Captain Nova',
        role: 'Starship Captain',
        traits: ['Charismatic', 'Tactical', 'Adventurous'],
        archetype: CHARACTER_ARCHETYPES[0]
      },
      {
        name: 'Dr. Xenon',
        role: 'Chief Science Officer',
        traits: ['Brilliant', 'Logical', 'Curious'],
        archetype: CHARACTER_ARCHETYPES[1]
      }
    ],
    presetLocations: [
      {
        name: 'New Terra Station',
        type: 'Space Station',
        description: 'A massive orbital station serving as a trade hub',
        significance: 'Gateway to the outer rim territories'
      },
      {
        name: 'The Void Nebula',
        type: 'Cosmic Phenomenon',
        description: 'A mysterious nebula that disrupts navigation systems',
        significance: 'Hiding place for pirates and rebels'
      }
    ],
    presetFactions: [
      {
        name: 'Galactic Federation',
        type: 'Government',
        ideology: 'Unity and peace through cooperation',
        goals: ['Maintain galactic peace', 'Promote trade']
      },
      {
        name: 'The Void Runners',
        type: 'Pirate Fleet',
        ideology: 'Freedom from government control',
        goals: ['Raid trade routes', 'Establish free zones']
      }
    ],
    governmentStructure: GOVERNMENT_STRUCTURES[3]
  },
  {
    id: 'urban-fantasy',
    name: 'Urban Fantasy',
    genre: 'urban-fantasy',
    description: 'Modern world with hidden supernatural elements',
    presetCharacters: [
      {
        name: 'Detective Morgan',
        role: 'Supernatural Investigator',
        traits: ['Perceptive', 'Skeptical', 'Determined'],
        archetype: CHARACTER_ARCHETYPES[0]
      },
      {
        name: 'The Oracle',
        role: 'Mystical Guide',
        traits: ['Enigmatic', 'Prophetic', 'Ancient'],
        archetype: CHARACTER_ARCHETYPES[1]
      }
    ],
    presetLocations: [
      {
        name: 'The Hidden Sanctum',
        type: 'Secret Location',
        description: 'A mystical refuge hidden within the city',
        significance: 'Safe haven for supernatural beings'
      },
      {
        name: 'Midnight Market',
        type: 'Supernatural Bazaar',
        description: 'A market that only appears at night, selling magical items',
        significance: 'Hub of supernatural commerce'
      }
    ],
    presetFactions: [
      {
        name: 'The Veil Keepers',
        type: 'Secret Organization',
        ideology: 'Protect the masquerade between worlds',
        goals: ['Hide supernatural from mundane', 'Maintain balance']
      },
      {
        name: 'Chaos Syndicate',
        type: 'Criminal Organization',
        ideology: 'Exploit supernatural power for gain',
        goals: ['Control supernatural underworld', 'Profit from chaos']
      }
    ],
    governmentStructure: GOVERNMENT_STRUCTURES[1],
    magicFramework: MAGIC_FRAMEWORKS[1]
  }
];

export const MYTHOLOGY_DATABASE = {
  greek: {
    pantheon: 'Greek Olympians',
    deities: [
      { name: 'Zeus', domain: ['Sky', 'Thunder', 'Justice'], symbols: ['Eagle', 'Lightning bolt'] },
      { name: 'Athena', domain: ['Wisdom', 'Warfare', 'Crafts'], symbols: ['Owl', 'Olive tree'] },
      { name: 'Poseidon', domain: ['Sea', 'Earthquakes', 'Horses'], symbols: ['Trident', 'Dolphin'] }
    ],
    concepts: ['Hubris', 'Fate vs Free Will', 'Divine Justice']
  },
  norse: {
    pantheon: 'Norse Æsir',
    deities: [
      { name: 'Odin', domain: ['Wisdom', 'War', 'Death'], symbols: ['Ravens', 'Spear Gungnir'] },
      { name: 'Thor', domain: ['Thunder', 'Strength', 'Protection'], symbols: ['Hammer Mjolnir', 'Goats'] },
      { name: 'Freyja', domain: ['Love', 'Beauty', 'Fertility'], symbols: ['Falcon cloak', 'Cats'] }
    ],
    concepts: ['Ragnarök', 'Honor in Battle', 'Wyrd (Fate)']
  },
  egyptian: {
    pantheon: 'Egyptian Gods',
    deities: [
      { name: 'Ra', domain: ['Sun', 'Creation', 'Kingship'], symbols: ['Solar disk', 'Falcon'] },
      { name: 'Isis', domain: ['Magic', 'Motherhood', 'Healing'], symbols: ['Throne', 'Ankh'] },
      { name: 'Anubis', domain: ['Death', 'Mummification', 'Afterlife'], symbols: ['Jackal', 'Scales'] }
    ],
    concepts: ['Ma\'at (Balance)', 'Afterlife Journey', 'Divine Pharaoh']
  }
};