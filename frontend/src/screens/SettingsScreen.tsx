import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [username, setUsername] = useState<string>('');
  const [isOffDay, setIsOffDay] = useState(false);

  const settings = [
    { id: '1', title: 'View Hobbies', action: () => console.log('View Hobbies') },
    { id: '2', title: 'View Tasks', action: () => console.log('View Tasks') },
    { id: '3', title: 'View Saved Routines', action: () => console.log('View Saved Routines') },
    { id: '4', title: 'Update Username', action: () => console.log('Update Username') },
    { id: '5', title: 'Change Password', action: () => console.log('Change Password') },
  ];

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('user_username');
        if (savedUsername) {
          setUsername(savedUsername);
        }
      } catch (error) {
        console.error('Failed to fetch username from AsyncStorage:', error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.profileImageWrapper}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editIcon}>
            <Text style={styles.editText}>✏️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.username}>{username || 'Loading...'}</Text>
      </View>

      <FlatList
        data={settings}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Off Day</Text>
            <Switch
              value={isOffDay}
              onValueChange={(value) => setIsOffDay(value)}
              thumbColor={isOffDay ? '#76c7c0' : '#ccc'}
              trackColor={{ false: '#e0e0e0', true: '#cceeea' }}
            />
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.settingItem} onPress={item.action}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 4,
  },
  editText: {
    fontSize: 12,
    color: '#333',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
});
