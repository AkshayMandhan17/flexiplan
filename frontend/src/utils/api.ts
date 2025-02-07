import { API_BASE_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

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