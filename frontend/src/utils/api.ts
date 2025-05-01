import { API_BASE_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from 'react-native'; // Import Alert
import { RoutineData, TaskFormData, UserRoutineResponse, User} from "./model";
import { FriendRequest } from "./model";

// Helper function to get authentication headers
const getAuthHeaders = async () => {
  const accessToken = await AsyncStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
};

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

export const fetchUserDetails = async (): Promise<User> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/details/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `HTTP error! Status: ${response.status}`);
    }

    const data: User = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    Alert.alert("Error", error.message || "Failed to fetch user details.");
    throw error;
  }
};

export const fetchPublicUserDetails = async (username: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${username}/`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `HTTP error! Status: ${response.status}`);
    }

    const data: User = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching public user details:", error);
    Alert.alert("Error", error.message || "Failed to fetch user details.");
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

  export const signup = async (
    firstName: string,
    lastName: string,
    username: string, 
    email: string, 
    password: string
) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username, 
          email, 
          password,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Error!");
      }
  
      return data; // Return signup response
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

  // Send a friend request
export const sendFriendRequest = async (toUserId: number) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/friends/send/${toUserId}/`, {
      method: "POST",
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      Alert.alert("Error", data.error || "Failed to send friend request.");
      return;
    }

    return data;
  } catch (error: any) {
    console.error("Error sending friend request:", error);
    Alert.alert("Error", error.message || "Failed to send friend request.");
    throw error;
  }
};

// Respond to a friend request (Accept or Reject)
export const respondToFriendRequest = async (requestId: number, action: "Accept" | "Reject") => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/friends/respond/${requestId}/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ action }),
    });

    const data = await response.json();
    if (!response.ok) {
      Alert.alert("Error", data.error || "Failed to respond to friend request.");
      return;
    }

    return data;
  } catch (error: any) {
    console.error("Error responding to friend request:", error);
    Alert.alert("Error", error.message || "Failed to respond to friend request.");
    throw error;
  }
};

// List all friends of the authenticated user
export const fetchFriends = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/friends/list/`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch friends");
    }

    const data = await response.json();

    // Map API response to match the expected structure
    return data.map((friend: { id: number; username: string, first_name: string, last_name: string, profile_picture: string }) => ({
      id: friend.id,
      name: friend.username,
      first_name: friend.first_name,
      last_name: friend.last_name,
      profile_picture: friend.profile_picture
    }));
  } catch (error) {
    console.error("Error fetching friends:", error);
    throw error;
  }
};

// Remove a friend
export const removeFriend = async (friendId: number) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/friends/remove/${friendId}/`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to remove friend");
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing friend:", error);
    throw error;
  }
};

export const fetchFriendshipDetails = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/friends/details/`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch friendship details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching friendship details:", error);
    throw error;
  }
};


export const fetchUserRoutines = async (): Promise<UserRoutineResponse> => {
  try {
    const accessToken = await AsyncStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/api/user-routine/`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
      }
  });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: UserRoutineResponse = await response.json() as UserRoutineResponse;
    return data;
  } catch (error) {
    console.error("Error fetching user routines:", error);
    throw error;
  }
};


export const fetchFriendRequests = async (): Promise<FriendRequest[]> => {
  try {
    const accessToken = await AsyncStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/api/friends/requests/`, { // Replace with your actual endpoint
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch friend requests: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data as FriendRequest[]; // Type assertion

  } catch (error: any) {
    console.error("Error fetching friend requests:", error);
    Alert.alert("Error", error.message || "Failed to fetch friend requests.");
    throw error;
  }
};

// Get all messages between the authenticated user and a friend
export const fetchMessages = async (friendId: number) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/messages/${friendId}/`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to fetch messages");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    Alert.alert("Error", error.message || "Failed to fetch messages.");
    throw error;
  }
};

// Send a message to a friend
export const sendMessage = async (friendId: number, message: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/messages/${friendId}/send/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to send message");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error sending message:", error);
    Alert.alert("Error", error.message || "Failed to send message.");
    throw error;
  }
};

// Mark messages from a friend as read
export const markMessagesAsRead = async (friendId: number) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/messages/${friendId}/mark-read/`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to mark messages as read");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    Alert.alert("Error", error.message || "Failed to mark messages as read.");
    throw error;
  }
};

export const generateRoutine = async (userId: number) => {
  try {
    const accessToken = await AsyncStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/api/generate-routine/${userId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || 'Failed to generate routine';
      Alert.alert("Error", errorMessage);
      return;
    }

    return data.routine as RoutineData;
  } catch (error: any) {
    console.error("Error generating routine:", error);
    Alert.alert("Error", error.message || "Failed to generate routine.");
    throw error;
  }
};

export const updateRoutine = async (userId: number) => {
  try {
    const accessToken = await AsyncStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/api/generate-routine/${userId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || 'Failed to update routine';
      Alert.alert("Error", errorMessage);
      return;
    }

    return data.routine as RoutineData;
  } catch (error: any) {
    console.error("Error updating routine:", error);
    Alert.alert("Error", error.message || "Failed to update routine.");
    throw error;
  }
};

// Upload user profile picture using FormData
export const uploadUserPfp = async (profilePictureUri: string) => {
  try {
    const headers = await getAuthHeaders(); // Get auth token header

    const formData = new FormData();

    const uriParts = profilePictureUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    let fileType = '';
    const nameParts = fileName.split('.');
    if (nameParts.length > 1) {
        const extension = nameParts[nameParts.length - 1].toLowerCase();
        if (extension === 'jpg' || extension === 'jpeg') {
            fileType = 'image/jpeg';
        } else if (extension === 'png') {
            fileType = 'image/png';
        } else if (extension === 'gif') {
            fileType = 'image/gif';
        } else {
            fileType = 'application/octet-stream'; // Or handle appropriately
            console.warn("Unknown file type for:", fileName);
        }
    }

    if (!fileType) {
         Alert.alert("Error", "Could not determine file type for upload.");
         return; // Or throw error
    }
    formData.append('profile_picture', {
      uri: profilePictureUri,
      name: fileName,
      type: fileType,
    } as any); // Use 'as any' or define a proper type if using strict TypeScript

    // delete headers['Content-Type'];

    const response = await fetch(`${API_BASE_URL}/api/upload-pfp/`, {
      method: "PUT", // Or POST, depending on your preference, PUT is common for updates
      headers: {
        'Authorization': headers.Authorization
      },
      body: formData,   // Send the FormData object as the body
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || data.detail || "Failed to upload profile picture";
      Alert.alert("Error", errorMessage);
      console.error("Upload error details:", data);
      // Do not throw here if you handle errors with Alerts, just return maybe null
      return null;
    }

    // Handle success response
    Alert.alert("Success", data.message || "Profile picture uploaded successfully!");
    // Return the updated data which should include the new public URL
    return data;

  } catch (error: any) {
    console.error("Error uploading profile picture:", error);
    const errorMessage = error.message || "An unexpected error occurred during upload.";
    Alert.alert("Error", errorMessage);
    // throw error; // Re-throwing might crash the app if not caught upstream
     return null;
  }
};