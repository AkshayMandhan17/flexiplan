import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the "+" button icon

const categories = ['Art', 'Sports', 'Music', 'Tech', 'Travel', 'Cooking']; // Example categories
const hobbies = [
  { id: '1', name: 'Painting', category: 'Art' },
  { id: '2', name: 'Football', category: 'Sports' },
  { id: '3', name: 'Guitar', category: 'Music' },
  { id: '4', name: 'Programming', category: 'Tech' },
  { id: '5', name: 'Photography', category: 'Travel' },
];

const ExploreHobbiesScreen = () => {
  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.searchSection}>
        <TextInput style={styles.searchBar} placeholder="Search hobbies..." />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryTab}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Section */}
      <FlatList
        data={hobbies}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Placeholder for the image */}
            <View style={styles.cardImagePlaceholder}>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Card Text Section */}
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.cardsContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchSection: {
    height: '20%',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchBar: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  categoryTabs: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 35,
  },
  categoryTab: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryText: {
    color: '#333',
    fontSize: 14,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3, // For shadow on Android
    shadowColor: '#000', // For shadow on iOS
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImagePlaceholder: {
    height: 100,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#9dbfb6',
    borderRadius: 20,
    padding: 6,
  },
  cardTextContainer: {
    padding: 8,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardCategory: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default ExploreHobbiesScreen;
