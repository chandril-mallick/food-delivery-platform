import React from 'react';
import { motion } from 'framer-motion';
import OTPLogin from '../components/OTPLogin';

const Login = () => {
  // Motion variants for staggered, polished animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.08 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col md:flex-row bg-gradient-to-br from-orange-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      {/* Decorative animated background blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-orange-200 to-rose-200 blur-3xl dark:from-orange-900/30 dark:to-rose-900/30"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1, delay: 0.15 }}
        className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-rose-200 to-orange-200 blur-3xl dark:from-rose-900/30 dark:to-orange-900/30"
      />

      {/* Left Side - Food Image */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-400 to-red-500 dark:from-orange-800 dark:to-red-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-25"></div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <h1 className="text-4xl font-bold mb-4 drop-shadow">Taste of Home,<br />Delivered to You</h1>
            <p className="text-lg mb-8 text-white/90">Experience the warmth of homemade food, just like mom makes it.</p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md bg-white/70 dark:bg-white/5 backdrop-blur rounded-3xl shadow-xl ring-1 ring-gray-200/60 dark:ring-white/10 p-6 md:p-8 transition transform md:hover:-translate-y-0.5 md:hover:shadow-2xl"
        >
          {/* Logo + Tagline */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <div className="relative mx-auto h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm ring-1 ring-orange-100 overflow-hidden">
              {/* Subtle animated glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-orange-100 to-rose-100"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <img src="/logo1.png" alt="Dabba" className="relative h-10 w-10 object-contain" />
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Sign in to your account</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Welcome back! Continue with your mobile number to get started.</p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <OTPLogin />
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVariants} className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-white/10" />
            <div className="text-xs text-gray-400 dark:text-gray-500 tracking-wider">SECURE LOGIN</div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-white/10" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;