import React from 'react';
import { Crown, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface OnlineUser {
  id: string;
  email: string;
  online_at: string;
  avatar_url?: string;
}

interface OnlineUsersListProps {
  onlineUsers: Record<string, OnlineUser>;
}

export function OnlineUsersList({ onlineUsers }: OnlineUsersListProps) {
  const { language } = useLanguage();
  const userCount = Object.keys(onlineUsers).length;

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const isAdminEmail = (email: string) => {
    return email === 'cherifhoucine83@gmail.com';
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return language === 'ar' ? 'الآن' : 'now';
    if (diffInMinutes < 60) return language === 'ar' ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return language === 'ar' ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`;
  };

  return (
    <Card className="w-full lg:w-80 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          {language === 'ar' ? 'المتصلون' : 'Online Users'}
          <Badge variant="secondary" className="ml-auto">
            {userCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] lg:h-[400px]">
          <div className="space-y-3 pr-2">
            {Object.values(onlineUsers).map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="relative">
                  <Avatar className={`h-10 w-10 ${isAdminEmail(user.email) ? 'ring-2 ring-amber-400' : ''}`}>
                    {user.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt="User avatar" />
                    ) : null}
                    <AvatarFallback className={isAdminEmail(user.email) ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}>
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isAdminEmail(user.email) ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <span className="font-medium text-sm truncate">
                        User {user.id.substring(0, 8)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getRelativeTime(user.online_at)}
                  </div>
                </div>
              </div>
            ))}
            
            {userCount === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {language === 'ar' ? 'لا يوجد مستخدمون متصلون' : 'No users online'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}