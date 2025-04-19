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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteUserTask, fetchUserTasks } from "../utils/api";
import { Task } from "../utils/model";
import { NavigationProp, useNavigation } from '@react-navigation/native'; // ✅ Import useNavigation
import { RootStackParamList } from "../../App";

const categoryImages: { [key: string]: string } = {
  Art: "https://via.placeholder.com/100x100?text=Art",
  Sports: "https://via.placeholder.com/100x100?text=Sports",
  Music: "https://via.placeholder.com/100x100?text=Music",
  Tech: "https://via.placeholder.com/100x100?text=Tech",
  Travel: "https://via.placeholder.com/100x100?text=Travel",
  Cooking: "https://via.placeholder.com/100x100?text=Cooking",
  Default: "https://via.placeholder.com/100x100?text=Hobby",
};

const UserTasksScreen = () => {
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // ✅ Get navigation object

  useEffect(() => {
    const loadUserTasks = async () => {
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

        // Fetch user tasks
        const tasksData = await fetchUserTasks(parsedUserId);
        setUserTasks(tasksData);
      } catch (error) {
        console.error("Failed to load user tasks:", error);
        Alert.alert("Error loading user tasks.");
      } finally {
        setLoading(false);
      }
    };

    loadUserTasks();
  }, []);

  const handleDeleteTask = async (taskId: number) => {
    if (!userId) {
      Alert.alert("User ID not found.");
      return;
    }

    try {
      await deleteUserTask(userId, taskId);
      setUserTasks(userTasks.filter((task) => task.id !== taskId));
      Alert.alert("Task removed successfully!");
    } catch (error: any) {
      console.error("Failed to delete user task:", error);
      Alert.alert("Failed to delete user task: " + (error.message || error));
    }
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.listItem}>
      <View style={styles.taskInfo}>
        <View>
          <Text style={styles.taskName}>{item.task_name}</Text>
          {item.description && <Text style={styles.description}>{item.description}</Text>}

          <Text style={styles.priority}>
            Priority: <Text>{item.priority}</Text>
          </Text>

          <Text style={styles.timeRequired}>
            Time Required: {item.time_required ? item.time_required : "Not specified"}
          </Text>

          <Text style={styles.daysAssociated}>
            Days: {item.days_associated.length > 0 ? item.days_associated.join(", ") : "No days assigned"}
          </Text>

          {item.is_fixed_time && (
            <Text style={styles.fixedTime}>
              Fixed Time Slot: {item.fixed_time_slot ? item.fixed_time_slot : "Not set"}
            </Text>
          )}

          <Text style={styles.createdAt}>Created on: {new Date(item.created_at).toLocaleString()}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
        <Ionicons name="trash-bin" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9dbfb6" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{username ? `Your Tasks` : "User Tasks"}</Text>
        <Text style={styles.subtitle}>Here is a list of your tasks.</Text>
        <TouchableOpacity // ✅ Add Task Button in Header
          style={styles.addButton}
          onPress={() => navigation.navigate('AddUserTask')} // ✅ Navigate to AddTaskScreen
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={userTasks}
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
    flexDirection: 'row', // ✅ Enable flexDirection for header
    justifyContent: 'space-between', // ✅ Space between title and button
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    flex: 1, // ✅ Allow title to take up space
    textAlign: 'center', // ✅ Center the title
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: 'center', // ✅ Center subtitle as well
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
  taskInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  taskName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  priority: {
    fontSize: 14,
    fontWeight: "bold",
  },
  high: { color: "#FF6B6B" }, // Red for high priority
  medium: { color: "#FFA500" }, // Orange for medium priority
  low: { color: "#4CAF50" }, // Green for low priority
  timeRequired: {
    fontSize: 14,
    color: "#555",
  },
  daysAssociated: {
    fontSize: 14,
    color: "#555",
  },
  fixedTime: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "bold",
  },
  createdAt: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  addButton: { // ✅ Style for Add Button
    backgroundColor: "#9dbfb6",
    borderRadius: 25,
    padding: 8,
  },
});

export default UserTasksScreen;