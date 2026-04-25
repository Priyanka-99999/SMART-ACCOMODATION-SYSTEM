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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 animate-fade-in">
      <div className="mb-10 pb-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-10 w-10 text-primary" />
            Super Admin Control
          </h1>
          <p className="text-gray-500 mt-3 text-lg font-medium">Verify and moderate new property listings</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Verifications ({pendingProperties.length})</h2>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500 font-medium">Loading...</div>
        ) : pendingProperties.length > 0 ? (
          <div className="space-y-6">
            {pendingProperties.map(property => (
              <div key={property._id} className="border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow bg-gray-50/50">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-extrabold text-xl text-gray-900">{property.title}</h3>
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Pending</span>
                  </div>
                  <p className="text-gray-600 font-medium mb-3 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{property.location} • Rs {property.price}/mo</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{property.description}</p>
                </div>
                <div className="flex gap-3 min-w-[200px]">
                  <button onClick={() => handleStatusUpdate(property._id, 'approved')} className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-bold transition-colors">
                    <CheckCircle className="h-5 w-5" /> Approve
                  </button>
                  <button onClick={() => handleStatusUpdate(property._id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold transition-colors">
                    <XCircle className="h-5 w-5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
            <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
            <p className="text-gray-500 mt-2 font-medium">There are no properties pending verification.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
