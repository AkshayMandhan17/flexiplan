import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For the "+" button icon
import { fetchHobbies, addUserHobby } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Hobby } from "../utils/model";
const categories = ["Art", "Sports", "Music", "Tech", "Travel", "Cooking"]; // Example categories

// Category-to-image mapping
const categoryImages: { [key: string]: string } = {
  Art: "https://via.placeholder.com/100x100?text=Art",
  Sports: "https://via.placeholder.com/100x100?text=Sports",
  Music: "https://via.placeholder.com/100x100?text=Music",
  Tech: "https://via.placeholder.com/100x100?text=Tech",
  Travel: "https://via.placeholder.com/100x100?text=Travel",
  Cooking: "https://via.placeholder.com/100x100?text=Cooking",
  Default: "https://via.placeholder.com/100x100?text=Hobby", // Default image
};

const ExploreHobbiesScreen = () => {
  const [hobbies, setHobbies] = useState<Hobby[]>();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadHobbies = async () => {
      try {
        const data = await fetchHobbies();
        setHobbies(data);

        const storedUserId = await AsyncStorage.getItem("user_id");
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10)); // Parse the string to a number
        } else {
          // Handle the case where the user ID is not found (e.g., user not logged in)
          Alert.alert("User ID not found. Please log in.");
        }

      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHobbies();
  }, []);


  const handleAddHobby = async (hobbyId: number) => {
    if (!userId) {
      Alert.alert("You must be logged in to add hobbies.");
      return;
    }
  
    try {
      const result = await addUserHobby(userId, hobbyId); // Capture the result
  
      if (result) {
        // Only show the success alert if addUserHobby returned a result
        Alert.alert("Hobby added successfully!");
      }
    } catch (error: any) {
      console.error("Failed to add hobby:", error);
      Alert.alert("Failed to add hobby: " + (error.message || error));
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9dbfb6" />
        <Text>Loading hobbies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.searchSection}>
        <TextInput style={styles.searchBar} placeholder="Search hobbies..." />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryTab}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Section */}
      <FlatList
        data={hobbies}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Placeholder for the image */}
            <View style={styles.cardImagePlaceholder}>
              {/* Use the Image component to display a placeholder image */}
              <Image
                source={{ uri: categoryImages[item.category] || categoryImages["Default"] }}
                style={{ width: "100%", height: "100%", borderRadius: 8 }}
              />
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddHobby(item.id)}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Card Text Section */}
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.cardsContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchSection: {
    height: "20%",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchBar: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  categoryTabs: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 35,
  },
  categoryTab: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryText: {
    color: "#333",
    fontSize: 14,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImagePlaceholder: {
    height: 100,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  addButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#9dbfb6",
    borderRadius: 20,
    padding: 6,
  },
  cardTextContainer: {
    padding: 8,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardCategory: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ExploreHobbiesScreen;
