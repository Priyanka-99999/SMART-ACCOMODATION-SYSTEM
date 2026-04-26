import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import PropertyCard from '../components/PropertyCard';

const UserDashboard = () => {
  const { user, wishlist, fetchWishlist } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [wishlistProps, setWishlistProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    fetchData();
    fetchWishlist();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, wishlistRes] = await Promise.all([
        api.get('/bookings/mybookings'),
        api.get('/users/wishlist')
      ]);
      setBookings(bookingsRes.data);
      setWishlistProps(wishlistRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  // Keep wishlist in sync with global store changes
  useEffect(() => {
    setWishlistProps(prev => prev.filter(p => wishlist.includes(p._id)));
  }, [wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-10 animate-fade-in">
      <div className="mb-6 sm:mb-10 pb-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-end gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-gray-500 mt-2 sm:mt-3 text-sm sm:text-lg font-medium">Manage your bookings and wishlist</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl sm:rounded-2xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('bookings')} 
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'bookings' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Calendar className="h-4 w-4" /> Bookings
          </button>
          <button 
            onClick={() => setActiveTab('wishlist')} 
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'wishlist' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Heart className="h-4 w-4" /> Saved <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-md ml-1">{wishlist.length}</span>
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-xl text-primary">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              Your Bookings
            </h2>

            {loading ? (
              <div className="grid gap-6">
                {[1, 2].map(n => <div key={n} className="bg-gray-100 h-40 rounded-3xl animate-pulse"></div>)}
              </div>
            ) : bookings.length > 0 ? (
              <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking, index) => (
                  <div key={booking._id} className="bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/50 overflow-hidden flex flex-col animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="p-5 sm:p-7 flex-grow">
                      <div className="flex justify-between items-start mb-4 sm:mb-5">
                        <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 line-clamp-1">{booking.propertyId?.title || 'Unknown Property'}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${
                          booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                          booking.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-3 mb-5 font-medium">
                        <p className="flex items-center gap-2 text-gray-800"><MapPin className="h-4 w-4 text-primary" /> {booking.propertyId?.location || 'Unknown'}</p>
                        <p className="flex items-center gap-2 text-gray-500"><Calendar className="h-4 w-4" /> <strong>Move-in:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-white px-5 sm:px-7 py-4 sm:py-5 border-t border-gray-100 flex justify-between items-center mt-auto">
                      <span className="text-gray-400 text-[10px] sm:text-sm font-semibold uppercase tracking-wider">Monthly Rent</span>
                      <span className="font-extrabold text-lg sm:text-xl text-primary drop-shadow-sm">Rs {booking.totalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm animate-fade-in px-4">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No bookings yet</h3>
                <p className="text-gray-500 mb-8 text-sm sm:text-lg">Explore the marketplace to find your perfect stay.</p>
                <Link to="/" className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 inline-block">
                  Explore Properties
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3 animate-fade-in">
              <div className="bg-red-100 p-2 rounded-xl text-red-500">
                <Heart className="h-6 w-6 fill-red-500" />
              </div>
              Saved Properties
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(n => <div key={n} className="bg-gray-100 h-[380px] rounded-3xl animate-pulse"></div>)}
              </div>
            ) : wishlistProps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {wishlistProps.map((property, index) => (
                  <div key={property._id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
                  <Heart className="h-10 w-10 text-red-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-8 text-lg">Save properties you like by clicking the heart icon.</p>
                <Link to="/" className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform inline-block">
                  Explore Properties
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
