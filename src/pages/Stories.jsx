import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, UserIcon, ClockIcon, ArrowRightIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { collection, getDocs, orderBy, query, limit, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuthStore } from "../store/authStore";
import ResponsiveImage from "../components/ResponsiveImage";
import LoadingSpinner from "../components/LoadingSpinner";
import StoryEditor from "../components/StoryEditor";

export default function Stories() {
  const { userProfile } = useAuthStore();
  const [stories, setStories] = useState([]);
  const [featuredStory, setFeaturedStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showStoryEditor, setShowStoryEditor] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    fetchStories();
  }, [selectedCategory, sortBy]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      if (!db) {
        console.warn('Firestore not available - cannot load stories');
        setStories([]);
        setFeaturedStory(null);
        setLoading(false);
        return;
      }

      let q;
      if (selectedCategory === 'all') {
        q = query(
          collection(db, "stories"),
          orderBy(sortBy === 'newest' ? "publishedAt" : "title", sortBy === 'newest' ? "desc" : "asc"),
          limit(50)
        );
      } else {
        q = query(
          collection(db, "stories"),
          where("category", "==", selectedCategory),
          orderBy(sortBy === 'newest' ? "publishedAt" : "title", sortBy === 'newest' ? "desc" : "asc"),
          limit(50)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const storiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setStories(storiesData);
      setFeaturedStory(storiesData.find(story => story.featured));
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    
    try {
      if (db) {
        await deleteDoc(doc(db, "stories", storyId));
      }
      setStories(stories.filter(s => s.id !== storyId));
      if (featuredStory?.id === storyId) {
        setFeaturedStory(null);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Error deleting story: ' + error.message);
    }
  };

  const handleEditStory = (story) => {
    setEditingStory(story);
    setShowStoryEditor(true);
  };

  const handleAddStory = () => {
    setEditingStory(null);
    setShowStoryEditor(true);
  };

  const handleCloseEditor = () => {
    setShowStoryEditor(false);
    setEditingStory(null);
  };

  const handleSaveStory = () => {
    setShowStoryEditor(false);
    setEditingStory(null);
    fetchStories(); // Refresh stories list
  };

  const categories = [
    { id: 'all', label: 'All Stories' },
    { id: 'events', label: 'Events & Festivals' },
    { id: 'people', label: 'People & Profiles' },
    { id: 'places', label: 'Places & Destinations' },
    { id: 'traditions', label: 'Traditions & Culture' },
    { id: 'artisan-story', label: 'Artisan Stories' },
    { id: 'food-culture', label: 'Food & Recipes' },
    { id: 'community', label: 'Community Impact' },
    { id: 'sustainability', label: 'Environment' }
  ];

  // Filter and sort stories
  let filteredStories = selectedCategory === 'all' 
    ? stories.filter(story => !story.featured && story.content && story.content.length > 100) // Only show stories with substantial content
    : stories.filter(story => story.category === selectedCategory && !story.featured && story.content && story.content.length > 100);

  // Sort stories
  filteredStories = filteredStories.sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.publishedAt) - new Date(b.publishedAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'newest':
      default:
        return new Date(b.publishedAt) - new Date(a.publishedAt);
    }
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-organic-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-organic-text to-organic-highlight text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mountain-pattern opacity-10"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Darjeeling Stories & News
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto mb-8">
              Weekly updates, events, and interesting stories from the Darjeeling hills. 
              Stay connected with our community and discover what's happening in our region.
            </p>
            
            {/* Admin Add Story Button */}
            {isAdmin && (
              <button
                onClick={handleAddStory}
                className="inline-flex items-center gap-2 bg-white text-organic-text font-semibold px-6 py-3 rounded-lg hover:bg-organic-background transition-all"
              >
                <PlusIcon className="w-5 h-5" />
                Create New Story
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Story */}
      {featuredStory && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative">
                  <ResponsiveImage
                    src={featuredStory.featuredImage}
                    alt={featuredStory.title}
                    className="w-full h-96 lg:h-full"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={true}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-organic-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ⭐ Featured Story
                    </span>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={featuredStory.authorImage} 
                      alt={featuredStory.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-organic-text">{featuredStory.author}</p>
                      <p className="text-sm text-organic-text opacity-75">{featuredStory.readTime}</p>
                    </div>
                  </div>
                  <h2 className="font-display text-3xl font-bold text-organic-text mb-4">
                    {featuredStory.title}
                  </h2>
                  <p className="text-lg text-organic-text opacity-75 mb-6 leading-relaxed">
                    {featuredStory.excerpt}
                  </p>
                  <Link 
                    to={`/stories/${featuredStory.id}`}
                    className="inline-flex items-center gap-2 bg-organic-primary text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-all"
                  >
                    Read Full Story
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-organic-primary text-white'
                      : 'bg-organic-background text-organic-text hover:bg-organic-primary hover:text-white'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-organic-text">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="author">Author A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Results Info */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-organic-text opacity-75">
              {filteredStories.length} {selectedCategory === 'all' ? 'stories' : `${categories.find(c => c.id === selectedCategory)?.label.toLowerCase()} stories`} found
            </p>
            {isAdmin && (
              <button
                onClick={handleAddStory}
                className="flex items-center gap-2 bg-organic-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
              >
                <PlusIcon className="w-4 h-4" />
                Add Story
              </button>
            )}
          </div>
          
          {filteredStories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-organic-text mb-2">No Stories Found</h3>
              <p className="text-organic-text opacity-75 mb-6">
                {selectedCategory === 'all' 
                  ? 'No stories have been published yet.' 
                  : `No stories found in the ${categories.find(c => c.id === selectedCategory)?.label} category.`
                }
              </p>
              {isAdmin && (
                <button
                  onClick={handleAddStory}
                  className="bg-organic-primary text-white px-6 py-3 rounded-lg hover:opacity-90"
                >
                  Create First Story
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map((story) => (
              <article key={story.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative">
                  <ResponsiveImage
                    src={story.featuredImage}
                    alt={story.title}
                    className="w-full h-48"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-organic-highlight text-white px-2 py-1 rounded-full text-xs font-semibold capitalize">
                      {(story.category || '').replace('-', ' ')}
                    </span>
                  </div>
                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => handleEditStory(story)}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                        title="Edit Story"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStory(story.id)}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        title="Delete Story"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={story.authorImage} 
                      alt={story.author}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-organic-text">{story.author}</p>
                      <div className="flex items-center gap-2 text-organic-text opacity-75">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{new Date(story.publishedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <ClockIcon className="w-3 h-3" />
                        <span>{story.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold text-organic-text mb-3 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-organic-text opacity-75 mb-4 line-clamp-3">
                    {story.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {story.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-organic-background text-organic-text px-2 py-1 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link 
                    to={`/stories/${story.id}`}
                    className="inline-flex items-center gap-2 text-organic-primary hover:text-organic-text font-medium"
                  >
                    Read Story
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-organic-text text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Taste the Stories, Support the Artisans
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Every product you purchase directly supports these amazing artisans and their families
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/shop" 
              className="inline-block bg-organic-primary text-white font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-all"
            >
              Shop Authentic Products
            </Link>
            <Link 
              to="/artisans" 
              className="inline-block border border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-organic-text transition-all"
            >
              Meet Our Artisans
            </Link>
          </div>
        </div>
      </section>
      
      {/* Story Editor Modal */}
      {showStoryEditor && (
        <StoryEditor
          story={editingStory}
          onClose={handleCloseEditor}
          onSave={handleSaveStory}
        />
      )}
    </div>
  );
}