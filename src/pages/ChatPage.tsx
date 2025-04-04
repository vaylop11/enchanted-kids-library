
import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, supabaseUntyped } from '@/integrations/supabase/client';
import { Send, User, ArrowLeft, Crown, Trash2, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { AIChatMessageSkeleton } from '@/components/ui/skeleton';
import TranslatableMessage from '@/components/TranslatableMessage';

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
  const { user, loading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optimisticId, setOptimisticId] = useState<string | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!user) return;

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
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          const deletedMessageId = payload.old.id;
          // Handle single message deletion
          if (deletedMessageId) {
            setMessages((prev) => prev.filter(msg => msg.id !== deletedMessageId));
          } 
          // If we don't have a specific message ID, it might be a bulk delete
          // We'll handle that by refreshing messages from the server
          else {
            fetchMessages();
          }
        }
      )
      .subscribe();

    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const presentUsers: Record<string, OnlineUser> = {};
        
        Object.keys(state).forEach(key => {
          const presences = state[key] as unknown as Array<{ online_at: string, email: string }>;
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
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            email: user.email || 'Anonymous',
          });
        }
      });

    const fetchMessages = async () => {
      try {
        setIsSubmitting(true); // Show loading state while fetching messages
        const { data, error } = await supabaseUntyped
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;
        if (data) setMessages(data as Message[]);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsSubmitting(false);
      }
    };

    fetchMessages();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim() || isSubmitting) return;

    // Create optimistic message ID for UI responsiveness
    const tempId = `temp-${Date.now()}`;
    setOptimisticId(tempId);
    
    // Add optimistic message immediately for better UX
    const optimisticMessage: Message = {
      id: tempId,
      content: newMessage.trim(),
      user_id: user.id,
      user_email: user.email || 'Anonymous',
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage(''); // Clear input right away
    setIsSubmitting(true);
    
    try {
      const { error } = await supabaseUntyped.from('messages').insert({
        content: optimisticMessage.content,
        user_id: user.id,
        user_email: user.email || 'Anonymous',
      });

      if (error) throw error;
      
      // The real message will be added via the subscription
      // So we don't need to add it manually here
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setIsSubmitting(false);
      setOptimisticId(null);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!isAdmin) return;
    
    try {
      const { error } = await supabaseUntyped
        .from('messages')
        .delete()
        .match({ id: messageId });
        
      if (error) throw error;
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const deleteAllMessages = async () => {
    if (!isAdmin) return;
    
    try {
      // Delete all messages with a date greater than 1970-01-01
      const { error } = await supabaseUntyped
        .from('messages')
        .delete()
        .gte('created_at', '1970-01-01');
        
      if (error) throw error;
      
      // Clear the messages in the UI immediately
      setMessages([]);
      toast.success('All messages cleared');
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast.error('Failed to clear all messages');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const isAdminEmail = (email: string) => {
    return email === 'cherifhoucine83@gmail.com';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('home')}
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
          <Card className="lg:w-64 w-full p-5 h-full lg:h-auto">
            <h2 className="text-lg font-medium mb-4">{t('onlineUsers')}</h2>
            <ScrollArea className="h-[200px] lg:h-[calc(100%-3rem)]">
              <div className="space-y-3 pr-4">
                {Object.values(onlineUsers).map((onlineUser) => (
                  <div key={onlineUser.id} className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className={`h-8 w-8 ${isAdminEmail(onlineUser.email) ? 'bg-amber-100' : 'bg-primary/10'}`}>
                        <AvatarFallback className={isAdminEmail(onlineUser.email) ? 'text-amber-600' : 'text-primary'}>
                          {getInitials(onlineUser.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                    </div>
                    <div className="truncate flex-1 text-sm">
                      {isAdminEmail(onlineUser.email) ? (
                        <div className="flex items-center gap-1">
                          <Crown className="h-3 w-3 text-amber-500" />
                          <span className="font-medium text-amber-600">Admin</span>
                        </div>
                      ) : (
                        <span>User {onlineUser.id.substring(0, 4)}</span>
                      )}
                    </div>
                  </div>
                ))}
                {Object.keys(onlineUsers).length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('noUsersOnline')}</p>
                )}
              </div>
            </ScrollArea>
          </Card>
          
          <Card className="flex-1 flex flex-col p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">{t('chatRoom')}</h2>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  {Object.keys(onlineUsers).length} {t('online')}
                </Badge>
                
                {isAdmin && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={deleteAllMessages}
                    title="Clear all messages"
                    className="flex items-center gap-1"
                  >
                    <Eraser className="h-4 w-4" />
                    {t('clearAll')}
                  </Button>
                )}
              </div>
            </div>
            
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
                        <Avatar className={`h-8 w-8 ${isAdminEmail(message.user_email) ? 'bg-amber-100' : 'bg-primary/10'}`}>
                          <AvatarFallback className={isAdminEmail(message.user_email) ? 'text-amber-600' : 'text-primary'}>
                            {getInitials(message.user_email)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <TranslatableMessage 
                        content={message.content}
                        timestamp={message.created_at}
                        isUser={message.user_id === user.id}
                      />
                      
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
                
                {optimisticId && (
                  <AIChatMessageSkeleton />
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <form onSubmit={sendMessage} className="p-4 border-t bg-muted/10">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('typeMessage')}
                  className="flex-1"
                  disabled={isSubmitting}
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newMessage.trim() && !isSubmitting) {
                        sendMessage(e);
                      }
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || isSubmitting}
                  className="transition-all duration-300"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {t('send')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
