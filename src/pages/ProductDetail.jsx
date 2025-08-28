import React from "react";
import { useParams, Link } from "react-router-dom";
import ResponsiveImage from "../components/ResponsiveImage";
import { useProductStore } from "../store/productStore";
import { useInventoryStore } from "../store/inventoryStore";
import ReviewStars from "../components/ReviewStars";
import WishlistButton from "../components/WishlistButton";
import AddToCartButton from "../components/AddToCartButton";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import ReviewSummary from "../components/ReviewSummary";
import formatCurrency from "../utils/formatCurrency";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ProductDetail() {
  const { id } = useParams();
  const { products, getProductById } = useProductStore();
  const { trackProduct, untrackProduct } = useInventoryStore();
  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showReviewForm, setShowReviewForm] = React.useState(false);

  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Try to get from store first
        let foundProduct = products.find((p) => p.id === id);
        
        // If not in store, fetch from Firebase
        if (!foundProduct) {
          foundProduct = await getProductById(id);
        }
        
        setProduct(foundProduct);
        
        // Start tracking inventory for this product
        if (foundProduct) {
          trackProduct(id);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    // Cleanup: stop tracking when component unmounts
    return () => {
      untrackProduct(id);
    };
  }, [id, products, getProductById, trackProduct, untrackProduct]);

  if (loading) {
    return (
      <div className="min-h-screen bg-organic-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-organic-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-6">The product you're looking for doesn't exist.</p>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 px-6 py-2 bg-himalaya text-white rounded-lg hover:bg-himalaya-dark transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 text-himalaya hover:text-himalaya-dark"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Shop
        </Link>
      </nav>

      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Product Image */}
        <div className="relative">
          <ResponsiveImage
            src={product.image} 
            alt={product.name} 
            className="w-full h-96 rounded-lg shadow-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
            priority={true} // This is the main product image
          />
          {product.quantityAvailable === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <span className="text-white font-bold text-2xl">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-himalaya-dark">{product.name}</h1>
            <WishlistButton productId={product.id} />
          </div>
          
          <div className="mb-4">
            <ReviewStars rating={product.rating || 4} />
            <span className="ml-2 text-gray-600">
              ({product.rating || 4}/5) • {product.reviewCount || 0} reviews
            </span>
          </div>
          
          <p className="text-xl font-semibold text-green-700 mb-6">{formatCurrency(product.price)}</p>
          
          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
          
          {/* Product Features */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div><strong>SKU:</strong> {product.sku || 'N/A'}</div>
              <div><strong>Weight:</strong> {product.weight || 'N/A'}</div>
              <div><strong>Origin:</strong> {product.origin || 'Himalayas'}</div>
              <div><strong>Artisan:</strong> {product.artisan || 'Local Artisan'}</div>
            </div>
            
            {product.ingredients && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Ingredients:</h4>
                <p className="text-sm text-gray-600">{product.ingredients.join(', ')}</p>
              </div>
            )}
            
            <h3 className="font-semibold mb-2">Product Features:</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• 100% Organic and Natural</li>
              <li>• Sourced directly from Himalayan farmers</li>
              <li>• No artificial preservatives or chemicals</li>
              <li>• Sustainably grown and harvested</li>
            </ul>
          </div>
          
          {product.storageInstructions && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-1">Storage Instructions:</h4>
              <p className="text-blue-700 text-sm">{product.storageInstructions}</p>
            </div>
          )}
          
          {/* Stock Status */}
          <div className="mb-6">
            {product.quantityAvailable > 0 ? (
              <p className="text-green-600 font-medium">
                ✓ In Stock ({product.quantityAvailable} available)
              </p>
            ) : (
              <p className="text-red-600 font-medium">✗ Out of Stock</p>
            )}
          </div>
          
          {/* Add to Cart */}
          <div className="mb-6">
            <AddToCartButton product={product} className="w-full md:w-auto" />
          </div>
          
          {/* Additional Info */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Free shipping on orders over ₹500</p>
            <p>• 7-day return policy</p>
            <p>• Secure payment options</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-16" data-cy="reviews-section">
        <h2 className="text-2xl font-bold text-organic-text mb-6" data-cy="reviews-title">Customer Reviews</h2>
        
        <ReviewSummary productId={product.id} />
        
        <div className="mt-8">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-organic-primary text-white px-6 py-2 rounded-lg hover:opacity-90 mb-6"
            >
              Write a Review
            </button>
          ) : (
            <div className="mb-6">
              <ReviewForm 
                productId={product.id} 
                onReviewSubmitted={() => {
                  setShowReviewForm(false);
                  // Show success message
                  const successDiv = document.createElement('div');
                  successDiv.className = 'bg-green-100 text-green-700 p-4 rounded-lg mb-4';
                  successDiv.setAttribute('data-cy', 'review-success');
                  successDiv.textContent = 'Review submitted successfully!';
                  document.querySelector('[data-cy="reviews-section"]').appendChild(successDiv);
                  setTimeout(() => successDiv.remove(), 5000);
                }}
              />
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-600 hover:text-gray-800 text-sm mt-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <ReviewList productId={product.id} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img 
                  src={relatedProduct.image} 
                  alt={relatedProduct.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold mb-2">{relatedProduct.name}</h3>
                  <p className="text-green-700 font-semibold mb-3">{formatCurrency(relatedProduct.price)}</p>
                  <Link 
                    to={`/products/${relatedProduct.id}`}
                    className="block w-full text-center px-4 py-2 bg-himalaya text-white rounded hover:bg-himalaya-dark transition-colors"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}