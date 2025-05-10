import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "./DarkModeContext";

// Define Note type
type Note = {
  title: string;
  content: string;
  createdAt: string;
  pinned?: boolean;
};

const Home = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const fetchNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem("notes");
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchNotes();
      cancelSelectionMode();
    }
  }, [isFocused]);

  const saveNotes = async (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    await AsyncStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    router.push("/create");
  };

  const handleNotePress = (note: Note, index: number) => {
    if (isSelectionMode) {
      toggleSelection(index);
    } else {
      router.push({
        pathname: "/create",
        params: {
          title: note.title,
          content: note.content,
          createdAt: note.createdAt,
          index: index.toString(),
        },
      });
    }
  };

  const handleNoteLongPress = (index: number) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedNotes([index]);
    }
  };

  const toggleSelection = (index: number) => {
    if (selectedNotes.includes(index)) {
      setSelectedNotes(selectedNotes.filter((i) => i !== index));
    } else {
      setSelectedNotes([...selectedNotes, index]);
    }
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedNotes([]);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    const updatedNotes = notes.filter((_, idx) => !selectedNotes.includes(idx));
    await saveNotes(updatedNotes);
    cancelSelectionMode();
  };

  const togglePin = async (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes[index].pinned = !updatedNotes[index].pinned;
    await saveNotes(updatedNotes);
  };

  const filteredNotes = notes
    .filter((note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <LinearGradient
      colors={isDarkMode ? ["#2c3e50", "#000000"] : ["#d0f0c0", "#2ecc71"]}
      style={styles.container}
    >
      {/* Delete Confirmation Modal */}
      <Modal transparent visible={showDeleteModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Notes?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete {selectedNotes.length} selected
              note{selectedNotes.length > 1 ? "s" : ""}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={cancelSelectionMode}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#27ae60" }]}
                onPress={confirmDelete}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View
        style={[
          styles.topContainer,
          { backgroundColor: isDarkMode ? "#000" : "#2ecc71" },
        ]}
      >
        {isSelectionMode ? (
          <>
            <Text style={styles.title}>{selectedNotes.length} selected</Text>
            <TouchableOpacity
              style={styles.iconLeft}
              onPress={() => setShowDeleteModal(true)}
            >
              <Ionicons name="trash-outline" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconRight}
              onPress={cancelSelectionMode}
            >
              <Ionicons name="close-outline" size={32} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Voice Note</Text>
            <TouchableOpacity style={styles.iconLeft} onPress={toggleDarkMode}>
              <Ionicons
                name={isDarkMode ? "sunny-outline" : "moon-outline"}
                size={32}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconRight}>
              <Ionicons name="settings-outline" size={32} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Search Bar */}
      <TextInput
        style={[
          styles.searchBar,
          {
            backgroundColor: isDarkMode ? "#2c3e50" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
          },
        ]}
        placeholder="Search notes..."
        placeholderTextColor={isDarkMode ? "#bdc3c7" : "#7f8c8d"}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Notes List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.notesContainer}>
          {filteredNotes.map((note, index) => {
            const isSelected = selectedNotes.includes(index);
            return (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: isSelected
                      ? "#27ae60"
                      : isDarkMode
                      ? "#2c3e50"
                      : "#ffffff",
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
                onPress={() => handleNotePress(note, index)}
                onLongPress={() => handleNoteLongPress(index)}
              >
                <TouchableOpacity
                  style={styles.pinIcon}
                  onPress={() => togglePin(index)}
                >
                  <Ionicons
                    name={note.pinned ? "pin" : "pin-outline"}
                    size={20}
                    color={note.pinned ? "#f39c12" : isDarkMode ? "#bdc3c7" : "#7f8c8d"}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.cardText,
                    {
                      color: isDarkMode
                        ? "#ecf0f1"
                        : isSelected
                        ? "#ffffff"
                        : "#34495e",
                    },
                  ]}
                >
                  {note.title}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    { color: isDarkMode ? "#95a5a6" : "#7f8c8d" },
                  ]}
                >
                  {note.createdAt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* FAB and Empty State */}
      {!isSelectionMode && notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            You haven't created any notes yet. Tap the "+" button to start
            capturing your thoughts, ideas, or voice memos!
          </Text>
          <TouchableOpacity
            style={[
              styles.inlineAddButton,
              { backgroundColor: isDarkMode ? "#ecf0f1" : "#ffffff" },
            ]}
            onPress={handleAddNote}
          >
            <Ionicons name="add" size={28} color="#27ae60" />
          </TouchableOpacity>
        </View>
      ) : (
        !isSelectionMode && (
          <TouchableOpacity
            style={[
              styles.fab,
              { backgroundColor: isDarkMode ? "#ecf0f1" : "#ffffff" },
            ]}
            onPress={handleAddNote}
          >
            <Ionicons name="add" size={32} color="#27ae60" />
          </TouchableOpacity>
        )
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 120,
    alignItems: "center",
  },
  topContainer: {
    width: "100%",
    height: 180,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    marginBottom: 10,
    shadowColor: "#1e824c",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    position: "absolute",
    top: 50,
    alignSelf: "center",
  },
  iconLeft: {
    position: "absolute",
    left: 30,
    bottom: 20,
  },
  iconRight: {
    position: "absolute",
    right: 30,
    bottom: 20,
  },
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  notesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    width: "90%",
  },
  card: {
    width: "47%",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1abc9c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 6,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    borderRadius: 50,
    width: 65,
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16a085",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  pinIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 128, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    shadowColor: "#1e824c",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
    paddingHorizontal: 30,
    textAlign: "center",
    color: "#2c3e50",
    fontStyle: "italic",
  },
  inlineAddButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16a085",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default Home;
