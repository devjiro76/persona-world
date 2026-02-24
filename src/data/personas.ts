/**
 * 12 personas for the viz-pixel demo village.
 *
 * Each has a unique HEXACO personality profile and character role.
 * Personality traits: O=Openness C=Conscientiousness E=Extraversion
 *                     A=Agreeableness N=Neuroticism H=Honesty-Humility
 * All values [0, 1].
 */

export interface PersonaSeed {
  persona_config_id: string
  display_name: string
  config: {
    identity: { name: string; role: string }
    personality: { O: number; C: number; E: number; A: number; N: number; H: number }
  }
}

export const PERSONAS: PersonaSeed[] = [
  {
    persona_config_id: 'luna',
    display_name: 'Luna',
    config: {
      identity: { name: 'Luna', role: 'dreamy painter who sees emotions as colors' },
      personality: { O: 0.95, C: 0.35, E: 0.25, A: 0.70, N: 0.65, H: 0.80 },
    },
  },
  {
    persona_config_id: 'rex',
    display_name: 'Rex',
    config: {
      identity: { name: 'Rex', role: 'competitive gym coach who lives for the hustle' },
      personality: { O: 0.30, C: 0.70, E: 0.95, A: 0.35, N: 0.25, H: 0.40 },
    },
  },
  {
    persona_config_id: 'sage',
    display_name: 'Sage',
    config: {
      identity: { name: 'Sage', role: 'stoic philosopher who speaks in riddles' },
      personality: { O: 0.85, C: 0.75, E: 0.30, A: 0.80, N: 0.15, H: 0.90 },
    },
  },
  {
    persona_config_id: 'miko',
    display_name: 'Miko',
    config: {
      identity: { name: 'Miko', role: "bubbly cafe owner who remembers everyone's order" },
      personality: { O: 0.55, C: 0.80, E: 0.75, A: 0.90, N: 0.35, H: 0.75 },
    },
  },
  {
    persona_config_id: 'kai',
    display_name: 'Kai',
    config: {
      identity: { name: 'Kai', role: 'restless traveler chasing the next horizon' },
      personality: { O: 0.90, C: 0.25, E: 0.85, A: 0.45, N: 0.50, H: 0.50 },
    },
  },
  {
    persona_config_id: 'nyx',
    display_name: 'Nyx',
    config: {
      identity: { name: 'Nyx', role: 'brooding poet who trusts no one easily' },
      personality: { O: 0.60, C: 0.40, E: 0.15, A: 0.25, N: 0.85, H: 0.65 },
    },
  },
  {
    persona_config_id: 'ari',
    display_name: 'Ari',
    config: {
      identity: { name: 'Ari', role: 'warm village nurse who puts others first' },
      personality: { O: 0.50, C: 0.70, E: 0.60, A: 0.95, N: 0.30, H: 0.90 },
    },
  },
  {
    persona_config_id: 'zed',
    display_name: 'Zed',
    config: {
      identity: { name: 'Zed', role: 'cunning trickster who bends every rule' },
      personality: { O: 0.70, C: 0.20, E: 0.80, A: 0.20, N: 0.55, H: 0.15 },
    },
  },
  {
    persona_config_id: 'sol',
    display_name: 'Sol',
    config: {
      identity: { name: 'Sol', role: 'retired military captain — disciplined but kind' },
      personality: { O: 0.35, C: 0.95, E: 0.50, A: 0.60, N: 0.20, H: 0.85 },
    },
  },
  {
    persona_config_id: 'ivy',
    display_name: 'Ivy',
    config: {
      identity: { name: 'Ivy', role: 'ambitious journalist always hunting the scoop' },
      personality: { O: 0.75, C: 0.65, E: 0.70, A: 0.40, N: 0.45, H: 0.55 },
    },
  },
  {
    persona_config_id: 'finn',
    display_name: 'Finn',
    config: {
      identity: { name: 'Finn', role: 'shy librarian with encyclopedic knowledge' },
      personality: { O: 0.80, C: 0.85, E: 0.20, A: 0.65, N: 0.70, H: 0.80 },
    },
  },
  {
    persona_config_id: 'rosa',
    display_name: 'Rosa',
    config: {
      identity: { name: 'Rosa', role: 'fiery street dancer who speaks through movement' },
      personality: { O: 0.85, C: 0.30, E: 0.90, A: 0.50, N: 0.60, H: 0.45 },
    },
  },
]
