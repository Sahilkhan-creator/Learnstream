import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/GlassCard';
import { BookMarked, Play, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const LibraryPage = () => {
  const { token } = useAuth();
  const [bookmarkedTutorials, setBookmarkedTutorials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get(`${API}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarkedTutorials(response.data);
    } catch (error) {
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (tutorialId) => {
    try {
      await axios.delete(`${API}/bookmarks/${tutorialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarkedTutorials(prev => prev.filter(t => t.id !== tutorialId));
      toast.success('Removed from library');
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
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
        <div className="mb-8">
          <h1 className="font-heading text-5xl font-bold text-foreground mb-2 tracking-tight">
            My Library
          </h1>
          <p className="text-muted text-lg">Your saved tutorials in one place</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : bookmarkedTutorials.length === 0 ? (
          <GlassCard className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookMarked className="text-primary" size={32} />
            </div>
            <h3 className="font-heading text-2xl font-semibold text-foreground mb-2">No saved tutorials yet</h3>
            <p className="text-muted mb-6">Start bookmarking tutorials from the feed to build your personal library</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedTutorials.map((tutorial) => {
              const videoId = extractYouTubeId(tutorial.youtube_url);
              const thumbnailUrl = tutorial.preview_image || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

              return (
                <GlassCard key={tutorial.id} className="group overflow-hidden p-0" data-testid={`library-tutorial-${tutorial.id}`}>
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={thumbnailUrl}
                      alt={tutorial.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <a
                        href={tutorial.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`play-library-tutorial-${tutorial.id}`}
                        className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      >
                        <Play className="text-primary ml-1" size={24} fill="currentColor" />
                      </a>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {tutorial.category}
                      </span>
                      <Button
                        onClick={() => removeBookmark(tutorial.id)}
                        variant="ghost"
                        size="sm"
                        data-testid={`remove-bookmark-${tutorial.id}`}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-full"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {tutorial.title}
                    </h3>
                    <p className="text-muted text-sm line-clamp-2 mb-3">
                      {tutorial.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted">
                        By <span className="font-medium text-foreground">{tutorial.creator_name}</span>
                      </div>
                      <a
                        href={tutorial.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-accent transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
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