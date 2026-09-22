import React from 'react';
import { Product } from '../types';
import { Plus, Minus, Clock, Star, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  onAddToCart: (p: Product) => void;
  onUpdateQuantity: (id: number, delta: number) => void;
  onOpenDetails: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetails
}) => {
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-3xl p-3.5 sm:p-4 border border-zinc-200/70 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-200">
      
      {/* Top Media / Emoji Section */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="relative w-full aspect-square bg-gradient-to-b from-zinc-50 to-zinc-100/60 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden mb-3 group-hover:scale-[1.02] transition-transform"
      >
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {product.badge && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-400 text-zinc-950 shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Favorite Icon */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xs transition-colors"
            title="Toggle favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-400 hover:text-rose-500'}`} />
          </button>
        )}

        {/* Delivery ETA pill */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-xs text-zinc-700 text-[10px] font-bold border border-zinc-200/60 flex items-center gap-1 shadow-xs">
          <Clock className="w-3 h-3 text-rose-500" />
          <span>{product.time}</span>
        </div>

        {/* Product Visual */}
        <span className="text-6xl sm:text-7xl select-none filter drop-shadow-sm group-hover:scale-110 transition-transform">
          {product.image}
        </span>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div onClick={() => onOpenDetails(product)} className="cursor-pointer">
          {/* Unit & Rating */}
          <div className="flex items-center justify-between text-xs text-zinc-600 mb-1">
            <span className="font-semibold text-zinc-600">{product.unit}</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-zinc-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-rose-600 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-zinc-600 line-clamp-1 mt-0.5">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart Controls */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-zinc-900 text-base sm:text-lg">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-zinc-600 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Stepper / Add button */}
          {quantityInCart === 0 ? (
            <button
              id={`add-product-btn-${product.id}`}
              onClick={() => onAddToCart(product)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-rose-600 text-white rounded-xl px-1.5 py-1 shadow-sm">
              <button
                id={`dec-product-btn-${product.id}`}
                onClick={() => onUpdateQuantity(product.id, -1)}
                className="w-6 h-6 rounded-lg bg-rose-700/60 hover:bg-rose-700 flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-black text-xs min-w-[16px] text-center">
                {quantityInCart}
              </span>
              <button
                id={`inc-product-btn-${product.id}`}
                onClick={() => onUpdateQuantity(product.id, 1)}
                className="w-6 h-6 rounded-lg bg-rose-700/60 hover:bg-rose-700 flex items-center justify-center text-white active:scale-90 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
