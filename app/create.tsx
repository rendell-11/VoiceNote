import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDarkMode } from "./DarkModeContext";

export default function Create() {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [isListening, setIsListening] = useState(false);
  const { isDarkMode } = useDarkMode();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.title && typeof params.title === 'string') {
      setTitle(params.title);
    }
    if (params.content && typeof params.content === 'string') {
      setNote(params.content);
    }
    if (params.index && typeof params.index === 'string') {
      setEditingIndex(parseInt(params.index, 10));
    }

    const now = new Date();
    const formatted = now.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
    }).replace(',', '');
    setTimestamp(formatted);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      saveNoteAndGoBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;

    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners());
    };
  }, [selection]);

  const onSpeechResults = (event: any) => {
    const text = event.value?.[0] || '';

    setNote((prevNote) => {
      const start = selection.start;
      const end = selection.end;
      return prevNote.slice(0, start) + text + prevNote.slice(end);
    });

    setSelection((prev) => {
      const cursor = prev.start + text.length;
      return { start: cursor, end: cursor };
    });
  };

  const onSpeechError = (error: any) => {
    console.error('Speech-to-text error:', error);
  };

  const onSpeechStart = () => console.log('Speech recognition started');
  const onSpeechEnd = () => console.log('Speech recognition ended');

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const startListening = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      console.warn("Microphone permission denied");
      return;
    }
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (error) {
      console.error('Voice start error:', error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Voice stop error:', error);
    }
  };

  const saveNoteAndGoBack = async () => {
    if (title.trim() !== '' || note.trim() !== '') {
      try {
        const existingNotes = await AsyncStorage.getItem('notes');
        const notes = existingNotes ? JSON.parse(existingNotes) : [];

        if (editingIndex !== null) {
          notes[editingIndex] = {
            title: title.trim(),
            content: note.trim(),
            createdAt: notes[editingIndex].createdAt,
          };
        } else {
          notes.push({
            title: title.trim(),
            content: note.trim(),
            createdAt: timestamp,
          });
        }

        await AsyncStorage.setItem('notes', JSON.stringify(notes));
      } catch (error) {
        console.error('Failed to save note:', error);
      }
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDarkMode ? "#1c1c1c" : "#d0f0e0" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={saveNoteAndGoBack} style={styles.saveButton}>
          <Ionicons name="checkmark" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.titleInput}
        placeholder="Enter a note title..."
        placeholderTextColor="#99aab5"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.timestamp}>
        {timestamp} • {note.length} characters
      </Text>

      <TextInput
        style={styles.noteInput}
        placeholder="Start typing here..."
        placeholderTextColor="#99aab5"
        multiline
        autoFocus
        value={note}
        onChangeText={setNote}
        selection={selection}
        onSelectionChange={({ nativeEvent: { selection } }) => setSelection(selection)}
      />

      {isKeyboardVisible && (
        <View style={styles.toolbar}>
          {!isListening ? (
            <TouchableOpacity onPress={startListening} style={styles.micButton}>
              <Ionicons name="mic-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={stopListening} style={styles.micButton}>
              <Ionicons name="stop-circle" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {isListening && (
        <Text style={{ textAlign: 'center', marginTop: 10, color: '#16a085' }}>
          Listening...
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#d0f0e0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 12,
    backgroundColor: "#ecf0f1",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    padding: 12,
    backgroundColor: "#2ecc71",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "600",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
    color: "#333",
    elevation: 3,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginBottom: 15,
    textAlign: "right",
  },
  noteInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    fontSize: 18,
    color: "#333",
    textAlignVertical: "top",
    elevation: 3,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 10,
  },
  micButton: {
    backgroundColor: '#16a085',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
