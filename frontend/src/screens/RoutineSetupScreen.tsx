import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RoutineSetupScreen = ({ navigation }: any) => {
    const [messages, setMessages] = useState([
        { id: '1', sender: 'assistant', text: 'Welcome to Flexiplan! Let’s set up your routine. What tasks do you usually work on during the day?' },
    ]);
    const [input, setInput] = useState('');
    const [currentQuestionId, setCurrentQuestionId] = useState(1); // Track current question
    const [userId, setUserId] = useState(1); // Assume you already have the user ID after login (can be retrieved from AsyncStorage or context)
    const [token, setToken] = useState<string | null>(null); // Store the token

    // Fetch the token from AsyncStorage on component mount
    useEffect(() => {
        const fetchToken = async () => {
            const storedToken = await AsyncStorage.getItem('access_token');
            setToken(storedToken);
        };
        fetchToken();
    }, []);

    const handleSendMessage = async () => {
        if (input.trim()) {
            const newMessage = { id: Date.now().toString(), sender: 'user', text: input };
            setMessages([...messages, newMessage]);
            setInput('');

            // Ensure the token is available before making the request
            if (!token) {
                Alert.alert('Error', 'No token found, please log in again');
                return;
            }

            // Send the response to the backend and get the assistant's reply
            try {
                const response = await fetch('http://192.168.100.21:8000/api/routine-setup/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Add token to headers
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        question_id: currentQuestionId,
                        response: input,
                    }),
                });

                const data = await response.json();

                if (data.clarification) {
                    // If clarification is needed, send the clarification message
                    const assistantMessage = { id: Date.now().toString(), sender: 'assistant', text: data.clarification };
                    setMessages((prev) => [...prev, assistantMessage]);
                } else if (data.next_question) {
                    // If a valid response is received, move to the next question
                    const assistantMessage = { id: Date.now().toString(), sender: 'assistant', text: data.next_question.question };
                    setMessages((prev) => [...prev, assistantMessage]);
                    setCurrentQuestionId(data.next_question.id); // Update to the next question
                } else {
                    // Routine setup complete or other message
                    const assistantMessage = { id: Date.now().toString(), sender: 'assistant', text: data.message || "Routine setup complete!" };
                    setMessages((prev) => [...prev, assistantMessage]);
                    // Optionally navigate to the home screen after setup is complete
                    navigation.replace("TabNavigator");
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to communicate with the server.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Text style={[styles.message, item.sender === 'assistant' ? styles.assistant : styles.user]}>
                        {item.text}
                    </Text>
                )}
                contentContainerStyle={styles.chat}
            />
            <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type your message..."
            />
            <Button title="Send" onPress={handleSendMessage} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    chat: { paddingBottom: 16 },
    message: { marginVertical: 8, padding: 10, borderRadius: 8 },
    assistant: { backgroundColor: '#f0f0f0', alignSelf: 'flex-start' },
    user: { backgroundColor: '#007bff', color: '#fff', alignSelf: 'flex-end' },
    input: { borderWidth: 1, borderColor: 'gray', padding: 8, marginVertical: 8, borderRadius: 4 },
});

export default RoutineSetupScreen;
