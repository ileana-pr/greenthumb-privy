import React, { useState, useRef, useEffect } from 'react';
import { Send, Leaf, Bot, User, Sprout, TreePine, Flower } from 'lucide-react';
import type { UUID } from '@elizaos/core';

// Remove or simplify this:
declare global {
  interface Window {
    // empty - we're not using window storage anymore
  }
  
}

interface Message {
  id: UUID;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

function uuidv4(): UUID {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  }) as UUID;
}

const callbacks: {[key: string]: (response: any) => void} = {}

class SimpleSocketManager {
  private static socket: any = null;
  private static callbacks: Map<string, (response: any) => void> = new Map();
  private static currentChannelId: string | null = null;
  private static currentUserId: string | null = null;
  private static agentId: string | null = null;

  static async getSocket() {
    if (this.socket?.connected) {
      console.log('🔄 Using existing connected socket');
      return this.socket;
    }

    console.log('🚀 Creating new socket connection');
    const { io } = await import('socket.io-client');
    
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
      query: {
        source: 'greenthumb-frontend',
        timestamp: Date.now()
      }
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to ElizaOS server');
      // get agent id first, then join channel
      console.log('🤖 Getting agent ID...');
      this.getAgentId().then(() => {
        console.log('✅ Agent ID obtained, now joining channel...');
        this.joinChannel().catch(error => {
          console.error('❌ Failed to join channel during connection:', error);
        });
      }).catch(error => {
        console.error('❌ Failed to get agent ID:', error);
      });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from ElizaOS server');
      // reset state on disconnect
      this.currentChannelId = null;
      this.currentUserId = null;
    });

    // listen for ANY and ALL socket events to debug
    // this.socket.onAny((event: string, data: any) => {
    //   console.log('🔍 Socket event received:', event, data);
      
    //   // check for agent responses in any event
    //   if (this.callbacks.size > 0) {
    //     // look for text content in various formats
    //     let responseText = null;
        
    //     if (data && data.content) {
    //       responseText = typeof data.content === 'string' ? data.content : data.content.text;
    //     } else if (data && data.text) {
    //       responseText = data.text;
    //     } else if (data && data.message && data.message.content) {
    //       responseText = typeof data.message.content === 'string' ? data.message.content : data.message.content.text;
    //     }
        
    //     if (responseText && typeof responseText === 'string' && responseText.length > 0) {
    //       console.log('🎯 Found potential response text:', responseText);
          
    //       // trigger all pending callbacks
    //       for (const [id, callback] of this.callbacks.entries()) {
    //         console.log("in for loop LMAO", id, callback)
    //         callback({ content: { text: responseText } });
    //         this.callbacks.delete(id);
    //         break;
    //       }
    //     }
    //   }
    // });

    // also listen for specific events that might contain responses
    const responseEvents = [
      'messageBroadcast',
      'messageComplete', 
      'message',
      'response',
      'agentResponse',
      'newMessage',
      'messageReceived'
    ];

    responseEvents.forEach(eventName => {
      this.socket.on(eventName, (data: any) => {
        console.log(`📨 Received ${eventName} event:`, data);
        this.handlePotentialResponse(data);
      });
    });

    // wait for connection to be established
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      this.socket.on('connect', () => {
        console.log('🎉 Socket connection established and ready');
        resolve(this.socket);
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('❌ Socket connection error:', error);
        reject(error);
      });

      // timeout after 10 seconds
      setTimeout(() => {
        if (!this.socket?.connected) {
          console.error('⏰ Socket connection timeout');
          reject(new Error('Socket connection timeout'));
        }
      }, 10000);
    });
  }

  static handlePotentialResponse(data: any) {
    console.log("HELLLOOOOO", Object.keys(callbacks).length)
    if (Object.keys(callbacks).length === 0) return;
    console.log("in handle potential res")

    let responseText = null;
    
    // try multiple ways to extract response text
    if (data && data.content) {
      responseText = typeof data.content === 'string' ? data.content : data.content.text;
    } else if (data && data.text) {
      responseText = data.text;
      console.log("in data text", responseText)
    } else if (data && data.message) {
      if (typeof data.message === 'string') {
        responseText = data.message;
      } else if (data.message.content) {
        responseText = typeof data.message.content === 'string' ? data.message.content : data.message.content.text;
      }
    }
    
    if (responseText && typeof responseText === 'string' && responseText.length > 0) {
      console.log('🎯 Processing response text:', responseText);
      
      // trigger the first pending callback
      for (const [id, callback] of Object.entries(callbacks)) {
        if(data.senderName === "GreenThumb") {
          callback({ content: { text: responseText } });
          delete callbacks[id];
          break;
        }
      }
    }
  }

  static async getAgentId(): Promise<void> {
    try {
      // hardcode the agent ID from the logs since we know it works
      this.agentId = "7b13fa42-026d-06c3-9a41-891fe15757f9";
      console.log('🤖 Using GreenThumb agent ID:', this.agentId);
    } catch (error) {
      console.error('❌ Failed to get agent ID:', error);
      this.agentId = "7b13fa42-026d-06c3-9a41-891fe15757f9";
    }
  }

  static async joinChannel() {
    console.log('🔗 joinChannel called');
    const socket = await this.getSocket();
    if (!socket?.connected || !this.agentId) {
      console.error('🚫 Cannot join channel: socket connected?', !!socket?.connected, 'agent ID?', !!this.agentId);
      throw new Error('Cannot join channel: socket not connected or agent ID missing');
    }

    // generate consistent IDs for this session
    this.currentChannelId = this.generateChannelId();
    this.currentUserId = this.generateUserId();

    console.log('🔗 Joining channel with IDs:', {
      channelId: this.currentChannelId,
      userId: this.currentUserId,
      agentId: this.agentId
    });

    // send room joining message (type 1)
    const joinPayload = {
      type: 1, // ROOM_JOINING
      payload: {
        channelId: this.currentChannelId,
        roomId: this.currentChannelId,
        entityId: this.currentUserId
      }
    };

    console.log('🔗 Emitting join message:', joinPayload);
    socket.emit('message', joinPayload);

    // wait a moment for channel to be established
    console.log('⏳ Waiting for channel to be established...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // increased to 2 seconds
    console.log('✅ Channel join process completed');
  }

  static generateChannelId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static generateUserId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static generateMessageId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static async sendMessage(text: string): Promise<any> {
    console.log('🚀 sendMessage called with:', text);
    console.log('📊 Current state:', {
      socketConnected: this.socket?.connected,
      currentChannelId: this.currentChannelId,
      currentUserId: this.currentUserId,
      agentId: this.agentId
    });

    const socket = await this.getSocket();
    
    return new Promise((resolve, reject) => {
      if (!socket?.connected) {
        console.error('❌ Socket not connected');
        reject(new Error('Not connected to ElizaOS server'));
        return;
      }

      if (!this.currentChannelId || !this.currentUserId) {
        console.error('❌ Channel not joined yet - attempting to join now');
        // Try to join channel if not already joined
        this.joinChannel().then(() => {
          console.log('✅ Channel joined successfully, retrying message send');
          // Retry the message after joining
          return this.sendMessage(text);
        }).then(resolve).catch(reject);
        return;
      }

      if (!this.agentId) {
        console.error('❌ Agent ID not found');
        reject(new Error('Agent ID not found'));
        return;
      }

      console.log('✅ All conditions met, proceeding with message send');

      const messageId = this.generateMessageId();

      // set up response callback before sending
      callbacks[messageId] = (response: any) => {
        console.log('🎯 Processing response for message:', messageId, response);
        
        // handle different response formats
        if (response && response.content) {
          if (typeof response.content === 'string') {
            // content is a string
            resolve({ text: response.content, success: true });
          } else if (response.content.text) {
            // content is an object with text property
            resolve({ text: response.content.text, success: true });
          } else {
            resolve({ text: JSON.stringify(response.content), success: true });
          }
        } else if (response && response.text) {
          resolve({ text: response.text, success: true });
        } else if (typeof response === 'string') {
          resolve({ text: response, success: true });
        } else {
          console.warn('🤔 Unexpected response format:', response);
          resolve({ text: "I received your message but had trouble generating a response.", success: true });
        }
      };

      console.log("in send message LOOK HERE", Object.keys(callbacks).length)

      // use the exact format from the working dashboard
      const messagePayload = {
        type: 2, // SEND_MESSAGE
        payload: {
          senderId: this.currentUserId,
          senderName: "user",
          message: text,
          channelId: this.currentChannelId,
          roomId: this.currentChannelId,
          serverId: "00000000-0000-0000-0000-000000000000",
          messageId: messageId,
          source: "client_chat",
          metadata: {
            channelType: "DM", // force DM type
            isDm: true,        // force DM flag
            targetUserId: this.agentId
          }
        }
      };

      console.log('📤 Sending message to ElizaOS:', messagePayload);
      socket.emit('message', messagePayload);

      // shorter timeout since the agent is clearly responding
      setTimeout(() => {
        console.log("in send message TIMEOUT", Object.keys(callbacks).length)

        if (callbacks[messageId]) {
          delete callbacks[messageId];
          console.log('⏰ Message timeout for:', messageId);
          resolve({ 
            text: "I'm taking a bit longer to respond than usual. Please try again!", 
            success: true 
          });
        }
      }, 30000); // 10 second timeout
    });
  }

  static isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

class GreenthumbAPI {
  private baseUrl = 'http://localhost:3000';

  async sendMessage(text: string): Promise<any> {
    return SimpleSocketManager.sendMessage(text);
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  isConnected(): boolean {
    return SimpleSocketManager.isConnected();
  }
}

const GreenthumbApp: React.FC = () => {
  console.log(`🏗️ GreenThumb: Component initializing - NO socket created yet`);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      text: "Hello! I'm Greenthumb, your AI cultivation assistant. I'm here to help you grow healthy, thriving plants. What would you like to know about gardening today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Create API instance lazily to avoid immediate socket connection
  const getAPI = () => {
    if (!api.current) {
      console.log(`⚡ GreenThumb: Creating API instance (but not connecting socket yet)`);
      api.current = new GreenthumbAPI();
    }
    return api.current;
  };
  const api = useRef<GreenthumbAPI | null>(null);

  useEffect(() => {
    // Test connection to ElizaOS backend
    const checkConnection = async () => {
      console.log(`🏥 GreenThumb: Health check only - NO socket creation`);
      try {
        // Only check health endpoint, don't create socket yet
        const response = await fetch('http://localhost:3000/api/health');
        const healthOk = response.ok;
        
        // Consider connected if health check passes (socket will connect when needed)
        setIsConnected(healthOk);
        console.log(healthOk ? `✅ GreenThumb: Server is healthy` : `❌ GreenThumb: Server health check failed`);
      } catch (error) {
        console.error(`GreenThumb: Connection check failed:`, error);
        setIsConnected(false);
      }
    };

    checkConnection();
    
    // Check connection less frequently to reduce load
    const interval = setInterval(checkConnection, 10000);
    
    return () => {
      console.log(`🧹 GreenThumb: Component unmounting - cleaning up`);
      clearInterval(interval);
      // No need for socket cleanup with static approach
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: uuidv4(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const messageText = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      console.log('📤 GreenThumb: Sending message to ElizaOS:', messageText);
      const response = await getAPI().sendMessage(messageText);
      
      console.log('📨 GreenThumb: Received response from ElizaOS:', response);
      
      if (response && response.text) {
        const botMsg: Message = {
          id: uuidv4(),
          text: response.text,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Handle case where response doesn't have expected format
        const errorMsg: Message = {
          id: uuidv4(),
          text: "I'm sorry, I didn't receive a proper response. Please try again.",
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMsg: Message = {
        id: uuidv4(),
        text: "I'm having trouble connecting right now. Please check that the ElizaOS server is running and try again.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      
      // Update connection status
      setIsConnected(false);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const FloatingIcons = () => (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          color: 'rgba(34, 197, 94, 0.2)',
          animation: 'pulse 2s infinite',
        }}
      >
        <Leaf size={24} />
      </div>
      <div 
        style={{
          position: 'absolute',
          top: '128px',
          right: '64px',
          color: 'rgba(34, 197, 94, 0.15)',
          animation: 'bounce 2s infinite',
          animationDelay: '1s',
        }}
      >
        <Sprout size={20} />
      </div>
      <div 
        style={{
          position: 'absolute',
          bottom: '128px',
          left: '80px',
          color: 'rgba(34, 197, 94, 0.1)',
          animation: 'pulse 2s infinite',
          animationDelay: '2s',
        }}
      >
        <TreePine size={28} />
      </div>
      <div 
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '128px',
          color: 'rgba(34, 197, 94, 0.2)',
          animation: 'bounce 2s infinite',
          animationDelay: '0.5s',
        }}
      >
        <Flower size={22} />
      </div>
    </div>
  );

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <FloatingIcons />
      
      {/* Header */}
      <div 
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(34, 197, 94, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div 
          style={{
            maxWidth: '1024px',
            margin: '0 auto',
            padding: '16px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Logo */}
            <div 
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Leaf size={24} />
            </div>
            
            {/* Title and subtitle */}
            <div style={{ flex: 1 }}>
              <h1 
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#064e3b',
                  margin: 0,
                }}
              >
                Greenthumb
              </h1>
              <p 
                style={{
                  fontSize: '14px',
                  color: '#047857',
                  margin: 0,
                }}
              >
                AI Cultivation Assistant
              </p>
            </div>
            
            {/* Connection status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? '#10b981' : '#ef4444',
                }}
              />
              <span 
                style={{
                  fontSize: '14px',
                  color: isConnected ? '#047857' : '#dc2626',
                  fontWeight: '500',
                }}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '1024px',
          width: '100%',
          margin: '0 auto',
          padding: '0 24px',
          paddingTop: '24px',
          paddingBottom: '120px', // Space for input area
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar */}
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: message.sender === 'bot' ? '#10b981' : '#6b7280',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {message.sender === 'bot' ? <Bot size={18} /> : <User size={18} />}
              </div>
              
              {/* Message bubble */}
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: message.sender === 'user' ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                  backgroundColor: message.sender === 'user' ? '#10b981' : 'white',
                  color: message.sender === 'user' ? 'white' : '#1f2937',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: message.sender === 'bot' ? '1px solid rgba(34, 197, 94, 0.1)' : 'none',
                }}
              >
                <p style={{ margin: 0, lineHeight: '1.5' }}>{message.text}</p>
                <p 
                  style={{
                    margin: 0,
                    marginTop: '4px',
                    fontSize: '12px',
                    opacity: 0.7,
                  }}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#10b981',
                  color: 'white',
                }}
              >
                <Bot size={18} />
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '18px 18px 18px 6px',
                  backgroundColor: 'white',
                  border: '1px solid rgba(34, 197, 94, 0.1)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div 
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                  <div 
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      animation: 'pulse 1.5s infinite',
                      animationDelay: '0.3s',
                    }}
                  />
                  <div 
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      animation: 'pulse 1.5s infinite',
                      animationDelay: '0.6s',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(34, 197, 94, 0.1)',
          padding: '16px',
          zIndex: 10,
        }}
      >
        <div 
          style={{
            maxWidth: '1024px',
            margin: '0 auto',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about plant care, growing tips, troubleshooting, or anything garden-related..."
              disabled={!isConnected}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '24px',
                border: '2px solid rgba(34, 197, 94, 0.2)',
                outline: 'none',
                fontSize: '16px',
                resize: 'none',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || !isConnected}
            style={{
              padding: '12px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: inputText.trim() && isConnected ? '#10b981' : '#d1d5db',
              color: 'white',
              cursor: inputText.trim() && isConnected ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GreenthumbApp; 