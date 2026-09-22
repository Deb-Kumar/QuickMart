import React from 'react';
import { ShoppingBag, Zap, MapPin, Search, ChevronDown, PackageCheck, Sparkles, X, Bot, User as UserIcon, Heart } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onCartClick: () => void;
  onOrdersClick: () => void;
  activeOrdersCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedAddress: string;
  onAddressClick: () => void;
  onOpenMealPlanner: () => void;
  onOpenAssistant: () => void;
  onOpenAuth: () => void;
  currentUser: User | null;
  favoritesCount: number;
  onToggleFavoritesFilter: () => void;
  isFavoritesFilterActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  onCartClick,
  onOrdersClick,
  activeOrdersCount,
  searchQuery,
  onSearchChange,
  selectedAddress,
  onAddressClick,
  onOpenMealPlanner,
  onOpenAssistant,
  onOpenAuth,
  currentUser,
  favoritesCount,
  onToggleFavoritesFilter,
  isFavoritesFilterActive
}) => {
  const isAnonymous = currentUser?.isAnonymous ?? true;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-2 sm:gap-4">
          
          {/* Logo & Delivery Time Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-rose-600 to-rose-950 bg-clip-text text-transparent">
                    QuickMart
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    10 MINS
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium -mt-1">Instant Grocery Delivery</p>
              </div>
            </div>

            {/* Address Selector Pill */}
            <button
              id="delivery-location-selector"
              onClick={onAddressClick}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 hover:bg-rose-50/60 border border-zinc-200/80 hover:border-rose-200 text-left transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <div className="max-w-[140px] xl:max-w-[180px]">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-900 leading-tight">
                  <span>Deliver to</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </div>
                <div className="text-[10px] text-zinc-500 truncate">{selectedAddress}</div>
              </div>
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="flex-1 max-w-md xl:max-w-lg mx-1 sm:mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-input-field"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search for 'milk', 'chips', 'apple', 'pasta'..."
                className="w-full pl-10 pr-10 py-2 bg-zinc-100/80 hover:bg-zinc-100 focus:bg-white text-zinc-900 text-xs sm:text-sm rounded-2xl border border-zinc-200/70 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* AI Meal Planner Action */}
            <button
              id="ai-recipe-planner-btn"
              onClick={onOpenMealPlanner}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 hover:from-amber-100 hover:to-rose-100 text-rose-700 border border-rose-200/80 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>AI Recipes</span>
            </button>

            {/* Chef Quicky Assistant Button */}
            <button
              id="ai-chat-concierge-btn"
              onClick={onOpenAssistant}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 font-bold text-xs transition-all cursor-pointer"
              title="Chef Quicky AI Concierge"
            >
              <Bot className="w-4 h-4 text-rose-600" />
              <span className="hidden xl:inline">AI Chat</span>
            </button>

            {/* Favorites Toggle Button */}
            <button
              id="favorites-toggle-btn"
              onClick={onToggleFavoritesFilter}
              className={`relative flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-2xl font-bold text-xs border transition-all cursor-pointer ${
                isFavoritesFilterActive
                  ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-2xs'
                  : 'bg-zinc-100/70 hover:bg-rose-50/60 border-zinc-200/60 text-zinc-700'
              }`}
              title="Saved Favorites"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavoritesFilterActive ? 'fill-rose-500 text-rose-500' : 'text-zinc-600'}`} />
              {favoritesCount > 0 && (
                <span className="text-[10px] font-black text-rose-600">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Orders Tracker Button */}
            <button
              id="view-orders-button"
              onClick={onOrdersClick}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-2xl text-zinc-700 hover:text-rose-600 bg-zinc-100/70 hover:bg-rose-50/80 border border-zinc-200/60 font-semibold text-xs transition-all cursor-pointer"
            >
              <PackageCheck className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">Orders</span>
              {activeOrdersCount > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            <button
              id="auth-profile-button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-2 rounded-2xl bg-zinc-100/70 hover:bg-zinc-200/70 border border-zinc-200/60 font-bold text-xs text-zinc-800 transition-all cursor-pointer"
              title="User Account"
            >
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="User" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-4 h-4 text-zinc-700" />
              )}
              <span className="hidden xl:inline text-[11px]">
                {currentUser && !isAnonymous ? (currentUser.displayName?.split(' ')[0] || 'Account') : 'Account'}
              </span>
            </button>

            {/* Cart Trigger */}
            <button
              id="open-cart-button"
              onClick={onCartClick}
              className="group flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/35 active:scale-95 transition-all cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:-translate-y-0.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-zinc-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[9px] opacity-85 font-bold uppercase tracking-wider">
                  {cartCount === 0 ? 'Basket' : `${cartCount} items`}
                </span>
                <span className="font-extrabold text-xs sm:text-sm">
                  {cartCount === 0 ? '₹0' : `₹${cartTotal.toFixed(0)}`}
                </span>
              </div>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
