import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = () => {
  const [username, setUsername] = useState<string | null>(null);

  // Fetch username from AsyncStorage when the screen loads
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("user_username"); // Or use 'user_id' if needed
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error("Error fetching user data from AsyncStorage:", error);
        Alert.alert("Error", "Failed to load user data");
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      {username ? (
        <Text style={styles.greeting}>Hello, Explore Screen</Text>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default HomeScreen;
