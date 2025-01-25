import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ProgressBar } from "react-native-paper"; // Progress bars
import { Checkbox } from "react-native-paper"; // Checkbox
import { Swipeable } from "react-native-gesture-handler"; // Swipeable for swipe actions
import { Ionicons } from "@expo/vector-icons"; // For delete icon

const HomeScreen = () => {
  // Mock data for routines
  const [routines, setRoutines] = useState([
    { id: "1", name: "This Week", emoji: "☀️", progress: 0.4 },
    { id: "2", name: "Jatin Routine", emoji: "😎", progress: 0 },
    { id: "3", name: "Fitness", emoji: "💪", progress: 0.7 },
  ]);

  // State for active routine
  const [activeRoutine, setActiveRoutine] = useState("1"); // Default active routine is "This Week"

  // Mock data for today's tasks
  const [tasks, setTasks] = useState([
    {
      id: "1",
      name: "Drink Water",
      emoji: "💧",
      timeRange: "7:00 - 8:00",
      completed: false,
    },
    {
      id: "2",
      name: "Walking",
      emoji: "🚶‍♂️",
      timeRange: "8:00 - 8:30",
      completed: false,
    },
    {
      id: "3",
      name: "Make Coffee",
      emoji: "☕",
      timeRange: "8:30 - 9:00",
      completed: false,
    },
  ]);

  // Toggle task completion
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Remove a task from the list
  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Render the delete action for Swipeable
  const renderRightActions = () => (
    <View style={styles.fullDeleteBackground}>
      <Ionicons name="trash" size={24} color="#fff" />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Routines Section */}
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.heading}>Routines</Text>
          {/* <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity> */}
        </View>
        <FlatList
          data={routines}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={1} onPress={() => setActiveRoutine(item.id)}>
              <View
                style={[
                  styles.routineCard,
                  activeRoutine === item.id && styles.activeRoutineCard,
                ]}
              >
                <View style={styles.avatar}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.routineName}>{item.name}</Text>
                <ProgressBar
                  progress={item.progress}
                  color="#76c7c0"
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {Math.round(item.progress * 100)}% Complete
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Today's To Do Section */}
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.heading}>Today's To Do</Text>
          <Text style={styles.dateText}>Dec 11 • Wednesday</Text>
        </View>
        {tasks.map((task) => (
          <Swipeable
            key={task.id}
            renderRightActions={renderRightActions}
            onSwipeableRightOpen={() => removeTask(task.id)}
          >
            <View style={styles.taskItem}>
              <View style={styles.taskAvatar}>
                <Text style={styles.taskEmoji}>{task.emoji}</Text>
              </View>
              <View style={styles.taskDetails}>
                <Text style={styles.taskName}>{task.name}</Text>
                <Text style={styles.taskTime}>{task.timeRange}</Text>
              </View>
              <Checkbox
                status={task.completed ? "checked" : "unchecked"}
                onPress={() => toggleTask(task.id)}
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
  routineCard: {
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
  activeRoutineCard: {
    shadowColor: "#76c7c0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "#76c7c0",
  },
  avatar: {
    backgroundColor: "#eef6f7",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
  },
  routineName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginBottom: 4,
  },
  progressText: {
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
  taskAvatar: {
    backgroundColor: "#eef6f7",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  taskEmoji: {
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
