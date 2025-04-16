import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { fetchMessages, sendMessage as sendMessageAPI, markMessagesAsRead } from "../utils/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../config";

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chats'>;

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { friendId, friendName, friendAvatar } = route.params;

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState<string>("");
  const [currentUser, setCurrentUser] = useState();
  
  

  const loadMessages = async () => {
    try {
      const msgs = await fetchMessages(friendId);
      const sortedMsgs = msgs.sort(
        (a: { timestamp: string }, b: { timestamp: string }) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  
      setMessages(sortedMsgs);
    } catch (err) {
      console.log('Failed to load messages', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessageAPI(friendId, newMessage);
      setNewMessage('');
      await loadMessages(); // Refresh after sending
    } catch (err) {
      console.log("Error sending message", err);
    }
  };

  useEffect(() => {
    const initChat = async () => {
      await loadMessages();
      await markMessagesAsRead(friendId);
    };
    initChat();
  }, [friendId]);

  const getAuthHeaders = async () => {
    const accessToken = await AsyncStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
  };

  useEffect(() => {
    const FuncUserDetails = async () => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/users/details/`, {
          method: 'GET',
          headers,
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          console.log(userData);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };
    FuncUserDetails();
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // convert hour '0' to '12'
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  
    return `${hours}:${minutesStr} ${ampm}`;
  };
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("user_username");
        if (savedUsername) {
          setUsername(savedUsername);
        }
      } catch (error) {
        console.error("Failed to fetch username from AsyncStorage:", error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: friendAvatar }} style={styles.avatar} />
        <Text style={styles.friendName}>{currentUser.friendName}</Text>
        <TouchableOpacity>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.chatBubble,
              item.sender.username === username ? styles.senderBubble : styles.receiverBubble,
            ]}
          >
            <Text style={styles.messageText}>{item.message}</Text>
            {/* <Text style={styles.messageTime}>{item.time}</Text> */}
            <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>

          </View>
        )}
        contentContainerStyle={styles.chatContainer}
        inverted // Newest at the bottom
      />

      {/* Chat Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  friendName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  menuDots: {
    fontSize: 20,
    color: '#888',
  },
  chatContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatBubble: {
    maxWidth: '75%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  senderBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#9dbfb6',
  },
  receiverBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  sendButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#9dbfb6',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
