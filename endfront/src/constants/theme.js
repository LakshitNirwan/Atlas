// ─── APP CONFIGURATION ───────────────────────────────────────────────────────
export const CONFIG = {
  pathThickness: "2",
  pathOpacity: 1,
  xrayThickness: "2.5",
  xrayOpacity: 0.4,
};

// ─── FEST MODE DATA ───────────────────────────────────────────────────────────
export const FEST_EVENTS = {
  'PRP_101':          { title: 'Creativity Club Design Sprint', color: '#7a2da9', time: '10:00 AM' },
  'PRP_210':          { title: 'Debate Club Mock Trials',       color: '#bb00ff', time: '1:00 PM'  },
  'PRP_202':          { title: 'VinnovateIT B3',                color: '#0dc456', time: '9:00 AM'  },
  'PRP_node_lobby_G': { title: 'BunkBuddies Promo Booth',       color: '#00ffcc', time: 'All Day'  },
  'SJT_211':          { title: 'Hexa-thon',                     color: '#b3ea0e', time: '3:00 PM'  },
  'SJT_311':          { title: 'TAM Bidathon 3.0',              color: '#9d5304', time: '8:00 AM'  },
};

// ─── DESIGN TOKENS: DARK ─────────────────────────────────────────────────────
export const DARK = {
  bg0:             '#060c1a',
  bg1:             '#0b1428',
  bg2:             '#0f1e38',
  bg3:             '#142444',
  border:          '#1e3358',
  borderGlow:      '#1a4a8a',
  cyan:            '#00d4ff',
  cyanDim:         '#0090b3',
  cyanGlow:        'rgba(0,212,255,0.15)',
  cyanGlow2:       'rgba(0,212,255,0.08)',
  amber:           '#f59e0b',
  red:             '#ef4444',
  redGlow:         'rgba(239,68,68,0.3)',
  green:           '#10b981',
  text0:           '#e8f4ff',
  text1:           '#7aa3c8',
  text2:           '#3d6a9e',
  gridLine:        'rgba(0,212,255,0.04)',
  mapBg:           '#060c1a',
  mapGrid:         'rgba(0,212,255,0.03)',
  corridorStroke:  '#0090b3',
  corridorOpacity: '0.65',
  nodeOpacity:     '0.95',
  labelBg:         'rgba(6,12,26,0.88)',
  legendBg:        'rgba(11,20,40,0.92)',
  titleGradient:   'linear-gradient(135deg, #00d4ff 0%, #a8d8ff 50%, #00d4ff 100%)',
};

// ─── DESIGN TOKENS: LIGHT ────────────────────────────────────────────────────
export const LIGHT = {
  bg0:             '#edf2f8',
  bg1:             '#ffffff',
  bg2:             '#f4f8fd',
  bg3:             '#e2eaf5',
  border:          '#bfcfe8',
  borderGlow:      '#7da4cc',
  cyan:            '#1a66cc',
  cyanDim:         '#2277dd',
  cyanGlow:        'rgba(26,102,204,0.14)',
  cyanGlow2:       'rgba(26,102,204,0.07)',
  amber:           '#b86a00',
  red:             '#c82020',
  redGlow:         'rgba(200,32,32,0.12)',
  green:           '#0a7a52',
  text0:           '#0b1a30',
  text1:           '#2a4568',
  text2:           '#5878a0',
  gridLine:        'rgba(26,102,204,0.06)',
  mapBg:           '#d8e8f5',
  mapGrid:         'rgba(26,102,204,0.08)',
  corridorStroke:  '#1a55aa',
  corridorOpacity: '0.45',
  nodeOpacity:     '0.9',
  labelBg:         'rgba(232,241,252,0.94)',
  legendBg:        'rgba(255,255,255,0.97)',
  titleGradient:   'linear-gradient(135deg, #0a50bb 0%, #1a66cc 50%, #0a50bb 100%)',
};