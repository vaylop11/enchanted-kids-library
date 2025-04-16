
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTypingIndicator = (roomId: string, userId: string, userEmail: string) => {
  const [typingUsers, setTypingUsers] = useState<{[key: string]: { email: string, timestamp: number }}>({});

  useEffect(() => {
    const channel = supabase.channel(`typing_${roomId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const newTypingUsers: {[key: string]: { email: string, timestamp: number }} = {};
        
        Object.keys(state).forEach(presenceId => {
          const presence = state[presenceId][0] as any;
          if (presence.isTyping) {
            newTypingUsers[presenceId] = {
              email: presence.email,
              timestamp: presence.timestamp
            };
          }
        });
        
        setTypingUsers(newTypingUsers);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const setTyping = async (isTyping: boolean) => {
    const channel = supabase.channel(`typing_${roomId}`);
    await channel.track({
      isTyping,
      email: userEmail,
      timestamp: Date.now()
    });
  };

  const getTypingIndicator = () => {
    const now = Date.now();
    const activeTypers = Object.entries(typingUsers)
      .filter(([id, data]) => {
        return id !== userId && now - data.timestamp < 3000;
      })
      .map(([_, data]) => data.email);
    
    if (activeTypers.length === 0) return '';
    if (activeTypers.length === 1) return `${activeTypers[0]} is typing...`;
    if (activeTypers.length === 2) return `${activeTypers[0]} and ${activeTypers[1]} are typing...`;
    return 'Several people are typing...';
  };

  return { setTyping, getTypingIndicator };
};
