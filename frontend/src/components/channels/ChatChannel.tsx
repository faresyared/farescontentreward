import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Define the structure of a chat message object
interface ChatMessage {
  _id: string;
  author: {
    _id: string;
    username: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
}

interface ChatChannelProps {
  campaignId: string;
}

// Get the chat server URL from our environment variables
const CHAT_SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:10000';

const ChatChannel: React.FC<ChatChannelProps> = ({ campaignId }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // This effect handles connecting to and disconnecting from the chat server
  useEffect(() => {
    if (!token) return;

    // Create a new socket connection, passing the user's auth token
    const socket = io(CHAT_SERVER_URL, {
      auth: { token }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to chat server!');
      setIsConnected(true);
      // Once connected, we join the specific "room" for this campaign
      socket.emit('joinCampaign', campaignId);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server.');
      setIsConnected(false);
    });

    // Listen for new messages broadcasted from the server
    socket.on('newMessage', (message: ChatMessage) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Clean up the connection when the component is unmounted
    return () => {
      socket.disconnect();
    };
  }, [campaignId, token]);

  // This effect fetches the initial message history when the component loads
  useEffect(() => {
    const fetchMessageHistory = async () => {
      try {
        const res = await axios.get(`${CHAT_SERVER_URL}/messages/${campaignId}`);
        setMessages(res.data);
      } catch (err) {
        toast.error('Could not load chat history.');
        console.error(err);
      }
    };
    fetchMessageHistory();
  }, [campaignId]);

  // This effect automatically scrolls to the bottom when a new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to handle sending a new message
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current) {
      socketRef.current.emit('chatMessage', {
        campaignId,
        content: newMessage,
      });
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[75vh] bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
      {/* Header with connection status */}
      <div className="p-3 border-b border-gray-700/50 flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <p className="text-white font-bold">Live Chat</p>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg._id} className={`flex items-start gap-3 ${msg.author._id === user?.id ? 'justify-end' : ''}`}>
            {msg.author._id !== user?.id && <img src={msg.author.avatar} alt={msg.author.username} className="h-8 w-8 rounded-full" />}
            <div className={`p-3 rounded-xl max-w-lg ${msg.author._id === user?.id ? 'bg-red-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-300 rounded-bl-none'}`}>
              <div className="flex items-baseline gap-2">
                <p className="font-bold text-sm">{msg.author.username}</p>
                <p className="text-xs text-gray-400">{format(new Date(msg.createdAt), 'p')}</p>
              </div>
              <p className="mt-1 text-base">{msg.content}</p>
            </div>
          </div>
        ))}
        {/* Empty div to help with auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <div className="p-4 border-t border-gray-700/50">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500 text-white"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            disabled={!isConnected}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatChannel;