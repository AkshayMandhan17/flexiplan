import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ListRenderItem,
  TouchableOpacity,
  Alert,
} from "react-native";
import { fetchFriends, removeFriend } from "../utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { StackNavigationProp } from "@react-navigation/stack";

// Types
interface Friend {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
}

interface FriendsScreenState {
  friends: Friend[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

// Components
function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={60} color="#00aaff" />
      <Text style={styles.emptyStateText}>No friends found</Text>
      <Text style={styles.emptyStateSubtext}>
        Pull to refresh and try again
      </Text>
    </View>
  );
}

function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
      <Text style={styles.retryButton} onPress={onRetry}>
        Tap to retry
      </Text>
    </View>
  );
}

function FriendItem({
  friend,
  onRemove,
  onPress,
}: {
  friend: Friend;
  onRemove: (id: number) => void;
  onPress: (friend: Friend) => void;
}) {
  console.log(friend);
  return (
    <TouchableOpacity onPress={() => onPress(friend)} style={styles.friendItem}>
      {/* <Ionicons name="person-circle-outline" size={40} color="white" style={styles.friendIcon} /> */}
      <Image
        source={
          friend.profile_picture
            ? { uri: friend.profile_picture }
            : require("../../assets/default_user.jpg")
        }
        style={styles.avatar}
      />
      <Text style={styles.friendName}>
        {friend.first_name} {friend.last_name}
      </Text>
      <TouchableOpacity
        onPress={() => onRemove(friend.id)}
        style={styles.removeButton}
      >
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function FriendsScreen() {
  // const navigation = useNavigation(); // Add this at the top of FriendsScreen
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [state, setState] = useState<FriendsScreenState>({
    friends: [],
    loading: true,
    refreshing: false,
    error: null,
  });

  const loadFriends = useCallback(async (isRefreshing = false) => {
    try {
      setState((prev) => ({
        ...prev,
        loading: !isRefreshing,
        refreshing: isRefreshing,
        error: null,
      }));

      const friendsList = await fetchFriends();

      setState((prev) => ({
        ...prev,
        friends: friendsList,
        loading: false,
        refreshing: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to load friends",
        loading: false,
        refreshing: false,
      }));
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const handleRefresh = useCallback(() => {
    loadFriends(true);
  }, [loadFriends]);

  const handleRemoveFriend = useCallback(async (friendId: number) => {
    Alert.alert(
      "Remove Friend",
      "Are you sure you want to remove this friend?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFriend(friendId);
              setState((prev) => ({
                ...prev,
                friends: prev.friends.filter(
                  (friend) => friend.id !== friendId
                ),
              }));
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to remove friend. Please try again."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, []);

  const handlePressFriend = useCallback(
    (friend: Friend) => {
      navigation.navigate("Chats", {
        friendId: friend.id,
        friendName: friend.name,
        friendAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${friend.name}`,
      });
    },
    [navigation]
  );

  const renderItem: ListRenderItem<Friend> = useCallback(
    ({ item }) => (
      <FriendItem
        friend={item}
        onRemove={handleRemoveFriend}
        onPress={handlePressFriend}
      />
    ),
    [handleRemoveFriend, handlePressFriend]
  );

  if (state.loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00aaff" />
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.title}>My Friends</Text>

        {state.error ? (
          <ErrorView message={state.error} onRetry={() => loadFriends()} />
        ) : (
          <FlatList
            data={state.friends}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={state.refreshing}
                onRefresh={handleRefresh}
                colors={["#00aaff"]}
                tintColor="#00aaff"
              />
            }
            ListEmptyComponent={EmptyState}
            contentContainerStyle={
              state.friends.length === 0 && styles.emptyListContent
            }
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        )}
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Semi-transparent black overlay
  },
  container: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 15,
  },
  errorContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#ff4d4d",
    alignItems: "center",
    marginHorizontal: 20,
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    color: "#00aaff",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  friendIcon: {
    marginRight: 15,
  },
  friendName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff", // White text
  },
  removeButton: {
    padding: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 10,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#f0f0f0",
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FriendsScreen;
