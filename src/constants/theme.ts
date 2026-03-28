// Notion-inspired minimalist design system

export const Colors = {
  // Backgrounds
  background: '#F7F7F5',       // Notion's warm off-white
  surface: '#FFFFFF',
  surfaceHover: '#F7F7F5',
  surfaceSecondary: '#EFEFEF',

  // Text
  text: {
    primary: '#0F0F0F',        // Near-black
    secondary: '#6B7280',      // Mid gray
    disabled: '#A1A1AA',       // Light gray
    inverse: '#FFFFFF',
  },

  // Borders
  border: '#E8E8E8',
  borderStrong: '#D1D1D1',

  // Accent (black-based, Notion style)
  primary: '#0F0F0F',          // Black as primary action
  primaryHover: '#2D2D2D',

  // Semantic
  error: '#EF4444',
  errorSurface: '#FEF2F2',
  success: '#22C55E',
  successSurface: '#F0FDF4',
  warning: '#F59E0B',
  warningSurface: '#FFFBEB',

  // Live badge
  live: '#EF4444',
  liveSurface: '#FEF2F2',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '400' as const },
};

// Shadows — very subtle, Notion-like
export const Shadows = {
  none: {},
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
};
