import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

// Previne o auto-hide da tela de carregamento até estarmos prontos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#0f40d4',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 16 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#f0f4f8' },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="cidadao" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="nova-ocorrencia" 
          options={{ 
            title: 'Nova Ocorrência',
            headerBackTitle: 'Voltar',
          }} 
        />
        <Stack.Screen 
          name="funcionario" 
          options={{ headerShown: false }} 
        />
      </Stack>
    </>
  );
}
