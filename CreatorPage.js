import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Youtube } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = ['Tech', 'Education', 'Creative', 'Science', 'Business', 'Health'];

export const CreatorPage = () => {
  const { token } = useAuth();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    category: 'Tech',
    preview_image: '',
  });

  useEffect(() => {
    fetchMyTutorials();
  }, []);

  const fetchMyTutorials = async () => {
    try {
      const response = await axios.get(`${API}/tutorials/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTutorials(response.data);
    } catch (error) {
      toast.error('Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTutorial) {
        await axios.put(`${API}/tutorials/${editingTutorial.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Tutorial updated successfully');
      } else {
        await axios.post(`${API}/tutorials`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Tutorial created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMyTutorials();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save tutorial');
    }
  };

  const handleEdit = (tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      title: tutorial.title,
      description: tutorial.description,
      youtube_url: tutorial.youtube_url,
      category: tutorial.category,
      preview_image: tutorial.preview_image || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (tutorialId) => {
    if (!window.confirm('Are you sure you want to delete this tutorial?')) return;

    try {
      await axios.delete(`${API}/tutorials/${tutorialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Tutorial deleted');
      fetchMyTutorials();
    } catch (error) {
      toast.error('Failed to delete tutorial');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      youtube_url: '',
      category: 'Tech',
      preview_image: '',
    });
    setEditingTutorial(null);
  };

  const extractYouTubeId = (url) => {
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
      return url.split('embed/')[1].split('?')[0];
    }
    return url;
  };

  return (
    <div className="min-h-screen pb-12" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #DBEAFE 100%)' }}>
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-heading text-5xl font-bold text-foreground mb-2 tracking-tight">
              Creator Dashboard
            </h1>
            <p className="text-muted text-lg">Share your knowledge with the world</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button
                data-testid="create-tutorial-button"
                className="mt-4 md:mt-0 bg-primary text-white rounded-full px-6 h-12 font-medium hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
              >
                <PlusCircle className="mr-2" size={20} />
                Create Tutorial
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-2xl border-white/50 rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl font-bold">
                  {editingTutorial ? 'Edit Tutorial' : 'Create New Tutorial'}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground font-medium">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="tutorial-title-input"
                    placeholder="Introduction to React Hooks"
                    className="bg-white/50 border-white/60 focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube_url" className="text-foreground font-medium flex items-center gap-2">
                    <Youtube size={18} />
                    YouTube URL
                  </Label>
                  <Input
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    required
                    data-testid="tutorial-youtube-url-input"
                    placeholder="https://youtube.com/watch?v=..."
                    className="bg-white/50 border-white/60 focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground font-medium">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="tutorial-category-select" className="bg-white/50 border-white/60 rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-2xl border-white/50 rounded-2xl">
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    data-testid="tutorial-description-input"
                    placeholder="Describe what learners will gain from this tutorial..."
                    rows={4}
                    className="bg-white/50 border-white/60 focus:ring-2 focus:ring-primary/20 rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preview_image" className="text-foreground font-medium">Preview Image URL (Optional)</Label>
                  <Input
                    id="preview_image"
                    value={formData.preview_image}
                    onChange={(e) => setFormData({ ...formData, preview_image: e.target.value })}
                    data-testid="tutorial-preview-image-input"
                    placeholder="https://example.com/image.jpg"
                    className="bg-white/50 border-white/60 focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="tutorial-submit-button"
                  className="w-full bg-primary text-white rounded-full h-12 font-medium hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
                >
                  {editingTutorial ? 'Update Tutorial' : 'Create Tutorial'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tutorials List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : tutorials.length === 0 ? (
          <GlassCard className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Youtube className="text-primary" size={32} />
            </div>
            <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">No tutorials yet</h3>
            <p className="text-muted mb-6">Create your first tutorial to share your knowledge</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tutorials.map((tutorial) => {
              const videoId = extractYouTubeId(tutorial.youtube_url);
              const thumbnailUrl = tutorial.preview_image || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

              return (
                <GlassCard key={tutorial.id} data-testid={`my-tutorial-${tutorial.id}`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-64 aspect-video flex-shrink-0 rounded-2xl overflow-hidden">
                      <img
                        src={thumbnailUrl}
                        alt={tutorial.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {tutorial.category}
                          </span>
                          <h3 className="font-heading text-2xl font-semibold text-foreground mt-2">
                            {tutorial.title}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(tutorial)}
                            variant="outline"
                            size="sm"
                            data-testid={`edit-tutorial-${tutorial.id}`}
                            className="rounded-full border-white/60 hover:bg-white/60"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            onClick={() => handleDelete(tutorial.id)}
                            variant="outline"
                            size="sm"
                            data-testid={`delete-tutorial-${tutorial.id}`}
                            className="rounded-full border-white/60 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>

                      <p className="text-muted mb-4">{tutorial.description}</p>

                      <div className="flex items-center gap-4 text-sm text-muted">
                        <span>Created {new Date(tutorial.created_at).toLocaleDateString()}</span>
                        <a
                          href={tutorial.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View on YouTube
                        </a>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};