import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { 
  Download, Upload, Layout, Type, Palette, 
  Image as ImageIcon, X, ChevronRight, Check,
  Mail, Phone, Globe, MapPin, Sparkles
} from 'lucide-react';

// --- Types & Constants ---

type LayoutType = 'modern' | 'minimal' | 'bold';

interface CardState {
  // Content
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logo: string | null;
  
  // Design
  layout: LayoutType;
  gradient: string;
  isGlass: boolean;
  showQr: boolean; // Placeholder for future
}

const GRADIENTS = [
  { name: 'Ocean', value: 'from-blue-600 via-violet-600 to-indigo-600' },
  { name: 'Sunset', value: 'from-orange-500 via-amber-500 to-yellow-500' },
  { name: 'Berry', value: 'from-pink-500 via-rose-500 to-red-500' },
  { name: 'Emerald', value: 'from-emerald-500 via-teal-500 to-cyan-500' },
  { name: 'Midnight', value: 'from-slate-900 via-purple-900 to-slate-900' },
  { name: 'Clean', value: 'from-gray-100 to-gray-200 text-black' }, // Special case handling needed
];

// --- UI Components (Custom, No Shadcn) ---

const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 mb-4 text-slate-400">
    <Icon size={16} />
    <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
  </div>
);

const InputGroup = ({ label, value, onChange, placeholder }: any) => (
  <div className="group">
    <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1 transition-colors group-focus-within:text-blue-400">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all hover:border-slate-700"
    />
  </div>
);

const Toggle = ({ active, onClick, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${
      active 
        ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
    }`}
  >
    <span className="text-sm font-medium">{label}</span>
    <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-500' : 'bg-slate-700'}`}>
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${active ? 'left-6' : 'left-1'}`} />
    </div>
  </button>
);

// --- The Business Card Component ---

const Card = ({ data, cardRef }: { data: CardState; cardRef: React.RefObject<HTMLDivElement> }) => {
  const isDark = !data.gradient.includes('gray-100');
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const mutedColor = isDark ? 'text-white/60' : 'text-slate-500';

  return (
    <div className="perspective-1000 relative group">
      <motion.div
        ref={cardRef}
        className={`relative w-[540px] h-[340px] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300 ${
           data.layout === 'minimal' ? 'items-center text-center p-10' : 'p-10'
        }`}
        style={{ fontFamily: '"Inter", sans-serif' }}
      >
        {/* Background Layer */}
        <div className={`absolute inset-0 bg-gradient-to-br ${data.gradient}`} />
        
        {/* Glass Overlay Effect */}
        {data.isGlass && (
          <>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
          </>
        )}

        {/* Noise Texture (Subtle) */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        {/* --- Content: Modern Layout --- */}
        {data.layout === 'modern' && (
          <>
            <div className="relative z-10 flex justify-between items-start w-full">
              <div>
                {data.logo && (
                  <img src={data.logo} alt="Logo" className="h-12 w-auto mb-6 object-contain rounded-lg shadow-sm" />
                )}
                <h1 className={`text-4xl font-bold tracking-tight mb-2 ${textColor}`}>{data.fullName}</h1>
                <p className={`text-lg font-medium tracking-wide ${mutedColor}`}>{data.jobTitle}</p>
              </div>
              {!data.logo && <Sparkles className={`opacity-20 ${textColor}`} size={48} />}
            </div>

            <div className="relative z-10 w-full mt-auto">
               <div className={`h-px w-full mb-6 ${isDark ? 'bg-white/20' : 'bg-black/10'}`} />
               <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                 <div className={`space-y-2 ${textColor}`}>
                   <div className="flex items-center gap-3"><Mail size={16} className="opacity-70"/> {data.email}</div>
                   <div className="flex items-center gap-3"><Phone size={16} className="opacity-70"/> {data.phone}</div>
                 </div>
                 <div className={`space-y-2 ${textColor} text-right`}>
                   <div className="flex items-center justify-end gap-3">{data.website} <Globe size={16} className="opacity-70"/></div>
                   <div className="flex items-center justify-end gap-3">{data.company} <MapPin size={16} className="opacity-70"/></div>
                 </div>
               </div>
            </div>
          </>
        )}

        {/* --- Content: Minimal Layout --- */}
        {data.layout === 'minimal' && (
          <>
             <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6">
                {data.logo && (
                  <img src={data.logo} alt="Logo" className="h-16 w-auto object-contain mb-2" />
                )}
                <div className="text-center">
                  <h1 className={`text-3xl font-extrabold tracking-tighter mb-2 ${textColor}`}>{data.fullName}</h1>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                    {data.jobTitle}
                  </span>
                </div>
                
                <div className={`flex flex-wrap justify-center gap-4 text-xs font-medium mt-4 ${textColor}`}>
                  <span className="flex items-center gap-2 opacity-80 border-r border-current pr-4 last:border-0 last:pr-0">
                    {data.email}
                  </span>
                  <span className="flex items-center gap-2 opacity-80 border-r border-current pr-4 last:border-0 last:pr-0">
                    {data.website}
                  </span>
                  <span className="flex items-center gap-2 opacity-80 last:border-0 last:pr-0">
                    {data.phone}
                  </span>
                </div>
             </div>
          </>
        )}

        {/* --- Content: Bold Layout --- */}
        {data.layout === 'bold' && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/10 backdrop-blur-sm z-0" />
            
            <div className="relative z-10 flex flex-col h-full justify-center pl-4">
              {data.logo && <img src={data.logo} className="h-10 w-auto absolute top-0 left-4" />}
              <h1 className={`text-5xl font-black uppercase leading-[0.85] tracking-tighter ${textColor}`}>
                {data.fullName.split(' ')[0]}<br />
                <span className="opacity-50">{data.fullName.split(' ')[1]}</span>
              </h1>
              <p className={`mt-4 text-xl font-bold ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>{data.jobTitle}</p>
            </div>

            <div className={`absolute right-0 top-0 bottom-0 w-1/3 z-10 flex flex-col justify-center p-6 space-y-4 text-right text-xs font-medium ${textColor}`}>
               <div className="space-y-1">
                 <p className="opacity-50 uppercase text-[10px]">Company</p>
                 <p>{data.company}</p>
               </div>
               <div className="space-y-1">
                 <p className="opacity-50 uppercase text-[10px]">Contact</p>
                 <p>{data.email}</p>
                 <p>{data.phone}</p>
               </div>
               <div className="space-y-1">
                 <p className="opacity-50 uppercase text-[10px]">Web</p>
                 <p>{data.website}</p>
               </div>
            </div>
          </>
        )}

      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [card, setCard] = useState<CardState>({
    fullName: 'Dikie Dev',
    jobTitle: 'Full Stack Engineer',
    company: 'Future Systems Inc.',
    email: 'dikie@example.com',
    phone: '+1 234 567 890',
    website: 'www.dikie.dev',
    address: 'Nairobi, Kenya',
    logo: null,
    layout: 'modern',
    gradient: 'from-blue-600 via-violet-600 to-indigo-600',
    isGlass: true,
    showQr: false,
  });

  const update = (key: keyof CardState, value: any) => {
    setCard(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      update('logo', url);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 4 });
      saveAs(dataUrl, `business-card-${card.fullName.replace(/\s/g, '-')}.png`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans flex flex-col lg:flex-row overflow-hidden">
      
      {/* --- Sidebar Control Panel --- */}
      <div className="w-full lg:w-[480px] bg-[#0a0a0a] border-r border-white/5 flex flex-col h-screen z-20 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Layout size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Card<span className="text-blue-500">Maker</span> Pro</span>
          </div>
          <div className="text-xs font-mono text-slate-600 border border-slate-800 px-2 py-1 rounded">v2.0</div>
        </div>

        {/* Scrollable Controls */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Layout Selection */}
          <section>
             <SectionTitle icon={Layout} title="Layout Structure" />
             <div className="grid grid-cols-3 gap-3">
               {['modern', 'minimal', 'bold'].map((layout) => (
                 <button
                   key={layout}
                   onClick={() => update('layout', layout)}
                   className={`h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                     card.layout === layout 
                       ? 'border-blue-500 bg-blue-900/20 text-blue-400' 
                       : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-700 hover:bg-slate-900'
                   }`}
                 >
                   <div className={`w-8 h-5 rounded border-2 border-current opacity-50 ${layout === 'minimal' ? 'flex justify-center items-center' : ''}`}>
                      {layout === 'minimal' && <div className="w-1 h-1 bg-current rounded-full" />}
                   </div>
                   <span className="text-xs font-medium capitalize">{layout}</span>
                 </button>
               ))}
             </div>
          </section>

          {/* Design System */}
          <section>
            <SectionTitle icon={Palette} title="Theme & Style" />
            <div className="space-y-4">
              {/* Gradients */}
              <div className="grid grid-cols-6 gap-2">
                {GRADIENTS.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => update('gradient', g.value)}
                    className={`w-full aspect-square rounded-full transition-transform hover:scale-110 ${card.gradient === g.value ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''}`}
                    style={{ background: g.name === 'Clean' ? '#f0f0f0' : undefined }}
                  >
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${g.value}`} />
                  </button>
                ))}
              </div>
              
              {/* Glass Toggle */}
              <Toggle 
                label="Glassmorphism Effect" 
                active={card.isGlass} 
                onClick={() => update('isGlass', !card.isGlass)} 
              />
            </div>
          </section>

          {/* Logo Upload */}
          <section>
            <SectionTitle icon={ImageIcon} title="Branding" />
            <div className="flex gap-4 items-center">
              <div 
                className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden bg-slate-900 cursor-pointer hover:border-blue-500 hover:text-blue-500 text-slate-600 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {card.logo ? (
                  <img src={card.logo} className="w-full h-full object-cover" />
                ) : (
                  <Upload size={20} />
                )}
              </div>
              <div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Upload Logo
                </button>
                <p className="text-xs text-slate-600 mt-1">Recommended: PNG with transparent background</p>
                {card.logo && (
                   <button onClick={() => update('logo', null)} className="text-xs text-red-400 mt-2 hover:underline">Remove logo</button>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
            </div>
          </section>

          {/* Text Content */}
          <section className="space-y-4">
            <SectionTitle icon={Type} title="Personal Details" />
            <div className="space-y-3">
              <InputGroup label="Full Name" value={card.fullName} onChange={(v: string) => update('fullName', v)} />
              <div className="grid grid-cols-2 gap-3">
                <InputGroup label="Job Title" value={card.jobTitle} onChange={(v: string) => update('jobTitle', v)} />
                <InputGroup label="Company" value={card.company} onChange={(v: string) => update('company', v)} />
              </div>
              <InputGroup label="Email" value={card.email} onChange={(v: string) => update('email', v)} />
              <InputGroup label="Website" value={card.website} onChange={(v: string) => update('website', v)} />
              <InputGroup label="Phone" value={card.phone} onChange={(v: string) => update('phone', v)} />
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#0a0a0a]">
          <button
            onClick={handleDownload}
            className="group w-full bg-white text-black h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-[0.98]"
          >
            <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            Download High-Res
          </button>
        </div>
      </div>

      {/* --- Preview Canvas --- */}
      <div className="flex-1 bg-[#050505] relative flex items-center justify-center overflow-hidden p-8 lg:p-0">
        {/* Environment Ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(50,50,50,0.2),transparent_70%)]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* The Card Stage */}
        <div className="relative z-10 scale-[0.6] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 transition-transform duration-500 ease-out">
          <Card data={card} cardRef={cardRef} />
        </div>

        {/* Floating Instruction */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 text-xs font-mono tracking-widest uppercase opacity-50">
          Preview Mode • 4X Quality Export
        </div>
      </div>
    </div>
  );
}