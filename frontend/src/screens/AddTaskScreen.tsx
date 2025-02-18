import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { addUserTask } from "../utils/api"; // ✅ Import addUserTask service

interface TaskFormData {
  task_name: string;
  description: string;
  time_required: string; // Now string input for duration (HH:MM:SS)
  days_associated: string[];
  priority: string;
  is_fixed_time: boolean;
  fixed_time_slot: string; // Now string input for time slot (HH:MM:SS)
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AddTaskScreen = () => {
  const { control, handleSubmit, watch, setValue } = useForm<TaskFormData>({
    defaultValues: {
      task_name: "",
      description: "",
      time_required: "00:30:00", // Default duration as string
      days_associated: [],
      priority: "Medium",
      is_fixed_time: false,
      fixed_time_slot: "08:00:00", // Default time slot as string
    },
  });
  const navigation = useNavigation();
  const [isFixedTime, setIsFixedTime] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);


  const onSubmit = async (data: TaskFormData) => { // ✅ Make onSubmit async
    const requestBody = {
      task_name: data.task_name,
      description: data.description || null,
      time_required: data.time_required || null,
      days_associated: selectedDays,
      priority: data.priority,
      is_fixed_time: isFixedTime,
      fixed_time_slot: isFixedTime ? data.fixed_time_slot : null,
    };

    try {
      const userId = await AsyncStorage.getItem('user_id'); // ✅ Get userId from AsyncStorage
      if (!userId) {
        Alert.alert("Error", "User ID not found. Please log in.");
        return;
      }
      const parsedUserId = parseInt(userId, 10);

      const responseData = await addUserTask(parsedUserId, requestBody);

      if (responseData) {
        Alert.alert("Success", "Task added successfully!");
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add task. Please try again.");
      console.error("Error adding task:", error);
    }
  };

  const toggleDaySelection = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(selectedDay => selectedDay !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  const toggleFixedTime = () => {
    setIsFixedTime(!isFixedTime);
    setValue("is_fixed_time", !isFixedTime);
    if (!isFixedTime) {
      setValue("fixed_time_slot", "08:00:00"); // Reset to default time string
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add Task</Text>

      {/* Task Name Input - No changes needed */}
      <Controller
        control={control}
        name="task_name"
        rules={{ required: "Task name is required" }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Task Name*</Text>
            <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Enter task name" />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        )}
      />

      {/* Description Input - No changes needed */}
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput style={styles.input} onChangeText={onChange} value={value} placeholder="Task description" multiline />
          </View>
        )}
      />

      {/* Time Required Input - Now TextInput for Duration */}
      <Controller
        control={control}
        name="time_required"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Estimated Task Duration (HH:MM:SS) (Optional)</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              value={value}
              placeholder="HH:MM:SS (e.g., 01:30:00 for 1 hour 30 minutes)"
              keyboardType="default" // You can adjust keyboardType as needed
            />
          </View>
        )}
      />

      {/* Days Associated - No changes needed */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Days Associated</Text>
        <View style={styles.daysContainer}>
          {daysOfWeek.map(day => (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, selectedDays.includes(day) && styles.dayButtonSelected]}
              onPress={() => toggleDaySelection(day)}
            >
              <Text style={[styles.dayButtonText, selectedDays.includes(day) && styles.dayButtonTextSelected]}>{day.substring(0, 3)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Priority Input - No changes needed */}
      <Controller
        control={control}
        name="priority"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Priority</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              value={value}
              placeholder="Enter priority (High, Medium, Low)"
            />
          </View>
        )}
      />

      {/* Is Fixed Time Checkbox - No changes needed */}
      <TouchableOpacity onPress={toggleFixedTime} style={styles.checkboxContainer}>
        <Text style={styles.label}>Fixed Time?</Text>
        <Text style={styles.checkbox}>{isFixedTime ? "✅" : "❌"}</Text>
      </TouchableOpacity>

      {/* Fixed Time Slot Input - Now TextInput for Time Slot */}
      {isFixedTime && (
        <Controller
          control={control}
          name="fixed_time_slot"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fixed Time Slot (HH:MM:SS)</Text>
              <TextInput
                style={styles.input}
                onChangeText={onChange}
                value={value}
                placeholder="HH:MM:SS (e.g., 07:00:00 for 7 AM)"
                keyboardType="default" // You can adjust keyboardType as needed
              />
            </View>
          )}
        />
      )}

      {/* Submit Button - No changes needed */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.submitText}>Add Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddTaskScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkbox: {
    fontSize: 18,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  dayButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  dayButtonSelected: {
    backgroundColor: '#76c7c0',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#555',
  },
  dayButtonTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});