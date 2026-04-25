import { useState, useEffect } from 'react';
import { PlusCircle, Building, Users, MapPin, Mail, MessageSquare } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', location: '', amenities: '', images: '', gender: 'any', distance: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propRes, inqRes] = await Promise.all([
        api.get(`/properties?ownerId=${user._id}`),
        api.get('/inquiries')
      ]);
      setProperties(propRes.data);
      setInquiries(inqRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      const newProperty = {
        ...formData,
        price: Number(formData.price),
        amenities: formData.amenities.split(',').map(a => a.trim()),
        images: formData.images.split(',').map(i => i.trim()),
      };
      
      const res = await api.post('/properties', newProperty);
      setProperties([res.data, ...properties]);
      setShowForm(false);
      setFormData({ title: '', description: '', price: '', location: '', amenities: '', images: '', gender: 'any', distance: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding property');
    }
  };

  const updateInquiryStatus = async (id, status) => {
    try {
      await api.put(`/inquiries/${id}/status`, { status });
      setInquiries(inquiries.map(inq => inq._id === id ? { ...inq, status } : inq));
    } catch (error) {
      console.error(error);
    }
  };

  if (user?.role !== 'owner' && user?.role !== 'admin') {
    return <div className="pt-32 text-center text-xl font-bold">Access Denied. Owners only.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 animate-fade-in">
      <div className="mb-10 pb-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">PG Owner Dashboard</h1>
          <p className="text-gray-500 mt-3 text-lg font-medium">Manage your properties and inquiries</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('properties')} 
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'properties' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Building className="h-4 w-4" /> Properties
          </button>
          <button 
            onClick={() => setActiveTab('inquiries')} 
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'inquiries' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Mail className="h-4 w-4" /> Inquiries {inquiries.filter(i => i.status === 'pending').length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-md ml-1">{inquiries.filter(i => i.status === 'pending').length}</span>}
          </button>
        </div>
      </div>

      {activeTab === 'properties' && (
        <>
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <PlusCircle className="h-5 w-5" />
              {showForm ? 'Cancel' : 'List New Property'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 mb-10 animate-slide-down">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Property Details</h2>
              <form onSubmit={handleAddProperty} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Name</label>
                  <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Sunny Boys PG" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Monthly Rent (Rs)</label>
                  <input required type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location Area</label>
                  <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Kormangala" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Distance (Landmark)</label>
                  <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors" value={formData.distance} onChange={e => setFormData({...formData, distance: e.target.value})} placeholder="e.g. 500m from College" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender Preference</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="any">Any (Co-ed)</option>
                    <option value="boys">Boys Only</option>
                    <option value="girls">Girls Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amenities (comma separated)</label>
                  <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors" value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} placeholder="wifi, ac, food" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URLs (comma separated)</label>
                  <input required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors" value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} placeholder="https://image1.jpg, https://image2.jpg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors">Submit Property</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map(property => (
              <div key={property._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full border ${
                    property.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                    property.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {property.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-xl mb-2 pr-20">{property.title}</h3>
                <p className="text-gray-500 font-medium mb-4 flex items-center gap-1.5"><MapPin className="h-4 w-4" />{property.location}</p>
                <p className="text-primary font-bold text-2xl mb-4">Rs {property.price}</p>
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">Gender: <span className="capitalize font-bold text-gray-700">{property.gender}</span></p>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {inquiries.length > 0 ? inquiries.map(inquiry => (
            <div key={inquiry._id} className="p-6 border-b border-gray-100 last:border-0 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-gray-50 transition-colors">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-lg text-gray-900">{inquiry.userId?.name}</h4>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">{inquiry.contactPhone}</span>
                </div>
                <p className="text-gray-500 text-sm mb-3">Regarding: <span className="font-bold text-primary">{inquiry.propertyId?.title}</span></p>
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <div className="flex items-start gap-2 text-gray-700">
                    <MessageSquare className="h-5 w-5 mt-0.5 text-indigo-400 flex-shrink-0" />
                    <p className="italic">{inquiry.message}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 min-w-[140px]">
                {inquiry.status === 'pending' ? (
                  <>
                    <button onClick={() => updateInquiryStatus(inquiry._id, 'replied')} className="flex-1 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-100 transition-colors">Mark Replied</button>
                    <button onClick={() => updateInquiryStatus(inquiry._id, 'read')} className="flex-1 bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">Mark Read</button>
                  </>
                ) : (
                  <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-500 capitalize border border-gray-200">
                    {inquiry.status}
                  </span>
                )}
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-gray-500 font-medium">No inquiries yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
