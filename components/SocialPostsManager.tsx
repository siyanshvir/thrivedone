import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SocialPostService, SocialPost } from '@/services/SocialPostService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Image as ImageIcon, Link as LinkIcon, Instagram, Twitter, Facebook } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const SocialPostsManager = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  
  const [formData, setFormData] = useState<Partial<SocialPost>>({
    platform: 'Instagram',
    image_url: '',
    caption: '',
    link: '',
    position: 0,
    active: 1
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['social-posts'],
    queryFn: () => SocialPostService.getPosts()
  });

  const resetForm = () => {
    setFormData({
      platform: 'Instagram',
      image_url: '',
      caption: '',
      link: '',
      position: 0,
      active: 1
    });
    setEditingPost(null);
  };

  const createMutation = useMutation({
    mutationFn: (post: Partial<SocialPost>) => SocialPostService.createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Social post added successfully');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => toast.error('Failed to create post')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<SocialPost> }) => 
      SocialPostService.updatePost(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Social post updated successfully');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => toast.error('Failed to update post')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => SocialPostService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Social post deleted successfully');
    },
    onError: () => toast.error('Failed to delete post')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      toast.error('Image URL is required');
      return;
    }
    
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (post: SocialPost) => {
    setEditingPost(post);
    setFormData({
      platform: post.platform || 'Instagram',
      image_url: post.image_url,
      caption: post.caption || '',
      link: post.link || '',
      position: post.position || 0,
      active: post.active ? 1 : 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(id);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      default: return <ImageIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Social Media Posts</h2>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#111111] text-white border-white/10">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Add New Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select 
                  value={formData.platform} 
                  onValueChange={(val) => setFormData({...formData, platform: val})}
                >
                  <SelectTrigger className="bg-black/50 border-white/10">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-white/10 text-white">
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input 
                  id="image_url" 
                  value={formData.image_url} 
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="bg-black/50 border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Post Link</Label>
                <Input 
                  id="link" 
                  value={formData.link} 
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="bg-black/50 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (Optional)</Label>
                <Input 
                  id="caption" 
                  value={formData.caption} 
                  onChange={(e) => setFormData({...formData, caption: e.target.value})}
                  className="bg-black/50 border-white/10"
                />
              </div>
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="position">Position</Label>
                  <Input 
                    id="position" 
                    type="number"
                    value={formData.position} 
                    onChange={(e) => setFormData({...formData, position: parseInt(e.target.value) || 0})}
                    className="bg-black/50 border-white/10"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="active">Status</Label>
                  <Select 
                    value={formData.active ? '1' : '0'} 
                    onValueChange={(val) => setFormData({...formData, active: parseInt(val)})}
                  >
                    <SelectTrigger className="bg-black/50 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-white/10 text-white">
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black">
                {editingPost ? 'Update Post' : 'Save Post'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">No social posts added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map(post => (
            <div key={post.id} className={`group relative bg-[#111111] rounded-xl overflow-hidden border ${post.active ? 'border-white/10' : 'border-red-500/30'} transition-all hover:border-cyan-500/50`}>
              <div className="aspect-square bg-black overflow-hidden relative">
                <img src={post.image_url} alt="Social post" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                  {getPlatformIcon(post.platform || '')}
                </div>
                {!post.active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">HIDDEN</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs">Pos: {post.position}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(post)}
                      className="p-1.5 bg-white/10 rounded hover:bg-white/20 text-white transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 bg-red-500/20 rounded hover:bg-red-500/40 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {post.caption && (
                  <p className="text-white/80 text-sm line-clamp-2 mb-2">{post.caption}</p>
                )}
                {post.link && (
                  <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs flex items-center gap-1 hover:underline">
                    <LinkIcon className="w-3 h-3" /> View original post
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
