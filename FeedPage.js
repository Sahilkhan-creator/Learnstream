import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/GlassCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categories = ['All', 'Tech', 'Education', 'Creative', 'Science', 'Business', 'Health'];

export const FeedPage = () => {
  const { token, user } = useAuth();
  const [tutorials, setTutorials] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    fetchTutorials();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    filterTutorials();
  }, [tutorials, searchQuery, selectedCategory]);

  const fetchTutorials = async () => {
    try {
      const response = await axios.get(`${API}/tutorials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTutorials(response.data);
    } catch (error) {
      toast.error('Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get(`${API}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = new Set(response.data.map(t => t.id));
      setBookmarkedIds(ids);
    } catch (error) {
      console.error('Failed to load bookmarks');
    }
  };

  const filterTutorials = () => {
    let filtered = tutorials;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTutorials(filtered);
  };

  const toggleBookmark = async (tutorialId) => {
    try {
      if (bookmarkedIds.has(tutorialId)) {
        await axios.delete(`${API}/bookmarks/${tutorialId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          next.delete(tutorialId);
          return next;
        });
        toast.success('Removed from library');
      } else {
        await axios.post(`${API}/bookmarks`, { tutorial_id: tutorialId }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarkedIds(prev => new Set(prev).add(tutorialId));
        toast.success('Added to library');
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
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

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #DBEAFE 100%)' }}>
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #DBEAFE 100%)' }}>
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl sm:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Discover Tutorials
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Curated educational content tailored to your interests
          </p>
        </div>

        {/* Search & Filters */}
        <GlassCard className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
              <Input
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-input"
                className="pl-12 bg-white/50 border-white/60 focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="category-filter" className="w-full md:w-48 bg-white/50 border-white/60 rounded-xl h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-2xl border-white/50 rounded-2xl">
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        {/* Tutorials Grid */}
        {filteredTutorials.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">No tutorials found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTutorials.map((tutorial) => {
              const videoId = extractYouTubeId(tutorial.youtube_url);
              const thumbnailUrl = tutorial.preview_image || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
              const isBookmarked = bookmarkedIds.has(tutorial.id);

              return (
                <GlassCard key={tutorial.id} className="group overflow-hidden p-0" data-testid={`tutorial-card-${tutorial.id}`}>
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
                        data-testid={`play-tutorial-${tutorial.id}`}
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
                      <button
                        onClick={() => toggleBookmark(tutorial.id)}
                        data-testid={`bookmark-${tutorial.id}`}
                        className="p-1.5 hover:bg-white/60 rounded-full transition-all"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="text-primary" size={20} fill="currentColor" />
                        ) : (
                          <Bookmark className="text-muted" size={20} />
                        )}
                      </button>
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