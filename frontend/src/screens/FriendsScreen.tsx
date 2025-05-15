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
  StatusBar,
  Platform,
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

// Constants - keeping your original color scheme
const PRIMARY_COLOR = "rgba(197, 110, 50, 0.9)";
const LIGHT_PRIMARY_COLOR = "rgba(197, 110, 50, 0.2)";
const TEXT_ON_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#333333";
const ERROR_COLOR = "#FF4D4D";
const DISABLED_COLOR = "#888888";
const SUCCESS_COLOR = "#4CAF50";
const BACKGROUND_COLOR = "#F8F8F8";
const CARD_BACKGROUND = "#FFFFFF";

// Components
function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite" duration={2000}>
        <Ionicons name="people-outline" size={90} color={PRIMARY_COLOR} />
      </Animatable.View>
      <Text style={styles.emptyStateTitle}>No connections found</Text>
      <Text style={styles.emptyStateSubtext}>
        Pull down to refresh and discover amazing people
      </Text>
    </View>
  );
}

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Animatable.View animation="fadeIn" style={styles.errorContainer}>
      <Ionicons name="warning-outline" size={60} color={ERROR_COLOR} />
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Tap to try again</Text>
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
    <Animatable.View animation="fadeInUp" duration={300} delay={friend.id * 50 % 300}>
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <TouchableOpacity 
          style={styles.friendItem} 
          onPressIn={handlePressIn} 
          onPressOut={handlePressOut} 
          activeOpacity={0.8}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={friend.profile_picture ? { uri: friend.profile_picture } : require("../../assets/default_user.jpg")}
              style={styles.avatar}
            />
            <View style={styles.statusDot} />
          </View>
          
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>
              {friend.first_name} {friend.last_name}
            </Text>
            <Text style={styles.friendSubtitle}>Tap to chat</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => onRemove(friend.id)} 
            style={styles.removeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={28} color={ERROR_COLOR} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </Animatable.View>
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
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Animatable.Text animation="fadeIn" delay={300} style={styles.loadingText}>
          Establishing Connections...
        </Animatable.Text>
        <Animatable.View animation="fadeIn" delay={600} style={styles.loadingDots}>
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite" 
            style={[styles.loadingDot, { backgroundColor: PRIMARY_COLOR }]} 
          />
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite"
            delay={200}
            style={[styles.loadingDot, { backgroundColor: PRIMARY_COLOR, opacity: 0.8 }]} 
          />
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite"
            delay={400}
            style={[styles.loadingDot, { backgroundColor: PRIMARY_COLOR, opacity: 0.6 }]} 
          />
        </Animatable.View>
      </View>
    );
  }

  return (
    <Animatable.View animation="fadeIn" style={styles.background}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Animatable.Text animation="fadeIn" style={styles.title}>
            Your Connections
          </Animatable.Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{state.friends.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.container}>
        {state.error ? (
          <ErrorView message={state.error} onRetry={() => loadFriends()} />
        ) : (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                {state.friends.length > 0 
                  ? `${state.friends.length} Connection${state.friends.length !== 1 ? 's' : ''}` 
                  : 'No Connections'}
              </Text>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="person-add" size={18} color={TEXT_ON_PRIMARY} />
              </TouchableOpacity>
            </View>
            
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
              contentContainerStyle={[
                styles.listContent,
                state.friends.length === 0 && styles.emptyListContent
              ]}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          </>
        )}
      </View>
    </Animatable.View>
  );
}

// Enhanced Styles
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 20,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_SECONDARY,
  },
  loadingDots: {
    flexDirection: "row",
    marginTop: 12,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: TEXT_ON_PRIMARY,
    textAlign: "center",
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_ON_PRIMARY,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_SECONDARY,
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(197, 110, 50, 0.3)",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: SUCCESS_COLOR,
    borderWidth: 2,
    borderColor: CARD_BACKGROUND,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "bold",
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  friendSubtitle: {
    fontSize: 14,
    color: DISABLED_COLOR,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginTop: 20,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: DISABLED_COLOR,
    marginTop: 10,
    textAlign: "center",
    lineHeight: 22,
  },
  errorContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "rgba(255, 77, 77, 0.3)",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: ERROR_COLOR,
    marginTop: 10,
  },
  errorText: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: TEXT_ON_PRIMARY,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FriendsScreen;