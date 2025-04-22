import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView, // Import KeyboardAvoidingView
  Platform,             // Import Platform
  ActivityIndicator,    // For potential loading states
  Keyboard,             // To dismiss keyboard
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native'; // Import useNavigation
import { RootStackParamList } from '../../App'; // Adjust path if needed
import { fetchMessages, sendMessage as sendMessageAPI, markMessagesAsRead, fetchPublicUserDetails } from "../utils/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../config"; // Adjust path if needed
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

// --- Color Palette ---
const PRIMARY_COLOR = "rgba(197, 110, 50, 0.9)";
const PRIMARY_COLOR_LIGHT = "rgba(197, 110, 50, 0.1)";
const BACKGROUND_COLOR = "#FFFFFF";
const INPUT_BACKGROUND_COLOR = "#F5F5F5"; // Background for input area
const SENDER_BUBBLE_COLOR = PRIMARY_COLOR;
const RECEIVER_BUBBLE_COLOR = "#ECECEC"; // Lighter grey for receiver
const TEXT_COLOR_LIGHT = "#FFFFFF";
const TEXT_COLOR_DARK = "#222222"; // Slightly darker text
const TEXT_COLOR_SECONDARY = "#666666";
const BORDER_COLOR = "#E0E0E0";
const HEADER_BACKGROUND = "#FFFFFF";

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chats'>; // Ensure 'Chats' matches your navigator key

// Define a Message type (adjust based on your actual API response)
type Message = {
  id: number;
  sender: { username: string; id: number; }; // Assuming sender object structure
  receiver: { username: string; id: number; }; // Assuming receiver object structure
  message: string;
  timestamp: string;
  read: boolean;
};

// Define User type based on fetchPublicUserDetails response
type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string; // Optional profile picture from details
};

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation(); // For potential back navigation
  const { friendId, friendName, friendAvatar } = route.params; // friendAvatar might be overridden by fetched details

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUsername, setCurrentUsername] = useState<string | null>(null); // Store logged-in user's username
  const [friendDetails, setFriendDetails] = useState<User | null>(null); // Store fetched friend details
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false); // State for sending indicator
  const flatListRef = useRef<FlatList>(null);

  // --- Fetching Logic ---
  useEffect(() => {
    const getUsername = async () => {
      const savedUsername = await AsyncStorage.getItem("user_username");
      setCurrentUsername(savedUsername);
    };
    getUsername();
  }, []);

  useEffect(() => {
    // Fetch friend's full details when the screen loads or friendId changes
    const loadFriendDetails = async () => {
      if (friendName) { // Use friendName passed initially or fetch by ID if needed
        try {
          // Assuming fetchPublicUserDetails can work with username
           const details = await fetchPublicUserDetails(friendName);
           setFriendDetails(details);
        } catch (error) {
             console.error("Failed to fetch friend details:", error);
             // Set fallback details from route params if fetch fails
             setFriendDetails({
                 id: friendId,
                 username: friendName,
                 first_name: friendName, // Fallback
                 last_name: "",
                 profile_picture: friendAvatar
             });
        }
      } else {
          console.warn("Friend name not available to fetch details.");
          // Fallback using route params
          setFriendDetails({
              id: friendId,
              username: friendName || "Friend", // Fallback name
              first_name: friendName || "Friend",
              last_name: "",
              profile_picture: friendAvatar
          });
      }
    };

    loadFriendDetails();
  }, [friendId, friendName, friendAvatar]); // Rerun if these change

  useEffect(() => {
    // Fetch messages and mark as read when friendId is known
    const initChat = async () => {
      if (!friendId || !currentUsername) return; // Wait until we have necessary IDs

      setLoading(true);
      try {
        const msgs = await fetchMessages(friendId);
        // Sort messages: Oldest first for FlatList (inverted handles display)
        const sortedMsgs = msgs.sort(
          (a: Message, b: Message) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessages(sortedMsgs);
        await markMessagesAsRead(friendId); // Mark as read after fetching
      } catch (err) {
        console.error('Failed to load messages or mark as read', err);
        Alert.alert("Error", "Could not load chat messages.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUsername) {
      initChat();
    }

     // Optional: Set up polling or WebSocket for real-time messages
     // const intervalId = setInterval(initChat, 5000); // Example polling every 5s
     // return () => clearInterval(intervalId);

  }, [friendId, currentUsername]); // Depend on friendId and currentUsername

  // --- Sending Logic ---
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !currentUsername) return;

    setSending(true);
    const optimisticMessage: Message = { // Create message optimistically
        id: Date.now(), // Temporary ID
        sender: { username: currentUsername, id: 0 }, // Placeholder ID
        receiver: { username: friendDetails?.username || '', id: friendId },
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: false,
    };

    // Add optimistically to UI
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    Keyboard.dismiss(); // Dismiss keyboard after sending attempt

    try {
      await sendMessageAPI(friendId, optimisticMessage.message);
      // Optionally reload messages from server to confirm and get real ID/timestamp
      // await loadMessages(); // You might want a more targeted update or rely on push notifications/websockets
    } catch (err) {
      console.error("Error sending message", err);
      Alert.alert("Error", "Message could not be sent.");
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    } finally {
       setSending(false);
    }
  };

  // --- Helper ---
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // --- Render ---
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isSender = item.sender.username === currentUsername;
    return (
      <View style={[
          styles.chatBubbleBase,
          isSender ? styles.senderBubble : styles.receiverBubble,
        ]}
      >
        <Text style={[styles.messageText, isSender ? styles.senderText : styles.receiverText]}>
          {item.message}
        </Text>
        <Text style={[styles.messageTime, isSender ? styles.senderTime : styles.receiverTime]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  const friendDisplayName = friendDetails ? `${friendDetails.first_name || ''} ${friendDetails.last_name || ''}`.trim() : friendName || "Chat";
  const finalFriendAvatar = friendDetails?.profile_picture || friendAvatar; // Prefer fetched avatar

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Adjust offset if header height changes
    >
      {/* Header */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
         </TouchableOpacity>
         <Image
            source={
                finalFriendAvatar
                ? { uri: API_BASE_URL + finalFriendAvatar } // Prepend base URL if avatar is relative path
                : require("../../assets/default_user.jpg") // Local fallback
            }
            style={styles.avatar}
         />
         <View style={styles.headerTextContainer}>
             <Text style={styles.friendName} numberOfLines={1}>{friendDisplayName}</Text>
             {/* Add online status here if available */}
             {/* <Text style={styles.statusText}>Online</Text> */}
         </View>
         <TouchableOpacity style={styles.menuButton} onPress={() => Alert.alert("Menu", "Menu options not implemented yet.")}>
             <Ionicons name="ellipsis-vertical" size={22} color={PRIMARY_COLOR} />
         </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      {loading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
      ) : (
          <FlatList
             ref={flatListRef}
             data={messages}
             keyExtractor={(item) => item.id.toString()}
             renderItem={renderMessageItem}
             style={styles.chatList}
             contentContainerStyle={styles.chatListContainer}
             inverted // Keep newest messages at the bottom
             onContentSizeChange={() => {
                // Optional: Ensure scroll to bottom when new messages load if not already there
                // if (!loading && messages.length > 0) flatListRef.current?.scrollToEnd({ animated: false });
             }}
             onLayout={() => {
                 // Optional: Scroll to bottom on initial layout
                 // if (messages.length > 0) flatListRef.current?.scrollToEnd({ animated: false });
             }}
          />
      )}

      {/* Chat Input Bar */}
      <View style={styles.inputBar}>
         {/* Optional: Add attachment button */}
         {/* <TouchableOpacity style={styles.iconButton}>
             <Ionicons name="attach" size={24} color={TEXT_COLOR_SECONDARY} />
         </TouchableOpacity> */}
         <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={TEXT_COLOR_SECONDARY}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            editable={!sending} // Disable input while sending
         />
         <TouchableOpacity
            style={[styles.sendButtonContainer, sending && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={sending || !newMessage.trim()}
         >
             {sending ? (
                 <ActivityIndicator size="small" color={ICON_COLOR_LIGHT} />
             ) : (
                 <Ionicons name="send" size={20} color={TEXT_COLOR_LIGHT} />
             )}
         </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR, // Use clean white background
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: HEADER_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingTop: Platform.OS === 'ios' ? 40 : 10, // Basic safe area handling for iOS status bar
  },
  backButton: {
    padding: 5,
    marginRight: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20, // Perfect circle
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1, // Takes available space
    justifyContent: 'center',
  },
  friendName: {
    fontSize: 17, // Slightly smaller, cleaner
    fontWeight: '600', // Semibold
    color: TEXT_COLOR_DARK,
  },
  statusText: { // Example style for online status
    fontSize: 12,
    color: TEXT_COLOR_SECONDARY,
  },
  menuButton: {
    padding: 8,
  },
  // --- Chat List ---
  chatList: {
    flex: 1, // Takes remaining space
  },
  chatListContainer: {
    paddingHorizontal: 12,
    paddingVertical: 15, // More vertical padding
  },
  // --- Chat Bubbles ---
  chatBubbleBase: {
    maxWidth: '80%', // Max width for bubbles
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18, // Nicer rounding
    marginBottom: 10,
    minWidth: 60, // Ensure time fits well
  },
  senderBubble: {
    alignSelf: 'flex-end',
    backgroundColor: SENDER_BUBBLE_COLOR,
    borderBottomRightRadius: 4, // Slightly flattened corner
  },
  receiverBubble: {
    alignSelf: 'flex-start',
    backgroundColor: RECEIVER_BUBBLE_COLOR,
    borderBottomLeftRadius: 4, // Slightly flattened corner
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22, // Improve readability
  },
  senderText: {
    color: TEXT_COLOR_LIGHT,
  },
  receiverText: {
    color: TEXT_COLOR_DARK,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 5,
    alignSelf: 'flex-end', // Time always at the bottom right
  },
  senderTime: {
    color: 'rgba(255, 255, 255, 0.7)', // Lighter time text on dark bubble
  },
  receiverTime: {
    color: TEXT_COLOR_SECONDARY,
  },
  // --- Input Bar ---
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: INPUT_BACKGROUND_COLOR, // Use specific background for input area
  },
  iconButton: { // Style for potential attachment button
      padding: 8,
      marginRight: 5,
  },
  input: {
    flex: 1,
    minHeight: 42, // Slightly taller input
    maxHeight: 120, // Allow multiple lines but limit height
    borderRadius: 21, // Match height for rounded look
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: BACKGROUND_COLOR, // White input background
    fontSize: 16,
    color: TEXT_COLOR_DARK,
    marginRight: 10, // Space between input and send button
    borderWidth: 1,
    borderColor: BORDER_COLOR, // Subtle border
  },
  sendButtonContainer: {
    width: 42,
    height: 42,
    borderRadius: 21, // Perfect circle
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
      backgroundColor: '#BDBDBD', // Grey out when disabled
  },
  // --- Loading ---
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR,
  },
});

export default ChatScreen;