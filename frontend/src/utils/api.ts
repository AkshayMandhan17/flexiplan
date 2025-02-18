import { API_BASE_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from 'react-native'; // Import Alert
import { TaskFormData } from "./model";

export const fetchHobbies = async () => {
  try {
    const accessToken = await AsyncStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/api/hobbies/`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
    ); // API endpoint for hobbies

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Return the array of hobbies
  } catch (error) {
    console.error("Error fetching hobbies:", error);
    throw error;
  }
};


export const fetchUsers = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
  
      const data = await response.json();
      return data; // Return the array of users
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  export const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials!");
      }
  
      await AsyncStorage.setItem("access_token", data.access);
      await AsyncStorage.setItem("refresh_token", data.refresh);
      await AsyncStorage.setItem("user_id", String(data.user.id));
      await AsyncStorage.setItem("user_username", data.user.username);

      return data; // Return login response
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  export const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Error!");
      }
  
      return data; // Return singup response
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  };

  export const fetchUserHobbies = async (userId: number) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}/hobbies/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user hobbies:", error);
      throw error;
    }
  };
  
  export const addUserHobby = async (userId: number, hobbyId: number) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}/hobbies/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ hobby_id: hobbyId })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        // Use the error message from the API
        const errorMessage = data.error || 'Unknown error';
        Alert.alert("Error", errorMessage);
        return; // Early return
      }
  
      return data;
    } catch (error: any) {
      console.error("Error adding user hobby:", error);
      Alert.alert("Error", error.message || "Failed to add hobby.");
      throw error;
    }
  };
  
  export const deleteUserHobby = async (userId: number, hobbyId: number) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}/hobbies/delete/${hobbyId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      return;
    } catch (error) {
      console.error("Error deleting user hobby:", error);
      throw error;
    }
  };

  export const addUserTask = async (userId: number, taskData: TaskFormData) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(taskData) // ✅ Send taskData as the request body
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the error message from the API
        const errorMessage = data.error || 'Failed to add task'; // ✅ Updated error message
        Alert.alert("Error", errorMessage);
        return; // Early return
      }

      return data;
    } catch (error: any) {
      console.error("Error adding user task:", error); // ✅ Updated console log message
      Alert.alert("Error", error.message || "Failed to add task."); // ✅ Updated alert message
      throw error;
    }
  };

  export const fetchUserTasks = async (userId: number) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/tasks/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      throw error;
    }
  };

  export const deleteUserTask = async (userId: number, taskId: number) => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      return;
    } catch (error) {
      console.error("Error deleting user task:", error);
      throw error;
    }
  };