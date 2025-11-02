import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const OTPLogin = () => {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [countdown, setCountdown] = useState(0);
  
  const { sendOTP, verifyOTP, isAuthenticated, provider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Cleanup reCAPTCHA on component unmount
  useEffect(() => {
    return () => {
      // Clean up any existing reCAPTCHA containers
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!displayName || displayName.trim().length < 2) {
      toast.error('Please enter your name');
      return;
    }
    const uiDigits = phoneNumber.replace(/\D/g, '');
    if (!uiDigits || uiDigits.length !== 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      // Persist name for post-login use
      localStorage.setItem('pendingDisplayName', displayName.trim());
      // Always pass E.164 to the service regardless of UI formatting
      const digits = uiDigits; // already validated to be exactly 10
      const e164 = `+91${digits}`;
      const result = await sendOTP(e164);
      if (result.success) {
        // Firebase returns confirmationResult; Supabase does not require it
        if (provider === 'firebase') {
          setConfirmationResult(result.confirmationResult);
        } else {
          setConfirmationResult(null);
        }
        setStep('otp');
        setCountdown(60);
        toast.success('OTP sent successfully!');
      } else {
        toast.error(result.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      // For Supabase, pass phone number; for Firebase, pass confirmationResult
      // Always pass E.164 to the service regardless of UI formatting
      const digits = phoneNumber.replace(/\D/g, '');
      if (provider === 'supabase' && digits.length !== 10) {
        toast.error('Please enter a valid 10-digit phone number');
        setLoading(false);
        return;
      }
      const e164 = `+91${digits}`;
      const result = provider === 'supabase'
        ? await verifyOTP(e164, otp, { displayName })
        : await verifyOTP(confirmationResult, otp);
      if (result.success) {
        // Name was captured earlier; keep it available for profile completion
        const name = localStorage.getItem('pendingDisplayName');
        if (name) {
          // Optionally, we could save the name to profile here if user object is available
          // Defer to profile page to finalize; keep name cached
          localStorage.removeItem('pendingDisplayName');
          localStorage.setItem('displayName', name);
        }
        toast.success('Login successful!');
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || 'Invalid OTP');
        setOtp('');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      // Always pass E.164 to the service regardless of UI formatting
      const digits = phoneNumber.replace(/\D/g, '');
      if (digits.length !== 10) {
        toast.error('Please enter a valid 10-digit phone number');
        setLoading(false);
        return;
      }
      const e164 = `+91${digits}`;
      const result = await sendOTP(e164);
      if (result.success) {
        if (provider === 'firebase') {
          setConfirmationResult(result.confirmationResult);
        } else {
          setConfirmationResult(null);
        }
        setCountdown(60);
        toast.success('OTP resent successfully!');
      } else {
        toast.error(result.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setConfirmationResult(null);
    setCountdown(0);
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length >= 6) {
      return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      return `${digits.slice(0,3)}-${digits.slice(3)}`;
    }
    return digits;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="w-full font-sans">
      {/* Form */}
      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">👤</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Aman Kumar"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                required
              />
            </div>
          </div>
          {/* Phone */}
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-500 font-semibold">+91</div>
              <span className="pointer-events-none absolute inset-y-0 left-12 flex items-center text-gray-400">📱</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="XXXXXXXXXX"
                className="w-full pl-20 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Standard rates may apply.</p>
          </div>
          {/* reCAPTCHA Container - Only show for Firebase */}
          {provider === 'firebase' && (
            <div className="flex justify-center my-4">
              <div 
                id="recaptcha-container" 
                className="flex justify-center items-center"
                style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}
              ></div>
            </div>
          )}
          
          {/* Supabase Info - Show helpful message for Supabase */}
          {provider === 'supabase' && (
            <div className="flex justify-center">
              <div className="text-sm text-gray-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                ✅ Using fast, reliable SMS delivery from Dabba Bot. No reCAPTCHA needed.
              </div>
            </div>
          )}
          
          {/* Send OTP Button */}
          <button
            type="submit"
            disabled={loading || phoneNumber.replace(/\D/g, '').length < 10 || displayName.trim().length < 2}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          {/* OTP Input */}
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">
              Enter OTP
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">🔒</span>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full pl-10 pr-4 text-center text-xl md:text-2xl font-semibold tracking-widest border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition px-4 py-3"
                maxLength={6}
                required
              />
            </div>
          </div>
          {/* Buttons: Back & Resend */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
            <button
              type="button"
              onClick={handleBack}
              className="text-orange-500 hover:text-orange-700 font-medium text-sm md:text-base transition"
            >
              ← Change Number
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || loading}
              className={`text-orange-500 hover:text-orange-700 font-medium text-sm md:text-base transition disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>
          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}

      {/* Terms & Privacy */}
      <div className="mt-6 text-center text-sm md:text-base text-gray-500">
        <p>
          By continuing, you agree to our{' '}
          <button className="text-orange-500 hover:text-orange-700 underline bg-transparent border-none cursor-pointer">
            Terms of Service
          </button>{' '}
          and{' '}
          <button className="text-orange-500 hover:text-orange-700 underline bg-transparent border-none cursor-pointer">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default OTPLogin;