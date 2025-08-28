import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useArtisanStore } from "../store/artisanStore";
import ResponsiveImage from "../components/ResponsiveImage";
import LoadingSpinner from "../components/LoadingSpinner";
import { MapPinIcon, StarIcon, CalendarIcon } from "@heroicons/react/24/outline";

export default function ArtisansDirectory() {
  const { artisans, featuredArtisans, fetchArtisans, fetchFeaturedArtisans, loading } = useArtisanStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  useEffect(() => {
    fetchArtisans();
    fetchFeaturedArtisans();
  }, [fetchArtisans, fetchFeaturedArtisans]);

  // Demo artisans for when Firebase isn't configured
  const demoArtisans = [
    {
      id: 'deepak-sharma-001',
      name: 'Deepak Sharma',
      title: 'Master Pickle Maker',
      location: 'Darjeeling, West Bengal',
      region: 'West Bengal',
      experience: 25,
      profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800',
      shortBio: 'Third-generation pickle maker specializing in traditional Darjeeling recipes passed down through his family.',
      specialties: ['Traditional Pickles', 'Fermentation', 'Spice Blending'],
      rating: 4.8,
      reviewCount: 24,
      featured: true,
      productCount: 3
    },
    {
      id: 'laxmi-devi-001',
      name: 'Laxmi Devi',
      title: 'Wild Honey Collector',
      location: 'Manali, Himachal Pradesh',
      region: 'Himachal Pradesh',
      experience: 18,
      profileImage: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800',
      shortBio: 'Expert honey collector who harvests wild honey from high-altitude forests using traditional sustainable methods.',
      specialties: ['Wild Honey Collection', 'Sustainable Harvesting', 'High-Altitude Foraging'],
      rating: 4.9,
      reviewCount: 18,
      featured: true,
      productCount: 2
    },
    {
      id: 'ashok-singh-001',
      name: 'Ashok Singh',
      title: 'Organic Rice Farmer',
      location: 'Uttarakhand Hills',
      region: 'Uttarakhand',
      experience: 22,
      profileImage: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
      shortBio: 'Dedicated organic farmer growing ancient varieties of red rice in terraced fields using traditional methods.',
      specialties: ['Organic Farming', 'Heritage Rice Varieties', 'Terraced Agriculture'],
      rating: 4.7,
      reviewCount: 31,
      featured: true,
      productCount: 2
    },
    {
      id: 'fatima-khan-001',
      name: 'Fatima Khan',
      title: 'Spice Master',
      location: 'Kashmir Valley',
      region: 'Kashmir',
      experience: 30,
      profileImage: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
      shortBio: 'Master spice blender creating traditional Kashmiri spice mixes using recipes perfected over three decades.',
      specialties: ['Spice Blending', 'Kashmiri Cuisine', 'Traditional Recipes'],
      rating: 4.8,
      reviewCount: 27,
      featured: false,
      productCount: 3
    },
    {
      id: 'ram-prasad-001',
      name: 'Ram Prasad',
      title: 'Forest Honey Guardian',
      location: 'Garhwal Himalayas',
      region: 'Uttarakhand',
      experience: 20,
      profileImage: 'https://images.pexels.com/photos/1181562/pexels-photo-1181562.jpeg?auto=compress&cs=tinysrgb&w=800',
      shortBio: 'Forest guardian and honey collector protecting wild bee colonies while sustainably harvesting forest honey.',
      specialties: ['Forest Conservation', 'Wild Honey', 'Ecosystem Protection'],
      rating: 4.9,
      reviewCount: 15,
      featured: false,
      productCount: 1
    },
    {
      id: 'mohan-lal-001',
      name: 'Mohan Lal',
      title: 'Black Salt Miner',
      location: 'Sambhar Lake Region',
      region: 'Rajasthan',
      experience: 28,
      profileImage: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
      shortBio: 'Traditional black salt miner extracting mineral-rich kala namak using methods passed down through generations.',
      specialties: ['Traditional Mining', 'Mineral Extraction', 'Salt Processing'],
      rating: 4.4,
      reviewCount: 22,
      featured: false,
      productCount: 1
    },
    {
      id: 'dolma-angmo-001',
      name: 'Dolma Angmo',
      title: 'Yak Cheese Maker',
      location: 'Ladakh',
      region: 'Ladakh',
      experience: 16,
      profileImage: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
      shortBio: 'High-altitude yak cheese maker creating traditional churpi using ancient Ladakhi methods in the world\'s highest inhabited region.',
      specialties: ['Yak Cheese Making', 'High-Altitude Processing', 'Traditional Preservation'],
      rating: 4.3,
      reviewCount: 8,
      featured: false,
      productCount: 1
    }
  ];

  // Use demo data if Firebase isn't configured or no data
  const displayArtisans = artisans.length > 0 ? artisans : demoArtisans;
  const displayFeaturedArtisans = featuredArtisans.length > 0 ? featuredArtisans : demoArtisans.filter(a => a.featured);

  // Get unique regions from artisans
  const regions = React.useMemo(() => {
    const allRegions = displayArtisans.map(a => a.region || a.location?.split(',')[1]?.trim()).filter(Boolean);
    return [...new Set(allRegions)];
  }, [displayArtisans]);

  // Filter artisans based on search and region
  const filteredArtisans = React.useMemo(() => {
    return displayArtisans.filter(artisan => {
      const matchesSearch = !searchTerm || 
        artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artisan.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artisan.specialties && artisan.specialties.some(s => 
          s.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      const matchesRegion = selectedRegion === "all" || 
        artisan.region === selectedRegion ||
        artisan.location?.includes(selectedRegion);
      
      return matchesSearch && matchesRegion;
    });
  }, [displayArtisans, searchTerm, selectedRegion]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-organic-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-organic-text to-organic-highlight text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mountain-pattern opacity-10"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Meet Our Artisans
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto">
            Discover the master craftspeople behind every authentic product. 
            Each artisan carries forward generations of traditional knowledge from the heart of the Himalayas.
          </p>
        </div>
      </section>

      {/* Featured Artisans */}
      {displayFeaturedArtisans.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-display text-3xl font-bold text-organic-text mb-8 text-center">
              Featured Master Artisans
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayFeaturedArtisans.slice(0, 3).map((artisan) => (
                <Link 
                  key={artisan.id} 
                  to={`/artisans/${artisan.id}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative">
                    <ResponsiveImage
                      src={artisan.profileImage}
                      alt={`${artisan.name} - Master Artisan`}
                      className="w-full h-64 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-organic-primary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        ⭐ Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-organic-text mb-2">
                      {artisan.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPinIcon className="w-4 h-4 text-organic-primary" />
                      <span className="text-organic-text opacity-75 text-sm">{artisan.location}</span>
                    </div>
                    <p className="text-organic-text opacity-75 mb-4 line-clamp-3">
                      {artisan.shortBio}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-organic-highlight" />
                        <span className="text-sm text-organic-text">{artisan.experience} years</span>
                      </div>
                      {artisan.rating && (
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-organic-text">{artisan.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search artisans by name, location, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-organic-primary focus:border-transparent"
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* All Artisans */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold text-organic-text">
              All Artisans ({filteredArtisans.length})
            </h2>
          </div>
          
          {filteredArtisans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-organic-text opacity-75 text-lg mb-6">
                No artisans found matching your search criteria.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRegion("all");
                }}
                className="text-organic-primary hover:text-organic-text underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtisans.map((artisan) => (
                <Link 
                  key={artisan.id} 
                  to={`/artisans/${artisan.id}`}
                  className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <ResponsiveImage
                      src={artisan.profileImage}
                      alt={`${artisan.name} - Artisan`}
                      className="w-full h-48 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {artisan.featured && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-organic-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-organic-text mb-1 group-hover:text-organic-primary transition-colors">
                      {artisan.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <MapPinIcon className="w-3 h-3 text-organic-primary" />
                      <span className="text-organic-text opacity-75 text-xs">{artisan.location}</span>
                    </div>
                    <p className="text-organic-text opacity-75 text-sm line-clamp-2 mb-3">
                      {artisan.shortBio}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-organic-highlight font-medium">
                        {artisan.experience} years exp.
                      </span>
                      {artisan.specialties && (
                        <span className="text-organic-text opacity-75">
                          {artisan.specialties[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cultural Heritage Section */}
      <section className="py-16 bg-organic-text text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold mb-6">
            Preserving Himalayan Heritage
          </h2>
          <p className="text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
            Every artisan in our network is a guardian of ancient traditions. 
            By supporting their work, you help preserve centuries-old craftsmanship 
            and ensure these skills are passed to future generations.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-organic-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏔️</span>
              </div>
              <h3 className="font-semibold mb-2">Mountain Communities</h3>
              <p className="text-sm opacity-75">Supporting remote Himalayan villages</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-organic-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold mb-2">Traditional Crafts</h3>
              <p className="text-sm opacity-75">Preserving ancient techniques and knowledge</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-organic-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold mb-2">Fair Trade</h3>
              <p className="text-sm opacity-75">Ensuring fair compensation for artisans</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}