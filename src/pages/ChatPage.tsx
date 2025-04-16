
import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, supabaseUntyped } from '@/integrations/supabase/client';
import { Send, ArrowLeft, Crown, Reply, ThumbsUp, Heart, Laugh, Frown, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChatMessageSkeleton } from '@/components/ui/skeleton';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import type { ChatMessage as ChatMessageType, ChatUser } from '@/types/chat';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type OnlineUser = {
  id: string;
  email: string;
  online_at: string;
};

const EMOJI_REACTIONS = [
  { emoji: '👍', icon: ThumbsUp },
  { emoji: '❤️', icon: Heart },
  { emoji: '😂', icon: Laugh },
  { emoji: '😢', icon: Frown },
] as const;

const ChatPage = () => {
  const { user, loading, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessageType | null>(null);
  const { setTyping, getTypingIndicator } = useTypingIndicator('global', user?.id || '', user?.email || '');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

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
          const newMessage = payload.new as ChatMessageType;
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
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          const updatedMessage = payload.new as ChatMessageType;
          setMessages(prev => 
            prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
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
      setIsLoading(true);
      try {
        const { data, error } = await supabaseUntyped
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;
        if (data) setMessages(data as ChatMessageType[]);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  const handleReply = (message: ChatMessageType) => {
    setReplyToMessage(message);
    // Scroll to message input when replying
    setTimeout(() => {
      const input = document.querySelector('input[aria-label="Type a message"]');
      if (input) {
        input.scrollIntoView({ behavior: 'smooth' });
        (input as HTMLInputElement).focus();
      }
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    try {
      let messagePayload: any = {
        content: messageContent,
        user_id: user.id,
        user_email: user.email || 'Anonymous'
      };
      
      // If replying to a message, add it to the payload
      if (replyToMessage) {
        messagePayload.reply_to = {
          id: replyToMessage.id,
          user_email: replyToMessage.user_email,
          content: replyToMessage.content.substring(0, 50) + (replyToMessage.content.length > 50 ? '...' : '')
        };
      }
      
      const { error } = await supabaseUntyped
        .from('messages')
        .insert(messagePayload);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setReplyToMessage(null);
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

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      // Get the current message to check existing reactions
      const { data: message, error: fetchError } = await supabaseUntyped
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;
      
      // Initialize or get existing reactions
      let updatedReactions = message?.reactions || [];
      
      // Find if this emoji reaction already exists
      const existingReactionIndex = updatedReactions.findIndex(r => r.emoji === emoji);
      
      if (existingReactionIndex >= 0) {
        // Check if user has already reacted with this emoji
        const userIndex = updatedReactions[existingReactionIndex].users.indexOf(user.id);
        
        if (userIndex >= 0) {
          // Remove user from the reaction
          updatedReactions[existingReactionIndex].users.splice(userIndex, 1);
          
          // If no users left for this reaction, remove the reaction
          if (updatedReactions[existingReactionIndex].users.length === 0) {
            updatedReactions.splice(existingReactionIndex, 1);
          }
        } else {
          // Add user to the existing reaction
          updatedReactions[existingReactionIndex].users.push(user.id);
        }
      } else {
        // Add new reaction with this user
        updatedReactions.push({
          emoji,
          users: [user.id]
        });
      }

      // Update the message with the new reactions
      const { error: updateError } = await supabaseUntyped
        .from('messages')
        .update({ reactions: updatedReactions })
        .eq('id', messageId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    }
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

  const pageTitle = language === 'ar' ? 'غرفة الدردشة | تشات PDF' : 'Chat Room | ChatPDF';
  const pageDescription = language === 'ar' 
    ? 'تواصل مع مستخدمين آخرين وناقش ملفات PDF ومشاريعك في غرفة دردشة تشات PDF'
    : 'Connect with other users and discuss PDF files and projects in the ChatPDF chat room';

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title={pageTitle}
        description={pageDescription}
        keywords="chat room, pdf discussion, real time chat, document collaboration"
        ogImage="/chat-preview.png"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": pageTitle,
          "description": pageDescription,
          "isPartOf": {
            "@type": "WebSite",
            "name": "Gemi ChatPDF",
            "url": "https://chatpdf.icu"
          }
        }}
      />
      
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
                {isLoading ? (
                  <div className="space-y-4">
                    <ChatMessageSkeleton />
                    <div className="flex justify-end">
                      <ChatMessageSkeleton />
                    </div>
                    <ChatMessageSkeleton />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>{t('noMessages')}</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={cn(
                        "flex gap-3",
                        message.user_id === user?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.user_id !== user?.id && (
                        <Avatar className={cn(
                          "h-8 w-8",
                          isAdminEmail(message.user_email) ? 'bg-amber-100' : 'bg-primary/10'
                        )}>
                          <AvatarFallback>
                            {getInitials(message.user_email)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={cn(
                        "relative max-w-[75%] rounded-lg p-3 group",
                        message.user_id === user?.id 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        {message.reply_to && (
                          <div className={cn(
                            "mb-2 px-3 py-2 text-xs border-l-2 rounded bg-background/40",
                            message.user_id === user?.id 
                              ? "border-primary-foreground/30 text-primary-foreground/70" 
                              : "border-primary/30 text-foreground/70"
                          )}>
                            <div className="font-medium mb-0.5">
                              Replying to {message.reply_to.user_email}
                            </div>
                            <div className="line-clamp-1">
                              {message.reply_to.content}
                            </div>
                          </div>
                        )}
                        
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                        
                        <div className="text-xs opacity-70 mt-1">
                          {formatTime(message.created_at)}
                        </div>

                        <div className={cn(
                          "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity",
                          message.user_id === user?.id ? "left-2" : "right-2",
                          "flex items-center gap-1"
                        )}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-background/80 backdrop-blur-sm rounded-full"
                            onClick={() => handleReply(message)}
                          >
                            <Reply className="h-3 w-3" />
                          </Button>

                          <HoverCard openDelay={0}>
                            <HoverCardTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1 bg-background/80 backdrop-blur-sm rounded-full"
                              >
                                😀
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-auto p-1 flex gap-1" side="top">
                              {EMOJI_REACTIONS.map(({ emoji }) => (
                                <Button
                                  key={emoji}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleReaction(message.id, emoji)}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </HoverCardContent>
                          </HoverCard>
                        </div>

                        {message.reactions && message.reactions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.reactions.map((reaction, idx) => (
                              <Badge
                                key={`${reaction.emoji}-${idx}`}
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => handleReaction(message.id, reaction.emoji)}
                              >
                                {reaction.emoji} {reaction.users.length}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {message.user_id === user?.id && (
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback>
                            {getInitials(message.user_email)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                
                {getTypingIndicator() && (
                  <div className="text-sm text-muted-foreground animate-pulse">
                    {getTypingIndicator()}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <form onSubmit={sendMessage} className="flex flex-col gap-2">
              {replyToMessage && (
                <div className="mb-2 flex items-center justify-between text-sm bg-muted p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4" />
                    <span className="line-clamp-1">
                      <span className="font-medium">Replying to {replyToMessage.user_email}:</span> {replyToMessage.content}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyToMessage(null)}
                    className="flex-shrink-0"
                  >
                    Cancel
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder={language === 'ar' 
                    ? "اكتب رسالتك..."
                    : "Type your message..."
                  }
                  className="flex-1"
                  aria-label="Type a message"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4 mr-2" />
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
