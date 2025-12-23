export const colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  danger: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
  light: '#ecf0f1',
  dark: '#2c3e50',
  white: '#ffffff',
  black: '#000000',
  gray: '#95a5a6',
  lightGray: '#f8f9fa',
  darkGray: '#34495e',
  success: '#27ae60',
  error: '#e74c3c',
  border: '#ddd',
  background: '#f5f7fa',
  card: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  placeholder: '#bdc3c7'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24
  }
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8
  }
};

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows
};

export type Theme = typeof theme;
