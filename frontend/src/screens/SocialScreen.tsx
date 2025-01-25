import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { fetchUsers } from '../utils/api'; // Import the updated API call
import { User } from '../utils/model'; // Import the User interface

const SocialTab = ({ navigation }: any) => {
  const [users, setUsers] = useState<User[]>([]); // State for storing users data
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // State for filtered users based on search
  const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering users

  // Fetch users from the backend API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers(); // Call the API to fetch users
        setUsers(data); // Set the users data
        setFilteredUsers(data); // Set the filtered list as well
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    loadUsers();
  }, []);

  // Handle search input change
  const handleSearch = (text: string) => {
    setSearchTerm(text);

    // Filter users based on search term
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // // Toggle Add friend status (for now, this is just a mock)
  // const toggleAdd = (id: string) => {
  //   setFilteredUsers((prev) =>
  //     prev.map((user) =>
  //       user.id === id ? { ...user, added: !user.added } : user
  //     )
  //   );
  // };

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <Text style={styles.heading}>Find Friends</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search friends..."
          value={searchTerm}
          onChangeText={handleSearch} // Filter users on text change
        />
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ChatScreen', {
                friendName: item.username,
                friendId: item.id,
              })
            }
          >
            <View style={styles.listItem}>
              {/* Avatar */}
              <Image
                source={{ uri: 'https://via.placeholder.com/50' }} // Placeholder image
                style={styles.avatar}
              />

              {/* Name and Last Message */}
              <View style={styles.textContainer}>
                <Text style={styles.name}>{item.username}</Text>
                <Text style={styles.lastMessage}>
                  no messages yet
                </Text>
              </View>

              {/* Add Button */}
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: '#9dbfb6' },
                ]}
              >
                <Text style={{ color: '#FFF' }}>
                  {/* {item.added ? 'Added' : 'Add'} */}
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    height: '30%',
    backgroundColor: '#333', // Darker background
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  searchBar: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
});

export default SocialTab;
