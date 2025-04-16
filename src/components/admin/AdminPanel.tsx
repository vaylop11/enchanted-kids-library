
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserManagement from './UserManagement';
import BlogManagement from './BlogManagement';
import AdsenseManagement from './AdsenseManagement';

interface AdminPanelProps {
  userCount?: number | null;
  countLoading?: boolean;
}

const AdminPanel = ({ userCount, countLoading }: AdminPanelProps) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="container max-w-7xl mx-auto">
      <h1 className="heading-1 mb-4">
        {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
      </h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="users">
            {language === 'ar' ? 'المستخدمين' : 'Users'}
          </TabsTrigger>
          <TabsTrigger value="blog">
            {language === 'ar' ? 'المدونة' : 'Blog'}
          </TabsTrigger>
          <TabsTrigger value="adsense">
            {language === 'ar' ? 'الإعلانات' : 'AdSense'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <UserManagement userCount={userCount} countLoading={countLoading} />
        </TabsContent>
        
        <TabsContent value="blog" className="space-y-4">
          <BlogManagement />
        </TabsContent>
        
        <TabsContent value="adsense" className="space-y-4">
          <AdsenseManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
