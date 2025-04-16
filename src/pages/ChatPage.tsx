
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, Bot, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';

// Chat message type definition
interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatPage = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Handle initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      // Add welcome message when chat first loads
      setMessages([{
        id: 'welcome',
        content: language === 'ar'
          ? "مرحبًا بك في المساعد الذكي! كيف يمكنني مساعدتك اليوم؟"
          : "Welcome to Gemi AI Chat Assistant! How can I help you today?",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [language, messages.length]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Set up scroll detection for showing scroll-to-bottom button
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.getElementById('chat-messages');
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
        setShowScrollButton(isNotAtBottom);
      }
    };
    
    const scrollContainer = document.getElementById('chat-messages');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Scroll to bottom function for button
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShowScrollButton(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Simulate API call delay
      setTimeout(() => {
        // Add bot response
        const botResponse = {
          id: `bot-${Date.now()}`,
          content: generateResponse(input.trim()),
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting response:', error);
      setLoading(false);
    }
  };
  
  // Simple response generator
  const generateResponse = (input: string): string => {
    const responses = [
      "That's an interesting point! Let me explain further:\n\n## Key Points\n\n1. First, consider the main concept\n2. Then, analyze the implications\n3. Finally, draw conclusions\n\n> Remember that context matters in this analysis.",
      "I understand your question. Here's what you need to know:\n\n```\nfunction example() {\n  return 'This is a code example';\n}\n```\n\nDoes this help explain the concept?",
      "Great question! Here's a breakdown:\n\n**Bold text for emphasis**\n\n*Italics for important concepts*\n\n- List item 1\n- List item 2\n- List item 3",
      "Let me organize this information for you:\n\n| Header 1 | Header 2 |\n| --- | --- |\n| Data 1 | Data 2 |\n| Data 3 | Data 4 |",
      "I'd recommend exploring these resources:\n\n1. First resource link\n2. Second resource with **important note**\n3. Third resource with `code reference`"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container max-w-5xl mx-auto px-4 py-8">
        <div className="bg-background border rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)] max-h-[800px]">
          {/* Chat header */}
          <div className="bg-muted/30 p-4 border-b">
            <h2 className="text-lg font-medium">
              {language === 'ar' ? 'مساعد جيمي الذكي' : 'Gemi AI Assistant'}
            </h2>
          </div>
          
          {/* Chat messages */}
          <div 
            id="chat-messages" 
            className="flex-grow overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser 
                      ? 'bg-purple-800 text-white rounded-tr-none' 
                      : 'bg-muted rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.isUser ? (
                      <>
                        <span className="text-xs font-medium ml-1">
                          {language === 'ar' ? 'أنت' : 'You'}
                        </span>
                        <User className="h-3.5 w-3.5 ml-1 opacity-70" />
                      </>
                    ) : (
                      <>
                        <Bot className="h-3.5 w-3.5 mr-1 opacity-70" />
                        <span className="text-xs font-medium">
                          {language === 'ar' ? 'جيمي' : 'Gemi'}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className={`prose prose-sm max-w-none ${message.isUser ? 'text-white prose-invert' : ''}`}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  
                  <div className="mt-1 text-right">
                    <span className="text-[10px] opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <Skeleton className="h-12 w-24" />
              </div>
            )}
            
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-20 right-8 bg-purple-800 text-white p-2 rounded-full shadow-lg hover:bg-purple-900 transition-colors"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          )}
          
          {/* Input area */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-background flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
              className="resize-none min-h-[50px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              type="submit" 
              className="bg-purple-800 hover:bg-purple-900"
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatPage;
