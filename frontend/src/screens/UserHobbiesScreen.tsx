import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchUserHobbies, deleteUserHobby } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Hobby } from "../utils/model";

// Category-to-image mapping (You can use the same as in ExploreHobbiesScreen)
const categoryImages: { [key: string]: string } = {
  Art: "https://via.placeholder.com/100x100?text=Art",
  Sports: "https://via.placeholder.com/100x100?text=Sports",
  Music: "https://via.placeholder.com/100x100?text=Music",
  Tech: "https://via.placeholder.com/100x100?text=Tech",
  Travel: "https://via.placeholder.com/100x100?text=Travel",
  Cooking: "https://via.placeholder.com/100x100?text=Cooking",
  Default: "https://via.placeholder.com/100x100?text=Hobby",
};

const UserHobbiesScreen = () => {
  const [userHobbies, setUserHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null); // State for username


  useEffect(() => {
    const loadUserHobbies = async () => {
      try {
        // Load user ID from AsyncStorage
        const storedUserId = await AsyncStorage.getItem("user_id");
        const storedUsername = await AsyncStorage.getItem("user_username"); // Load username

        if (!storedUserId || !storedUsername) {
          Alert.alert("User information not found. Please log in.");
          return;
        }

        const parsedUserId = parseInt(storedUserId, 10);
        setUserId(parsedUserId);
        setUsername(storedUsername); // Set username

        // Fetch user hobbies
        const hobbiesData = await fetchUserHobbies(parsedUserId);
        setUserHobbies(hobbiesData);
      } catch (error) {
        console.error("Failed to load user hobbies:", error);
        Alert.alert("Error loading user hobbies.");
      } finally {
        setLoading(false);
      }
    };

    loadUserHobbies();
  }, []);

  const handleDeleteHobby = async (hobbyId: number) => {
    if (!userId) {
      Alert.alert("User ID not found.");
      return;
    }

    try {
      await deleteUserHobby(userId, hobbyId);
      // Update the list of user hobbies after successful deletion
      setUserHobbies(userHobbies.filter((hobby) => hobby.id !== hobbyId));
      Alert.alert("Hobby removed successfully!");
    } catch (error: any) {
      console.error("Failed to delete hobby:", error);
      Alert.alert("Failed to delete hobby: " + (error.message || error));
    }
  };

  const renderItem = ({ item }: { item: Hobby }) => (
    <View style={styles.listItem}>
      <View style={styles.hobbyInfo}>
        <Image
          source={{ uri: categoryImages[item.category] || categoryImages["Default"] }}
          style={styles.hobbyImage}
        />
        <View>
          <Text style={styles.hobbyName}>{item.name}</Text>
          <Text style={styles.hobbyCategory}>{item.category}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDeleteHobby(item.id)}>
        <Ionicons name="trash-bin" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

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
      <View style={styles.header}>
        <Text style={styles.title}>{username ? `Your Hobbies` : "User Hobbies"}</Text>
        <Text style={styles.subtitle}>Here is a list of your hobbies.</Text>
      </View>
      <FlatList
        data={userHobbies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  hobbyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  hobbyImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  hobbyName: {
    fontSize: 16,
    fontWeight: "500",
  },
  hobbyCategory: {
    fontSize: 14,
    color: "#888",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UserHobbiesScreen;