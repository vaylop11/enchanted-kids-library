
import React, { useState, useEffect } from 'react';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Loader2, Ban, Trash2, UserX, Search, RefreshCw, UserPlus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  banned_until?: string | null;
};

const UserManagement = () => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const isMobile = useIsMobile();
  
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

  const renderMobileView = () => (
    <div className="space-y-4">
      {filteredUsers.map((user) => (
        <div key={user.id} className="bg-card p-4 rounded-lg border shadow-sm">
          <h4 className="font-medium text-base mb-2 truncate">{user.email}</h4>
          <div className="flex flex-col space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'ar' ? 'تاريخ التسجيل' : 'Created'}</span>
              <span>{formatDate(user.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{language === 'ar' ? 'آخر تسجيل دخول' : 'Last Sign In'}</span>
              <span>{formatDate(user.last_sign_in_at)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{language === 'ar' ? 'الحالة' : 'Status'}</span>
              {isBanned(user) ? (
                <Badge variant="destructive" className="text-xs">
                  {language === 'ar' ? 'محظور' : 'Banned'}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  {language === 'ar' ? 'نشط' : 'Active'}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-4">
            {isBanned(user) ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnbanUser(user.id)}
              >
                <UserX className="mr-1 h-4 w-4" />
                {language === 'ar' ? 'إلغاء الحظر' : 'Unban'}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUserId(user.id);
                  setBanDialogOpen(true);
                }}
              >
                <Ban className="mr-1 h-4 w-4" />
                {language === 'ar' ? 'حظر' : 'Ban'}
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setSelectedUserId(user.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              {language === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Input
            placeholder={language === 'ar' ? 'البحث حسب البريد الإلكتروني' : 'Search by email'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex space-x-2 self-end sm:self-auto">
          <Button onClick={fetchUsers} variant="outline" size={isMobile ? "sm" : "default"}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} mr-1`} />
            {!isMobile && (language === 'ar' ? 'تحديث' : 'Refresh')}
          </Button>
          <Button variant="accent" size={isMobile ? "sm" : "default"}>
            <UserPlus className="h-4 w-4 mr-1" />
            {!isMobile && (language === 'ar' ? 'إضافة مستخدم' : 'Add User')}
          </Button>
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
        </div>
      ) : isMobile ? (
        renderMobileView()
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
                          size="sm"
                          onClick={() => handleUnbanUser(user.id)}
                        >
                          <UserX className="mr-1 h-4 w-4" />
                          {language === 'ar' ? 'إلغاء الحظر' : 'Unban'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setBanDialogOpen(true);
                          }}
                        >
                          <Ban className="mr-1 h-4 w-4" />
                          {language === 'ar' ? 'حظر' : 'Ban'}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {language === 'ar' ? 'حذف' : 'Delete'}
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
