
import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Send, Paperclip, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EnhancedChatInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
  autoFocus?: boolean;
  suggestions?: string[];
  isAnalyzing?: boolean;
}

export function EnhancedChatInput({
  onSubmit,
  placeholder = "Type a message...",
  disabled = false,
  className,
  dir = "ltr",
  autoFocus = false,
  suggestions = [],
  isAnalyzing = false,
  ...props
}: EnhancedChatInputProps) {
  const [message, setMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && autoFocus) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || disabled || isAnalyzing) return;
    
    onSubmit(trimmedMessage);
    setMessage("");
    setShowSuggestions(false);
    
    // Reset the textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Auto-resize the textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    // Show suggestions if user types "?"
    if (value.endsWith("?") && suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const stopAnalysis = () => {
    // This would ideally cancel the ongoing analysis
    toast.info("Analysis stopped");
  };

  return (
    <div className={cn("border-t bg-background", className)} {...props}>
      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="border-b bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-3 p-4">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={isAnalyzing ? "Processing your question..." : placeholder}
            className="resize-none min-h-[80px] max-h-[200px] overflow-y-auto pr-12"
            dir={dir}
            disabled={disabled || isAnalyzing}
            rows={1}
          />
          
          {/* Quick action buttons */}
          <div className="absolute right-2 bottom-2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={true}
              title="Attach file (coming soon)"
            >
              <Paperclip className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {isAnalyzing ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-10 w-10 rounded-full flex-shrink-0"
              onClick={stopAnalysis}
              title="Stop analysis"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-full flex-shrink-0"
              disabled={!message.trim() || disabled}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
      
      <div className="text-xs text-muted-foreground px-4 pb-3 text-center">
        Press Enter to send, Shift+Enter for a new line
        {suggestions.length > 0 && " • Type '?' to see suggestions"}
      </div>
    </div>
  );
}
