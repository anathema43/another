import React from "react";
import { Link } from "react-router-dom";
import { TruckIcon, BeakerIcon, HandRaisedIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ResponsiveImage from "../components/ResponsiveImage";
import AddToCartButton from "../components/AddToCartButton";
import Logo from "../components/Logo";
import { useProductStore } from "../store/productStore";
import formatCurrency from "../utils/formatCurrency";

export default function Home() {
  const { products, featuredProducts, fetchProducts, fetchFeaturedProducts, loading } = useProductStore();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);
  const sliderRef = React.useRef(null);
  
  React.useEffect(() => {
    // Fetch both regular products and featured products
    const loadProducts = async () => {
      try {
        await fetchProducts();
        await fetchFeaturedProducts();
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    
    if (products.length === 0 || featuredProducts.length === 0) {
      loadProducts();
    }
  }, [products.length, featuredProducts.length, fetchProducts, fetchFeaturedProducts]);

  // Use featured products if available, fallback to first 4 regular products
  const displayProducts = React.useMemo(() => {
    if (featuredProducts.length > 0) {
      return featuredProducts;
    }
    return products.filter(p => p.featured === true).slice(0, 4);
  }, [featuredProducts, products]);

  // Auto-play functionality
  React.useEffect(() => {
    if (!isAutoPlaying || displayProducts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayProducts.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, displayProducts.length]);

  // Touch handlers for swipe functionality
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < displayProducts.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
    
    // Resume auto-play after 3 seconds
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // Navigation functions
  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? displayProducts.length - 1 : prev - 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % displayProducts.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // Loading state component
  const LoadingProducts = () => (
    <div className="flex gap-6 min-w-max">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div className="w-full h-64 bg-gray-200"></div>
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="text-red-600 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-organic-text mb-2">Unable to Load Products</h3>
      <p className="text-organic-text opacity-75 mb-4">Please check your connection and try again</p>
      <button 
        onClick={() => {
          fetchProducts();
          fetchFeaturedProducts();
        }}
        className="bg-organic-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section with Provided Image */}
      <section 
        className="relative h-screen flex items-center justify-center text-organic-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(185, 125, 75, 0.7), rgba(94, 140, 49, 0.7)), url('https://res.cloudinary.com/dj4kdlwzo/image/upload/v1753652937/Gemini_Generated_Image_m5nczum5nczum5nc_c99tl7.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Floating Mountain Pattern Overlay */}
        <div className="absolute inset-0 bg-mountain-pattern opacity-20"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl px-6 animate-fade-in">
          <div className="mb-12">
            <Logo 
              className="text-white justify-center" 
              size="xlarge"
              linkTo={null} 
            />
          </div>
          <div className="mb-6">
            <h2 className="font-brand text-3xl md:text-5xl font-bold mb-2 text-white">
              Authentic Handcrafted Goods
            </h2>
            <h2 className="font-brand text-3xl md:text-5xl font-bold mb-4 text-white">
              from the Heart of
            </h2>
            <h2 className="font-brand text-3xl md:text-5xl font-bold mb-4 text-white">
              the Darjeeling Hills
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/shop" 
              className="inline-block bg-organic-primary text-organic-white font-semibold px-10 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:opacity-90"
            >
              Discover Our Collection
            </Link>
            <Link 
              to="/artisans" 
              className="inline-block px-10 py-4 rounded-full text-lg transition-all duration-300 border-2 border-organic-text text-organic-text hover:bg-organic-text hover:text-organic-white backdrop-blur-sm"
            >
              Meet Our Artisans
            </Link>
            <Link 
              to="/about" 
              className="inline-block px-10 py-4 rounded-full text-lg transition-all duration-300 border-2 border-organic-text text-organic-text hover:bg-organic-text hover:text-organic-white backdrop-blur-sm"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-organic-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-organic-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Himalayan Inspired */}
      <section className="py-20 bg-organic-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="group animate-slide-up">
              <div className="w-20 h-20 bg-organic-primary rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <TruckIcon className="w-10 h-10 text-organic-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3 text-organic-text">Free Delivery</h3>
              <p className="text-organic-text opacity-75 text-lg">On all orders across the mountains</p>
            </div>
            
            <div className="group animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-organic-highlight rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <BeakerIcon className="w-10 h-10 text-organic-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3 text-organic-text">100% Organic</h3>
              <p className="text-organic-text opacity-75 text-lg">Pure & chemical free from nature</p>
            </div>
            
            <div className="group animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-20 h-20 bg-organic-primary rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <HandRaisedIcon className="w-10 h-10 text-organic-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3 text-organic-text">Fair Trade</h3>
              <p className="text-organic-text opacity-75 text-lg">Supporting mountain communities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-organic-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-organic-text mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-organic-text opacity-75 max-w-2xl mx-auto">
              Discover our handpicked selection of authentic treasures
            </p>
          </div>
          
          {/* Simple 2-Product Layout */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Rice Product */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <ResponsiveImage
                  src="https://images.pexels.com/photos/33239/wheat-field-wheat-cereals-grain.jpg?auto=compress&cs=tinysrgb&w=800"
                  alt="Organic Red Rice"
                  className="w-full h-64 hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority={true}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-organic-highlight text-organic-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    🌾 Organic
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-organic-white bg-opacity-90 rounded-full px-2 py-1">
                  <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-organic-primary fill-current" />
                    <span className="text-sm font-semibold ml-1">4.8</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold mb-2 text-organic-text">
                  Organic Red Rice
                </h3>
                <p className="text-organic-text opacity-75 mb-4 text-sm leading-relaxed">
                  Nutrient-rich, farm to table red rice from Himalayan valleys, grown without chemicals in terraced fields.
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-2xl text-organic-highlight">
                    ₹450
                  </span>
                  <Link 
                    to="/shop"
                    className="text-organic-primary hover:text-organic-text text-sm font-semibold underline"
                  >
                    View Details
                  </Link>
                </div>
                <Link 
                  to="/shop"
                  className="w-full bg-organic-primary text-organic-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-200 text-center block"
                >
                  Add to Cart
                </Link>
              </div>
            </div>

            {/* Wheat Product */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative overflow-hidden">
                <ResponsiveImage
                  src="https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Himalayan Buckwheat"
                  className="w-full h-64 hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority={true}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-organic-highlight text-organic-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    🌾 Gluten Free
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-organic-white bg-opacity-90 rounded-full px-2 py-1">
                  <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-organic-primary fill-current" />
                    <span className="text-sm font-semibold ml-1">4.6</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold mb-2 text-organic-text">
                  Himalayan Buckwheat
                </h3>
                <p className="text-organic-text opacity-75 mb-4 text-sm leading-relaxed">
                  Gluten-free, sustainably harvested buckwheat from high altitudes, perfect for traditional pancakes and porridge.
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-2xl text-organic-highlight">
                    ₹380
                  </span>
                  <Link 
                    to="/shop"
                    className="text-organic-primary hover:text-organic-text text-sm font-semibold underline"
                  >
                    View Details
                  </Link>
                </div>
                <Link 
                  to="/shop"
                  className="w-full bg-organic-primary text-organic-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-200 text-center block"
                >
                  Add to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Ramro Section */}
      <section id="why-ramro" className="py-20 bg-organic-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <img 
                src="https://res.cloudinary.com/dj4kdlwzo/image/upload/v1753654806/Gemini_Generated_Image_32y8mu32y8mu32y8_x9aecd.png" 
                alt="Himalayan landscape with traditional architecture" 
                className="w-full rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-8 text-organic-text">
                Why Choose Darjeeling Souls - From the Heart of the Hills
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-organic-highlight rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-lg text-organic-text mb-1">Locally Sourced & Sustainably Grown</h4>
                    <p className="text-organic-text opacity-75">Direct from Darjeeling hill communities with traditional farming methods</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-organic-primary rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-lg text-organic-text mb-1">No Chemical Pesticides or Fertilizers</h4>
                    <p className="text-organic-text opacity-75">Pure, natural products as nature intended</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-organic-primary rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-lg text-organic-text mb-1">Promotes Healthy Communities</h4>
                    <p className="text-organic-text opacity-75">Every purchase supports local artisans and their families</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-organic-highlight rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-lg text-organic-text mb-1">Authentic. Sustainable. Pure.</h4>
                    <p className="text-organic-text opacity-75">Connecting you with the timeless traditions of the Darjeeling hills</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link 
                  to="/shop"
                  className="btn-primary inline-block px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Explore Our Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-organic-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-organic-text mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-organic-text opacity-75">Voices from around the world</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-organic-background p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-organic-primary fill-current" />
                ))}
              </div>
              <p className="text-lg italic text-organic-text mb-4 font-display">
                "The organic red rice is absolutely incredible! You can taste the purity of the mountains."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-organic-primary rounded-full flex items-center justify-center text-organic-white font-bold mr-3">
                  S
                </div>
                <div>
                  <p className="font-semibold text-organic-text">Sarah Chen</p>
                  <p className="text-sm text-organic-text opacity-75">California, USA</p>
                </div>
              </div>
            </div>

            <div className="bg-organic-background p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-organic-primary fill-current" />
                ))}
              </div>
              <p className="text-lg italic text-organic-text mb-4 font-display">
                "Supporting local farmers while getting the best quality products. This is the future of shopping!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-organic-highlight rounded-full flex items-center justify-center text-organic-white font-bold mr-3">
                  R
                </div>
                <div>
                  <p className="font-semibold text-organic-text">Raj Patel</p>
                  <p className="text-sm text-organic-text opacity-75">Mumbai, India</p>
                </div>
              </div>
            </div>

            <div className="bg-organic-background p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-organic-primary fill-current" />
                ))}
              </div>
              <p className="text-lg italic text-organic-text mb-4 font-display">
                "The honey is pure magic! My family loves the authentic taste and the story behind each product."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-organic-primary rounded-full flex items-center justify-center text-organic-white font-bold mr-3">
                  M
                </div>
                <div>
                  <p className="font-semibold text-organic-text">Maria Rodriguez</p>
                  <p className="text-sm text-organic-text opacity-75">Barcelona, Spain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-organic-text text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mountain-pattern opacity-10"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience the Darjeeling Difference?
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of customers who choose authentic, organic products from the heart of the Darjeeling hills.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/shop" 
              className="inline-block bg-white text-organic-text font-bold px-10 py-4 rounded-full text-lg hover:bg-organic-background transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Begin Your Journey
            </Link>
            <Link 
              to="/signup" 
              className="inline-block border-2 border-white text-white font-bold px-10 py-4 rounded-full text-lg hover:bg-white hover:text-organic-text transition-all duration-300"
            >
              Join Our Community
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}