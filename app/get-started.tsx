import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GetStarted() {
  const router = useRouter();

  const handlePress = () => {
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Image source={require('../assets/images/splash.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to VoiceNoteApp</Text>
      <Text style={styles.subtitle}>
        Ready to start capturing your thoughts with your voice?
      </Text>

      <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handlePress}>
        <Text style={styles.buttonText}>🎙️  Let's Get Started</Text>
        <Text style={styles.buttonSubtext}>Tap to go to your dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
  },
  logo: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#BBBBBB',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#E0FFE5',
    marginTop: 4,
  },
});
