
import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

type Message = {
  id: string;
  content: string;
  user_id: string;
  user_email: string;
  created_at: string;
};

type OnlineUser = {
  id: string;
  email: string;
  online_at: string;
};

const ChatPage = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Set up real-time messaging and presence
  useEffect(() => {
    if (!user) return;

    // Listen for new messages
    const messageChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    // Set up presence channel for online users
    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track user presence
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const presentUsers: Record<string, OnlineUser> = {};
        
        Object.keys(state).forEach(key => {
          const presences = state[key] as Array<{ online_at: string, email: string }>;
          if (presences.length > 0) {
            presentUsers[key] = {
              id: key,
              email: presences[0].email,
              online_at: presences[0].online_at
            };
          }
        });
        
        setOnlineUsers(presentUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          // When subscribed, track our own presence
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            email: user.email,
          });
        }
      });

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;
        if (data) setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      }
    };

    fetchMessages();

    // Cleanup function
    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert({
        content: newMessage.trim(),
        user_id: user.id,
        user_email: user.email || 'Anonymous',
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Format timestamp to readable time
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Get initials from email
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 px-4 md:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
          {/* Online Users Sidebar */}
          <Card className="lg:w-64 w-full p-4 h-full lg:h-auto">
            <h2 className="text-lg font-medium mb-4">{t('onlineUsers')}</h2>
            <ScrollArea className="h-[200px] lg:h-[calc(100%-3rem)]">
              <div className="space-y-3 pr-4">
                {Object.values(onlineUsers).map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="h-8 w-8 bg-primary/10">
                        <AvatarFallback className="text-primary">{getInitials(user.email)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                    </div>
                    <div className="truncate flex-1 text-sm">{user.email}</div>
                  </div>
                ))}
                {Object.keys(onlineUsers).length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('noUsersOnline')}</p>
                )}
              </div>
            </ScrollArea>
          </Card>
          
          {/* Chat Area */}
          <Card className="flex-1 flex flex-col p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">{t('chatRoom')}</h2>
              <Badge variant="outline" className="text-xs">
                {Object.keys(onlineUsers).length} {t('online')}
              </Badge>
            </div>
            
            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4 mb-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>{t('noMessages')}</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex gap-3 ${message.user_id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.user_id !== user.id && (
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="text-primary">
                            {getInitials(message.user_email)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[75%] ${message.user_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                        {message.user_id !== user.id && (
                          <p className="text-xs font-medium mb-1">
                            {message.user_email}
                          </p>
                        )}
                        <p className="break-words">{message.content}</p>
                        <p className="text-xs opacity-70 text-right mt-1">
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                      {message.user_id === user.id && (
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="text-primary">
                            {getInitials(message.user_email)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('typeMessage')}
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {t('send')}
              </Button>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatPage;
