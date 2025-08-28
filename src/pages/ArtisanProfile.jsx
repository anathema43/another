import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useArtisanStore } from "../store/artisanStore";
import { useProductStore } from "../store/productStore";
import { db } from "../firebase/firebase";
import ProductCard from "../components/ProductCard";
import ResponsiveImage from "../components/ResponsiveImage";
import LoadingSpinner from "../components/LoadingSpinner";
import { ArrowLeftIcon, MapPinIcon, CalendarIcon, StarIcon } from "@heroicons/react/24/outline";

export default function ArtisanProfile() {
  const { id } = useParams();
  const { getArtisanById, getArtisanProducts } = useArtisanStore();
  const [artisan, setArtisan] = useState(null);
  const [artisanProducts, setArtisanProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtisanData = async () => {
      setLoading(true);
      try {
        if (!db) {
          console.warn('Firestore not available - cannot load artisan');
          setError("Database not available");
        } else {
          const artisanData = await getArtisanById(id);
          if (artisanData) {
            setArtisan(artisanData);
            const products = await getArtisanProducts(id);
            setArtisanProducts(products);
          } else {
            setError("Artisan not found");
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtisanData();
  }, [id, getArtisanById, getArtisanProducts]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !artisan) {
    return (
      <div className="min-h-screen bg-organic-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-organic-text mb-4">
            {error || "Artisan not found"}
          </h2>
          <Link 
            to="/artisans" 
            className="inline-flex items-center gap-2 text-organic-primary hover:text-organic-text"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Artisans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-organic-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-organic-text to-organic-highlight text-white overflow-hidden">
        <div className="absolute inset-0 bg-mountain-pattern opacity-10"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <Link 
              to="/artisans" 
              className="inline-flex items-center gap-2 text-white hover:text-organic-primary transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Artisans
            </Link>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                {artisan.name}
              </h1>
              <p className="text-xl mb-6 opacity-90">
                {artisan.title || "Master Artisan"}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5" />
                  <span>{artisan.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{artisan.experience} years of experience</span>
                </div>
                {artisan.rating && (
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 fill-current text-yellow-400" />
                    <span>{artisan.rating}/5 ({artisan.reviewCount || 0} reviews)</span>
                  </div>
                )}
              </div>
              
              <p className="text-lg leading-relaxed opacity-90">
                {artisan.shortBio}
              </p>
            </div>
            
            <div className="relative">
              <ResponsiveImage
                src={artisan.profileImage}
                alt={`${artisan.name} - Himalayan Artisan`}
                className="w-full h-96 rounded-2xl shadow-2xl"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={true}
              />
              {artisan.featured && (
                <div className="absolute top-4 left-4">
                  <span className="bg-organic-primary text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Featured Artisan
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Artisan Story */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="font-display text-3xl font-bold text-organic-text mb-6">
              The Story of {artisan.name}
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-organic-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{artisan.experience}</span>
                  </div>
                  <h3 className="font-semibold text-organic-text">Years of Experience</h3>
                  <p className="text-sm text-organic-text opacity-75">Mastering traditional crafts</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-organic-highlight rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{artisanProducts.length}</span>
                  </div>
                  <h3 className="font-semibold text-organic-text">Products</h3>
                  <p className="text-sm text-organic-text opacity-75">Available in our store</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-organic-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{artisan.familyMembers || 5}</span>
                  </div>
                  <h3 className="font-semibold text-organic-text">Family Members</h3>
                  <p className="text-sm text-organic-text opacity-75">Supported by your purchase</p>
                </div>
              </div>
              
              <div className="space-y-6 text-organic-text leading-relaxed">
                {artisan.story ? (
                  artisan.story.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>
                    {artisan.name} is a master artisan from {artisan.location}, carrying forward 
                    generations of traditional knowledge and craftsmanship. With {artisan.experience} years 
                    of experience, they create authentic products that tell the story of the Himalayas.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cultural Heritage */}
          {artisan.culturalHeritage && (
            <div className="bg-organic-background rounded-2xl p-8 mb-12">
              <h3 className="font-display text-2xl font-bold text-organic-text mb-6">
                Cultural Heritage & Traditions
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-organic-text mb-3">Traditional Techniques</h4>
                  <ul className="space-y-2 text-organic-text">
                    {artisan.techniques?.map((technique, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-organic-primary rounded-full mt-2 flex-shrink-0"></span>
                        {technique}
                      </li>
                    )) || (
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-organic-primary rounded-full mt-2 flex-shrink-0"></span>
                        Traditional Himalayan craftsmanship passed down through generations
                      </li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-organic-text mb-3">Cultural Values</h4>
                  <ul className="space-y-2 text-organic-text">
                    {artisan.values?.map((value, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-organic-highlight rounded-full mt-2 flex-shrink-0"></span>
                        {value}
                      </li>
                    )) || (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-organic-highlight rounded-full mt-2 flex-shrink-0"></span>
                          Sustainable and eco-friendly practices
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-organic-highlight rounded-full mt-2 flex-shrink-0"></span>
                          Community support and fair trade
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-organic-highlight rounded-full mt-2 flex-shrink-0"></span>
                          Preservation of cultural heritage
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Artisan's Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-organic-text mb-4">
              Products by {artisan.name}
            </h2>
            <p className="text-xl text-organic-text opacity-75">
              Discover authentic creations from this master artisan
            </p>
          </div>
          
          {artisanProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artisanProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-organic-text opacity-75 mb-6">
                No products available from this artisan at the moment.
              </p>
              <Link 
                to="/shop" 
                className="inline-block bg-organic-primary text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-all"
              >
                Explore All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Impact Story */}
      <section className="py-16 bg-organic-background">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-organic-text mb-6">
            Your Impact
          </h2>
          <p className="text-xl text-organic-text opacity-75 mb-8 leading-relaxed">
            When you purchase from {artisan.name}, you're not just buying a product – 
            you're supporting a family, preserving traditional crafts, and contributing 
            to the sustainable development of Himalayan communities.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-organic-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="font-semibold text-organic-text mb-2">Family Support</h3>
              <p className="text-sm text-organic-text opacity-75">
                Direct income for {artisan.familyMembers || 5} family members
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-organic-highlight rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">🏛️</span>
              </div>
              <h3 className="font-semibold text-organic-text mb-2">Cultural Preservation</h3>
              <p className="text-sm text-organic-text opacity-75">
                Keeping traditional crafts alive for future generations
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-organic-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">🌱</span>
              </div>
              <h3 className="font-semibold text-organic-text mb-2">Sustainable Practices</h3>
              <p className="text-sm text-organic-text opacity-75">
                Eco-friendly methods that protect the environment
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <Link 
              to="/shop" 
              className="inline-block bg-organic-primary text-white font-bold px-8 py-4 rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
            >
              Support {artisan.name} - Shop Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}