type Locale = 'en' | 'ko'

let locale: Locale = 'en'

export function initLocale(): void {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const forced = params?.get('lang')
  if (forced === 'ko' || forced === 'en') {
    locale = forced
    return
  }
  const lang = (typeof navigator !== 'undefined' ? navigator.language : 'en').split('-')[0]
  locale = lang === 'ko' ? 'ko' : 'en'
}

export function getLocale(): Locale { return locale }

const ko: Record<string, string> = {
  // ── UI labels ──
  'emotional state': '감정 상태',
  'actions': '행동',
  'feelings toward others': '관계',
  'personal log': '기록',
  'characters': '캐릭터',
  'no state yet': '아직 상태 없음',
  'no interactions yet': '아직 상호작용 없음',
  'click a character to inspect': '캐릭터를 클릭하세요',
  'perform an action to see logs here': '행동을 실행하면 여기에 기록됩니다',

  // VAD
  'pleasure': '쾌감',
  'energy': '에너지',
  'control': '통제력',

  // Toolbar
  'Auto': '자동',
  'pace': '속도',
  'zoom': '확대',
  'acts': '행동 수',

  // Event log
  'Global Log': '전체 기록',
  'time': '시간',
  'actor': '행위자',
  'target': '대상',
  'action_header': '행동',
  'reaction': '반응',
  'collapse': '접기',
  'expand': '펼치기',

  // LLM
  'AI': 'AI',
  'API Key': 'API 키',
  'save': '저장',
  'using default key': '기본 키 사용 중',
  'using your key': '내 키 사용 중',
  'Enter OpenRouter API key': 'OpenRouter API 키 입력',
  'clear': '초기화',

  // Onboarding
  'Click a character to select': '캐릭터를 클릭해서 선택하세요',
  'Use action buttons to interact and watch their emotional reaction': '행동 버튼으로 상호작용하고 감정 반응을 관찰하세요',
  'Press Auto to let characters interact on their own': '자동 버튼을 눌러 캐릭터가 자율적으로 상호작용하게 하세요',
  'Scroll to zoom, drag to pan the map': '스크롤로 확대, 드래그로 이동하세요',
  'Click to start': '클릭하여 시작',
  'Got it': '확인',
  'info.p1': '각 캐릭터는 고유한 성격과 감정 상태를 가지고 있습니다. 자율적으로 상호작용하며 관계를 형성하고, 감정적으로 반응하며, 시간이 지남에 따라 변화합니다.',
  'info.p2': '캐릭터를 클릭해서 내면 세계를 살펴보세요. 행동을 해보고 감정 변화를 관찰하세요.',

  // Actor
  'You': '나',

  // ── Action names ──
  'affection': '애정',
  'comfort': '위로',
  'praise': '칭찬',
  'gift': '선물',
  'encourage': '격려',
  'excite': '흥분시키기',
  'tease': '놀리기',
  'challenge': '도전',
  'startle': '놀래키기',
  'provoke': '도발',
  'neglect': '무시',
  'disgrace': '모욕',
  'criticize': '비판',
  'attack': '공격',
  'betray': '배신',
  'threaten': '위협',

  // ── Personality traits ──
  'conventional': '전통적',
  'creative': '창의적',
  'spontaneous': '자유분방',
  'disciplined': '체계적',
  'introverted': '내향적',
  'extraverted': '외향적',
  'competitive': '경쟁적',
  'cooperative': '협력적',
  'calm': '차분한',
  'sensitive': '예민한',
  'pragmatic': '현실적',
  'sincere': '성실한',

  // ── Affinity labels ──
  'unknown': '모름',
  'adores': '매우 좋아함',
  'loves': '좋아함',
  'likes': '호감',
  'warm': '따뜻함',
  'neutral': '보통',
  'cool': '서먹함',
  'wary': '경계',
  'hostile': '적대적',
  'despises': '혐오',

  // ── Zone labels ──
  'Cafe': '카페',
  'Library': '도서관',
  'Town Square': '마을 광장',
  'Park': '공원',
  'Training Ground': '훈련장',
  'Residential': '주거지',
}

// Emotion names → Korean (separate to avoid key conflicts with affinity "neutral")
const koEmotions: Record<string, string> = {
  joy: '기쁨', happiness: '행복', sadness: '슬픔', anger: '분노',
  fear: '공포', surprise: '놀라움', disgust: '혐오', contempt: '경멸',
  trust: '신뢰', love: '사랑', pride: '자부심', shame: '수치심',
  guilt: '죄책감', envy: '질투', gratitude: '감사', hope: '희망',
  anxiety: '불안', contentment: '만족', amusement: '즐거움', boredom: '지루함',
  relief: '안도', interest: '관심', awe: '경외', serenity: '평온',
  neutral: '무감정', excitement: '흥분', frustration: '좌절',
  disappointment: '실망', tenderness: '다정함', anticipation: '기대',
  nostalgia: '향수', admiration: '경탄', confusion: '혼란',
  melancholy: '우울', loneliness: '외로움', irritation: '짜증',
  rage: '격분', dread: '두려움', embarrassment: '당혹', jealousy: '시기',
  grief: '비통', calm: '차분', numbness: '무감각', sympathy: '동정', compassion: '연민',
  curiosity: '호기심', determination: '결의', satisfaction: '만족감',
  resignation: '체념', indifference: '무관심', affection: '애정',
  warmth: '온기', hostility: '적대감', suspicion: '의심', respect: '존경',
  annoyance: '짜증', panic: '공황', sorrow: '비애', delight: '환희',
  euphoria: '황홀', worry: '걱정', optimism: '낙관', pessimism: '비관',
}

// English fallback for namespaced keys (where the key itself is not the display text)
const en: Record<string, string> = {
  'info.p1': 'Each character has a unique personality and emotional state. They interact autonomously \u2014 building relationships, reacting emotionally, and evolving over time.',
  'info.p2': 'Click a character to see their inner world. Try performing actions and watch how they feel.',
  'acts': 'acts',
}

export function t(key: string): string {
  if (locale === 'en') return en[key] ?? key
  return ko[key] ?? ko[key.toLowerCase()] ?? en[key] ?? key
}

export function tEmotion(name: string): string {
  if (locale === 'en') return name
  return koEmotions[name.toLowerCase()] ?? name
}
