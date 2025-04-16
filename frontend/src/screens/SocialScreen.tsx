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
import {
  fetchUsers,
  fetchFriendshipDetails,
  sendFriendRequest,
  fetchFriendRequests,
  respondToFriendRequest,
} from '../utils/api';
import { User, FriendRequest } from '../utils/model';
import { useIsFocused } from '@react-navigation/native';

const SocialTab = ({ navigation }: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [friendshipStatuses, setFriendshipStatuses] = useState<{ [key: number]: string }>({});
  const [activeTab, setActiveTab] = useState<'findFriends' | 'requests'>('findFriends');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
        setFilteredUsers(data);
        // console.log(data);
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

    const loadFriendRequests = async () => {
      try {
        const data = await fetchFriendRequests();
        setFriendRequests(data);
        // console.log(data);
      } catch (error) {
        console.error('Failed to load friend requests:', error);
      }
    };

    if (isFocused) {
      loadUsers();
      loadFriendshipStatuses();
      if (activeTab === 'requests') {
        loadFriendRequests();
      }
    }
  }, [isFocused, activeTab]);

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    const filtered = users.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      return fullName.includes(text.toLowerCase());
    });
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

  const handleRespondToRequest = async (requestId: number, action: 'Accept' | 'Reject') => {
    try {
      await respondToFriendRequest(requestId, action);
      // Update the friend requests list
      setFriendRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, status: action === 'Accept' ? 'Accepted' : 'Rejected' } : request
        )
      );
    } catch (error) {
      console.error('Failed to respond to friend request:', error);
      Alert.alert('Error', 'Failed to respond to friend request.');
    }
  };

  const renderFindFriendsTab = () => (
    <>
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
              <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
              {/* <Text style={styles.lastMessage}>no messages yet</Text> */}
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
    </>
  );

  const renderRequestsTab = () => (
    <>
      <View style={styles.topSection}>
        <Text style={styles.heading}>Friend Requests</Text>
      </View>

      <FlatList
        data={friendRequests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.avatar} />

            <View style={styles.textContainer}>
              <Text style={styles.name}>{item.sender_username}</Text>
              <Text style={styles.lastMessage}>{item.status}</Text>
            </View>

            {item.status === 'Pending' && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => handleRespondToRequest(item.id, 'Accept')}
                >
                  <Text style={{ color: '#FFF' }}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                  onPress={() => handleRespondToRequest(item.id, 'Reject')}
                >
                  <Text style={{ color: '#FFF' }}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={activeTab === 'findFriends' ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab('findFriends')}
        >
          <Text style={styles.tabText}>Find Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === 'requests' ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={styles.tabText}>Requests</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'findFriends' ? renderFindFriendsTab() : renderRequestsTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#333',
  },
  activeTab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#444',
    alignItems: 'center',
  },
  inactiveTab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#222',
    alignItems: 'center',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  topSection: {
    height: '20%',
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
  },
});

export default SocialTab;