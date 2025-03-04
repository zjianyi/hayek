import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import './ChatBox.css';
import { streamGptResponse } from '../services/api';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text, images = []) => {
    if (!text.trim() && images.length === 0) return;

    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      images: images,
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Create assistant message placeholder for streaming
    const assistantMessageId = uuidv4();
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    setIsLoading(true);

    try {
      // Start streaming the response
      await streamGptResponse(
        text, 
        images,
        (chunk) => {
          setMessages((prevMessages) => 
            prevMessages.map((msg) => 
              msg.id === assistantMessageId 
                ? { ...msg, content: msg.content + chunk } 
                : msg
            )
          );
        }
      );
    } catch (error) {
      console.error('Error streaming response:', error);
      // Update the message to show the error
      setMessages((prevMessages) => 
        prevMessages.map((msg) => 
          msg.id === assistantMessageId 
            ? { ...msg, content: 'Error: Failed to get response. Please try again.' } 
            : msg
        )
      );
    } finally {
      // Mark streaming as complete
      setMessages((prevMessages) => 
        prevMessages.map((msg) => 
          msg.id === assistantMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbox">
      <MessageList messages={messages} />
      <div ref={messagesEndRef} />
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatBox; 