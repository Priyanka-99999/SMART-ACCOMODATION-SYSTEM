import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartSearch from '../components/SmartSearch';
import PropertyCard from '../components/PropertyCard';
import api from '../services/api';
import { Sparkles, ArrowRight, Search } from 'lucide-react';

import useAuthStore from '../store/useAuthStore';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiCriteria, setAiCriteria] = useState(null);
  const { isAuthenticated, user, fetchWishlist } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect admins and owners to their own dashboards
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/superadmin');
      return;
    }
    if (isAuthenticated && user?.role === 'owner') {
      navigate('/admin');
      return;
    }
    fetchProperties();
    if (isAuthenticated) fetchWishlist();
  }, [isAuthenticated, user]);

  const fetchProperties = async () => {
    try {
      const res = await api.get('/properties');
      setProperties(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching properties', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResults = (results, criteria) => {
    setProperties(Array.isArray(results) ? results : []);
    setAiCriteria(criteria);
  };

  const clearAiFilter = () => {
    setAiCriteria(null);
    setLoading(true);
    fetchProperties();
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-dark pt-24 sm:pt-32 pb-24 sm:pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-40 animate-zoom-in">
          <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2070" alt="Beautiful Home" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto text-center z-10 px-2">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 sm:mb-6 drop-shadow-lg animate-slide-down">
            Find your perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">PG / Hostel</span> instantly.
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-6 sm:mb-10 drop-shadow-md animate-slide-down delay-100 px-4">
            AI-powered search for students and working professionals.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <div className="px-4 animate-slide-up z-30 relative -mt-10 sm:-mt-12">
        <SmartSearch onSearchResults={handleSearchResults} />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {aiCriteria && (
          <div className="mb-8 sm:mb-10 animate-fade-in">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm animate-pulse-slow">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900">AI Results for: {aiCriteria.location === 'Any' ? 'Your Search' : `Near ${aiCriteria.location}`}</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                    {aiCriteria.maxPrice !== 'Any' && <span className="px-2.5 py-1 bg-white text-[10px] sm:text-xs font-bold text-indigo-600 rounded-full border border-indigo-100 shadow-sm">Budget: Under Rs.{aiCriteria.maxPrice}</span>}
                    {aiCriteria.gender !== 'any' && <span className="px-2.5 py-1 bg-white text-[10px] sm:text-xs font-bold text-indigo-600 rounded-full border border-indigo-100 shadow-sm capitalize">Gender: {aiCriteria.gender}</span>}
                  </div>
                </div>
              </div>
              <button 
                onClick={clearAiFilter}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 transition-all active:scale-95 text-sm"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Top Rated PG / Hostels</h2>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-lg font-medium">Verified stays for long-term comfort</p>
          </div>
          {!aiCriteria && (
            <button className="text-primary font-bold flex items-center gap-1.5 hover:gap-3 transition-all text-sm sm:text-base">
              View all <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-gray-200 h-[380px] rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (Array.isArray(properties) && properties.length > 0) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.map((property, index) => (
              <div key={property._id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">No properties found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search criteria or removing some filters.</p>
            {aiCriteria && (
              <button onClick={clearAiFilter} className="mt-6 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
                View all properties
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
