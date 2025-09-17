import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ArrowLeft, FileText, MessageSquare, Bot, Sparkles, Search, RotateCcw, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import SmartChatMessage from "@/components/SmartChatMessage";

const PDFViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [state, setState] = useState({
    chatMessages: [] as { id: string; content: string; isUser: boolean }[],
    loading: false,
  });

  // 🔥 مرجع لآخر رسالة
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 🔥 كل مرة تتغير الرسائل ننزل لآخرها
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.chatMessages]);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(language === "ar" ? "تم نسخ الرسالة ✅" : "Message copied ✅");
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      {/* رأس الصفحة */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border/10 bg-background/95 backdrop-blur-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === "ar" ? "رجوع" : "Back"}</span>
        </button>
      </div>

      {/* منطقة المحادثة */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {state.chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={msg.isUser ? "text-right" : "text-left"}
          >
            <SmartChatMessage message={msg} onCopy={handleCopyMessage} />
          </div>
        ))}
        {/* المرجع في الأخير */}
        <div ref={messagesEndRef} />
      </div>

      {/* إدخال الرسائل */}
      <div className="border-t border-border/10 p-3 flex gap-2 items-center bg-background">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-primary/50"
          placeholder={language === "ar" ? "اكتب رسالتك..." : "Type your message..."}
        />
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition">
          {language === "ar" ? "إرسال" : "Send"}
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
