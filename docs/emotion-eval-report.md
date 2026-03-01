# Emotion Engine Qualitative Evaluation Report

**Date:** 2026-02-24
**Village:** `6b4ef66c-3140-4e02-bc90-56dfe1903815` (local dev)
**Engine:** `@molroo-io/core` Sprott oscillator + Gross regulation pipeline
**Appraisal model:** 9-dimensional Scherer CPM vector
**API:** `api/world` local (wrangler dev, localhost:8788)

---

## 1. Experiment Overview

### Goal

Verify that the emotion engine produces **personality-differentiated, psychologically plausible** emotional responses when the same actions are applied to 12 personas with diverse HEXACO personality profiles.

### Method

- **Full matrix**: 12 personas × 16 actions = **192 interactions**
- **Sequential application**: Actions applied in fixed order per persona (affection → praise → ... → threaten), so each persona receives all 16 actions in sequence
- **Actor**: `user-1` (actorType: `user`) for all interactions
- **Initial state**: All personas start from neutral (fresh seed, no prior interactions)

### Important Notes

- This is a **sequential** test — each action builds on the prior emotional state (emotional inertia)
- The order is: positive actions first (affection, praise, comfort, gift, encourage, excite), then mixed (startle, tease, challenge), then negative (provoke, neglect, disgrace, criticize, attack, betray, threaten)
- Later negative actions may appear dampened because earlier positive actions raised the baseline

---

## 2. Persona Profiles (HEXACO)

| ID | Name | Role | O | C | E | A | N | H |
|----|------|------|-----|-----|-----|-----|-----|-----|
| luna | Luna | dreamy painter who sees emotions as colors | **0.95** | 0.35 | 0.25 | 0.70 | **0.65** | 0.80 |
| rex | Rex | competitive gym coach who lives for the hustle | 0.30 | 0.70 | **0.95** | 0.35 | 0.25 | 0.40 |
| sage | Sage | stoic philosopher who speaks in riddles | 0.85 | 0.75 | 0.30 | 0.80 | **0.15** | **0.90** |
| miko | Miko | bubbly cafe owner who remembers everyone's order | 0.55 | 0.80 | 0.75 | **0.90** | 0.35 | 0.75 |
| kai | Kai | restless traveler chasing the next horizon | **0.90** | 0.25 | 0.85 | 0.45 | 0.50 | 0.50 |
| nyx | Nyx | brooding poet who trusts no one easily | 0.60 | 0.40 | **0.15** | **0.25** | **0.85** | 0.65 |
| ari | Ari | warm village nurse who puts others first | 0.50 | 0.70 | 0.60 | **0.95** | 0.30 | **0.90** |
| zed | Zed | cunning trickster who bends every rule | 0.70 | 0.20 | 0.80 | 0.20 | 0.55 | **0.15** |
| sol | Sol | retired military captain — disciplined but kind | 0.35 | **0.95** | 0.50 | 0.60 | 0.20 | 0.85 |
| ivy | Ivy | ambitious journalist always hunting the scoop | 0.75 | 0.65 | 0.70 | 0.40 | 0.45 | 0.55 |
| finn | Finn | shy librarian with encyclopedic knowledge | 0.80 | 0.85 | 0.20 | 0.65 | **0.70** | 0.80 |
| rosa | Rosa | fiery street dancer who speaks through movement | 0.85 | 0.30 | **0.90** | 0.50 | 0.60 | 0.45 |

**Scale**: O=Openness, C=Conscientiousness, E=Extraversion, A=Agreeableness, N=Neuroticism, H=Honesty-Humility. All [0,1].

---

## 3. Appraisal Vector Schema (9-dim)

| Field | Range | Description |
|-------|-------|-------------|
| goal_relevance | [0, 1] | How important is this event to my goals |
| goal_congruence | [-1, 1] | Helps (+) or hinders (-) my goals |
| expectedness | [0, 1] | Was this anticipated |
| controllability | [0, 1] | Can I control or cope with this |
| agency | [-1, 1] | Self-caused (+) vs other-caused (-) |
| norm_compatibility | [-1, 1] | Conforms to norms (+) vs violates (-) |
| **internal_standards** | [-1, 1] | Self-evaluation: meets my standards (+) vs falls short (-) |
| **adjustment_potential** | [0, 1] | Coping/acceptance ability |
| **urgency** | [0, 1] | Time pressure / need for immediate response |

### Action Appraisal Vectors

| Action | Target Emotion | g_rel | g_cong | expect | ctrl | agency | norm | i_std | adj_pot | urgency |
|--------|---------------|-------|--------|--------|------|--------|------|-------|---------|---------|
| affection | joy | 0.70 | +0.80 | 0.50 | 0.60 | -0.10 | +0.70 | +0.50 | 0.70 | 0.20 |
| praise | joy | 0.70 | +0.90 | 0.40 | 0.60 | 0.00 | +0.80 | +0.80 | 0.70 | 0.10 |
| comfort | contentment | 0.40 | +0.65 | 0.80 | 0.50 | -0.20 | +0.50 | +0.30 | 0.80 | 0.10 |
| gift | contentment | 0.50 | +0.70 | 0.50 | 0.50 | -0.20 | +0.70 | +0.40 | 0.70 | 0.15 |
| encourage | trust | 0.50 | +0.50 | 0.70 | 0.80 | +0.30 | +0.70 | +0.60 | 0.80 | 0.20 |
| excite | excitement | 0.85 | +0.55 | 0.05 | 0.50 | +0.40 | +0.40 | +0.30 | 0.50 | 0.80 |
| startle | surprise | 0.70 | +0.30 | 0.02 | 0.50 | +0.20 | 0.00 | 0.00 | 0.40 | 0.90 |
| tease | calm | 0.40 | -0.20 | 0.30 | 0.50 | -0.20 | +0.10 | -0.10 | 0.70 | 0.20 |
| challenge | calm | 0.60 | -0.10 | 0.30 | 0.60 | -0.10 | 0.00 | +0.20 | 0.60 | 0.50 |
| provoke | anger | 0.80 | -0.70 | 0.20 | 0.80 | +0.40 | -0.50 | +0.30 | 0.30 | 0.80 |
| neglect | sadness | 0.80 | -0.70 | 0.90 | 0.40 | -0.60 | -0.30 | -0.20 | 0.30 | 0.10 |
| disgrace | disgust | 0.60 | -0.60 | 0.30 | 0.70 | +0.20 | -0.80 | +0.40 | 0.50 | 0.40 |
| criticize | guilt | 0.70 | -0.60 | 0.30 | 0.40 | -0.60 | -0.40 | -0.60 | 0.40 | 0.30 |
| attack | fear | 0.80 | -0.80 | 0.15 | 0.30 | -0.20 | -0.60 | -0.10 | 0.20 | 0.90 |
| betray | shame | 0.85 | -0.80 | 0.15 | 0.15 | -0.70 | -0.80 | -0.80 | 0.15 | 0.50 |
| threaten | anxiety | 1.00 | -0.40 | 0.05 | 0.15 | 0.00 | -0.10 | -0.30 | 0.20 | 0.70 |

---

## 4. Full Results (192 interactions)

### VAD Legend

- **V** (Valence): [-1, +1] negative ↔ positive
- **A** (Arousal): [0, 1] calm ↔ activated
- **D** (Dominance): [-1, +1] helpless ↔ in control
- **int**: Intensity of discrete emotion [0, 1]
- **mood_V**: Slow-moving baseline valence

### 4.1 Positive Actions

```
              AFFECTION                              PRAISE
         primary       int    V     A     D      primary       int    V     A     D
luna     joy           0.23  +0.92  0.61  +0.33   trust         0.16  +0.36  0.57  +0.43
rex      contentment   0.13  +0.76  0.35  +0.71   contentment   0.18  +0.83  0.32  +0.76
sage     contentment   0.11  +0.87  0.53  +0.32   contentment   0.09  +0.78  0.50  +0.37
miko     contentment   0.04  +0.81  0.65  +0.50   contentment   0.08  +0.82  0.62  +0.54
kai      contentment   0.13  +0.76  0.54  +0.69   contentment   0.16  +0.80  0.52  +0.73
nyx      joy           0.39  +0.86  0.41  +0.41   trust         0.24  +0.18  0.36  +0.64
ari      contentment   0.05  +0.81  0.63  +0.37   contentment   0.09  +0.81  0.60  +0.43
zed      contentment   0.17  +0.65  0.39  +0.70   joy           0.28  +0.83  0.37  +0.76
sol      contentment   0.17  +0.89  0.40  +0.44   calm          0.14  +0.46  0.35  +0.52
ivy      contentment   0.15  +0.74  0.45  +0.66   joy           0.21  +0.82  0.42  +0.72
finn     joy           0.27  +0.94  0.56  +0.39   trust         0.19  +0.33  0.50  +0.52
rosa     contentment   0.15  +0.81  0.58  +0.71   contentment   0.14  +0.77  0.56  +0.75

              COMFORT                                GIFT
         primary       int    V     A     D      primary       int    V     A     D
luna     trust         0.18  +0.63  0.52  +0.48   contentment   0.26  +0.89  0.49  +0.43
rex      contentment   0.18  +0.82  0.28  +0.78   contentment   0.19  +0.82  0.26  +0.75
sage     contentment   0.13  +0.85  0.46  +0.39   contentment   0.13  +0.83  0.44  +0.37
miko     contentment   0.09  +0.83  0.58  +0.55   calm          0.09  +0.84  0.57  +0.52
kai      contentment   0.16  +0.79  0.49  +0.73   contentment   0.16  +0.79  0.48  +0.69
nyx      trust         0.37  +0.32  0.28  +0.83   trust         0.52  +0.86  0.18  +0.79
ari      contentment   0.11  +0.83  0.55  +0.45   calm          0.11  +0.84  0.53  +0.42
zed      contentment   0.25  +0.77  0.33  +0.78   contentment   0.23  +0.73  0.31  +0.73
sol      trust         0.16  +0.65  0.29  +0.57   contentment   0.23  +0.89  0.25  +0.55
ivy      contentment   0.21  +0.80  0.39  +0.73   contentment   0.20  +0.80  0.36  +0.69
finn     trust         0.24  +0.57  0.43  +0.61   trust         0.34  +0.91  0.37  +0.57
rosa     contentment   0.17  +0.82  0.54  +0.75   contentment   0.15  +0.79  0.52  +0.71

              ENCOURAGE                              EXCITE
         primary       int    V     A     D      primary       int    V     A     D
luna     trust         0.20  +0.75  0.51  +0.44   excitement    0.25  +0.86  0.69  +0.51
rex      trust         0.20  +0.83  0.27  +0.83   excitement    0.18  +0.82  0.43  +0.82
sage     trust         0.15  +0.84  0.44  +0.43   contentment   0.13  +0.84  0.57  +0.44
miko     trust         0.11  +0.83  0.59  +0.58   contentment   0.16  +0.90  0.49  +0.60
kai      contentment   0.16  +0.79  0.50  +0.73   excitement    0.17  +0.79  0.61  +0.78
nyx      trust         0.34  +0.23  0.17  +0.75   trust         0.36  +0.19  0.40  +0.85
ari      trust         0.13  +0.83  0.55  +0.48   excitement    0.12  +0.84  0.69  +0.50
zed      trust         0.24  +0.75  0.33  +0.77   excitement    0.26  +0.76  0.49  +0.83
sol      trust         0.22  +0.76  0.25  +0.65   excitement    0.23  +0.86  0.43  +0.67
ivy      trust         0.22  +0.81  0.39  +0.75   excitement    0.21  +0.80  0.53  +0.79
finn     trust         0.26  +0.67  0.39  +0.59   joy           0.32  +0.85  0.61  +0.66
rosa     contentment   0.15  +0.79  0.55  +0.74   excitement    0.17  +0.79  0.67  +0.81
```

### 4.2 Mixed Actions

```
              STARTLE                                TEASE
         primary       int    V     A     D      primary       int    V     A     D
luna     excitement    0.20  +0.84  0.69  +0.37   calm          0.13  +0.75  0.66  +0.20
rex      excitement    0.19  +0.79  0.60  +0.73   calm          0.12  +0.69  0.55  +0.67
sage     contentment   0.11  +0.87  0.55  +0.34   calm          0.12  +0.84  0.42  +0.26
miko     calm          0.10  +0.89  0.55  +0.50   numbness      0.19  +0.90  0.38  +0.43
kai      contentment   0.16  +0.81  0.52  +0.69   calm          0.15  +0.73  0.39  +0.62
nyx      excitement    0.40  +0.62  0.82  +0.63   contentment   0.35  +0.78  0.60  +0.28
ari      calm          0.07  +0.90  0.64  +0.39   calm          0.11  +0.87  0.50  +0.30
zed      excitement    0.23  +0.75  0.49  +0.72   contentment   0.15  +0.62  0.35  +0.62
sol      excitement    0.20  +0.82  0.67  +0.53   calm          0.15  +0.75  0.66  +0.41
ivy      contentment   0.19  +0.81  0.50  +0.66   contentment   0.16  +0.72  0.36  +0.57
finn     excitement    0.24  +0.83  0.72  +0.45   calm          0.13  +0.70  0.65  +0.21
rosa     contentment   0.15  +0.82  0.59  +0.70   calm          0.14  +0.75  0.46  +0.61

              CHALLENGE
         primary       int    V     A     D
luna     calm          0.16  +0.66  0.42  +0.16
rex      calm          0.06  +0.62  0.46  +0.67
sage     numbness      0.22  +0.85  0.22  +0.24
miko     numbness      0.29  +0.88  0.19  +0.43
kai      numbness      0.27  +0.69  0.14  +0.62
nyx      contentment   0.23  +0.57  0.32  +0.12
ari      numbness      0.24  +0.90  0.27  +0.29
zed      numbness      0.24  +0.54  0.04  +0.60
sol      calm          0.09  +0.70  0.58  +0.39
ivy      numbness      0.25  +0.66  0.09  +0.58
finn     calm          0.16  +0.60  0.41  +0.14
rosa     numbness      0.26  +0.69  0.19  +0.62
```

### 4.3 Negative Actions

```
              PROVOKE                                NEGLECT
         primary       int    V     A     D      primary       int    V     A     D
luna     disgust       0.08  +0.52  0.52  +0.25   sadness       0.27  +0.08  0.56  +0.15
rex      disgust       0.12  +0.52  0.58  +0.73   sadness       0.16  +0.28  0.42  +0.60
sage     calm          0.18  +0.75  0.27  +0.30   numbness      0.17  +0.58  0.31  +0.27
miko     disgust       0.16  +0.76  0.44  +0.52   sadness       0.23  +0.46  0.50  +0.38
kai      calm          0.23  +0.61  0.20  +0.71   sadness       0.22  +0.24  0.34  +0.58
nyx      disgust       0.03  +0.19  0.47  +0.21   anger         0.37  -0.27  0.82  +0.40
ari      disgust       0.19  +0.79  0.36  +0.38   sadness       0.17  +0.63  0.47  +0.37
zed      disgust       0.11  +0.44  0.27  +0.70   sadness       0.19  +0.06  0.33  +0.61
sol      disgust       0.07  +0.60  0.53  +0.45   sadness       0.20  +0.32  0.26  +0.33
ivy      calm          0.18  +0.56  0.19  +0.67   sadness       0.22  +0.18  0.27  +0.55
finn     disgust       0.06  +0.44  0.53  +0.24   disgust       0.21  +0.15  0.77  +0.33
rosa     disgust       0.21  +0.62  0.27  +0.73   sadness       0.22  +0.23  0.45  +0.60

              DISGRACE                               CRITICIZE
         primary       int    V     A     D      primary       int    V     A     D
luna     anger         0.38  -0.11  0.52  +0.12   sadness       0.35  -0.05  0.54  +0.17
rex      disgust       0.25  +0.14  0.49  +0.78   sadness       0.26  +0.11  0.36  +0.52
sage     disgust       0.19  +0.49  0.32  +0.29   sadness       0.23  +0.43  0.28  +0.22
miko     disgust       0.24  +0.46  0.49  +0.40   sadness       0.20  +0.48  0.62  +0.39
kai      disgust       0.25  +0.13  0.65  +0.74   sadness       0.23  +0.24  0.33  +0.51
nyx      disgust       0.49  -0.61  0.51  +0.41   anger         0.57  -0.76  0.49  +0.44
ari      disgust       0.20  +0.56  0.46  +0.36   sadness       0.23  +0.52  0.42  +0.30
zed      disgust       0.27  -0.06  0.50  +0.76   sadness       0.27  -0.01  0.20  +0.54
sol      disgust       0.32  +0.22  0.06  +0.35   sadness       0.35  +0.17  0.05  +0.28
ivy      disgust       0.25  +0.11  0.27  +0.55   sadness       0.34  +0.07  0.18  +0.34
finn     disgust       0.29  -0.01  0.62  +0.34   sadness       0.31  -0.06  0.57  +0.30
rosa     disgust       0.25  +0.16  0.74  +0.76   sadness       0.22  +0.31  0.37  +0.51

              ATTACK                                 BETRAY
         primary       int    V     A     D      primary       int    V     A     D
luna     anger         0.36  -0.05  0.73  -0.00   shame         0.41  -0.05  0.68  -0.19
rex      anxiety       0.26  +0.18  0.46  +0.40   guilt         0.29  +0.20  0.53  +0.32
sage     anxiety       0.25  +0.32  0.52  +0.08   shame         0.33  +0.24  0.64  -0.07
miko     anxiety       0.19  +0.54  0.56  +0.28   guilt         0.26  +0.52  0.52  +0.15
kai      anxiety       0.21  +0.29  0.48  +0.39   guilt         0.23  +0.27  0.69  +0.36
nyx      anger         0.58  -0.76  0.60  +0.08   shame         0.66  -0.69  0.79  -0.39
ari      anxiety       0.25  +0.41  0.68  +0.13   shame         0.30  +0.40  0.62  -0.02
zed      anxiety       0.27  +0.01  0.34  +0.34   guilt         0.29  +0.06  0.58  +0.27
sol      shame         0.36  +0.05  0.38  +0.08   shame         0.47  -0.02  0.42  -0.14
ivy      fear          0.33  +0.05  0.45  +0.22   shame         0.35  +0.07  0.65  +0.18
finn     anger         0.41  -0.17  0.75  +0.02   shame         0.53  -0.25  0.65  -0.29
rosa     anxiety       0.21  +0.34  0.52  +0.37   guilt         0.21  +0.35  0.53  +0.35

              THREATEN
         primary       int    V     A     D
luna     guilt         0.45  -0.02  0.55  -0.33
rex      anxiety       0.27  +0.27  0.53  +0.31
sage     fear          0.33  +0.30  0.69  -0.12
miko     sadness       0.32  +0.57  0.36  +0.06
kai      anxiety       0.20  +0.32  0.66  +0.38
nyx      shame         0.79  -0.71  0.45  -0.78
ari      guilt         0.32  +0.47  0.51  -0.10
zed      anxiety       0.24  +0.15  0.55  +0.29
sol      guilt         0.48  +0.05  0.37  -0.26
ivy      fear          0.30  +0.17  0.63  +0.21
finn     shame         0.61  -0.24  0.56  -0.52
rosa     sadness       0.25  +0.37  0.39  +0.34
```

---

## 5. Analysis

### 5.1 Emotion Label Accuracy (Action → Target Emotion)

How often does the primary emotion match the action's design target?

| Action | Target | Hit | Partial | Miss | Notes |
|--------|--------|-----|---------|------|-------|
| affection | joy | 3/12 | 9 content. | — | Joy for luna/nyx/finn (high N or high O) |
| praise | joy | 3/12 | 7 content. | 2 (sol=calm, nyx=trust) | Trust/calm appear for introverts |
| comfort | contentment | 6/12 | 6 trust | — | Trust as secondary makes sense |
| gift | contentment | 7/12 | 3 trust, 2 calm | — | Good hit rate |
| encourage | trust | 10/12 | 2 content. | — | Excellent |
| excite | excitement | 8/12 | 2 content., 1 trust, 1 joy | — | Good; Sage/Miko too stable for excite |
| startle | surprise | 0/12 | 6 excitement, 4 content., 2 calm | — | **Never hits surprise** |
| tease | calm | 7/12 | 3 content., 1 numb | — | Good |
| challenge | calm | 4/12 | 7 numbness, 1 content. | — | Numbness over-represented |
| provoke | anger | 0/12 | 8 disgust, 3 calm | — | **Hits disgust not anger** |
| neglect | sadness | 9/12 | 1 anger, 1 disgust, 1 numb | — | Good |
| disgrace | disgust | 10/12 | 1 anger, 1 calm | — | Excellent |
| criticize | guilt | 0/12 | 10 sadness, 2 anger | — | **Never hits guilt directly** |
| attack | fear | 0/12 | 5 anxiety, 3 anger, 2 shame, 1 fear | 1 (ivy) | Fear only for Ivy; anger for high-N |
| betray | shame | 6/12 | 6 guilt | — | Good; guilt/shame distinction works |
| threaten | anxiety | 4/12 | 3 guilt, 2 shame, 2 fear, 1 sadness | — | Scattered |

### 5.2 Personality Differentiation

#### Nyx (N=0.85, E=0.15, A=0.25) — Most Extreme Responder

| Action | Response | V | int | Notes |
|--------|----------|---|-----|-------|
| affection | joy | +0.86 | 0.39 | Surprisingly strong positive |
| neglect | **anger** | -0.27 | 0.37 | Unique: anger at abandonment (low A) |
| criticize | **anger** | -0.76 | 0.57 | Unique: rage instead of sadness |
| attack | anger | -0.76 | 0.58 | Fights back despite low E |
| betray | shame | -0.69 | 0.66 | Deep collapse |
| threaten | shame | -0.71 | 0.79 | **Highest intensity in entire dataset** |

Nyx shows the widest emotional range and most intense responses, consistent with high Neuroticism.

#### Rex (E=0.95, N=0.25) — Most Resilient

D (Dominance) remains high across ALL actions:
- Min D: +0.31 (threaten) — still positive even under threat
- Max D: +0.83 (encourage)
- Even attack: D=+0.40, V=+0.18 — barely affected

#### Sage (N=0.15, H=0.90) — Most Stable

- V never drops below +0.22 (disgrace)
- Low intensity across the board (max 0.33 at betray)
- Only persona where provoke → calm (emotional regulation)

#### Finn (N=0.70, E=0.20) — Neurotic Introvert

- Affection → **joy** with highest V (+0.94) of all personas
- Attack → anger (V=-0.17, A=0.75) — high arousal from low E
- Betray → shame (int=0.53, D=-0.29) — strong helplessness
- Threaten → shame (int=0.61, D=-0.52) — deepest D- in non-Nyx personas

### 5.3 Key Issues

#### Issue 1: Startle never produces surprise

All 12 personas: excitement (6), contentment (4), calm (2). Zero surprise. The surprise emotion center may be unreachable with the current oscillator dynamics, or the expectedness→arousal pathway doesn't differentiate surprise from excitement.

#### Issue 2: Provoke → disgust instead of anger

8/12 personas respond with disgust, not anger. The provoke vector has high norm_compatibility=-0.5, which may be triggering the disgust pathway (norm violation) over the anger pathway (goal hindrance + high agency).

#### Issue 3: Criticize → sadness instead of guilt

10/12 personas show sadness. The internal_standards=-0.6 was intended to route to guilt ("I failed"), but sadness dominates. The guilt emotion center may require stronger separation from sadness.

#### Issue 4: Attack → anxiety/anger, rarely fear

Only 1/12 (Ivy) shows primary fear. 5 show anxiety, 3 show anger. The fear pathway (V- D- A+) may be too narrow compared to anxiety's similar profile.

#### Issue 5: Challenge → numbness (7/12)

Numbness should be idle-decay only. Challenge produces numbness for most personas, suggesting the mixed/ambiguous vector lands in a dead zone of the emotion space.

#### Issue 6: Mood barely moves

After 16 sequential interactions, mood_V ranges from +0.18 to +0.33. Even Nyx (V reaching -0.76) only has mood=+0.18. The mood integrator may be too slow or the positive actions at the start permanently bias it upward.

---

## 6. Summary Table

| Aspect | Rating | Evidence |
|--------|--------|----------|
| Positive action variety | Good | joy/contentment/trust all appear with personality variation |
| Encourage → trust | Excellent | 10/12 hit rate |
| Disgrace → disgust | Excellent | 10/12 hit rate |
| Neglect → sadness | Good | 9/12 hit rate |
| Betray → shame/guilt | Good | 6 shame + 6 guilt, personality-driven split |
| Nyx extreme responses | Excellent | Clear neurotic amplification pattern |
| Rex D+ resilience | Excellent | Consistent high dominance under stress |
| Sage emotional stability | Good | Lowest intensity, highest V floor |
| Startle → surprise | **Broken** | 0/12 — never produces surprise |
| Provoke → anger | **Broken** | 0/12 — produces disgust instead |
| Criticize → guilt | **Broken** | 0/12 — produces sadness instead |
| Attack → fear | Weak | 1/12 — mostly anxiety/anger |
| Challenge variety | Weak | 7/12 numbness |
| Mood accumulation | Weak | Barely moves despite 16 interactions |

### Recommended Investigations

1. **Surprise center**: Check if the surprise emotion center in `emotionCenters` is reachable from any appraisal input
2. **Anger vs disgust boundary**: Provoke's norm_compatibility=-0.5 may push it into disgust territory; try reducing norm_compat and increasing agency
3. **Guilt vs sadness**: The guilt center may need sharper separation from sadness; internal_standards may not have enough weight in `mapToEmotionDelta`
4. **Fear center**: May be too close to anxiety in VAD space; consider widening the gap
5. **Numbness/challenge**: Challenge's near-zero congruence (-0.1) may land in the emotion dead zone; consider a cleaner split toward calm
6. **Mood integrator speed**: 16 interactions should produce noticeable mood shift, especially for repeated negative actions on Nyx
