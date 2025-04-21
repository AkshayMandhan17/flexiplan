import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView, // Use SafeAreaView for better screen fitting
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteUserTask, fetchUserTasks } from "../utils/api";
import { Task } from "../utils/model";
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from "../../App"; // Ensure this path is correct

// --- Define Color Palette ---
const PRIMARY_COLOR = "rgba(197, 110, 50, 0.9)"; // Your app color
const SECONDARY_COLOR = "#FFFFFF"; // White
const TEXT_COLOR_PRIMARY = "#333333"; // Dark Gray
const TEXT_COLOR_SECONDARY = "#666666"; // Medium Gray
const TEXT_COLOR_LIGHT = "#888888"; // Light Gray
const BORDER_COLOR = "#EEEEEE";
const SHADOW_COLOR = "#000000";
const ERROR_COLOR = "#FF6B6B"; // Red for delete/errors

// --- Task Priority Colors ---
const PRIORITY_HIGH_COLOR = "#FF6B6B"; // Red
const PRIORITY_MEDIUM_COLOR = "#FFA500"; // Orange
const PRIORITY_LOW_COLOR = "#4CAF50"; // Green

// --- Component ---
const UserTasksScreen = () => {
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const loadUserTasks = async () => {
      setLoading(true); // Ensure loading is true at the start
      try {
        const storedUserId = await AsyncStorage.getItem("user_id");
        const storedUsername = await AsyncStorage.getItem("user_username");

        if (!storedUserId || !storedUsername) {
          Alert.alert(
            "Login Required",
            "User information not found. Please log in to view your tasks."
          );
          // Optional: Navigate to login screen if applicable
          // navigation.navigate('Login');
          setLoading(false);
          return;
        }

        const parsedUserId = parseInt(storedUserId, 10);
        setUserId(parsedUserId);
        setUsername(storedUsername);

        const tasksData = await fetchUserTasks(parsedUserId);
        setUserTasks(tasksData);
      } catch (error) {
        console.error("Failed to load user tasks:", error);
        Alert.alert("Loading Error", "Could not load your tasks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Use focus listener to refresh tasks when navigating back
    const unsubscribe = navigation.addListener('focus', loadUserTasks);

    // Initial load
    loadUserTasks();

    // Cleanup listener on unmount
    return unsubscribe;
  }, [navigation]); // Add navigation as a dependency

  const handleDeleteTask = async (taskId: number) => {
    if (!userId) {
      Alert.alert("Error", "User ID not found. Cannot delete task.");
      return;
    }

    // Confirmation Dialog
    Alert.alert(
        "Confirm Deletion",
        "Are you sure you want to remove this task?",
        [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Delete",
                onPress: async () => {
                    try {
                        await deleteUserTask(userId, taskId);
                        setUserTasks((prevTasks) =>
                          prevTasks.filter((task) => task.id !== taskId)
                        );
                        // Removed success alert for cleaner UX, maybe use a toast later
                        // Alert.alert("Success", "Task removed successfully!");
                    } catch (error: any) {
                        console.error("Failed to delete user task:", error);
                        Alert.alert(
                          "Deletion Failed",
                          "Failed to remove task: " + (error.message || "Unknown error")
                        );
                    }
                },
                style: "destructive" // iOS style for delete action
            }
        ]
    );
  };

  // --- Render Priority Badge ---
  const renderPriorityBadge = (priority: string) => {
    let backgroundColor = PRIORITY_LOW_COLOR; // Default to low
    if (priority?.toLowerCase() === 'high') {
      backgroundColor = PRIORITY_HIGH_COLOR;
    } else if (priority?.toLowerCase() === 'medium') {
      backgroundColor = PRIORITY_MEDIUM_COLOR;
    }

    return (
      <View style={[styles.priorityBadge, { backgroundColor }]}>
        <Text style={styles.priorityText}>{priority || 'Low'}</Text>
      </View>
    );
  };

  // --- Render Task Item Card ---
  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.taskName}>{item.task_name}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increase tap area
        >
          <Ionicons name="trash-bin-outline" size={22} color={ERROR_COLOR} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        {item.description && <Text style={styles.description}>{item.description}</Text>}

        <View style={styles.detailRow}>
            <Ionicons name="flag-outline" size={16} color={TEXT_COLOR_SECONDARY} style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Priority:</Text>
            {renderPriorityBadge(item.priority)}
        </View>

        <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={TEXT_COLOR_SECONDARY} style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Time Required:</Text>
            <Text style={styles.detailValue}>{item.time_required ? `${item.time_required} mins` : "Not specified"}</Text>
        </View>

        <View style={styles.detailRow}>
             <Ionicons name="calendar-outline" size={16} color={TEXT_COLOR_SECONDARY} style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Days:</Text>
            <Text style={styles.detailValue}>{item.days_associated?.length > 0 ? item.days_associated.join(", ") : "No days assigned"}</Text>
        </View>

        {item.is_fixed_time && (
          <View style={styles.detailRow}>
             <Ionicons name="alarm-outline" size={16} color={TEXT_COLOR_SECONDARY} style={styles.detailIcon} />
             <Text style={styles.detailLabel}>Fixed Time:</Text>
             <Text style={[styles.detailValue, styles.fixedTimeValue]}>
                {item.fixed_time_slot ? item.fixed_time_slot : "Not set"}
             </Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.createdAt}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  // --- Loading State ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  // --- Main Return ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- Header --- */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Tasks</Text>
        </View>

        {/* --- Task List or Empty State --- */}
        {userTasks.length === 0 ? (
           <View style={styles.emptyContainer}>
             <Ionicons name="file-tray-outline" size={60} color={TEXT_COLOR_LIGHT} />
             <Text style={styles.emptyText}>No tasks found.</Text>
             <Text style={styles.emptySubText}>Tap the '+' button to add your first task!</Text>
           </View>
         ) : (
           <FlatList
             data={userTasks}
             keyExtractor={(item) => item.id.toString()}
             renderItem={renderItem}
             contentContainerStyle={styles.listContainer}
             showsVerticalScrollIndicator={false} // Hide scrollbar for cleaner look
           />
         )}


        {/* --- Floating Action Button (FAB) --- */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddUserTask')} // Navigate to AddTaskScreen
        >
          <Ionicons name="add" size={32} color={SECONDARY_COLOR} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR, // Match header background for notch area
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7", // Light background for contrast with cards
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center", // Center title horizontally
    borderBottomLeftRadius: 15, // Subtle curve
    borderBottomRightRadius: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: SECONDARY_COLOR,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: TEXT_COLOR_SECONDARY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: -50, // Adjust to roughly center vertically
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_COLOR_SECONDARY,
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubText: {
     fontSize: 14,
     color: TEXT_COLOR_LIGHT,
     marginTop: 5,
     textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 20, // Add space between header and first card
    paddingBottom: 80, // Ensure space for FAB
  },
  // --- Card Styling ---
  card: {
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    // Shadow for depth (iOS)
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for depth (Android)
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Align items to the top
    marginBottom: 10,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "600", // Semi-bold
    color: TEXT_COLOR_PRIMARY,
    flex: 1, // Allow text to wrap
    marginRight: 10, // Space before delete button
  },
  deleteButton: {
    padding: 5, // Add padding to make it easier to tap
    marginLeft: 5,
  },
  cardBody: {
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: TEXT_COLOR_SECONDARY,
    marginBottom: 12,
    lineHeight: 20, // Improve readability
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
      marginRight: 8,
  },
  detailLabel: {
      fontSize: 14,
      color: TEXT_COLOR_SECONDARY,
      fontWeight: '500',
      marginRight: 5,
  },
  detailValue: {
      fontSize: 14,
      color: TEXT_COLOR_PRIMARY,
      flexShrink: 1, // Allow text to wrap if needed
  },
  fixedTimeValue: {
    fontWeight: '600',
    color: PRIMARY_COLOR, // Use primary color to highlight fixed time
  },
  priorityBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginLeft: 5, // Space from label
    alignSelf: 'flex-start', // Prevent stretching
  },
  priorityText: {
    color: SECONDARY_COLOR,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingTop: 10,
    marginTop: 5,
  },
  createdAt: {
    fontSize: 12,
    color: TEXT_COLOR_LIGHT,
  },
  // --- FAB Styling ---
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: PRIMARY_COLOR,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    // Shadow (iOS)
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Shadow (Android)
    elevation: 6,
  },
});

export default UserTasksScreen;