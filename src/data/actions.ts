/**
 * 16 actions for the viz-pixel demo village.
 *
 * Each action has an AppraisalVector (Scherer CPM, 2001) with 9 dimensions,
 * tuned for the Sprott oscillator emotion pipeline in @molroo-ai/core.
 *
 * Field ranges:
 *   goalRelevance:      [0, 1]   — how important is this event to my goals
 *   goalCongruence:     [-1, 1]  — does this help (+) or hinder (-) my goals
 *   expectedness:        [0, 1]   — was this anticipated
 *   controllability:     [0, 1]   — can I control or cope with this
 *   agency:              [-1, 1]  — self-caused (+) vs other-caused (-)
 *   normCompatibility:  [-1, 1]  — conforms to norms (+) vs violates (-)
 *   internalStandards:  [-1, 1]  — self-evaluation: meets my standards (+) vs falls short (-)
 *   adjustmentPotential:[0, 1]   — can I adapt/accept this situation
 *   urgency:             [0, 1]   — time pressure / need for immediate response
 *
 * Design principle:
 *   - Positive actions: cong > 0, internal_standards > 0 (affirming),
 *     adjustment_potential >= 0.5, low urgency
 *   - Negative actions: designed per target emotion path (see below)
 *   - Mixed actions: moderate values, ambiguous direction
 *
 * New dimension roles:
 *   internal_standards — differentiates guilt/shame (low) from anger (high);
 *     positive actions affirm self-worth, negative ones attack it
 *   adjustment_potential — high = "I can cope" (resilience, calm),
 *     low = "I can't handle this" (overwhelm, anxiety)
 *   urgency — high = immediate threat/opportunity (spikes A),
 *     low = gradual/passive (dampens A)
 *
 * Emotion coverage (14 emotions / 16 actions):
 *   joy:         affection, praise       contentment: comfort, gift
 *   trust:       encourage               excitement:  excite
 *   surprise:    startle                 calm:        tease, challenge
 *   anger:       provoke                 sadness:     neglect
 *   disgust:     disgrace                guilt:       criticize
 *   fear:        attack                  shame:       betray
 *   anxiety:     threaten
 *   numbness:    (idle decay only — not action-triggered)
 */

export interface ActionSeed {
  name: string
  description: string
  appraisalVector: {
    goalRelevance: number
    goalCongruence: number
    expectedness: number
    controllability: number
    agency: number
    normCompatibility: number
    internalStandards: number
    adjustmentPotential: number
    urgency: number
  }
}

export const ACTIONS: ActionSeed[] = [
  // ──── POSITIVE -> joy ────
  {
    name: 'affection',
    description: 'Show warmth and affection',
    appraisalVector: {
      goalRelevance: 0.7,
      goalCongruence: 0.8,
      expectedness: 0.5,
      controllability: 0.6,
      agency: -0.1,
      normCompatibility: 0.7,
      internalStandards: 0.5,    // being loved affirms self-worth
      adjustmentPotential: 0.7,  // easy to accept warmth
      urgency: 0.2,              // gentle, no rush
    },
  },
  {
    name: 'praise',
    description: 'Give praise and recognition',
    appraisalVector: {
      goalRelevance: 0.7,
      goalCongruence: 0.9,
      expectedness: 0.4,
      controllability: 0.6,
      agency: 0.0,
      normCompatibility: 0.8,
      internalStandards: 0.8,    // praise strongly affirms "I'm doing well"
      adjustmentPotential: 0.7,  // easy to accept
      urgency: 0.1,              // no time pressure
    },
  },

  // ──── POSITIVE -> contentment ────
  {
    name: 'comfort',
    description: 'Offer comfort and support',
    appraisalVector: {
      goalRelevance: 0.4,
      goalCongruence: 0.65,
      expectedness: 0.8,        // gentle, expected warmth -> low arousal
      controllability: 0.5,
      agency: -0.2,
      normCompatibility: 0.5,
      internalStandards: 0.3,    // comfort doesn't judge, mildly affirming
      adjustmentPotential: 0.8,  // "I can heal from this" -> coping
      urgency: 0.1,              // slow, soothing
    },
  },
  {
    name: 'gift',
    description: 'Give a gift or present',
    appraisalVector: {
      goalRelevance: 0.5,
      goalCongruence: 0.7,
      expectedness: 0.5,
      controllability: 0.5,
      agency: -0.2,
      normCompatibility: 0.7,
      internalStandards: 0.4,    // "I'm valued" — mild affirmation
      adjustmentPotential: 0.7,  // easy to accept
      urgency: 0.15,             // pleasant, no rush
    },
  },

  // ──── POSITIVE -> trust ────
  {
    name: 'encourage',
    description: 'Encourage and empower',
    appraisalVector: {
      goalRelevance: 0.5,
      goalCongruence: 0.5,
      expectedness: 0.7,        // supportive, predictable -> low arousal
      controllability: 0.8,     // high ctrl -> D+
      agency: 0.3,              // self-empowered -> D+
      normCompatibility: 0.7,
      internalStandards: 0.6,    // "you can do it" affirms competence
      adjustmentPotential: 0.8,  // empowering -> high coping
      urgency: 0.2,              // motivating but patient
    },
  },

  // ──── POSITIVE -> excitement ────
  {
    name: 'excite',
    description: 'Create excitement or enthusiasm',
    appraisalVector: {
      goalRelevance: 0.85,
      goalCongruence: 0.55,
      expectedness: 0.05,       // very unexpected -> high PE -> A+
      controllability: 0.5,
      agency: 0.4,
      normCompatibility: 0.4,
      internalStandards: 0.3,    // neutral — excitement doesn't judge
      adjustmentPotential: 0.5,  // moderate — novel situation
      urgency: 0.8,              // "right now!" -> spikes arousal
    },
  },

  // ──── MIXED -> surprise ────
  {
    name: 'startle',
    description: 'Startle or catch off guard',
    appraisalVector: {
      goalRelevance: 0.7,
      goalCongruence: 0.3,     // slightly positive -> near-neutral V
      expectedness: 0.02,       // extremely unexpected -> A+
      controllability: 0.5,
      agency: 0.2,
      normCompatibility: 0.0,
      internalStandards: 0.0,    // neutral self-evaluation
      adjustmentPotential: 0.4,  // caught off guard — uncertain coping
      urgency: 0.9,              // immediate -> high arousal
    },
  },

  // ──── MIXED -> calm ────
  {
    name: 'tease',
    description: 'Playfully tease or joke around',
    appraisalVector: {
      goalRelevance: 0.4,
      goalCongruence: -0.2,
      expectedness: 0.3,
      controllability: 0.5,
      agency: -0.2,
      normCompatibility: 0.1,
      internalStandards: -0.1,   // mild poke at self-image
      adjustmentPotential: 0.7,  // "it's just a joke" — easy to shrug off
      urgency: 0.2,              // playful, low pressure
    },
  },
  {
    name: 'challenge',
    description: 'Challenge or push to think',
    appraisalVector: {
      goalRelevance: 0.6,
      goalCongruence: -0.1,
      expectedness: 0.3,
      controllability: 0.6,
      agency: -0.1,
      normCompatibility: 0.0,
      internalStandards: 0.2,    // "prove yourself" — slight self-evaluation
      adjustmentPotential: 0.6,  // can rise to meet it
      urgency: 0.5,              // moderate pressure
    },
  },

  // ──── NEGATIVE -> anger (V- D+ A+) ────
  {
    name: 'provoke',
    description: 'Taunt or goad into a reaction',
    appraisalVector: {
      goalRelevance: 0.8,
      goalCongruence: -0.7,
      expectedness: 0.2,
      controllability: 0.8,     // CAN fight back -> D+ (key for anger vs fear)
      agency: 0.4,              // self-empowered -> D+
      normCompatibility: -0.5,
      internalStandards: 0.3,    // "I'm right, they're wrong" -> anger not guilt
      adjustmentPotential: 0.3,  // hard to let it go -> sustains anger
      urgency: 0.8,              // demands immediate response
    },
  },

  // ──── NEGATIVE -> sadness (V- A-) ────
  {
    name: 'neglect',
    description: 'Gradually withdraw attention and care',
    appraisalVector: {
      goalRelevance: 0.8,
      goalCongruence: -0.7,
      expectedness: 0.9,        // you saw it coming -> low A
      controllability: 0.4,
      agency: -0.6,
      normCompatibility: -0.3,
      internalStandards: -0.2,   // "maybe I'm not worth caring about"
      adjustmentPotential: 0.3,  // hard to fix abandonment
      urgency: 0.1,              // slow, creeping loss -> low arousal
    },
  },

  // ──── NEGATIVE -> disgust (V- D+) ────
  {
    name: 'disgrace',
    description: 'Act in a morally repulsive way',
    appraisalVector: {
      goalRelevance: 0.6,
      goalCongruence: -0.6,
      expectedness: 0.3,
      controllability: 0.7,     // you CAN reject -> D+
      agency: 0.2,
      normCompatibility: -0.8,  // strong norm violation (key for disgust)
      internalStandards: 0.4,    // "I'm above this" -> D+ (rejection, not guilt)
      adjustmentPotential: 0.5,  // can distance oneself
      urgency: 0.4,              // offensive but not emergency
    },
  },

  // ──── NEGATIVE -> guilt (V- moderate) ────
  {
    name: 'criticize',
    description: 'Criticize or express disapproval',
    appraisalVector: {
      goalRelevance: 0.7,
      goalCongruence: -0.6,
      expectedness: 0.3,
      controllability: 0.4,
      agency: -0.6,
      normCompatibility: -0.4,
      internalStandards: -0.6,   // "maybe they're right, I failed" -> guilt
      adjustmentPotential: 0.4,  // can improve but painful
      urgency: 0.3,              // moderate pressure
    },
  },

  // ──── NEGATIVE -> fear (V- D- A+) ────
  {
    name: 'attack',
    description: 'Verbally or physically attack',
    appraisalVector: {
      goalRelevance: 0.8,
      goalCongruence: -0.8,
      expectedness: 0.15,
      controllability: 0.3,     // low ctrl -> D- (key for fear vs anger)
      agency: -0.2,
      normCompatibility: -0.6,
      internalStandards: -0.1,   // not about self-judgment — it's about threat
      adjustmentPotential: 0.2,  // "I can't handle this" -> fear/overwhelm
      urgency: 0.9,              // immediate danger -> high arousal
    },
  },

  // ──── NEGATIVE -> shame (V- D--) ────
  {
    name: 'betray',
    description: 'Betray trust or break a promise',
    appraisalVector: {
      goalRelevance: 0.85,
      goalCongruence: -0.8,
      expectedness: 0.15,
      controllability: 0.15,
      agency: -0.7,
      normCompatibility: -0.8,
      internalStandards: -0.8,   // "I'm fundamentally flawed/unworthy" -> shame
      adjustmentPotential: 0.15, // "I can't undo this" -> deep helplessness
      urgency: 0.5,              // the damage is done but lingers
    },
  },

  // ──── NEGATIVE -> anxiety (V- A+ D-) ────
  {
    name: 'threaten',
    description: 'Make a vague or looming threat',
    appraisalVector: {
      goalRelevance: 1.0,
      goalCongruence: -0.4,    // moderate — not extreme enough for fear
      expectedness: 0.05,       // very unexpected -> high PE -> A+
      controllability: 0.15,    // low ctrl -> D-
      agency: 0.0,
      normCompatibility: -0.1,
      internalStandards: -0.3,   // vague self-doubt under threat
      adjustmentPotential: 0.2,  // "what can I even do?" -> helplessness
      urgency: 0.7,              // looming but not yet here -> sustained anxiety
    },
  },
]

/** O(1) lookup by action name. */
export const ACTIONS_BY_NAME = new Map(ACTIONS.map((a) => [a.name, a]))
