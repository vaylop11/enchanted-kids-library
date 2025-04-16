
export type ChatUser = {
  id: string;
  email: string;
  online_at: string;
};

export type MessageReaction = {
  emoji: '👍' | '❤️' | '😂' | '😲' | '😢' | '😡';
  users: string[];
};

export type ChatMessage = {
  id: string;
  content: string;
  user_id: string;
  user_email: string;
  created_at: string;
  reactions?: MessageReaction[];
};
