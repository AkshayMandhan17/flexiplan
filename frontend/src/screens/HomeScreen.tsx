import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator, // Import ActivityIndicator for loading state
  Alert, // Import Alert for error handling
} from "react-native";
import { ProgressBar } from "react-native-paper"; // Progress bars - REMOVING FOR NOW
import { Checkbox } from "react-native-paper"; // Checkbox
import { Swipeable } from "react-native-gesture-handler"; // Swipeable for swipe actions
import { Ionicons } from "@expo/vector-icons"; // For delete icon
import { Activity, RoutineData, UserRoutineResponse } from "../utils/model";
import { fetchUserRoutines } from "../utils/api";

const HomeScreen = () => {
  // State for today's tasks fetched from API
  const [tasks, setTasks] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = dayNames[today.getDay()]; // Get current day name (e.g., "Wednesday")

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      setError(null); // Reset error on new load
      try {
        const routineData: UserRoutineResponse = await fetchUserRoutines();
        // Extract today's activities
        //const todaysActivities: Activity[] = (routineData.routine_data[currentDayName] || []) as Activity[]; // Default to empty array if no activities for today
        const todaysActivities: Activity[] = (routineData.routine_data[currentDayName as keyof RoutineData] || []) as Activity[];
        // Format activities to include 'completed' status (initially false) and 'id' if needed for FlatList key
        const formattedTasks = todaysActivities.map((activity, index) => ({
          id: String(index), // Or generate a unique ID if needed
          ...activity,
          completed: false,
          timeRange: `${formatTime(activity.start_time)} - ${formatTime(activity.end_time)}`, // Format time range
        }));
        setTasks(formattedTasks);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch routines.");
        setLoading(false);
        Alert.alert("Error Fetching Routines", err.message || "Something went wrong."); // Show error alert
      }
    };

    loadTasks();
  }, []);

  // Helper function to format time (assuming time is like "HH:mm:ss" or "HH:mm")
  const formatTime = (timeString: string): string => {
    const parts = timeString.split(":");
    return `${parts[0]}:${parts[1]}`; // Format to "HH:mm"
  };


  // Toggle task completion (LOCAL STATE ONLY - NO BACKEND UPDATE YET)
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Remove a task from the list (LOCAL STATE ONLY - NO BACKEND UPDATE YET)
  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Render the delete action for Swipeable
  const renderRightActions = () => (
    <View style={styles.fullDeleteBackground}>
      <Ionicons name="trash" size={24} color="#fff" />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#76c7c0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle={"light-content"} />

      {/* Today's To Do Section */}
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.heading}>Today's To Do</Text>
          <Text style={styles.dateText}>
            {today.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
        {tasks.map((task) => (
          <Swipeable
            key={task.id}
            renderRightActions={renderRightActions}
            onSwipeableRightOpen={() => removeTask(task.id)}
          >
            <View style={styles.taskItem}>
              {/* <View style={styles.taskAvatar}>  REMOVED EMOJI FOR NOW
                <Text style={styles.taskEmoji}>{task.emoji}</Text>
              </View> */}
              <View style={styles.taskDetails}>
                <Text style={styles.taskName}>{task.activity}</Text> {/* Use activity name from API */}
                <Text style={styles.taskTime}>{task.start_time} - {task.end_time}</Text>
              </View>
              <Checkbox
                status={task.completed ? "checked" : "unchecked"}
                // onPress={() => toggleTask(task.id)}
                color="#76c7c0"
              />
            </View>
          </Swipeable>
        ))}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  section: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAll: {
    fontSize: 14,
    color: "#76c7c0",
  },
  dateText: {
    fontSize: 14,
    color: "#333",
  },
  routineCard: { // REMOVED ROUTINE CARD STYLES
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 4,
    margin: 8,
  },
  activeRoutineCard: { // REMOVED ROUTINE CARD STYLES
    shadowColor: "#76c7c0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "#76c7c0",
  },
  avatar: { // REMOVED ROUTINE CARD STYLES
    backgroundColor: "#eef6f7",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  emoji: { // REMOVED ROUTINE CARD STYLES
    fontSize: 24,
  },
  routineName: { // REMOVED ROUTINE CARD STYLES
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  progressBar: { // REMOVED ROUTINE CARD STYLES
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginBottom: 4,
  },
  progressText: { // REMOVED ROUTINE CARD STYLES
    fontSize: 12,
    textAlign: "center",
    color: "#888",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  taskAvatar: { // REMOVED TASK AVATAR STYLES
    backgroundColor: "#eef6f7",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  taskEmoji: { // REMOVED TASK AVATAR STYLES
    fontSize: 20,
  },
  taskDetails: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  taskTime: {
    fontSize: 12,
    color: "#888",
  },
  fullDeleteBackground: {
    flex: 1,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
});