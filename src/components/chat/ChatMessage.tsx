import React, { useState, useCallback } from 'react';
import { Crown, Trash2, Reply, MoreHorizontal, Copy, Check, CheckCheck, Paperclip } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MarkdownMessage } from '@/components/ui/markdown-message';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

// --- Types ---
interface ReplyTo {
  id: string;
  content: string;
  user_email: string;
  attachment_url?: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  user_email: string;
  created_at: string;
  reply_to?: ReplyTo;
  attachment_url?: string; // new
  status?: 'sent' | 'delivered' | 'read'; // new
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  isAdmin: boolean;
  userAvatar?: string;
  onDelete: (messageId: string) => void;
  onReply: (message: Message) => void;
}

// --- Helper Functions ---
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

const truncateContent = (content: string, maxLength: number = 50) => {
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
};

// --- Main Component ---
export const ChatMessage = React.memo(function ChatMessage({
  message,
  isCurrentUser,
  isAdmin,
  userAvatar,
  onDelete,
  onReply,
}: ChatMessageProps) {
  const { language, t } = useLanguage(); // نفترض أن t هو دالة ترجمة: t('copy') => 'نسخ'
  const [showActions, setShowActions] = useState(false);
  const [imageModal, setImageModal] = useState<string | null>(null); // لعرض الصورة كاملة

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    toast.success(t('message_copied'));
  }, [message.content, t]);

  const handleAttachmentClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      setImageModal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const closeModal = () => setImageModal(null);

  return (
    <>
      {/* Backdrop للـ Lightbox */}
      {imageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-3xl max-h-full">
            <button
              className="absolute -top-10 right-0 text-white text-2xl"
              onClick={closeModal}
            >
              ×
            </button>
            <img
              src={imageModal}
              alt="Enlarged attachment"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div
        className={`flex gap-3 group relative ${isCurrentUser ? 'justify-end flex-row-reverse' : 'justify-start'}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* الصورة الرمزية */}
        {!isCurrentUser && (
          <Avatar className={`h-10 w-10 ${isAdminEmail(message.user_email) ? 'ring-2 ring-amber-400' : ''}`}>
            <AvatarImage src={userAvatar || undefined} alt={t('user_avatar')} />
            <AvatarFallback className={isAdminEmail(message.user_email) ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}>
              {getInitials(message.user_email)}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={`max-w-[75%] relative ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
          {/* الرسالة */}
          <div
            className={`
              rounded-2xl p-4 shadow-sm border
              ${isCurrentUser 
                ? 'bg-primary text-primary-foreground mr-auto rounded-tl-md' 
                : 'bg-card text-card-foreground rounded-tr-md'
              }
            `}
          >
            {/* اسم المستخدم / Admin Badge */}
            {!isCurrentUser && (
              <div className="flex items-center gap-2 mb-2">
                {isAdminEmail(message.user_email) ? (
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-300 flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    {t('admin')}
                  </Badge>
                ) : (
                  <span className="text-xs font-medium opacity-70">
                    {t('user')} {message.user_id.substring(0, 6)}
                  </span>
                )}
              </div>
            )}

            {/* الرد على رسالة */
            message.reply_to && (
              <div className="mb-3 p-2 rounded-lg bg-muted/50 border-l-4 border-primary/30 cursor-pointer hover:bg-muted/70 transition"
                   onClick={() => onReply(message.reply_to as Message)}>
                <div className="text-xs opacity-70 mb-1">
                  {t('replying_to')} {isAdminEmail(message.reply_to.user_email) ? t('admin') : t('user')}
                </div>
                <div className="text-sm opacity-80 flex items-center gap-1">
                  {message.reply_to.attachment_url && (
                    <Paperclip className="h-3 w-3" />
                  )}
                  {truncateContent(message.reply_to.content)}
                </div>
              </div>
            )}

            {/* المحتوى */}
            <div className="space-y-2">
              {message.attachment_url && (
                <div
                  className="relative rounded-lg overflow-hidden max-w-xs cursor-pointer border"
                  onClick={(e) => handleAttachmentClick(e, message.attachment_url!)}
                >
                  {message.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={message.attachment_url}
                      alt="Attachment"
                      className="w-full h-auto object-cover"
                    />
                  ) : (
                    <div className="p-4 bg-muted text-center text-sm">
                      <Paperclip className="h-4 w-4 mx-auto mb-1" />
                      {t('file_attached')}
                    </div>
                  )}
                </div>
              )}

              {message.content && (
                <MarkdownMessage
                  content={message.content}
                  className={`prose-sm max-w-none ${isCurrentUser ? 'prose-invert' : ''}`}
                />
              )}
            </div>

            {/* الوقت وحالة الرسالة */}
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs opacity-60">
                {formatTime(message.created_at)}
                {isCurrentUser && (
                  <span className="ml-1">
                    {message.status === 'read' ? (
                      <CheckCheck className="h-3 w-3 text-blue-500 inline" />
                    ) : message.status === 'delivered' ? (
                      <CheckCheck className="h-3 w-3 text-gray-400 inline" />
                    ) : (
                      <Check className="h-3 w-3 text-gray-400 inline" />
                    )}
                  </span>
                )}
              </div>

              {/* الأزرار (تظهر عند التحويم) */}
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
                        {t('copy_message')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReply(message)}>
                        <Reply className="h-4 w-4 mr-2" />
                        {t('reply')}
                      </DropdownMenuItem>
                      {isAdmin && !isCurrentUser && (
                        <DropdownMenuItem
                          onClick={() => onDelete(message.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('delete')}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الصورة الرمزية للمستخدم الحالي */}
        {isCurrentUser && (
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar || undefined} alt={t('your_avatar')} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(message.user_email)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </>
  );
});
