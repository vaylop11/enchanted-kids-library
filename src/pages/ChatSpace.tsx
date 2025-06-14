
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { EnhancedChatInput } from '@/components/ui/enhanced-chat-input';
import { ChatMessageBubble } from '@/components/ui/chat-message-bubble';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
}

interface UserPresence {
  user_id: string;
  email: string;
  online_at: string;
}

const ChatSpace = () => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Redirect to sign in if not authenticated
  if (!loading && !user) {
    return <Navigate to="/signin" replace />;
  }

  useEffect(() => {
    if (!user) return;

    const setupRealtimeChat = async () => {
      // Create a channel for the chat room
      const channel = supabase.channel('chat_room', {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channelRef.current = channel;

      // Track user presence
      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const users: UserPresence[] = [];
          
          // Extract user data from presence state
          Object.values(newState).forEach((presenceArray: any) => {
            if (Array.isArray(presenceArray)) {
              presenceArray.forEach((presence: any) => {
                if (presence.user_id && presence.email && presence.online_at) {
                  users.push({
                    user_id: presence.user_id,
                    email: presence.email,
                    online_at: presence.online_at
                  });
                }
              });
            }
          });
          
          setOnlineUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .on('broadcast', { event: 'new_message' }, ({ payload }) => {
          const newMessage: ChatMessage = {
            id: payload.id,
            content: payload.content,
            isUser: payload.userId === user.id,
            timestamp: new Date(payload.timestamp),
            userId: payload.userId,
            userEmail: payload.userEmail,
          };
          setMessages(prev => [...prev, newMessage]);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track this user's presence
            await channel.track({
              user_id: user.id,
              email: user.email,
              online_at: new Date().toISOString(),
            });
          }
        });

      setIsLoading(false);
    };

    setupRealtimeChat();

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!user || !channelRef.current) return;

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Broadcast the message to all connected users
    const { error } = await channelRef.current.send({
      type: 'broadcast',
      event: 'new_message',
      payload: {
        id: messageId,
        content,
        userId: user.id,
        userEmail: user.email,
        timestamp,
      },
    });

    if (error) {
      console.error('Error sending message:', error);
      toast.error(language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message');
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(language === 'ar' ? 'تم نسخ الرسالة' : 'Message copied');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-6">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl h-full">
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
            
            {/* Online Users Sidebar */}
            <Card className="lg:w-64 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">
                  {language === 'ar' ? 'المتصلون الآن' : 'Online Users'}
                </h2>
                <Badge variant="secondary" className="ml-auto">
                  {onlineUsers.length}
                </Badge>
              </div>
              <Separator className="mb-4" />
              <ScrollArea className="flex-1">
                <div className="space-y-3">
                  {onlineUsers.map((presence) => (
                    <div key={presence.user_id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {presence.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {presence.email}
                        </p>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-green-500 rounded-full" />
                          <span className="text-xs text-muted-foreground">
                            {language === 'ar' ? 'متصل' : 'Online'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {onlineUsers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {language === 'ar' ? 'لا يوجد مستخدمون متصلون' : 'No users online'}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-semibold">
                    {language === 'ar' ? 'غرفة الدردشة العامة' : 'General Chat Room'}
                  </h1>
                </div>
                <Badge variant="outline">
                  {messages.length} {language === 'ar' ? 'رسالة' : 'messages'}
                </Badge>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        {language === 'ar' ? 'مرحباً بك في غرفة الدردشة!' : 'Welcome to the Chat Room!'}
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        {language === 'ar' 
                          ? 'ابدأ محادثة مع المستخدمين الآخرين. جميع الرسائل تظهر في الوقت الفعلي.'
                          : 'Start a conversation with other users. All messages appear in real-time.'}
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className={`flex items-start gap-3 ${message.isUser ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {message.userEmail?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col gap-1 max-w-[70%] ${message.isUser ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">
                              {message.isUser ? 
                                (language === 'ar' ? 'أنت' : 'You') : 
                                message.userEmail?.split('@')[0] || 'User'
                              }
                            </span>
                            <span>
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <ChatMessageBubble
                            message={message}
                            language={language}
                            onCopy={handleCopyMessage}
                          />
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <EnhancedChatInput
                onSubmit={handleSendMessage}
                placeholder={language === 'ar' 
                  ? "اكتب رسالتك هنا..." 
                  : "Type your message here..."
                }
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                className="border-t-0"
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatSpace;
