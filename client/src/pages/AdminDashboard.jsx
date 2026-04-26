import { useState, useEffect } from 'react';
import { PlusCircle, Building, Users, MapPin, Mail, MessageSquare, Trash2, Edit3, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', location: '', amenities: '', images: '', gender: 'boys', distance: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propRes, inqRes, bookRes] = await Promise.all([
        api.get(`/properties?ownerId=${user._id}`),
        api.get('/inquiries'),
        api.get('/bookings/owner')
      ]);
      setProperties(propRes.data);
      setInquiries(inqRes.data);
      setBookings(bookRes.data);
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
      setFormData({ title: '', description: '', price: '', location: '', amenities: '', images: '', gender: 'boys', distance: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding property');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties(properties.filter(p => p._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting property');
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

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      setBookings(bookings.map(book => book._id === id ? { ...book, status } : book));
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating booking');
    }
  };

  if (user?.role !== 'owner' && user?.role !== 'admin') {
    return <div className="pt-32 text-center text-xl font-bold">Access Denied. Owners only.</div>;
  }

  // Stats calculation
  const totalEarnings = bookings.filter(b => b.status === 'confirmed').length * 5000; // Mock calculation
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const activeInquiries = inquiries.filter(i => i.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-2 font-medium">Welcome back, {user.name}. Here's what's happening today.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95"
        >
          <PlusCircle className="h-5 w-5" />
          {showForm ? 'Cancel' : 'Add New Listing'}
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-indigo-50 p-4 rounded-2xl text-primary"><Building className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Properties</p>
            <p className="text-2xl font-black text-gray-900">{properties.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><TrendingUp className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</p>
            <p className="text-2xl font-black text-gray-900">₹{totalEarnings.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-600"><Clock className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black text-gray-900">{pendingBookings}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-red-50 p-4 rounded-2xl text-red-600"><MessageSquare className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inquiries</p>
            <p className="text-2xl font-black text-gray-900">{activeInquiries}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-2xl flex overflow-x-auto custom-scrollbar no-scrollbar mb-10 gap-1 sm:gap-2">
        <button 
          onClick={() => setActiveTab('properties')} 
          className={`whitespace-nowrap px-4 sm:px-8 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${activeTab === 'properties' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          My Listings
        </button>
        <button 
          onClick={() => setActiveTab('bookings')} 
          className={`whitespace-nowrap px-4 sm:px-8 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${activeTab === 'bookings' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Bookings
        </button>
        <button 
          onClick={() => setActiveTab('inquiries')} 
          className={`whitespace-nowrap px-4 sm:px-8 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${activeTab === 'inquiries' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Inquiries
        </button>
      </div>

      {activeTab === 'properties' && (
        <>
          {showForm && (
            <div className="bg-white p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-gray-100 mb-12 animate-slide-up relative overflow-hidden">
              <h2 className="text-2xl sm:text-3xl font-black mb-8 text-gray-900 tracking-tight">Create Listing</h2>
              <form onSubmit={handleAddProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">PG / Hostel Name</label>
                  <input required className="w-full border border-gray-100 rounded-2xl px-5 py-3.5 sm:py-4 focus:ring-4 focus:ring-indigo-50 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-all font-medium text-gray-900" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Starlight Luxury Living" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Rent (₹)</label>
                  <input required type="number" className="w-full border border-gray-100 rounded-2xl px-5 py-3.5 sm:py-4 focus:ring-4 focus:ring-indigo-50 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-all font-medium text-gray-900" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location Area</label>
                  <input required className="w-full border border-gray-100 rounded-2xl px-5 py-3.5 sm:py-4 focus:ring-4 focus:ring-indigo-50 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-all font-medium text-gray-900" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Koramangala" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Distance (Landmark)</label>
                  <input required className="w-full border border-gray-100 rounded-2xl px-5 py-3.5 sm:py-4 focus:ring-4 focus:ring-indigo-50 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-all font-medium text-gray-900" value={formData.distance} onChange={e => setFormData({...formData, distance: e.target.value})} placeholder="e.g. 5 mins from Christ College" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Gender Preference</label>
                  <select className="w-full border border-gray-100 rounded-2xl px-5 py-3.5 sm:py-4 focus:ring-4 focus:ring-indigo-50 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-all font-bold text-gray-900 cursor-pointer" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="boys">Boys Only</option>
                    <option value="girls">Girls Only</option>
                    <option value="co-ed">Co-ed (Mixed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Amenities (comma separated)</label>
                  <input required className="w-full border border-gray-100 rounded-2xl px-5 py-3.5 sm:py-4 focus:ring-4 focus:ring-indigo-50 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-all font-medium text-gray-900" value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} placeholder="WiFi, AC, Food" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URLs (comma separated)</label>
                  <input required className="w-full border border-gray-100 rounded-2xl px-5 py-3.5 sm:py-4 focus:ring-4 focus:ring-indigo-50 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-all font-medium text-gray-900" value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} placeholder="https://image-1.jpg, https://image-2.jpg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea required className="w-full border border-gray-100 rounded-2xl px-5 py-3.5 sm:py-4 focus:ring-4 focus:ring-indigo-50 focus:border-primary outline-none bg-gray-50 focus:bg-white transition-all font-medium text-gray-900 h-32 sm:h-40 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                  <button type="button" onClick={() => setShowForm(false)} className="order-2 sm:order-1 px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95">Discard</button>
                  <button type="submit" className="order-1 sm:order-2 bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95">Publish</button>
                </div>
              </form>
            </div>
          )}

          {properties.length > 0 ? (
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {properties.map(property => (
                <div key={property._id} className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col relative overflow-hidden">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src={property.images[0] || 'https://via.placeholder.com/400x300'} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                      <span className={`px-3 py-1 text-[9px] sm:text-[10px] font-black uppercase rounded-full border backdrop-blur-md shadow-sm ${
                        property.status === 'approved' ? 'bg-green-500/90 text-white border-green-400' : 
                        property.status === 'rejected' ? 'bg-red-500/90 text-white border-red-400' : 
                        'bg-amber-500/90 text-white border-amber-400'
                      }`}>
                        {property.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 sm:p-8 flex flex-col flex-grow">
                    <h3 className="font-black text-xl sm:text-2xl mb-2 text-gray-900 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs sm:text-sm mb-4">
                      <MapPin className="h-4 w-4 text-primary" /> {property.location}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 sm:pt-6 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly</p>
                        <p className="text-xl sm:text-2xl font-black text-primary">₹{property.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeleteProperty(property._id)}
                          className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-90"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-24 bg-white rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-gray-100 px-4">
              <Building className="h-12 w-12 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">No Listings Found</h3>
              <p className="text-gray-500 mt-3 text-sm sm:text-lg max-w-md mx-auto font-medium">Add your first PG or hostel to reach thousands of students.</p>
              <button onClick={() => setShowForm(true)} className="mt-8 px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:-translate-y-1 active:scale-95 transition-all">Create Listing</button>
            </div>
          )}
        </>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length > 0 ? (
            <>
              {/* Desktop View Table */}
              <div className="hidden lg:block bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-wider">
                    <tr>
                      <th className="px-8 py-6">Tenant</th>
                      <th className="px-8 py-6">Property</th>
                      <th className="px-8 py-6">Date</th>
                      <th className="px-8 py-6">Status</th>
                      <th className="px-8 py-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map(booking => (
                      <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold text-sm">
                              {booking.userId?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{booking.userId?.name}</p>
                              <p className="text-[10px] text-gray-500">{booking.userId?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-gray-800 text-sm">{booking.propertyId?.title}</td>
                        <td className="px-8 py-6 text-xs text-gray-500 font-medium">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${
                            booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                            booking.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {booking.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => updateBookingStatus(booking._id, 'confirmed')} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"><CheckCircle className="h-4 w-4" /></button>
                              <button onClick={() => updateBookingStatus(booking._id, 'rejected')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Cards */}
              <div className="lg:hidden space-y-4">
                {bookings.map(booking => (
                  <div key={booking._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold">
                          {booking.userId?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{booking.userId?.name}</p>
                          <p className="text-xs text-gray-500">{booking.userId?.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${
                        booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                        booking.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Stay</p>
                      <p className="font-bold text-gray-900">{booking.propertyId?.title}</p>
                    </div>
                    {booking.status === 'pending' && (
                      <div className="flex gap-3">
                        <button onClick={() => updateBookingStatus(booking._id, 'confirmed')} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold text-sm active:scale-95 transition-all">Approve</button>
                        <button onClick={() => updateBookingStatus(booking._id, 'rejected')} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm active:scale-95 transition-all">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-16 sm:p-24 text-center bg-white rounded-2xl border border-gray-100">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">No Bookings</h3>
              <p className="text-gray-500 mt-2 font-medium">Booking requests will appear here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="grid gap-4 sm:gap-6">
          {inquiries.length > 0 ? inquiries.map(inquiry => (
            <div key={inquiry._id} className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 hover:shadow-md transition-all">
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 font-black">
                    {inquiry.userId?.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-base sm:text-xl text-gray-900">{inquiry.userId?.name}</h4>
                    <p className="text-xs sm:text-sm text-primary font-bold">{inquiry.contactPhone}</p>
                  </div>
                  <span className="ml-auto text-[8px] sm:text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    {inquiry.propertyId?.title}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100">
                  <p className="text-gray-700 text-sm sm:text-base font-medium italic">"{inquiry.message}"</p>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 sm:gap-3">
                {inquiry.status === 'pending' ? (
                  <>
                    <button onClick={() => updateInquiryStatus(inquiry._id, 'replied')} className="flex-1 bg-primary text-white px-5 sm:px-6 py-3 rounded-xl font-black text-xs sm:text-sm active:scale-95 transition-all shadow-md shadow-indigo-100">Replied</button>
                    <button onClick={() => updateInquiryStatus(inquiry._id, 'read')} className="flex-1 bg-white text-gray-600 border border-gray-200 px-5 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm active:scale-95 transition-all">Archive</button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 justify-center px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-black text-xs sm:text-sm uppercase">
                    <CheckCircle className="h-4 w-4" /> {inquiry.status}
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Mail className="h-10 w-10 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900">Inbox Empty</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
