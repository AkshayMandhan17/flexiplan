import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ChatAgent from '../components/ChatAgent';

const ChatAgentScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ChatAgent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default ChatAgentScreen; 