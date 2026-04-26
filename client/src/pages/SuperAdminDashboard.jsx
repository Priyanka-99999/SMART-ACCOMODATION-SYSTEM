import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, MapPin, CheckCircle, XCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const SuperAdminDashboard = () => {
  const { user } = useAuthStore();
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      // Admin fetches properties with status=pending
      const res = await api.get('/properties?status=pending');
      setPendingProperties(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/properties/${id}/status`, { status });
      setPendingProperties(pendingProperties.filter(p => p._id !== id));
    } catch (error) {
      alert('Error updating status');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="pt-32 text-center text-xl font-bold">Access Denied. Super Admins only.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-10 animate-fade-in">
      <div className="mb-6 sm:mb-10 pb-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-end gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            Super Admin
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-lg font-medium">Verify new property listings</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 px-2">Pending Verifications ({pendingProperties.length})</h2>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500 font-medium">Loading...</div>
        ) : pendingProperties.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {pendingProperties.map(property => (
              <div key={property._id} className="border border-gray-200 rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 hover:shadow-md transition-shadow bg-gray-50/50">
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="font-extrabold text-lg sm:text-xl text-gray-900">{property.title}</h3>
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">Pending</span>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base font-medium mb-3 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{property.location} • Rs {property.price}/mo</p>
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{property.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 min-w-full lg:min-w-[300px]">
                  <button onClick={() => handleStatusUpdate(property._id, 'approved')} className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-bold transition-all active:scale-95 text-sm sm:text-base">
                    <CheckCircle className="h-5 w-5" /> Approve
                  </button>
                  <button onClick={() => handleStatusUpdate(property._id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold transition-all active:scale-95 text-sm sm:text-base">
                    <XCircle className="h-5 w-5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-gray-50 rounded-2xl border border-gray-200 border-dashed mx-2">
            <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">All caught up!</h3>
            <p className="text-gray-500 mt-2 text-sm font-medium px-4">There are no properties pending verification.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
