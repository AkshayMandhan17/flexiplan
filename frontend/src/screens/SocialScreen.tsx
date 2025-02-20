import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { fetchUsers, fetchFriendshipDetails, sendFriendRequest } from '../utils/api';
import { User } from '../utils/model';

const SocialTab = ({ navigation }: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [friendshipStatuses, setFriendshipStatuses] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    const loadFriendshipStatuses = async () => {
      try {
        const data = await fetchFriendshipDetails();
        const statusMap: { [key: number]: string } = {};

        data.forEach((request: { friend: number; status: string }) => {
          statusMap[request.friend] = request.status;
        });

        setFriendshipStatuses(statusMap);
      } catch (error) {
        console.error('Failed to load friendship statuses:', error);
      }
    };

    loadUsers();
    loadFriendshipStatuses();
  }, []);

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleSendRequest = async (friendId: number) => {
    try {
      await sendFriendRequest(friendId);
      setFriendshipStatuses((prev) => ({ ...prev, [friendId]: 'Pending' }));
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.heading}>Find Friends</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search friends..."
          value={searchTerm}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.avatar} />

            <View style={styles.textContainer}>
              <Text style={styles.name}>{item.username}</Text>
              <Text style={styles.lastMessage}>no messages yet</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: friendshipStatuses[item.id] === 'Pending' ? '#ccc' : '#9dbfb6' },
              ]}
              onPress={() => handleSendRequest(item.id)}
              disabled={friendshipStatuses[item.id] === 'Pending'}
            >
              <Text style={{ color: '#FFF' }}>
                {friendshipStatuses[item.id] === 'Pending' ? 'Pending' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#333',
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