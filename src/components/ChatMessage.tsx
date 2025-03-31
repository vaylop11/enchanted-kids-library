
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/services/pdfStorage';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: ChatMessageType;
  onDelete?: (messageId: string) => void;
  isPermanentlyDeleting?: boolean;
}

const ChatMessage = ({ message, onDelete, isPermanentlyDeleting = false }: ChatMessageProps) => {
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = () => {
    if (onDelete) {
      setIsDeleting(true);
      onDelete(message.id);
    }
  };
  
  const formattedTime = format(new Date(message.timestamp), 'h:mm a');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col space-y-1 p-3.5 rounded-2xl max-w-[90%]",
        message.isUser 
          ? "bg-primary/10 ml-auto rounded-br-none border border-primary/20"
          : "bg-muted/60 mr-auto rounded-bl-none backdrop-blur-sm border border-muted"
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex justify-between items-start gap-2">
        <div 
          className="text-sm whitespace-pre-wrap leading-relaxed"
        >
          {message.content}
        </div>
        
        {showDelete && onDelete && message.isUser && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full opacity-70 hover:opacity-100 -mt-1 -mr-1"
            onClick={handleDelete}
            disabled={isDeleting || isPermanentlyDeleting}
          >
            {isDeleting || isPermanentlyDeleting ? (
              <div className="h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
      
      <div className="text-[10px] font-medium text-muted-foreground self-end mt-1">
        {formattedTime}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
