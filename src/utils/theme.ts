import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  web: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal' as const,
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal' as const,
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal' as const,
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
  android: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal' as const,
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal' as const,
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal' as const,
    },
  },
};

export const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ea',
    primaryContainer: '#bb86fc',
    secondary: '#03dac6',
    secondaryContainer: '#018786',
    tertiary: '#ff6f00',
    tertiaryContainer: '#ff8f00',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    background: '#fafafa',
    error: '#f44336',
    errorContainer: '#ffebee',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#000000',
    onSecondary: '#000000',
    onSecondaryContainer: '#ffffff',
    onTertiary: '#ffffff',
    onTertiaryContainer: '#000000',
    onSurface: '#1c1b1f',
    onSurfaceVariant: '#4a4458',
    onError: '#ffffff',
    onErrorContainer: '#000000',
    onBackground: '#1c1b1f',
    outline: '#79747e',
    outlineVariant: '#cac4d0',
    inverseSurface: '#313033',
    inverseOnSurface: '#f4eff4',
    inversePrimary: '#d0bcff',
    elevation: {
      level0: 'transparent',
      level1: '#f7f2fa',
      level2: '#f2edf6',
      level3: '#ece6f0',
      level4: '#e8e0eb',
      level5: '#e3dae6',
    },
    surfaceDisabled: 'rgba(28, 27, 31, 0.12)',
    onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)',
    backdrop: 'rgba(73, 69, 79, 0.4)',
  },
};