import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import {
  fetchMessages,
  sendMessage as sendMessageAPI,
  markMessagesAsRead,
  fetchPublicUserDetails,
} from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY_COLOR = "rgba(197, 110, 50, 0.9)";
const PRIMARY_COLOR_LIGHT = "rgba(197, 110, 50, 0.1)";
const BACKGROUND_COLOR = "#FFFFFF";
const INPUT_BACKGROUND_COLOR = "#F5F5F5";
const SENDER_BUBBLE_COLOR = PRIMARY_COLOR;
const RECEIVER_BUBBLE_COLOR = "#ECECEC";
const TEXT_COLOR_LIGHT = "#FFFFFF";
const TEXT_COLOR_DARK = "#222222";
const TEXT_COLOR_SECONDARY = "#666666";
const BORDER_COLOR = "#E0E0E0";
const HEADER_BACKGROUND = "#FFFFFF";

type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chats">;

type Message = {
  id: number;
  sender: { username: string; id: number };
  receiver: { username: string; id: number };
  message: string;
  timestamp: string;
  read: boolean;
};

type User = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string | null;
};

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { friendId, friendName, friendAvatar } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [friendDetails, setFriendDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const getUsername = async () => {
      const savedUsername = await AsyncStorage.getItem("user_username");
      setCurrentUsername(savedUsername);
    };
    getUsername();
  }, []);

  useEffect(() => {
    const loadFriendDetails = async () => {
      if (friendName) {
        try {
          const details = await fetchPublicUserDetails(friendName);
          setFriendDetails(details);
        } catch {
          setFriendDetails({
            id: friendId,
            username: friendName,
            first_name: friendName,
            last_name: "",
            profile_picture: friendAvatar,
          });
        }
      } else {
        setFriendDetails({
          id: friendId,
          username: friendName || "Friend",
          first_name: friendName || "Friend",
          last_name: "",
          profile_picture: friendAvatar,
        });
      }
    };
    loadFriendDetails();
  }, [friendId, friendName, friendAvatar]);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    const initChat = async () => {
      if (!friendId || !currentUsername) return;

      setLoading(true);
      try {
        const msgs = await fetchMessages(friendId);
        const sortedMsgs = msgs.sort(
          (a: Message, b: Message) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setMessages(sortedMsgs);
        await markMessagesAsRead(friendId);
        setTimeout(scrollToBottom, 300);
      } catch (err) {
        Alert.alert("Error", "Could not load chat messages.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUsername) initChat();
  }, [friendId, currentUsername]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !currentUsername) return;

    setSending(true);
    const optimisticMessage: Message = {
      id: Date.now(),
      sender: { username: currentUsername, id: 0 },
      receiver: { username: friendDetails?.username || "", id: friendId },
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    Keyboard.dismiss();

    setTimeout(scrollToBottom, 100); // Auto-scroll after sending

    try {
      await sendMessageAPI(friendId, optimisticMessage.message);
    } catch (err) {
      Alert.alert("Error", "Message could not be sent.");
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id)
      );
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isSender = item.sender.username === currentUsername;
    return (
      <View
        style={[
          styles.chatBubbleBase,
          isSender ? styles.senderBubble : styles.receiverBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isSender ? styles.senderText : styles.receiverText,
          ]}
        >
          {item.message}
        </Text>
        <Text
          style={[
            styles.messageTime,
            isSender ? styles.senderTime : styles.receiverTime,
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  const friendDisplayName = friendDetails
    ? `${friendDetails.first_name || ""} ${
        friendDetails.last_name || ""
      }`.trim()
    : friendName || "Chat";
  const finalFriendAvatar = friendDetails?.profile_picture || friendAvatar;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Image
          source={
            finalFriendAvatar
              ? { uri: API_BASE_URL + finalFriendAvatar }
              : require("../../assets/default_user.jpg")
          }
          style={styles.avatar}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.friendName} numberOfLines={1}>
            {friendDisplayName}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() =>
            Alert.alert("Menu", "Menu options not implemented yet.")
          }
        >
          <Ionicons name="ellipsis-vertical" size={22} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

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
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={TEXT_COLOR_SECONDARY}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          editable={!sending}
        />
        <TouchableOpacity
          style={[
            styles.sendButtonContainer,
            sending && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={sending || !newMessage.trim()}
        >
          {sending ? (
            <ActivityIndicator size="small" color={TEXT_COLOR_LIGHT} />
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
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: HEADER_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingTop: Platform.OS === "ios" ? 40 : 10,
  },
  backButton: {
    padding: 5,
    marginRight: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  friendName: {
    fontSize: 17,
    fontWeight: "600",
    color: TEXT_COLOR_DARK,
  },
  menuButton: {
    padding: 8,
  },
  chatList: {
    flex: 1,
  },
  chatListContainer: {
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  chatBubbleBase: {
    maxWidth: "80%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 10,
    minWidth: 60,
  },
  senderBubble: {
    alignSelf: "flex-end",
    backgroundColor: SENDER_BUBBLE_COLOR,
    borderBottomRightRadius: 4,
  },
  receiverBubble: {
    alignSelf: "flex-start",
    backgroundColor: RECEIVER_BUBBLE_COLOR,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
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
    alignSelf: "flex-end",
  },
  senderTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  receiverTime: {
    color: TEXT_COLOR_SECONDARY,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: INPUT_BACKGROUND_COLOR,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: BACKGROUND_COLOR,
    fontSize: 16,
    color: TEXT_COLOR_DARK,
    marginRight: 10,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  sendButtonContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR,
  },
});

export default ChatScreen;
