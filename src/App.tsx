import React, { useEffect, useState, useRef } from 'react';
import { profileConfig } from './config';
import './index.css';

export default function App() {
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const avatarWrapperRef = useRef<HTMLDivElement>(null);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2600);
  };

  const downloadVCard = () => {
    const vcardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN;CHARSET=UTF-8:${profileConfig.name}`,
      `N;CHARSET=UTF-8:${profileConfig.name.split(' ').reverse().join(';')};;;`,
      `ORG:${profileConfig.company}`,
      `TITLE:${profileConfig.title}`,
      `TEL;TYPE=CELL,VOICE;VALUE=uri:tel:${profileConfig.phoneFormatted}`,
      `EMAIL;TYPE=WORK,INTERNET:${profileConfig.email}`,
      `URL;TYPE=WORK:${profileConfig.website}`,
      `ADR;TYPE=WORK:;;${profileConfig.location};;;`,
      `X-SOCIALPROFILE;type=instagram:${profileConfig.instagram}`,
      `X-SOCIALPROFILE;type=tiktok:${profileConfig.tiktok}`,
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profileConfig.name.replace(/\s+/g, '_')}_Contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    displayToast("Contact card downloaded!");
  };

  const shareProfile = async () => {
    const shareData = {
      title: `${profileConfig.name} | ${profileConfig.company}`,
      text: `${profileConfig.name} — ${profileConfig.company}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          fallbackCopy();
        }
      }
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        displayToast("Profile link copied!");
      }).catch(() => {
        displayToast("Profile link ready to share!");
      });
    } else {
      displayToast("Profile link ready to share!");
    }
  };

  useEffect(() => {
    // 1. IntersectionObserver for Reveal Elements
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });

    // 2. Scroll Progress Bar & CEO Avatar Subtle Parallax Scale
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          
          // Progress Calculation
          if (progressBarRef.current && scrollHeight > 0) {
            const progressPercentage = Math.min((scrollTop / scrollHeight) * 100, 100);
            progressBarRef.current.style.width = progressPercentage + '%';
          }

          // Gentle Parallax & dynamic scaling on avatar
          if (avatarWrapperRef.current && scrollTop < 500) {
            const scale = Math.max(0.92, 1 - (scrollTop * 0.0004));
            const translateY = scrollTop * 0.12;
            avatarWrapperRef.current.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      revealObserver.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col items-center antialiased pb-28 ambient-bg-glow relative selection:bg-blue-600 selection:text-white">
      {/* Sleek Scroll-Driven Progress Bar */}
      <div aria-hidden="true" className="fixed top-0 left-0 right-0 h-[2.5px] bg-transparent z-50 pointer-events-none">
        <div ref={progressBarRef} className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 w-0 transition-all duration-75"></div>
      </div>
      
      {/* Floating Toast Notification */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-300 pointer-events-none px-4 py-2.5 rounded-full bg-blue-600/95 backdrop-blur-md text-white text-xs font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2 border border-blue-400/30 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'}`}>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
        <span>{toastMessage}</span>
      </div>

      {/* Main Mobile Container */}
      <main className="w-full max-w-[430px] px-4 pt-4 sm:pt-8 flex flex-col gap-6" data-purpose="nfc-profile-container">
        
        {/* BEGIN: Header Identity Section */}
        <header className="w-full flex flex-col items-center text-center relative scroll-reveal" data-purpose="executive-header">
          {/* Top Navigation & Brand Watermark */}
          <div className="w-full flex items-center justify-between py-2 px-1 mb-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-obsidian-850/80 border border-white/10 backdrop-blur-md">
              <img alt="Logo" className="w-5 h-5 object-contain" src={profileConfig.logoUrl} />
              <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">{profileConfig.company}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">NFC Verified</span>
            </div>
          </div>

          {/* CEO Portrait Container with Ambient Ring */}
          <div ref={avatarWrapperRef} className="relative mt-2 mb-4 group cursor-pointer transition-transform duration-500 will-change-transform">
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full p-1 avatar-glow-ring transition-transform duration-300 active:scale-95 bg-gradient-to-b from-blue-500/40 via-blue-700/20 to-transparent">
              <div className="w-full h-full rounded-full overflow-hidden bg-obsidian-800 border-2 border-white/15">
                <img alt={profileConfig.name} className="w-full h-full object-cover object-top filter brightness-105 contrast-105 transition-transform duration-700 group-hover:scale-105" src={profileConfig.avatarUrl} />
              </div>
            </div>
            {/* Official Brand Logo Floating Medallion */}
            <div className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-obsidian-900 border-2 border-blue-500 shadow-lg shadow-blue-600/40 flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:rotate-12">
              <img alt="Icon" className="w-full h-full object-contain" src={profileConfig.iconUrl} />
            </div>
          </div>

          {/* Availability Indicator Chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-3 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-status-pulse"></span>
            <span>{profileConfig.availability}</span>
          </div>

          {/* Executive Name & Credentials */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {profileConfig.name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-semibold tracking-wider text-slate-300 uppercase">
            {profileConfig.title} 
            <a className="text-blue-400 hover:text-blue-300 transition-colors ml-1" href={profileConfig.instagram} rel="noopener noreferrer" target="_blank">
              @{profileConfig.company}
            </a>
          </p>

          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-400 max-w-[340px]">
            {profileConfig.bio}
          </p>

          <a href={profileConfig.locationUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium hover:text-blue-400 transition-colors">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{profileConfig.location}</span>
          </a>
        </header>

        {/* Primary CTAs & Quick Actions */}
        <section className="flex flex-col gap-3 w-full scroll-reveal delay-100" data-purpose="quick-actions">
          <button onClick={downloadVCard} className="w-full h-13 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] border border-blue-400/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Save Contact to Phone</span>
          </button>

          <div className="grid grid-cols-3 gap-2.5 w-full">
            <a href={`https://wa.me/${profileConfig.whatsappFormatted}`} target="_blank" rel="noopener noreferrer" className="glass-card-interactive flex flex-col items-center justify-center py-3 px-2 rounded-2xl group border border-white/5 hover:border-emerald-500/40 scroll-reveal delay-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-1.5 transition-transform group-hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.976.58 2.029.927 3.149.927h.001c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.769-5.769-5.769zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.115-.526-1.558-.646-2.56-2.228-2.637-2.331-.077-.103-.635-.845-.635-1.611 0-.766.402-1.144.545-1.298.144-.154.314-.193.418-.193.104 0 .208.002.299.006.096.004.225-.036.352.269.13.312.443 1.077.482 1.156.039.078.065.17.013.273-.052.104-.078.169-.156.26-.078.091-.164.204-.235.274-.078.077-.16.16-.068.318.092.157.408.673.876 1.089.601.534 1.109.7 1.267.778.158.078.25.066.342-.04.092-.104.394-.459.5-.615.105-.157.209-.13.349-.078.14.052.887.418 1.04.495.152.078.255.117.293.182.038.065.038.377-.106.782z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.164a8.134 8.134 0 01-4.385-1.272l-.314-.187-2.956.776.789-2.882-.204-.326A8.134 8.134 0 013.836 12C3.836 7.498 7.498 3.836 12 3.836 16.502 3.836 20.164 7.498 20.164 12c0 4.502-3.662 8.164-8.164 8.164z"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-200">WhatsApp</span>
            </a>

            <a href={`tel:${profileConfig.phoneFormatted}`} className="glass-card-interactive flex flex-col items-center justify-center py-3 px-2 rounded-2xl group border border-white/5 hover:border-blue-500/40 scroll-reveal delay-200">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-1.5 transition-transform group-hover:scale-110">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-200">Call</span>
            </a>

            <a href={`mailto:${profileConfig.email}`} className="glass-card-interactive flex flex-col items-center justify-center py-3 px-2 rounded-2xl group border border-white/5 hover:border-amber-500/40 scroll-reveal delay-300">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-1.5 transition-transform group-hover:scale-110">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-200">Email</span>
            </a>
          </div>

          <button onClick={shareProfile} className="w-full py-3 px-4 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share Digital Profile</span>
          </button>
        </section>

        {/* Social Connect Grid */}
        <section className="w-full flex flex-col gap-2.5 scroll-reveal" data-purpose="social-networks">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Connect & Follow</h2>
            <span className="text-[10px] text-slate-500 font-mono">@{profileConfig.company.toLowerCase()}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <a href={profileConfig.instagram} target="_blank" rel="noopener noreferrer" className="glass-card-interactive flex flex-col items-center justify-center p-3 rounded-2xl group scroll-reveal delay-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 flex items-center justify-center text-pink-400 mb-1 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <span className="text-[11px] font-medium text-slate-300">Instagram</span>
            </a>

            <a href={profileConfig.tiktok} target="_blank" rel="noopener noreferrer" className="glass-card-interactive flex flex-col items-center justify-center p-3 rounded-2xl group scroll-reveal delay-200">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-1 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </div>
              <span className="text-[11px] font-medium text-slate-300">TikTok</span>
            </a>

            <a href={profileConfig.website} target="_blank" rel="noopener noreferrer" className="glass-card-interactive flex flex-col items-center justify-center p-3 rounded-2xl group scroll-reveal delay-300">
              <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 mb-1 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-slate-300">Website</span>
            </a>

            <a href={profileConfig.locationUrl} target="_blank" rel="noopener noreferrer" className="glass-card-interactive flex flex-col items-center justify-center p-3 rounded-2xl group scroll-reveal delay-400">
              <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-300 mb-1 group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-slate-300">Location</span>
            </a>
          </div>
        </section>

        {/* Services Showcase */}
        <section className="w-full flex flex-col gap-3 scroll-reveal" data-purpose="services-catalog">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Core Capabilities & Services</h2>
            <span className="text-[11px] text-blue-400 font-semibold">7 Areas</span>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3.5 transition-all duration-200 hover:border-white/20 scroll-reveal delay-100">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white tracking-tight">Graphic Design & Brand Identity</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">Comprehensive visual systems, logos, and brand guidelines.</p>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3.5 transition-all duration-200 hover:border-white/20 scroll-reveal delay-200">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white tracking-tight">Creative Content</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">Engaging digital content tailored for your target audience.</p>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3.5 transition-all duration-200 hover:border-white/20 scroll-reveal delay-300">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white tracking-tight">Website Design & UI/UX</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">Modern, responsive, and user-centric web experiences.</p>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3.5 transition-all duration-200 hover:border-white/20 scroll-reveal delay-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white tracking-tight">Video Editing & Motion Graphics</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">Professional video production and dynamic motion animation.</p>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3.5 transition-all duration-200 hover:border-white/20 scroll-reveal delay-500">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white tracking-tight">Photography</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">High-quality professional photography and retouching.</p>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3.5 transition-all duration-200 hover:border-white/20 scroll-reveal delay-600">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white tracking-tight">3D Designs & Modeling</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">Immersive 3D modeling and rendering services.</p>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl flex items-start gap-3.5 transition-all duration-200 hover:border-white/20 scroll-reveal delay-700">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white tracking-tight">Gadget Sales & Gear</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">Premium digital devices and creative equipment.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Business Info & Working Hours */}
        <section className="glass-card p-4 rounded-2xl flex flex-col gap-3 scroll-reveal" data-purpose="executive-hours">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Consultation Hours</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
            <span className="text-slate-400">Monday - Friday</span>
            <span className="font-medium text-slate-200">09:00 AM - 06:00 PM GMT</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
            <span className="text-slate-400">Saturday</span>
            <span className="font-medium text-slate-200">10:00 AM - 04:00 PM GMT</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-400">Sunday</span>
            <span className="font-semibold text-rose-400">Closed (Creative Production)</span>
          </div>
        </section>

        {/* QR Code & NFC Hardware Badge */}
        <section className="w-full flex flex-col items-center justify-center p-6 rounded-3xl glass-card relative overflow-hidden text-center scroll-reveal" data-purpose="nfc-qr-card">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative bg-white p-3 rounded-2xl shadow-xl shadow-black/60 flex flex-col items-center group transition-transform duration-300 hover:scale-[1.02]">
            <svg className="w-44 h-44 text-blue-600" fill="currentColor" viewBox="0 0 120 120">
              <rect x="10" y="10" width="30" height="30" rx="4" fill="#2563eb"></rect>
              <rect x="15" y="15" width="20" height="20" rx="2" fill="white"></rect>
              <rect x="20" y="20" width="10" height="10" rx="1" fill="#2563eb"></rect>
              
              <rect x="80" y="10" width="30" height="30" rx="4" fill="#2563eb"></rect>
              <rect x="85" y="15" width="20" height="20" rx="2" fill="white"></rect>
              <rect x="90" y="20" width="10" height="10" rx="1" fill="#2563eb"></rect>
              
              <rect x="10" y="80" width="30" height="30" rx="4" fill="#2563eb"></rect>
              <rect x="15" y="85" width="20" height="20" rx="2" fill="white"></rect>
              <rect x="20" y="90" width="10" height="10" rx="1" fill="#2563eb"></rect>
              
              <rect x="46" y="12" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="56" y="12" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="66" y="12" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="46" y="22" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="60" y="22" width="8" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="12" y="46" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="22" y="46" width="6" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="32" y="46" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="46" y="46" width="8" height="8" rx="2" fill="#2563eb"></rect>
              <rect x="60" y="46" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="74" y="46" width="6" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="88" y="46" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="102" y="46" width="6" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="12" y="58" width="6" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="26" y="58" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="40" y="58" width="6" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="54" y="58" width="12" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="72" y="58" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="84" y="58" width="8" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="100" y="58" width="8" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="12" y="68" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="22" y="68" width="10" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="46" y="68" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="60" y="68" width="6" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="74" y="68" width="8" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="92" y="68" width="6" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="46" y="80" width="8" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="60" y="80" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="72" y="80" width="6" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="84" y="80" width="8" height="8" rx="1" fill="#1e40af"></rect>
              <rect x="100" y="80" width="8" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="46" y="92" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="58" y="92" width="10" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="76" y="92" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="88" y="92" width="6" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="102" y="92" width="6" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="46" y="102" width="12" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="66" y="102" width="8" height="6" rx="1" fill="#1e40af"></rect>
              <rect x="82" y="102" width="6" height="6" rx="1" fill="#2563eb"></rect>
              <rect x="96" y="102" width="12" height="6" rx="1" fill="#1e40af"></rect>
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-slate-200 flex items-center justify-center">
                <img alt="Logo" className="w-full h-full object-contain" src={profileConfig.qrCenterLogoUrl} />
              </div>
            </div>
            <p className="mt-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Scan to view profile</p>
          </div>
          
          <div className="mt-4 flex flex-col items-center gap-1">
            <span className="text-xs font-semibold text-slate-300">NFC Digital Identity</span>
            <span className="text-[11px] text-slate-500">{profileConfig.company} Digital Infrastructure &copy; {profileConfig.copyrightYear}</span>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full text-center py-4 flex flex-col items-center gap-2 scroll-reveal">
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <span>{profileConfig.company.toLowerCase()}</span>
            <span>&bull;</span>
            <span>{profileConfig.name}</span>
          </div>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest">Crafted with precision & modern web standards</p>
        </footer>
      </main>

      {/* Sticky Mobile Thumb-Zone Floating Bar */}
      <div id="bottomStickyBar" className="fixed bottom-0 inset-x-0 z-40 p-3 bg-gradient-to-t from-obsidian-950 via-obsidian-900/90 to-transparent flex justify-center pointer-events-none">
        <div className="w-full max-w-[410px] glass-card p-2 rounded-2xl flex items-center gap-2 shadow-2xl shadow-black/80 pointer-events-auto border border-white/10">
          <a aria-label="WhatsApp Direct" href={`https://wa.me/${profileConfig.whatsappFormatted}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 active:scale-90 transition-transform">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.976.58 2.029.927 3.149.927h.001c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.769-5.769-5.769zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.115-.526-1.558-.646-2.56-2.228-2.637-2.331-.077-.103-.635-.845-.635-1.611 0-.766.402-1.144.545-1.298.144-.154.314-.193.418-.193.104 0 .208.002.299.006.096.004.225-.036.352.269.13.312.443 1.077.482 1.156.039.078.065.17.013.273-.052.104-.078.169-.156.26-.078.091-.164.204-.235.274-.078.077-.16.16-.068.318.092.157.408.673.876 1.089.601.534 1.109.7 1.267.778.158.078.25.066.342-.04.092-.104.394-.459.5-.615.105-.157.209-.13.349-.078.14.052.887.418 1.04.495.152.078.255.117.293.182.038.065.038.377-.106.782z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.164a8.134 8.134 0 01-4.385-1.272l-.314-.187-2.956.776.789-2.882-.204-.326A8.134 8.134 0 013.836 12C3.836 7.498 7.498 3.836 12 3.836 16.502 3.836 20.164 7.498 20.164 12c0 4.502-3.662 8.164-8.164 8.164z"/>
            </svg>
          </a>
          <a aria-label="Direct Phone Call" href={`tel:${profileConfig.phoneFormatted}`} className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 active:scale-90 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
          <button onClick={downloadVCard} className="flex-1 h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Save Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
}
