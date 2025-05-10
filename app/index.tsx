import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function Splash() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      router.replace('/get-started');
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.topContainer}>
        <Animated.Image
          source={require('../assets/images/splash.png')}
          style={[styles.logo, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        />
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          VoiceNoteApp
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
          Your Personal Voice-Powered Notepad
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#1e824c', // matches home.tsx green
  alignItems: 'center',
  justifyContent: 'center',
},

  topContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#1e824c', // Matching home.tsx topContainer
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    shadowColor: '#1e824c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0f2f1',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
