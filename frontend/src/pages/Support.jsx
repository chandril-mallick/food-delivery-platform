import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageSquare, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { createSupportTicket } from '../firebase/firestore';

const SupportPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const ticket = {
        name: form.name,
        email: form.email,
        message: form.message,
        userId: user?.uid || null,
        userEmail: user?.email || null,
        priority: 'normal',
        channel: 'contact_form',
      };
      await createSupportTicket(ticket);
      setStatus('sent');
      toast.success('Message sent! Our team will reply soon.');
      setForm({ name: '', email: '', message: '' });
    } catch (e2) {
      setStatus('error');
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Support</h1>
        </div>
        <p className="text-gray-600 mb-8">We're here 7 days a week. Choose any option below and we'll help you right away.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <a href="mailto:support@dabbabot.app" className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-orange-600" />
              <div className="font-semibold text-gray-800">Email</div>
            </div>
            <div className="text-sm text-gray-600">support@abouttech.co.in</div>
          </a>

          <a href="tel:+919733960909" className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-green-600" />
              <div className="font-semibold text-gray-800">Phone</div>
            </div>
            <div className="text-sm text-gray-600">+91 9733960909 (24/7)</div>
          </a>

          <a href="https://wa.me/919733960909" target="_blank" rel="noreferrer" className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div className="font-semibold text-gray-800">Chat</div>
            </div>
            <div className="text-sm text-gray-600">WhatsApp support</div>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder={user?.displayName || 'Your name'} className="w-full rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder={user?.email || 'you@example.com'} className="w-full rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows="4" required className="w-full rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-200" />
              </div>
              <button disabled={status==='sending'} className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-60">
                <Send className="w-4 h-4" /> {status==='sending' ? 'Sending...' : 'Send message'}
              </button>
              {status==='sent' && (
                <div className="flex items-center gap-2 text-green-600 text-sm"><CheckCircle2 className="w-4 h-4"/> Message sent! We will reply soon.</div>
              )}
              {status==='error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4"/> Something went wrong. Please try again.</div>
              )}
            </form>
          </div>

          {/* FAQs */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">FAQs</h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <div className="font-semibold">What are your delivery hours?</div>
                <div className="text-gray-600">We deliver from 6 AM to 12 PM daily. Campus deliveries are prioritized.</div>
              </div>
              <div>
                <div className="font-semibold">How do I apply an offer?</div>
                <div className="text-gray-600">Copy the code from the Offers page and apply it during checkout.</div>
              </div>
              <div>
                <div className="font-semibold">How can I track my order?</div>
                <div className="text-gray-600">Go to Orders from the bottom nav or Home quick action to see live status.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
