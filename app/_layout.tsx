// _layout.tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { DarkModeProvider } from './DarkModeContext'; // import here

SplashScreen.preventAutoHideAsync(); // Keep the splash screen visible

export default function Layout() {
    useEffect(() => {
        const hideSplash = async () => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            await SplashScreen.hideAsync();
        };
        hideSplash();
    }, []);

    return (
      <DarkModeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </DarkModeProvider>
    );
}
