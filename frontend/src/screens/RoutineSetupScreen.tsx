import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

const RoutineSetupScreen = ({ navigation }: any) => {
    const [messages, setMessages] = useState([
        { id: '1', sender: 'assistant', text: 'Welcome to Flexiplan! Let’s set up your routine. What tasks do you usually work on during the day?' },
    ]);
    const [input, setInput] = useState('');

    const handleSendMessage = async () => {
        if (input.trim()) {
            const newMessage = { id: Date.now().toString(), sender: 'user', text: input };
            setMessages([...messages, newMessage]);
            setInput('');

            // Call the backend API for the LLM response
            const response = await fetch('http://192.168.100.21:8000/api/routine-setup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
            });
            const data = await response.json();
            const assistantMessage = { id: Date.now().toString(), sender: 'assistant', text: data.response };
            setMessages((prev) => [...prev, assistantMessage]);
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
