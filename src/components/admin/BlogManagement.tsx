
import React, { useState, useEffect } from 'react';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface BlogPost {
  id: string;
  title: string;
  created_at: string;
  category: string;
  published: boolean;
}

const BlogManagement = () => {
  const { language } = useLanguage();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseUntyped
        .from('blog_posts')
        .select('id, title, created_at, category, published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
      }

      console.log('Fetched blog posts:', data);
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error(language === 'ar' ? 'فشل في جلب المقالات' : 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      console.log('Deleting post with ID:', deleteId);
      
      const { error } = await supabaseUntyped
        .from('blog_posts')
        .delete()
        .eq('id', deleteId);

      if (error) {
        console.error('Error deleting post:', error);
        throw error;
      }

      console.log('Post deleted successfully');
      toast.success(language === 'ar' ? 'تم حذف المقال بنجاح' : 'Post deleted successfully');
      fetchBlogPosts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(language === 'ar' ? 'فشل في حذف المقال' : 'Failed to delete post');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
  };

  const viewPost = (id: string) => {
    navigate(`/blog/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium">
          {language === 'ar' ? 'إدارة المقالات' : 'Manage Blog Posts'}
        </h3>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full"></div>
        </div>
      ) : blogPosts.length === 0 ? (
        <div className="text-center p-4 border rounded-md">
          {language === 'ar' ? 'لا توجد مقالات' : 'No blog posts found'}
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'العنوان' : 'Title'}</TableHead>
                <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead>{language === 'ar' ? 'التصنيف' : 'Category'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className="text-right">{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{formatDate(post.created_at)}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {post.published ? 
                        (language === 'ar' ? 'منشور' : 'Published') : 
                        (language === 'ar' ? 'مسودة' : 'Draft')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => viewPost(post.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(post.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' 
                ? 'هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this post? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={deletePost} 
              disabled={isDeleting} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
              ) : null}
              {language === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogManagement;
