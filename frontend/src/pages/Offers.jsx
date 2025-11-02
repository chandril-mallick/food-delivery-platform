import React, { useEffect, useState } from 'react';
import { Tag, Gift, Percent, Clock, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getOffers } from '../firebase/firestore';

// Fallback offers used if Firestore has none or fails
const fallbackOffers = [
  {
    id: 'campusfree',
    title: 'Students & Faculty',
    code: 'CAMPUSFREE',
    description: 'Free Delivery for all Students & Faculty',
    terms: 'Use your campus Address • Limited-time',
    color: 'from-blue-500 to-cyan-500',
  },
];

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOffers();
        setOffers((data && data.length) ? data : fallbackOffers);
      } catch (e) {
        setOffers(fallbackOffers);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const copy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success(`Code copied: ${code}`);
    }).catch(() => toast.error('Failed to copy'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Gift className="w-8 h-8 text-orange-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Exclusive Offers</h1>
        </div>
        <p className="text-gray-600 mb-8 flex items-center gap-2">
          <Percent className="w-4 h-4" /> Grab limited-time deals to save on every bite!
          <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
            <Clock className="w-4 h-4" /> Updated weekly
          </span>
        </p>

        {/* Campus-wide Announcement */}
        <div className="relative overflow-hidden rounded-2xl shadow-sm border border-blue-100 bg-white mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-10" />
          <div className="relative z-10 p-5 md:p-6 flex items-start gap-4">
            <div className="shrink-0">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-blue-700 font-semibold mb-1">Campus Special</div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1">Free Delivery for all Students & Faculty</h2>
              
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 2 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="relative overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-white">
                <div className="relative z-10 p-5 md:p-6">
                  <div className="h-4 w-28 bg-gray-200 rounded mb-3 animate-pulse" />
                  <div className="h-6 w-2/3 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded mb-4 animate-pulse" />
                  <div className="h-8 w-40 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              </div>
            ))
          ) : offers && offers.length ? (
            offers.map((offer) => (
              <div key={offer.id} className="relative overflow-hidden rounded-2xl shadow-sm border border-gray-100 bg-white">
                <div className={`absolute inset-0 bg-gradient-to-r ${offer.color} opacity-10`} />
                <div className="relative z-10 p-5 md:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Tag className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">{offer.title}</span>
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{offer.description}</h2>
                      <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {offer.terms}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="mt-1 inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg font-mono font-bold text-sm">
                        {offer.code}
                        <button
                          aria-label={`Copy code ${offer.code}`}
                          onClick={() => copy(offer.code)}
                          className="text-orange-600 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => window.location.assign('/menu')}
                      className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <Sparkles className="w-4 h-4" /> Order with this offer
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
              <div className="text-5xl mb-3">🎁</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No offers available</h3>
              <p className="text-sm text-gray-600">Check back soon for new savings!</p>
            </div>
          )}
        </div>

        <div className="mt-10 text-xs text-gray-500">
          Offers are subject to change. One offer per order. Terms apply.
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
