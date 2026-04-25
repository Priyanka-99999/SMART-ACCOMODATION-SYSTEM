import { Link } from 'react-router-dom';
import { MapPin, Wifi, Coffee, Car, Heart, Star } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const PropertyCard = ({ property }) => {
  const { isAuthenticated, wishlist, toggleWishlist } = useAuthStore();
  const isWishlisted = wishlist?.includes(property._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert('Please login to save to wishlist');
    toggleWishlist(property._id);
  };

  // Use property image or fall back to a reliable placeholder
  const imageUrl = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800';

  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
  ];

  const handleImageError = (e) => {
    // Pick a stable fallback based on property id to keep cards visually distinct
    const idx = property._id
      ? property._id.charCodeAt(property._id.length - 1) % FALLBACK_IMAGES.length
      : 0;
    e.target.src = FALLBACK_IMAGES[idx];
    e.target.onerror = null; // prevent infinite loop
  };

  const renderAmenityIcon = (amenity) => {
    const a = amenity.toLowerCase();
    if (a.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (a.includes('food') || a.includes('kitchen')) return <Coffee className="h-4 w-4" />;
    if (a.includes('parking')) return <Car className="h-4 w-4" />;
    return null;
  };

  return (
    <Link to={`/properties/${property._id}`} className="group block h-full">
      <div className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100/50 flex flex-col h-full transform group-hover:-translate-y-2 relative">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={property.title} 
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-gray-900 shadow-lg transform transition-transform group-hover:scale-105 z-20">
            Rs {property.price}<span className="text-gray-500 text-xs font-medium">/mo</span>
          </div>
          <button 
            onClick={handleWishlistClick}
            className="absolute top-4 left-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-md hover:scale-110 transition-transform z-20 group/btn"
          >
            <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/btn:text-red-500'}`} />
          </button>
        </div>
        <div className="p-6 flex flex-col flex-grow bg-white relative z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-extrabold text-xl text-gray-900 line-clamp-1 group-hover:text-primary transition-colors pr-2">{property.title}</h3>
            {property.averageRating > 0 && (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-xs font-bold flex-shrink-0 border border-amber-100">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                {property.averageRating.toFixed(1)}
              </div>
            )}
          </div>
          <div className="flex items-center text-gray-500 text-sm mb-5 font-medium">
            <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0 text-primary/70" />
            <span className="line-clamp-1 capitalize">{property.location}</span>
          </div>
          <div className="mt-auto pt-5 border-t border-gray-50">
            <div className="flex flex-wrap gap-2 text-gray-500">
              {property.amenities?.slice(0, 3).map((amenity, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 bg-gray-50 hover:bg-indigo-50 hover:text-primary rounded-lg transition-colors border border-gray-100" title={amenity}>
                  {renderAmenityIcon(amenity)}
                  <span className="capitalize">{amenity}</span>
                </div>
              ))}
              {property.amenities?.length > 3 && (
                <div className="text-xs font-medium px-2.5 py-1.5 bg-gray-50 rounded-lg flex items-center border border-gray-100">
                  +{property.amenities.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
