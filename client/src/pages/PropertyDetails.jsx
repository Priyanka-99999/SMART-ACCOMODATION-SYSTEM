import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Wifi, Coffee, Car, Star, Calendar, ArrowLeft, Image as ImageIcon, Mail, Phone, Building } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Booking states
  const [checkIn, setCheckIn] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Inquiry states
  const [message, setMessage] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, revRes] = await Promise.all([
          api.get(`/properties/${id}`),
          api.get(`/reviews/${id}`)
        ]);
        setProperty(propRes.data);
        setReviews(revRes.data);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    
    setInquiryLoading(true);
    setInquiryError('');
    try {
      await api.post('/inquiries', {
        propertyId: id,
        message,
        contactPhone
      });
      setInquirySuccess(true);
      setMessage('');
      setContactPhone('');
    } catch (err) {
      setInquiryError(err.response?.data?.message || 'Error sending inquiry');
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(false);

    try {
      await api.post('/bookings', {
        propertyId: id,
        checkInDate: checkIn
      });
      setBookingSuccess(true);
      setCheckIn('');
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Error creating booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');

    setReviewLoading(true);
    setReviewError('');
    try {
      const res = await api.post(`/reviews/${id}`, { rating, comment });
      setReviews([res.data, ...reviews]);
      setComment('');
      setRating(5);
      
      // Update local property stats
      setProperty(prev => ({
        ...prev,
        numReviews: prev.numReviews + 1,
        averageRating: ((prev.averageRating * prev.numReviews) + rating) / (prev.numReviews + 1)
      }));
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Error submitting review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-32 flex justify-center">
      <div className="animate-pulse-slow p-5 bg-indigo-50 rounded-full h-16 w-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
  if (!property) return <div className="min-h-screen pt-32 text-center text-2xl font-bold">Property not found</div>;

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 animate-fade-in">
      <button onClick={() => navigate(-1)} className="mb-4 sm:mb-6 flex items-center gap-2 text-gray-400 hover:text-primary font-bold transition-colors group text-sm">
        <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" /> Back to listings
      </button>

      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 sm:mb-3 tracking-tight">{property.title}</h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-500 font-medium text-sm sm:text-lg">
            <span className="flex items-center"><MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 text-primary" />{property.location}</span>
            {property.numReviews > 0 && (
              <span className="flex items-center text-amber-600 bg-amber-50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold border border-amber-100">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-500 text-amber-500 mr-1" />
                {property.averageRating.toFixed(1)} ({property.numReviews})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        {/* Left Column - Details */}
        <div className="lg:col-span-2">
          
          {/* Image Gallery */}
          <div className="mb-8 sm:mb-10 animate-slide-up">
            <div className="rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 relative group aspect-[4/3] sm:aspect-[16/9]">
              <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={`relative rounded-xl overflow-hidden h-24 w-32 flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-primary shadow-md opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 mb-10 animate-slide-up delay-100">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-5">About this PG / Hostel</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">{property.description}</p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 mb-10 animate-slide-up delay-200">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Facilities & Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {property.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-3 text-gray-800 capitalize font-medium text-lg">
                  <div className="p-3 bg-indigo-50 text-primary rounded-xl">
                    {amenity.toLowerCase().includes('wifi') ? <Wifi className="h-5 w-5" /> :
                     amenity.toLowerCase().includes('food') ? <Coffee className="h-5 w-5" /> :
                     amenity.toLowerCase().includes('parking') ? <Car className="h-5 w-5" /> :
                     <Star className="h-5 w-5" />}
                  </div>
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 mb-10 animate-slide-up delay-300">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              Resident Reviews {property.numReviews > 0 ? `(${property.averageRating.toFixed(1)} average)` : ''}
            </h2>

            {isAuthenticated && user?.role !== 'admin' && (
              <form onSubmit={handleReviewSubmit} className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Leave a Review</h3>
                {reviewError && <div className="text-red-500 text-sm mb-3 font-medium">{reviewError}</div>}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                        <Star className={`h-8 w-8 transition-colors ${rating >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Feedback</label>
                  <textarea required value={comment} onChange={e => setComment(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white" rows="3" placeholder="Share your experience as a resident..."></textarea>
                </div>
                <button type="submit" disabled={reviewLoading} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-70">
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            <div className="space-y-6">
              {reviews.length > 0 ? reviews.map(review => (
                <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-indigo-100 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                      {review.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{review.userId?.name || 'Anonymous Resident'}</h4>
                      <p className="text-xs text-gray-500 font-medium">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-4 w-4 ${review.rating >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              )) : (
                <p className="text-gray-500 font-medium italic">No reviews yet from residents.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            {/* Booking Box */}
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 animate-slide-up delay-300">
              <div className="flex items-end gap-1 mb-8 pb-6 border-b border-gray-100">
                <span className="text-4xl font-extrabold text-gray-900">Rs {property.price}</span>
                <span className="text-gray-500 mb-1.5 font-medium">/ month</span>
              </div>

              {bookingSuccess && (
                <div className="bg-green-50 text-green-700 p-5 rounded-2xl mb-6 border border-green-200 font-medium shadow-sm animate-fade-in">
                  Enrollment request sent! Check your dashboard for confirmation.
                </div>
              )}

              {bookingError && (
                <div className="bg-red-50 text-red-600 p-5 rounded-2xl mb-6 border border-red-200 font-medium shadow-sm animate-fade-in">
                  {bookingError}
                </div>
              )}

              <form onSubmit={handleBooking} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Move-in Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium bg-gray-50 focus:bg-white"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                  <p className="text-sm text-indigo-700 font-bold flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Monthly Subscription
                  </p>
                  <p className="text-xs text-indigo-500 mt-1">Payment will be processed on a monthly basis starting from your move-in date.</p>
                </div>

                <button 
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-primary hover:bg-indigo-700 text-white font-extrabold py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2 mt-4"
                >
                  {bookingLoading ? 'Processing...' : (
                    <>
                      <Calendar className="h-5 w-5" />
                      Reserve PG / Hostel
                    </>
                  )}
                </button>
                <p className="text-center text-sm font-medium text-gray-500 mt-4">Long-term stay (Monthly Rent)</p>
              </form>
            </div>

            {/* Owner Info Card */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-slide-up delay-400">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" /> Managed By
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 bg-indigo-50 text-primary rounded-2xl flex items-center justify-center text-xl font-black shadow-sm">
                  {property.ownerId?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg">{property.ownerId?.name}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verified Owner</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-primary transition-colors">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-primary"><Mail className="h-4 w-4" /></div>
                  <p className="font-bold text-sm truncate">{property.ownerId?.email}</p>
                </div>
                {property.ownerId?.phone && (
                  <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-primary transition-colors">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-primary"><Phone className="h-4 w-4" /></div>
                    <p className="font-bold text-sm">{property.ownerId?.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Owner Form */}
            {isAuthenticated && user?.role === 'user' && (
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-slide-up delay-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" /> Contact Owner
                </h3>
                
                {inquirySuccess ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-medium text-sm">
                    Message sent successfully! The owner will get back to you soon.
                  </div>
                ) : (
                  <form onSubmit={handleInquiry} className="space-y-4">
                    {inquiryError && <div className="text-red-500 text-sm font-medium">{inquiryError}</div>}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Phone (Optional)</label>
                      <input 
                        type="tel"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 focus:bg-white text-sm"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="For quicker replies"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                      <textarea 
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 focus:bg-white text-sm h-24"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Hi, I'm interested in..."
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={inquiryLoading}
                      className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                    >
                      {inquiryLoading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
