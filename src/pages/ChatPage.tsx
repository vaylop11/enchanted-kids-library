import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, supabaseUntyped } from '@/integrations/supabase/client';
import { ArrowLeft, Eraser, MessageSquare, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChatMessageSkeleton } from '@/components/ui/skeleton';
import { ChatInput } from '@/components/ui/chat-input';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatReplyBar } from '@/components/chat/ChatReplyBar';
import { OnlineUsersList } from '@/components/chat/OnlineUsersList';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ReplyTo {
  id: string;
  content: string;
  user_email: string;
  user_id: string;
}

type Message = {
  id: string;
  content: string;
  user_id: string;
  user_email: string;
  created_at: string;
  reply_to?: ReplyTo;
};

type OnlineUser = {
  id: string;
  email: string;
  online_at: string;
  avatar_url?: string;
};

const ChatPage = () => {
  const { user, loading, isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
          if (deletedMessageId) {
            setMessages((prev) => prev.filter(msg => msg.id !== deletedMessageId));
          } else {
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
      setIsLoading(true);
      try {
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
        setIsLoading(false);
      }
    };

    fetchMessages();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  const sendMessage = async (message: string) => {
    if (!user || !message.trim()) return;
    
    const messageData = {
      content: message.trim(),
      user_id: user.id,
      user_email: user.email || 'Anonymous',
      ...(replyTo && {
        reply_to: {
          id: replyTo.id,
          content: replyTo.content,
          user_email: replyTo.user_email,
          user_id: replyTo.user_id
        }
      })
    };
    
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...messageData,
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    setReplyTo(null); // Clear reply after sending

    try {
      const { error, data } = await supabaseUntyped
        .from('messages')
        .insert(messageData)
        .select('*');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === optimisticMessage.id ? data[0] : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message');
      setMessages((prev) => prev.filter(msg => msg.id !== optimisticMessage.id));
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      user_email: message.user_email,
      user_id: message.user_id
    });
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const deleteMessage = async (messageId: string) => {
    if (!isAdmin) return;
    
    try {
      const { error } = await supabaseUntyped
        .from('messages')
        .delete()
        .match({ id: messageId });
        
      if (error) throw error;
      toast.success(language === 'ar' ? 'تم حذف الرسالة' : 'Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(language === 'ar' ? 'فشل في حذف الرسالة' : 'Failed to delete message');
    }
  };

  const deleteAllMessages = async () => {
    if (!isAdmin) return;
    
    try {
      const { error } = await supabaseUntyped
        .from('messages')
        .delete()
        .gte('created_at', '1970-01-01');
        
      if (error) throw error;
      
      setMessages([]);
      toast.success(language === 'ar' ? 'تم مسح جميع الرسائل' : 'All messages cleared');
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast.error(language === 'ar' ? 'فشل في مسح الرسائل' : 'Failed to clear all messages');
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
          <OnlineUsersList onlineUsers={onlineUsers} />
          
          <Card className="flex-1 flex flex-col border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {language === 'ar' ? 'غرفة المحادثة' : 'Chat Room'}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(onlineUsers).length} {language === 'ar' ? 'متصل' : 'online'}
                  </Badge>
                  
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Trash className="h-4 w-4" />
                          {language === 'ar' ? 'مسح الكل' : 'Clear All'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {language === 'ar' ? 'مسح جميع الرسائل' : 'Clear All Messages'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {language === 'ar' 
                              ? 'هل أنت متأكد من أنك تريد مسح جميع الرسائل؟ لا يمكن التراجع عن هذا الإجراء.'
                              : 'Are you sure you want to clear all messages? This action cannot be undone.'
                            }
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={deleteAllMessages} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {language === 'ar' ? 'مسح' : 'Clear'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
                <div className="space-y-6 py-4">
                  {isLoading ? (
                    <div className="space-y-6">
                      <ChatMessageSkeleton />
                      <div className="flex justify-end">
                        <ChatMessageSkeleton />
                      </div>
                      <ChatMessageSkeleton />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                      <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        {language === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
                      </p>
                      <p className="text-sm">
                        {language === 'ar' ? 'ابدأ المحادثة!' : 'Start the conversation!'}
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isCurrentUser={message.user_id === user.id}
                        isAdmin={isAdmin}
                        userAvatar={user.avatar_url}
                        onDelete={deleteMessage}
                        onReply={handleReply}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="border-t border-border/50">
                <ChatReplyBar replyTo={replyTo} onCancelReply={cancelReply} />
                <div className="p-4">
                  <ChatInput 
                    onSubmit={sendMessage}
                    placeholder={language === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                    autoFocus
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
