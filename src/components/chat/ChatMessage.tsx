import React, { useState } from 'react';
import { Crown, Trash2, Reply, MoreHorizontal, Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MarkdownMessage } from '@/components/ui/markdown-message';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReplyTo {
  id: string;
  content: string;
  user_email: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  user_email: string;
  created_at: string;
  reply_to?: ReplyTo;
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  isAdmin: boolean;
  userAvatar?: string;
  onDelete: (messageId: string) => void;
  onReply: (message: Message) => void;
}

export function ChatMessage({ 
  message, 
  isCurrentUser, 
  isAdmin,
  userAvatar,
  onDelete, 
  onReply 
}: ChatMessageProps) {
  const { language } = useLanguage();
  const [showActions, setShowActions] = useState(false);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success(language === 'ar' ? 'تم نسخ الرسالة' : 'Message copied');
  };

  const truncateContent = (content: string, maxLength: number = 50) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div 
      className={`flex gap-3 group relative ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isCurrentUser && (
        <Avatar className={`h-10 w-10 ${isAdminEmail(message.user_email) ? 'ring-2 ring-amber-400' : ''}`}>
          {userAvatar ? (
            <AvatarImage src={userAvatar} alt="User avatar" />
          ) : null}
          <AvatarFallback className={isAdminEmail(message.user_email) ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}>
            {getInitials(message.user_email)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[75%] relative`}>
        <div className={`
          rounded-2xl p-4 shadow-sm border
          ${isCurrentUser 
            ? 'bg-primary text-primary-foreground ml-auto rounded-tr-md' 
            : 'bg-card text-card-foreground rounded-tl-md'
          }
        `}>
          {!isCurrentUser && (
            <div className="flex items-center gap-2 mb-2">
              {isAdminEmail(message.user_email) ? (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              ) : (
                <span className="text-xs font-medium opacity-70">
                  User {message.user_id.substring(0, 6)}
                </span>
              )}
            </div>
          )}

          {message.reply_to && (
            <div className="mb-3 p-2 rounded-lg bg-muted/50 border-l-4 border-primary/30">
              <div className="text-xs opacity-70 mb-1">
                {language === 'ar' ? 'رد على' : 'Replying to'} {isAdminEmail(message.reply_to.user_email) ? 'Admin' : `User ${message.reply_to.id.substring(0, 6)}`}
              </div>
              <div className="text-sm opacity-80">
                {truncateContent(message.reply_to.content)}
              </div>
            </div>
          )}
          
          <MarkdownMessage 
            content={message.content} 
            className={`prose-sm max-w-none ${isCurrentUser ? 'prose-invert' : ''}`}
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs opacity-60">
              {formatTime(message.created_at)}
            </div>
            
            {showActions && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-60 hover:opacity-100"
                  onClick={() => onReply(message)}
                >
                  <Reply className="h-3 w-3" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-60 hover:opacity-100"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'نسخ الرسالة' : 'Copy message'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onReply(message)}>
                      <Reply className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'رد' : 'Reply'}
                    </DropdownMenuItem>
                    {isAdmin && !isCurrentUser && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(message.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {language === 'ar' ? 'حذف' : 'Delete'}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {isCurrentUser && (
        <Avatar className="h-10 w-10">
          {userAvatar ? (
            <AvatarImage src={userAvatar} alt="Your avatar" />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(message.user_email)}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}