import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

// Previne o auto-hide da tela de carregamento até estarmos prontos
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isDark, colors } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.headerBg },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="auth/cidadao" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="auth/funcionario" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="cidadao" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="nova-ocorrencia" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="funcionario" 
          options={{ headerShown: false }} 
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
