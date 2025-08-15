import React from 'react';
import { X, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReplyTo {
  id: string;
  content: string;
  user_email: string;
  user_id: string;
}

interface ChatReplyBarProps {
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
}

export function ChatReplyBar({ replyTo, onCancelReply }: ChatReplyBarProps) {
  const { language } = useLanguage();

  if (!replyTo) return null;

  const isAdminEmail = (email: string) => {
    return email === 'cherifhoucine83@gmail.com';
  };

  const truncateContent = (content: string, maxLength: number = 60) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div className="bg-muted/50 border-t p-3 flex items-center gap-3">
      <Reply className="h-4 w-4 text-primary" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-1">
          {language === 'ar' ? 'رد على' : 'Replying to'} {' '}
          <span className="font-medium">
            {isAdminEmail(replyTo.user_email) ? 'Admin' : `User ${replyTo.user_id.substring(0, 6)}`}
          </span>
        </div>
        <div className="text-sm text-foreground truncate">
          {truncateContent(replyTo.content)}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={onCancelReply}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}