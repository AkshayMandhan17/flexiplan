import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard, // Import Keyboard
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchHobbies, addUserHobby } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Hobby } from "../utils/model"; // Ensure Hobby type is correctly defined

// --- Color Palette ---
const PRIMARY_COLOR = "rgba(197, 110, 50, 0.9)";
const PRIMARY_COLOR_LIGHT = "rgba(197, 110, 50, 0.1)";
const BACKGROUND_COLOR = "#F8F8F8"; // Light background for contrast
const CARD_BACKGROUND_COLOR = "#FFFFFF";
const TEXT_COLOR_PRIMARY = "#333333";
const TEXT_COLOR_SECONDARY = "#666666";
const BORDER_COLOR = "#E0E0E0";
const ICON_COLOR_LIGHT = "#FFFFFF";

const ExploreHobbiesScreen = () => {
  const [allHobbies, setAllHobbies] = useState<Hobby[]>([]); // Store the original fetched list
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true); // Ensure loading state is true at the start
      try {
        const data = await fetchHobbies();
        setAllHobbies(data); // Store the full list

        const storedUserId = await AsyncStorage.getItem("user_id");
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        } else {
          console.warn("User ID not found in storage."); // Use console.warn instead of Alert here
          // Consider redirecting to login if userId is strictly required immediately
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        Alert.alert(
          "Error",
          "Could not load hobbies. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and group hobbies based on search query
  const displayedGroupedHobbies = useMemo(() => {
    const filtered = searchQuery
      ? allHobbies.filter(
          (hobby) =>
            hobby.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hobby.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allHobbies;

    // Group the filtered hobbies
    const grouped: { [key: string]: Hobby[] } = {};
    filtered.forEach((hobby) => {
      if (!grouped[hobby.category]) {
        grouped[hobby.category] = [];
      }
      grouped[hobby.category].push(hobby);
    });
    return grouped;
  }, [allHobbies, searchQuery]); // Depend on allHobbies and searchQuery

  const handleAddHobby = async (hobbyId: number) => {
    if (!userId) {
      Alert.alert(
        "Login Required",
        "You need to be logged in to add hobbies."
      );
      // Optional: navigation.navigate('Login');
      return;
    }
    try {
      // Optional: Add some visual feedback while adding
      const result = await addUserHobby(userId, hobbyId);
      if (result) {
        Alert.alert("Success!", `${result.hobby_name} added to your hobbies.`);
        // Maybe update UI state to show it's added? (Advanced)
      } else {
        // Handle cases where addUserHobby might return falsy without throwing
         Alert.alert("Error", "Could not add hobby. Please try again.");
      }
    } catch (error: any) {
      console.error("Failed to add hobby:", error);
      const errorMessage =
        error.response?.data?.message || // Check Axios-like error structure
        error.message || // Generic error message
        "An unexpected error occurred.";
      Alert.alert("Failed to Add Hobby", errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading Hobbies...</Text>
      </View>
    );
  }

  const categoryKeys = Object.keys(displayedGroupedHobbies);

  return (
    <View style={styles.flexContainer}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Explore Hobbies</Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchOuterContainer}>
        <View style={styles.searchInnerContainer}>
          <Ionicons
            name="search"
            size={20}
            color={TEXT_COLOR_SECONDARY}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBar}
            placeholder="Search by name or category..."
            placeholderTextColor={TEXT_COLOR_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()} // Dismiss keyboard on submit
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={20} color={TEXT_COLOR_SECONDARY} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Hobbies List */}
      <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled" // Dismiss keyboard when tapping outside input
      >
        {categoryKeys.length > 0 ? (
          categoryKeys.map((category) => (
            <View key={category} style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {displayedGroupedHobbies[category].map((item) => (
                <View key={item.id.toString()} style={styles.hobbyItem}>
                  <Text style={styles.hobbyText}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddHobby(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={22} color={ICON_COLOR_LIGHT} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        ) : (
          // Displayed when search yields no results
          <View style={styles.noResultsContainer}>
            <Ionicons name="sad-outline" size={60} color={TEXT_COLOR_SECONDARY} />
            <Text style={styles.noResultsText}>
              No hobbies found matching "{searchQuery}"
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  // --- Header ---
  headerContainer: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: Platform.OS === 'android' ? 25 : 50, // Adjust status bar height
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: ICON_COLOR_LIGHT,
  },
  // --- Search ---
  searchOuterContainer: {
    padding: 15,
    backgroundColor: BACKGROUND_COLOR, // Match screen background
  },
  searchInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderRadius: 25, // More rounded
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 45, // Increased height
    fontSize: 16,
    color: TEXT_COLOR_PRIMARY,
  },
  clearIcon: {
      marginLeft: 10,
      padding: 5,
  },
  // --- ScrollView ---
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20, // Space at the bottom
  },
  // --- Category ---
  categoryCard: {
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    // Shadow for cards
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: PRIMARY_COLOR, // Use primary color for category titles
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY_COLOR_LIGHT, // Light separator
    paddingBottom: 8,
  },
  // --- Hobby Item ---
  hobbyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR, // Separator line between hobbies
    // Remove background from original style
  },
  // Make last item in category not have a border bottom
  hobbyItemLast: {
      borderBottomWidth: 0,
  },
  hobbyText: {
    fontSize: 16,
    color: TEXT_COLOR_PRIMARY,
    flex: 1, // Allow text to take available space
    marginRight: 10,
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 18, // Circular button
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    // Small shadow for the button
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  // --- Loading ---
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: TEXT_COLOR_SECONDARY,
  },
  // --- No Results ---
  noResultsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50, // Add some top margin
      padding: 20,
  },
  noResultsText: {
      fontSize: 16,
      color: TEXT_COLOR_SECONDARY,
      textAlign: 'center',
      marginTop: 10,
  },
});

export default ExploreHobbiesScreen;