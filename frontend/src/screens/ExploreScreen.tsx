import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { fetchHobbies, addUserHobby } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Hobby } from "../utils/model";

// Mapping categories to their respective Lottie animation files
const categoryAnimations: Record<string, any> = {
  Art: require("../../lotties/Art.json"),
  Sports: require("../../lotties/Sports.json"),
  Music: require("../../lotties/Music.json"),
  Tech: require("../../lotties/Tech.json"),
  Travel: require("../../lotties/Travel.json"),
  Cooking: require("../../lotties/Cooking.json"),
  Default: require("../../lotties/Sports.json"), // Fallback animation
};

const ExploreHobbiesScreen = () => {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [groupedHobbies, setGroupedHobbies] = useState<{ [key: string]: Hobby[] }>({});

  useEffect(() => {
    const loadHobbies = async () => {
      try {
        const data = await fetchHobbies();
        setHobbies(data);

        const storedUserId = await AsyncStorage.getItem("user_id");
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        } else {
          Alert.alert("User ID not found. Please log in.");
        }

        // Group hobbies by category
        const grouped: { [key: string]: Hobby[] } = {};
        data.forEach((hobby:any) => {
          if (!grouped[hobby.category]) {
            grouped[hobby.category] = [];
          }
          grouped[hobby.category].push(hobby);
        });
        setGroupedHobbies(grouped);
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
      const result = await addUserHobby(userId, hobbyId);
      if (result) {
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
    <ScrollView style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput style={styles.searchBar} placeholder="Search hobbies..." />
      </View>

      {Object.keys(groupedHobbies).map((category) => (
        <View key={category} style={styles.categoryContainer}>
          <LottieView
            source={categoryAnimations[category] || categoryAnimations.Default}
            autoPlay
            loop
            style={styles.categoryAnimation}
          />
          <Text style={styles.categoryTitle}>{category}</Text>
          {groupedHobbies[category].map((item) => (
            <View key={item.id} style={styles.hobbyItem}>
              <Text style={styles.hobbyText}>{item.name}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddHobby(item.id)}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchSection: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  searchBar: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  categoryContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  categoryAnimation: {
    width: 200,
    height: 150,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  hobbyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "orange",
    borderRadius: 8,
    marginBottom: 6,
    width: "100%",
  },
  hobbyText: {
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#9dbfb6",
    borderRadius: 20,
    padding: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ExploreHobbiesScreen;
