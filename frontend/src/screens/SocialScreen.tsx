import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

const SocialTab = ({ navigation }: any) => {
  const [friends, setFriends] = useState([
    { id: '1', name: 'Ece Akman', lastMessage: 'Facebook', added: false },
    { id: '2', name: 'Gracelyn', lastMessage: '4 mutual friends', added: true },
    { id: '3', name: 'Daisy Morgan', lastMessage: '8 mutual friends', added: false },
    { id: '4', name: 'Marie Jensen', lastMessage: 'Facebook', added: false },
    { id: '5', name: 'Cain Kemp', lastMessage: '54 mutual friends', added: false },
  ]);

  const toggleAdd = (id: string) => {
    setFriends((prev) =>
      prev.map((friend) =>
        friend.id === id ? { ...friend, added: !friend.added } : friend
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <Text style={styles.heading}>Find Friends</Text>
        <TextInput style={styles.searchBar} placeholder="Search friends..." />
      </View>

      {/* Friends List */}
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ChatScreen', {
                friendName: item.name,
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
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>

            {/* Add Button */}
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: item.added ? '#e0e0e0' : '#9dbfb6' },
              ]}
              onPress={() => toggleAdd(item.id)}
              disabled={item.added}
            >
              <Text style={{ color: item.added ? '#888' : '#fff' }}>
                {item.added ? 'Added' : 'Add'}
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
