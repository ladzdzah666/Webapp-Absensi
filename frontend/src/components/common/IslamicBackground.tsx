import React from 'react';

/**
 * IslamicBackground: Komponen latar belakang bernuansa arsitektur Islami megah & elegan.
 * Menggabungkan pola geometri Arabesque (Mashrabiya), siluet kubah masjid, 
 * bulan sabit keemasan, dan aura cahaya zamrud yang hidup.
 */
export default function IslamicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Latar Belakang Gradien Radial Cahaya Keemasan & Zamrud */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212, 175, 55, 0.22) 0%, rgba(6, 35, 25, 0.4) 45%, transparent 75%),
            radial-gradient(circle at 10% 25%, rgba(16, 185, 129, 0.18) 0%, transparent 40%),
            radial-gradient(circle at 90% 40%, rgba(212, 175, 55, 0.14) 0%, transparent 45%),
            radial-gradient(circle at 50% 85%, rgba(5, 150, 105, 0.2) 0%, transparent 55%)
          `
        }}
      />

      {/* 2. Pola Geometri Islami (Arabesque / Islamic Girih Tessellation) */}
      <div 
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23d4af37' stroke-width='0.9'%3E%3Cpath d='M40 0 L80 40 L40 80 L0 40 Z'/%3E%3Cpath d='M40 12 L68 40 L40 68 L12 40 Z' stroke='%2310b981' stroke-width='0.7'/%3E%3Cpath d='M40 24 L56 40 L40 56 L24 40 Z'/%3E%3Cpath d='M0 0 L20 20 L0 40 L-20 20 Z'/%3E%3Cpath d='M80 0 L100 20 L80 40 L60 20 Z'/%3E%3Cpath d='M0 80 L20 100 L0 120 L-20 100 Z'/%3E%3Cpath d='M80 80 L100 100 L80 120 L60 100 Z'/%3E%3Ccircle cx='40' cy='40' r='8' stroke='%23d4af37' stroke-width='0.8'/%3E%3Ccircle cx='0' cy='0' r='7' stroke='%2310b981' stroke-width='0.6'/%3E%3Ccircle cx='80' cy='0' r='7' stroke='%2310b981' stroke-width='0.6'/%3E%3Ccircle cx='0' cy='80' r='7' stroke='%2310b981' stroke-width='0.6'/%3E%3Ccircle cx='80' cy='80' r='7' stroke='%2310b981' stroke-width='0.6'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* 3. Bulan Sabit & Bintang Emas Islami (Pojok Kanan Atas) */}
      <div className="absolute top-6 right-8 opacity-25 hidden sm:block">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 10 C30 10 14 26 14 46 C14 66 30 82 50 82 C63 82 74 75 80 65 C62 70 42 56 42 38 C42 26 50 16 62 12 C58 11 54 10 50 10 Z"
            fill="url(#goldGradient)"
          />
          {/* Bintang 8 sudut kecil */}
          <polygon
            points="68,26 71,32 77,32 72,36 74,42 68,38 62,42 64,36 59,32 65,32"
            fill="#d4af37"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f6e08d" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#8c6e18" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 4. Siluet Kubah & Menara Masjid Elegan di Bagian Bawah Layar */}
      <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-56 opacity-15 overflow-hidden">
        <svg 
          className="w-full h-full object-cover object-bottom"
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Kubah Utama & Menara Berulang */}
          <path 
            d="
              M0,320 L0,220 
              L40,220 L40,160 L45,150 L50,160 L50,220 
              L120,220 
              C120,180 140,140 180,120 C220,140 240,180 240,220 
              L320,220 
              L320,130 L325,120 L330,130 L330,220 
              L420,220 
              C420,170 450,110 500,90 C550,110 580,170 580,220 
              L680,220 
              L680,150 L685,140 L690,150 L690,220 
              L760,220 
              C760,160 800,80 860,60 C920,80 960,160 960,220 
              L1040,220 
              L1040,140 L1045,130 L1050,140 L1050,220 
              L1140,220 
              C1140,170 1170,110 1220,90 C1270,110 1300,170 1300,220 
              L1380,220 
              L1380,160 L1385,150 L1390,160 L1390,220 
              L1440,220 L1440,320 Z
            " 
            fill="url(#mosqueGradient)" 
          />
          <defs>
            <linearGradient id="mosqueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#03140e" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 5. Aksen Titik Cahaya Bintang Keemasan yang Mengambang */}
      <div className="absolute top-1/4 left-1/6 w-1.5 h-1.5 rounded-full bg-amber-300 opacity-60 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-amber-400 opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-60 animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 right-1/6 w-2 h-2 rounded-full bg-amber-300 opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/12 w-1.5 h-1.5 rounded-full bg-amber-200 opacity-50 animate-pulse" style={{ animationDelay: '0.7s' }} />
    </div>
  );
}
