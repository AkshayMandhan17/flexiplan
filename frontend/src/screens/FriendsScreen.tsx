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
  Image,
  Animated,
  Easing,
} from "react-native";
import { fetchFriends, removeFriend } from "../utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Animatable from "react-native-animatable";

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

// Constants
const PRIMARY_COLOR = "rgba(197, 110, 50, 0.9)";
const LIGHT_PRIMARY_COLOR = "rgba(197, 110, 50, 0.2)";
const TEXT_ON_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#333333";
const ERROR_COLOR = "#FF4D4D";
const DISABLED_COLOR = "#888888";

// Components
function EmptyState() {
  return (
    <View style={enhancedStyles.emptyState}>
      <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite">
        <Ionicons name="people-outline" size={70} color={PRIMARY_COLOR} />
      </Animatable.View>
      <Text style={enhancedStyles.emptyStateText}>No connections found</Text>
      <Text style={enhancedStyles.emptyStateSubtext}>
        Pull down to refresh and discover amazing people
      </Text>
    </View>
  );
}

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Animatable.View animation="fadeIn" style={enhancedStyles.errorContainer}>
      <Ionicons name="warning-outline" size={50} color={ERROR_COLOR} />
      <Text style={enhancedStyles.errorText}>{message}</Text>
      <TouchableOpacity style={enhancedStyles.retryButton} onPress={onRetry}>
        <Text style={enhancedStyles.retryButtonText}>Tap to try again</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
}

function FriendItem({ friend, onRemove, onPress }: { friend: Friend; onRemove: (id: number) => void; onPress: (friend: Friend) => void }) {
  const scale = useState(new Animated.Value(1))[0];

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 50,
      friction: 5,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 5,
    }).start();
    onPress(friend);
  }, [scale, onPress, friend]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity style={enhancedStyles.friendItem} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.8}>
        <Image
          source={friend.profile_picture ? { uri: friend.profile_picture } : require("../../assets/default_user.jpg")}
          style={enhancedStyles.avatar}
        />
        <View style={enhancedStyles.friendInfo}>
          <Text style={enhancedStyles.friendName}>
            {friend.first_name} {friend.last_name}
          </Text>
          <Text style={enhancedStyles.friendId}>ID: {friend.id}</Text>
        </View>
        <TouchableOpacity onPress={() => onRemove(friend.id)} style={enhancedStyles.removeButton}>
          <Ionicons name="close-circle" size={30} color={ERROR_COLOR} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

function FriendsScreen() {
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
        error: err instanceof Error ? err.message : "Failed to load connections",
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
      "Remove Connection",
      "Are you sure you want to disconnect?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFriend(friendId);
              setState((prev) => ({
                ...prev,
                friends: prev.friends.filter((friend) => friend.id !== friendId),
              }));
            } catch (error) {
              Alert.alert("Error", "Failed to disconnect. Please try again.");
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
        friendAvatar: friend.profile_picture,
      });
    },
    [navigation]
  );

  const renderItem: ListRenderItem<Friend> = useCallback(
    ({ item }) => (
      <FriendItem friend={item} onRemove={handleRemoveFriend} onPress={handlePressFriend} />
    ),
    [handleRemoveFriend, handlePressFriend]
  );

  if (state.loading) {
    return (
      <View style={enhancedStyles.centerContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={enhancedStyles.loadingText}>Establishing Connections...</Text>
      </View>
    );
  }

  return (
    <Animatable.View animation="fadeIn" style={enhancedStyles.background}>
      <View style={enhancedStyles.header}>
        <Text style={enhancedStyles.title}>Your Connections</Text>
      </View>
      <View style={enhancedStyles.container}>
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
                tintColor={PRIMARY_COLOR}
                colors={[LIGHT_PRIMARY_COLOR, PRIMARY_COLOR, LIGHT_PRIMARY_COLOR]}
              />
            }
            ListEmptyComponent={EmptyState}
            contentContainerStyle={state.friends.length === 0 && enhancedStyles.emptyListContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        )}
      </View>
    </Animatable.View>
  );
}

// Enhanced Styles
const enhancedStyles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F4F4F4", // Light grey background
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderBottomRightRadius:20,
    borderBottomLeftRadius:20,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: TEXT_SECONDARY,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: TEXT_ON_PRIMARY,
    textAlign: "center",
  },
  errorContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#FFE0E0",
    borderWidth: 1,
    borderColor: ERROR_COLOR,
    alignItems: "center",
    marginHorizontal: 30,
    marginVertical: 20,
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: LIGHT_PRIMARY_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: "bold",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 18,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 20,
    fontWeight: "bold",
    color: TEXT_SECONDARY,
    marginBottom: 5,
  },
  friendId: {
    fontSize: 14,
    color: DISABLED_COLOR,
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyStateText: {
    fontSize: 22,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginTop: 15,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: DISABLED_COLOR,
    marginTop: 8,
    textAlign: "center",
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FriendsScreen;