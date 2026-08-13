'use client';
import { motion } from 'framer-motion';

export default function SOSButton() {
  const handleSOS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          window.location.href = `/navigate?sos=true&lat=${latitude}&lng=${longitude}`;
        },
        () => {
          window.location.href = '/navigate?sos=true';
        }
      );
    } else {
      window.location.href = '/navigate?sos=true';
    }
  };

  return (
    <motion.button
      id="sos-button"
      onClick={handleSOS}
      className="fixed bottom-25 right-6 z-30 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-2xl"

      style={{
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        boxShadow: [
          '0 0 20px rgba(239, 68, 68, 0.3)',
          '0 0 40px rgba(239, 68, 68, 0.6)',
          '0 0 20px rgba(239, 68, 68, 0.3)',
        ],
      }}
      transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
      aria-label="Emergency SOS"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 9v4m0 4h.01M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="absolute -top-1 -right-1 text-[10px] bg-white text-red-600 font-bold px-1.5 py-0.5 rounded-full">SOS</span>
    </motion.button>
  );
}
