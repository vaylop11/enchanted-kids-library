
export type ChatUser = {
  id: string;
  email: string;
  online_at: string;
};

export type MessageType = 'public' | 'private';

export type ChatMessage = {
  id: string;
  content: string;
  user_id: string;
  user_email: string;
  created_at: string;
  reply_to?: {
    id: string;
    content: string;
    user_email: string;
  } | null;
  type: MessageType;
  to_user_id?: string;
};
