
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
  autoFocus?: boolean;
  className?: string;
}

export function ChatInput({
  onSubmit,
  placeholder = "Type a message...",
  disabled = false,
  className,
  dir = "ltr",
  autoFocus = false,
  ...props
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && autoFocus) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || disabled) return;
    
    onSubmit(trimmedMessage);
    setMessage("");
    
    // Reset the textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize the textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={cn("border-t p-4", className)} {...props}>
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="resize-none min-h-[80px] max-h-[200px] overflow-y-auto"
          dir={dir}
          disabled={disabled}
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 rounded-full flex-shrink-0"
          disabled={!message.trim() || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      <div className="text-xs text-muted-foreground mt-2 text-center">
        Press Enter to send, Shift+Enter for a new line
      </div>
    </div>
  );
}
