import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, Globe, Lock, AlertTriangle, Mail, MapPin } from 'lucide-react';

const REVIEWS = [
  { name: "Yuki Tanaka", country: "Tokyo, Japan", text: "Precision-grade execution. Trustra's 2026 Directives make international capital movement seamless.", flag: "🇯🇵" },
  { name: "Lars Jensen", country: "Zurich, Switzerland", text: "The most transparent ROI protocol in the DACH region. The node's 99.9% uptime is absolute.", flag: "🇨🇭" },
  { name: "Oliver Bennett", country: "London, UK", text: "Superior liquidity management. Trustra is the benchmark for institutional asset growth in 2026.", flag: "🇬🇧" },
  { name: "Siddharth Nair", country: "Singapore, SG", text: "The sub-millisecond latency on the proprietary algorithms is unmatched for Asia-Pacific trade.", flag: "🇸🇬" },
  { name: "Hans Weber", country: "Frankfurt, Germany", text: "Zürich-audit certified security. The AES-256 encryption provides the peace of mind we require.", flag: "🇩🇪" },
  { name: "Bram Peeters", country: "Gent, Belgium", text: "Trustra's automated trading nodes have simplified my portfolio management. The reliability is world-class.", flag: "🇧🇪" }
];

const PLANS = [
  { id: 'starter', name: 'Rio Starter', yield: '6–9%', min: '€100 – €999' },
  { id: 'basic', name: 'Rio Basic', yield: '9–12%', min: '€1,000 – €4,999' },
  { id: 'standard', name: 'Rio Standard', yield: '12–16%', min: '€5,000 – €14,999' },
  { id: 'advanced', name: 'Rio Advanced', yield: '16–20%', min: '€15,000 – €49,999' },
  { id: 'elite', name: 'Rio Elite', yield: '20–25%', min: '€50,000 – ∞' }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden">
      {/* Navigation and Hero Sections remain the same as previous version... */}
      
      {/* ... (Plan Grid and Risk Disclaimer sections go here) ... */}

      {/* --- GLOBAL INFRASTRUCTURE SECTION --- */}
      <footer className="p-12 lg:p-20 border-t border-white/5 bg-[#030712] mt-32">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
               
               {/* USA Headquarters */}
               <div>
                  <div className="flex items-center gap-2 mb-4">
                     <MapPin size={16} className="text-yellow-500" />
                     <p className="text-[10px] font-black uppercase text-white tracking-widest">USA Headquarters</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-loose">
                     One World Trade Center, Suite 85<br/>
                     New York, NY 10007, United States
                  </p>
               </div>

               {/* European Hubs */}
               <div>
                  <div className="flex items-center gap-2 mb-4">
                     <Globe size={16} className="text-yellow-500" />
                     <p className="text-[10px] font-black uppercase text-white tracking-widest">European Branches</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-loose">
                     <span className="text-gray-400">Zurich:</span> Brandschenkestrasse 90, 8002 CH<br/>
                     <span className="text-gray-400">Frankfurt:</span> Taunustor 1, 60310 DE<br/>
                     <span className="text-gray-400">Gent:</span> Ottergemsesteenweg-Zuid 808, BE
                  </p>
               </div>

               {/* Global Operations */}
               <div>
                  <div className="flex items-center gap-2 mb-4">
                     <Zap size={16} className="text-yellow-500" />
                     <p className="text-[10px] font-black uppercase text-white tracking-widest">Global Hubs</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-loose">
                     Singapore, SG (Asia-Pacific)<br/>
                     London, UK (Capital Markets)<br/>
                     Tokyo, JP (Quantum Research)
                  </p>
               </div>

               {/* Support Terminal */}
               <div>
                  <div className="flex items-center gap-2 mb-4">
                     <Mail size={16} className="text-yellow-500" />
                     <p className="text-[10px] font-black uppercase text-white tracking-widest">Support Terminal</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-loose">
                     www.infocare@gmail.com<br/>
                     support@trustra.capital<br/>
                     +1 (878) 224-1625
                  </p>
               </div>

            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6">
               <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
                  Audit Certified Protocol v8.4.1 © 2016–2026 Trustra Capital Trade.
               </p>
               <div className="flex gap-8 text-[9px] font-bold text-gray-700 uppercase tracking-widest">
                  <span className="hover:text-yellow-500 cursor-pointer">Terms of Service</span>
                  <span className="hover:text-yellow-500 cursor-pointer">Privacy Protocol</span>
                  <span className="hover:text-yellow-500 cursor-pointer">AML Compliance</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
