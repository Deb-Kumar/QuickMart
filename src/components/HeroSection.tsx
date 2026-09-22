import { Zap, Clock, ShieldCheck, Tag, Flame } from 'lucide-react';

interface HeroSectionProps {
  onApplyPromo: (code: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onApplyPromo }) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white shadow-xl shadow-rose-500/15 p-6 sm:p-8 md:p-10 mb-8 transition-all">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-400/20 rounded-full blur-2xl pointer-events-none -mb-20"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Column: Heading & Value Prop */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white tracking-wide">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Superfast Delivery to Your Doorstep</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Fresh Groceries <br />
            <span className="text-amber-200 underline decoration-amber-300/60 decoration-wavy decoration-2">
              Delivered in 10 Mins
            </span>
          </h1>

          <p className="text-sm sm:text-base text-rose-50/90 max-w-lg leading-relaxed font-medium">
            From farm-fresh organic produce to pantry staples, chilled drinks, and snacks — freshly packed at your local dark store and rushed to your home.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/15 backdrop-blur-xs text-xs font-medium border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Average 8.4 Mins</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/15 backdrop-blur-xs text-xs font-medium border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>100% Fresh Guarantee</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/15 backdrop-blur-xs text-xs font-medium border border-white/10">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Zero Contact Delivery</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Promo Codes & Fast Picks */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Limited Time Offers</span>
              </div>
              <span className="text-[11px] font-semibold text-rose-100 bg-rose-900/30 px-2 py-0.5 rounded-full">Tap code to copy</span>
            </div>

            <div className="space-y-2">
              <div
                onClick={() => onApplyPromo('QUICK20')}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer transition-all active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-300 text-xs sm:text-sm bg-black/30 px-2 py-0.5 rounded-md">
                      QUICK20
                    </span>
                    <span className="text-xs font-bold text-white">20% OFF</span>
                  </div>
                  <p className="text-[11px] text-rose-100/80 mt-0.5">On orders above ₹199 • Max discount ₹100</p>
                </div>
                <button className="px-2.5 py-1 rounded-lg bg-amber-400 text-rose-950 text-xs font-bold shadow-xs group-hover:bg-amber-300 transition-colors">
                  Apply
                </button>
              </div>

              <div
                onClick={() => onApplyPromo('FRESH10')}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer transition-all active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-emerald-300 text-xs sm:text-sm bg-black/30 px-2 py-0.5 rounded-md">
                      FRESH10
                    </span>
                    <span className="text-xs font-bold text-white">₹50 FLAT OFF</span>
                  </div>
                  <p className="text-[11px] text-rose-100/80 mt-0.5">On fresh fruits, veggies & dairy above ₹249</p>
                </div>
                <button className="px-2.5 py-1 rounded-lg bg-emerald-400 text-emerald-950 text-xs font-bold shadow-xs group-hover:bg-emerald-300 transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
