import { API_BASE_URL } from "../config";

export const fetchHobbies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hobbies/`); // API endpoint for hobbies

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
      const response = await fetch(`${API_BASE_URL}/api/users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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