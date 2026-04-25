import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import api from '../services/api';

const SmartSearch = ({ onSearchResults }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/ai/recommend', { query });
      onSearchResults(res.data.results, res.data.parsedCriteria);
    } catch (error) {
      console.error('Error fetching AI recommendations', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto -mt-8 relative z-10">
      <form onSubmit={handleSearch} className="relative">
        <div className="bg-white rounded-full p-2 flex items-center shadow-2xl border border-gray-100">
          <div className="bg-primary/10 p-3 rounded-full mr-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try 'Find me a room under 5000 near college with WiFi'"
            className="flex-grow bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 px-2 w-full text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-indigo-700 text-white p-4 rounded-full transition-colors ml-2 shadow-md flex items-center justify-center min-w-[56px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SmartSearch;
