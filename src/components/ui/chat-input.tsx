
import React, { useState, KeyboardEvent, HTMLAttributes } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit: (message: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
}

const ChatInput = ({
  onSubmit,
  placeholder = 'Type a message...',
  isDisabled = false,
  className,
  ...props
}: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !isDisabled) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("relative flex items-end gap-2", className)} {...props}>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        className="min-h-[80px] resize-none pr-12"
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="absolute bottom-2 right-2"
        onClick={handleSubmit}
        disabled={isDisabled || !message.trim()}
      >
        <Send className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
};

export default ChatInput;
