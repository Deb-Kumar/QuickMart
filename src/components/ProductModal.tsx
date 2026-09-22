import React, { useState } from 'react';
import { Product } from '../types';
import { X, Clock, Star, ShieldCheck, Heart, Plus, Minus, MapPin, Sparkles, Loader2 } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  quantityInCart: number;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: number) => void;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onUpdateQuantity: (id: number, delta: number) => void;
  onSelectProduct?: (p: Product) => void;
}

interface SubstituteSuggestion {
  productId: number;
  product: Product;
  reason: string;
  healthBenefit: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  quantityInCart,
  isFavorite = false,
  onToggleFavorite,
  onClose,
  onAddToCart,
  onUpdateQuantity,
  onSelectProduct
}) => {
  const [showAiSubs, setShowAiSubs] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [substitutes, setSubstitutes] = useState<SubstituteSuggestion[]>([]);
  const [explanation, setExplanation] = useState('');

  if (!product) return null;

  const fetchSubstitutions = async (preference = 'healthier') => {
    setShowAiSubs(true);
    setSubLoading(true);
    try {
      const res = await fetch('/api/ai/substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, preference })
      });
      const data = await res.json();
      if (data.success) {
        setSubstitutes(data.suggestions || []);
        setExplanation(data.explanation || '');
      }
    } catch (e) {
      console.warn('AI substitutes error:', e);
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button & Favorite Button */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(product.id)}
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-600 flex items-center justify-center shadow-md border border-zinc-200/60 transition-colors"
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-600'}`} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-600 hover:text-zinc-900 flex items-center justify-center shadow-md border border-zinc-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Header Media */}
        <div className="relative bg-gradient-to-b from-rose-50/70 via-amber-50/40 to-white p-8 flex items-center justify-center border-b border-zinc-100">
          <span className="text-8xl select-none filter drop-shadow-md">{product.image}</span>
          
          <div className="absolute top-4 left-4 flex gap-1.5">
            {product.badge && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                {product.badge}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white text-zinc-700 border border-zinc-200/70 flex items-center gap-1 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              {product.time}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-md">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating} ({product.reviewsCount} reviews)</span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-zinc-900">{product.name}</h2>
            <p className="text-sm text-zinc-600 mt-1 font-medium">{product.unit}</p>
          </div>

          {/* Description */}
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 text-sm text-zinc-700 leading-relaxed">
            {product.description}
          </div>

          {/* AI Smart Substitutions Button & Panel */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-900">AI Smart Alternatives</h4>
                  <p className="text-[10px] text-zinc-500">Gemini suggests healthy or cheaper swaps</p>
                </div>
              </div>
              <button
                onClick={() => fetchSubstitutions('healthy')}
                disabled={subLoading}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
              >
                {subLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Find Swaps</span>
              </button>
            </div>

            {/* Substitution Results */}
            {showAiSubs && (
              <div className="mt-3 pt-3 border-t border-rose-200/60 space-y-2">
                {subLoading ? (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    <span>Analyzing nutritional alternatives...</span>
                  </div>
                ) : substitutes.length === 0 ? (
                  <p className="text-xs text-zinc-500">No alternatives found.</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-zinc-600 font-medium">{explanation}</p>
                    {substitutes.map((sub) => (
                      <div
                        key={sub.productId}
                        className="p-2.5 rounded-xl bg-white border border-rose-200/80 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div 
                          className="flex items-center gap-2.5 cursor-pointer flex-1"
                          onClick={() => onSelectProduct?.(sub.product)}
                        >
                          <span className="text-2xl">{sub.product.image}</span>
                          <div>
                            <p className="text-xs font-bold text-zinc-900 hover:text-rose-600 transition-colors">{sub.product.name}</p>
                            <p className="text-[10px] text-rose-600 font-medium">{sub.healthBenefit}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-zinc-900">₹{sub.product.price}</span>
                          <button
                            onClick={() => {
                              onAddToCart(sub.product);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Attributes Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {product.origin && (
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-600 font-medium block">Origin / Source</span>
                <span className="font-bold text-zinc-900 mt-0.5 block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {product.origin}
                </span>
              </div>
            )}
            {product.shelfLife && (
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-600 font-medium block">Shelf Life</span>
                <span className="font-bold text-zinc-900 mt-0.5 block">{product.shelfLife}</span>
              </div>
            )}
          </div>

          {/* Nutritional Info if available */}
          {product.nutrition && (
            <div className="border-t border-zinc-100 pt-4">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5">
                Nutritional Values (Approx)
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-rose-50/60 p-2 rounded-xl border border-rose-100">
                  <span className="text-[10px] text-zinc-600 block">Energy</span>
                  <span className="font-black text-rose-700 text-xs">{product.nutrition.calories}</span>
                </div>
                <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-zinc-600 block">Protein</span>
                  <span className="font-black text-amber-700 text-xs">{product.nutrition.protein}</span>
                </div>
                <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-zinc-600 block">Carbs</span>
                  <span className="font-black text-emerald-700 text-xs">{product.nutrition.carbs}</span>
                </div>
                <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-zinc-600 block">Fat</span>
                  <span className="font-black text-blue-700 text-xs">{product.nutrition.fat}</span>
                </div>
              </div>
            </div>
          )}

          {/* Freshness Promise */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-medium border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>QuickMart 100% Replacement Guarantee if freshness isn't top notch.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-zinc-600 font-medium block">Total Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-zinc-600 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {quantityInCart === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Basket</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-rose-600 text-white rounded-2xl px-4 py-2 shadow-md">
              <button
                onClick={() => onUpdateQuantity(product.id, -1)}
                className="w-8 h-8 rounded-xl bg-rose-700 hover:bg-rose-800 flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-black text-base min-w-[24px] text-center">
                {quantityInCart}
              </span>
              <button
                onClick={() => onUpdateQuantity(product.id, 1)}
                className="w-8 h-8 rounded-xl bg-rose-700 hover:bg-rose-800 flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
