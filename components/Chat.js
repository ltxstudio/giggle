'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSmile, FaUpload } from 'react-icons/fa';
import EmojiPicker from 'react-emojione';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      setMessages(data);
      setLoading(false);
    };

    fetchMessages();

    const messageListener = supabase
      .from('messages')
      .on('INSERT', (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(messageListener);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage || !username) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ content: newMessage, username }]);

    if (error) {
      console.error('Error sending message:', error.message);
    } else {
      setNewMessage('');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(newMessage + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    // Handle file upload logic (e.g., upload to Supabase Storage)
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Real-Time Chat</h2>

      {/* Username input */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Enter your username"
          className="w-full p-3 border border-gray-300 rounded-md"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* Message display */}
      <motion.div
        className="overflow-auto h-72 mb-4 p-4 border border-gray-200 rounded-md bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="mb-2">
              <strong className="text-sm text-blue-600">{message.username}</strong>
              <p className="text-gray-800">{message.content}</p>
            </div>
          ))
        )}
      </motion.div>

      {/* Message input and send button */}
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Type a message"
          className="w-full p-3 border border-gray-300 rounded-md"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 p-3 bg-blue-500 text-white rounded-md"
        >
          <FaPaperPlane />
        </button>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="ml-2 p-3 bg-yellow-400 text-white rounded-md"
        >
          <FaSmile />
        </button>
        <input
          type="file"
          className="ml-2"
          onChange={handleFileUpload}
        />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-10">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default Chat;
