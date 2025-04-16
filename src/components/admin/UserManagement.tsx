
import React, { useState, useEffect } from 'react';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Loader2, Ban, Trash2, UserX, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  banned_until?: string | null;
};

interface UserManagementProps {
  userCount?: number | null;
  countLoading?: boolean;
}

const UserManagement = ({ userCount, countLoading = false }: UserManagementProps) => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Call the getUsers edge function
      const { data, error } = await supabaseUntyped.functions.invoke('get-users');
      
      if (error) {
        console.error('Error fetching users:', error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء جلب المستخدمين' : 'Error fetching users');
        return;
      }
      
      console.log('Fetched users:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء جلب المستخدمين' : 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserDelete = async () => {
    if (!selectedUserId) return;
    
    try {
      setIsProcessing(true);
      
      // Call the deleteUser edge function
      const { data, error } = await supabaseUntyped.functions.invoke('delete-user', {
        body: { userId: selectedUserId }
      });
      
      if (error) {
        console.error('Error deleting user:', error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء حذف المستخدم' : 'Error deleting user');
        return;
      }
      
      toast.success(language === 'ar' ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حذف المستخدم' : 'Error deleting user');
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const handleUserBan = async () => {
    if (!selectedUserId) return;
    
    try {
      setIsProcessing(true);
      
      // Call the banUser edge function - bans for 30 days by default
      const { data, error } = await supabaseUntyped.functions.invoke('ban-user', {
        body: { userId: selectedUserId }
      });
      
      if (error) {
        console.error('Error banning user:', error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء حظر المستخدم' : 'Error banning user');
        return;
      }
      
      toast.success(language === 'ar' ? 'تم حظر المستخدم بنجاح' : 'User banned successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حظر المستخدم' : 'Error banning user');
    } finally {
      setIsProcessing(false);
      setBanDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      // Call the unbanUser edge function
      const { data, error } = await supabaseUntyped.functions.invoke('unban-user', {
        body: { userId }
      });
      
      if (error) {
        console.error('Error unbanning user:', error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء إلغاء حظر المستخدم' : 'Error unbanning user');
        return;
      }
      
      toast.success(language === 'ar' ? 'تم إلغاء حظر المستخدم بنجاح' : 'User unbanned successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إلغاء حظر المستخدم' : 'Error unbanning user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const isBanned = (user: User) => {
    if (!user.banned_until) return false;
    return new Date(user.banned_until) > new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <Users className="mr-2 h-5 w-5" />
            {language === 'ar' ? 'إحصائيات المستخدمين' : 'User Statistics'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'نظرة عامة على مستخدمي النظام'
              : 'Overview of system users'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
              </div>
              <div className="text-2xl font-bold">
                {countLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : userCount !== null ? (
                  userCount
                ) : (
                  '-'
                )}
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {language === 'ar' ? 'المستخدمين المحظورين' : 'Banned Users'}
              </div>
              <div className="text-2xl font-bold">
                {users.filter(user => isBanned(user)).length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between">
        <Input
          placeholder={language === 'ar' ? 'البحث حسب البريد الإلكتروني' : 'Search by email'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={fetchUsers} variant="outline" size="sm">
          {language === 'ar' ? 'تحديث' : 'Refresh'}
        </Button>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                <TableHead>{language === 'ar' ? 'تاريخ التسجيل' : 'Created At'}</TableHead>
                <TableHead>{language === 'ar' ? 'آخر تسجيل دخول' : 'Last Sign In'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                  <TableCell>
                    {isBanned(user) ? (
                      <Badge variant="destructive">
                        {language === 'ar' ? 'محظور' : 'Banned'}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {language === 'ar' ? 'نشط' : 'Active'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {isBanned(user) ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUnbanUser(user.id)}
                          title={language === 'ar' ? 'إلغاء الحظر' : 'Unban'}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setBanDialogOpen(true);
                          }}
                          title={language === 'ar' ? 'حظر' : 'Ban'}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setDeleteDialogOpen(true);
                        }}
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'تأكيد حذف المستخدم' : 'Confirm Delete User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' 
                ? 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المستخدم وجميع بياناته.'
                : 'This action cannot be undone. The user and all their data will be permanently deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleUserDelete}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {language === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban User Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'تأكيد حظر المستخدم' : 'Confirm Ban User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' 
                ? 'سيتم حظر المستخدم لمدة 30 يومًا. خلال هذه الفترة، لن يتمكن المستخدم من تسجيل الدخول.'
                : 'The user will be banned for 30 days. During this period, the user will not be able to sign in.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUserBan}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {language === 'ar' ? 'حظر' : 'Ban'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
