import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { LiveOrderTrackerModal } from './components/LiveOrderTrackerModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AddressModal } from './components/AddressModal';
import { MealPlannerModal } from './components/MealPlannerModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { AuthModal } from './components/AuthModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsModal } from './components/TermsModal';
import { Category, Product, CartItem, Order } from './types';
import { categories as localCategories, products as localProducts, promoCodes } from './data';
import { 
  initAuth, 
  subscribeOrders, 
  subscribeCart, 
  subscribeFavorites, 
  saveOrderToFirestore, 
  syncCartToFirestore, 
  toggleFavoriteInFirestore 
} from './lib/firebase';
import { User } from 'firebase/auth';
import { 
  Zap,
  ShieldCheck, 
  Clock, 
  Sparkles, 
  ArrowUpDown,
  Bike,
  Heart,
  Bot,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Github
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>(localCategories);
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'time'>('relevance');
  const [selectedQuickTag, setSelectedQuickTag] = useState<string>('all');
  const [isFavoritesOnly, setIsFavoritesOnly] = useState(false);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isMealPlannerOpen, setIsMealPlannerOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Cart, Orders & Favorites State (backed by Firestore + localStorage fallback)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('quickmart_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('quickmart_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('quickmart_favs');
    return saved ? JSON.parse(saved) : [];
  });

  const [deliveryAddress, setDeliveryAddress] = useState<string>('Flat 402, Sunshine Heights, Indiranagar, Bengaluru');
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [checkoutInstructions, setCheckoutInstructions] = useState('Leave at door');
  const [checkoutTip, setCheckoutTip] = useState(20);

  // 1. Initialize Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Realtime Firestore Sync for Orders, Cart & Favorites when user is ready
  useEffect(() => {
    if (!currentUser) return;

    // Realtime Orders
    const unsubOrders = subscribeOrders(currentUser.uid, (firestoreOrders) => {
      if (firestoreOrders && firestoreOrders.length > 0) {
        setOrders(firestoreOrders);
      }
    });

    // Realtime Cart
    const unsubCart = subscribeCart(currentUser.uid, (firestoreCart) => {
      if (firestoreCart && firestoreCart.length > 0) {
        setCartItems(firestoreCart);
      }
    });

    // Realtime Favorites
    const unsubFavs = subscribeFavorites(currentUser.uid, (favs) => {
      if (favs) {
        setFavoriteIds(favs);
      }
    });

    return () => {
      unsubOrders();
      unsubCart();
      unsubFavs();
    };
  }, [currentUser?.uid]);

  // Local storage persistence fallbacks
  useEffect(() => {
    localStorage.setItem('quickmart_cart', JSON.stringify(cartItems));
    if (currentUser?.uid) {
      syncCartToFirestore(currentUser.uid, cartItems);
    }
  }, [cartItems, currentUser?.uid]);

  useEffect(() => {
    localStorage.setItem('quickmart_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('quickmart_favs', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Fetch initial catalog from server
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories(localCategories));

    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts(localProducts));

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0 && orders.length === 0) {
          setOrders(data);
        }
      })
      .catch(() => {});
  }, []);

  // Cart actions
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const addMultipleToCart = (itemsToAdd: Product[]) => {
    setCartItems(prev => {
      const updated = [...prev];
      for (const prod of itemsToAdd) {
        const idx = updated.findIndex(i => i.id === prod.id);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        } else {
          updated.push({ ...prod, quantity: 1 });
        }
      }
      return updated;
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedPromo('');
    setPromoDiscount(0);
    if (currentUser?.uid) {
      syncCartToFirestore(currentUser.uid, []);
    }
  };

  // Favorites action
  const handleToggleFavorite = async (productId: number) => {
    if (currentUser?.uid) {
      const nextList = await toggleFavoriteInFirestore(currentUser.uid, productId, favoriteIds);
      setFavoriteIds(nextList);
    } else {
      setFavoriteIds(prev =>
        prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      );
    }
  };

  const handleApplyPromo = async (code: string): Promise<boolean> => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedPromo(data.promo.code);
        setPromoDiscount(data.discount);
        return true;
      }
    } catch (e) {
      const found = promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase());
      if (found && subtotal >= found.minOrder) {
        let discount = found.discountType === 'percentage' 
          ? (subtotal * found.value) / 100 
          : found.value;
        if (found.code === 'SUPER50' && discount > 150) {
          discount = 150;
        }
        setAppliedPromo(found.code);
        setPromoDiscount(discount);
        return true;
      }
    }
    return false;
  };

  const handleProceedToCheckout = (promo: string, instructions: string, tip: number) => {
    setAppliedPromo(promo);
    setCheckoutInstructions(instructions);
    setCheckoutTip(tip);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    // Save to local & Firestore
    setOrders(prev => [newOrder, ...prev]);
    if (currentUser?.uid) {
      saveOrderToFirestore(currentUser.uid, newOrder);
    }
    clearCart();
    setIsCheckoutOpen(false);
    setActiveTrackingOrder(newOrder);
  };

  const handleReorder = (pastOrder: Order) => {
    pastOrder.items.forEach(item => addToCart(item));
    setIsOrdersOpen(false);
    setIsCartOpen(true);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Favorites Filter
    if (isFavoritesOnly) {
      list = list.filter(p => favoriteIds.includes(p.id));
    }

    // Category Filter
    if (activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Quick Filter Chips
    if (selectedQuickTag === 'under_99') {
      list = list.filter(p => p.price <= 99);
    } else if (selectedQuickTag === 'deals') {
      list = list.filter(p => !!p.originalPrice || !!p.badge);
    } else if (selectedQuickTag === 'fastest') {
      list = list.filter(p => parseInt(p.time) <= 8);
    }

    // Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'time') {
      list.sort((a, b) => parseInt(a.time) - parseInt(b.time));
    }

    return list;
  }, [products, activeCategory, searchQuery, sortBy, selectedQuickTag, isFavoritesOnly, favoriteIds]);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalCartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 font-sans flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* Top Sticky Navigation */}
      <Navbar
        cartCount={totalCartQuantity}
        cartTotal={cartTotal}
        onCartClick={() => setIsCartOpen(true)}
        onOrdersClick={() => setIsOrdersOpen(true)}
        activeOrdersCount={activeOrders.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAddress={deliveryAddress}
        onAddressClick={() => setIsAddressOpen(true)}
        onOpenMealPlanner={() => setIsMealPlannerOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        favoritesCount={favoriteIds.length}
        onToggleFavoritesFilter={() => setIsFavoritesOnly(!isFavoritesOnly)}
        isFavoritesFilterActive={isFavoritesOnly}
      />

      {/* Active Order Float Banner (if order currently in transit) */}
      {activeOrders.length > 0 && !activeTrackingOrder && (
        <div className="bg-gradient-to-r from-rose-600 to-amber-500 text-white py-2.5 px-4 sticky top-18 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              <Bike className="w-4 h-4" />
              <span>
                Your order <strong>#{activeOrders[0].id}</strong> is on the way!
              </span>
            </div>
            <button
              onClick={() => setActiveTrackingOrder(activeOrders[0])}
              className="px-3 py-1 rounded-xl bg-white text-rose-950 text-xs font-black shadow-xs hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Track Live Map
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Promotional Hero Section */}
        {!searchQuery && !isFavoritesOnly && (
          <HeroSection
            onApplyPromo={(code) => {
              handleApplyPromo(code);
              setIsCartOpen(true);
            }}
          />
        )}

        {/* AI Recipe Banner Highlight */}
        {!searchQuery && !isFavoritesOnly && (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0">
                🍳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg">Don't know what to cook?</h3>
                  <span className="bg-amber-300 text-zinc-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    AI Powered
                  </span>
                </div>
                <p className="text-xs text-rose-100 mt-0.5">
                  Describe any dish or craving. Gemini plans the recipe & bundles all fresh grocery ingredients for 10-min delivery!
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMealPlannerOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-white text-rose-950 font-black text-xs sm:text-sm shadow-md hover:bg-rose-50 transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>Plan Meal in 1-Click</span>
            </button>
          </div>
        )}

        {/* Categories Bar */}
        {!isFavoritesOnly && (
          <CategoryBar
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={(slug) => {
              setActiveCategory(slug);
              setSearchQuery('');
            }}
          />
        )}

        {/* Filter & Sorting Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-200/80">
          
          {/* Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'deals', label: '🔥 Fresh Deals' },
              { id: 'fastest', label: '⚡ Under 8 Mins' },
              { id: 'under_99', label: '💵 Under ₹99' },
            ].map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedQuickTag(tag.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedQuickTag === tag.id
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                    : 'bg-white text-zinc-600 hover:text-zinc-900 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-zinc-600 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-zinc-200 text-zinc-900 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer shadow-2xs"
            >
              <option value="relevance">Featured & Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated (4.8+)</option>
              <option value="time">Fastest Delivery</option>
            </select>
          </div>

        </div>

        {/* Section Heading & Item Counter */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              {isFavoritesOnly ? (
                <>
                  <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
                  <span>My Saved Favorites ({favoriteIds.length})</span>
                </>
              ) : searchQuery ? (
                `Results for "${searchQuery}"`
              ) : activeCategory === 'all' ? (
                'All Fresh Groceries'
              ) : (
                categories.find(c => c.slug === activeCategory)?.name || 'Items'
              )}
            </h2>
            <p className="text-xs text-zinc-600 font-medium mt-0.5">
              Showing {filteredProducts.length} items available for 10-minute dispatch
            </p>
          </div>

          {isFavoritesOnly && (
            <button
              onClick={() => setIsFavoritesOnly(false)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
            >
              Back to all items
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center max-w-md mx-auto my-8 space-y-3 shadow-xs">
            <div className="text-6xl mb-2">🔍</div>
            <h3 className="font-extrabold text-zinc-900 text-lg">No grocery items found</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {isFavoritesOnly
                ? "You haven't saved any favorite items yet. Tap the heart icon on any product to save it here!"
                : "We couldn't find items matching your filter. Try searching for fresh fruit, dairy, or clear your filters."}
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setSelectedQuickTag('all');
                setIsFavoritesOnly(false);
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {filteredProducts.map((product) => {
              const inCart = cartItems.find(item => item.id === product.id);
              const isFav = favoriteIds.includes(product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={inCart ? inCart.quantity : 0}
                  isFavorite={isFav}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={addToCart}
                  onUpdateQuantity={updateQuantity}
                  onOpenDetails={(p) => setSelectedProduct(p)}
                />
              );
            })}
          </div>
        )}

      </main>

      {/* Floating AI Assistant Trigger Button */}
      <button
        id="floating-ai-assistant-btn"
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border-2 border-white"
        title="Chat with Chef Quicky AI"
      >
        <Bot className="w-5 h-5" />
        <span className="hidden sm:inline text-xs font-extrabold tracking-wide">Ask Chef Quicky</span>
      </button>

      {/* Floating Bottom Cart Bar on Mobile */}
      {totalCartQuantity > 0 && !isCartOpen && (
        <div className="md:hidden fixed bottom-4 inset-x-4 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-rose-600 text-white font-extrabold text-sm shadow-xl shadow-rose-600/35 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-zinc-950 font-black text-xs px-2 py-0.5 rounded-full">
                {totalCartQuantity}
              </span>
              <span>View Basket</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>₹{cartTotal.toFixed(0)}</span>
              <span>➔</span>
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 mt-16 py-12 text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Column 1: Brand Info */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black shadow-md shadow-rose-600/20">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <span className="font-black text-xl text-zinc-900 tracking-tight">QuickMart</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500 max-w-xs">
                Revolutionizing daily essentials with ultra-fast 10-minute grocery delivery from micro dark stores right in your neighborhood.
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Dark Stores Online</span>
              </div>
            </div>

            {/* Column 2: Categories */}
            <div>
              <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider mb-3">
                Categories
              </h4>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><button onClick={() => { setActiveCategory('vegetables'); setIsFavoritesOnly(false); }} className="hover:text-rose-600 transition-colors cursor-pointer">Fresh Vegetables</button></li>
                <li><button onClick={() => { setActiveCategory('fruits'); setIsFavoritesOnly(false); }} className="hover:text-rose-600 transition-colors cursor-pointer">Fresh Fruits</button></li>
                <li><button onClick={() => { setActiveCategory('dairy'); setIsFavoritesOnly(false); }} className="hover:text-rose-600 transition-colors cursor-pointer">Dairy & Breakfast</button></li>
                <li><button onClick={() => { setActiveCategory('munchies'); setIsFavoritesOnly(false); }} className="hover:text-rose-600 transition-colors cursor-pointer">Snacks & Munchies</button></li>
              </ul>
            </div>

            {/* Column 3: QuickMart Promise */}
            <div>
              <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider mb-3">
                QuickMart Promise
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-500">
                <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" /> <span>10-Minute Express Dispatch</span></li>
                <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> <span>100% Freshness Guarantee</span></li>
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" /> <span>AI Recipe & Cart Assistant</span></li>
              </ul>
            </div>

            {/* Column 4: Customer Support & Social Links (Right Side) */}
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider mb-3">
                  Customer Support
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed mb-2.5">
                  Need help with your order? Our 24/7 dark store concierge is always live.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl">
                  <span>support@quickmart.delivery</span>
                </div>
              </div>

              {/* Social Media Links Right Side */}
              <div className="pt-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">Connect With Us</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xs"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white text-zinc-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xs"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-[#1877F2] hover:text-white text-zinc-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xs"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-[#0A66C2] hover:text-white text-zinc-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xs"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-[#FF0000] hover:text-white text-zinc-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xs"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xs"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
            <p>© {new Date().getFullYear()} QuickMart Technologies Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-rose-600 transition-colors cursor-pointer">Privacy Policy</button>
              <button onClick={() => setIsTermsOpen(true)} className="hover:text-rose-600 transition-colors cursor-pointer">Terms of Service</button>
              <a href="#" className="hover:text-rose-600 transition-colors">Dark Store Locations</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <ProductModal
        product={selectedProduct}
        quantityInCart={selectedProduct ? (cartItems.find(i => i.id === selectedProduct.id)?.quantity || 0) : 0}
        isFavorite={selectedProduct ? favoriteIds.includes(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        onUpdateQuantity={updateQuantity}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <MealPlannerModal
        isOpen={isMealPlannerOpen}
        onClose={() => setIsMealPlannerOpen(false)}
        onAddMultipleToCart={addMultipleToCart}
      />

      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        cartItems={cartItems}
        onAddToCart={addToCart}
        onOpenMealPlanner={() => setIsMealPlannerOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        deliveryAddress={deliveryAddress}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
        onProceedToCheckout={handleProceedToCheckout}
        appliedPromo={appliedPromo}
        onApplyPromo={handleApplyPromo}
        promoDiscount={promoDiscount}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        appliedPromo={appliedPromo}
        promoDiscount={promoDiscount}
        selectedInstruction={checkoutInstructions}
        selectedTip={checkoutTip}
        deliveryAddress={deliveryAddress}
        onOrderSuccess={handleOrderSuccess}
      />

      <LiveOrderTrackerModal
        order={activeTrackingOrder}
        onClose={() => setActiveTrackingOrder(null)}
        onRefreshOrders={() => {}}
      />

      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        onTrackOrder={(order) => setActiveTrackingOrder(order)}
        onReorder={handleReorder}
      />

      <AddressModal
        isOpen={isAddressOpen}
        onClose={() => setIsAddressOpen(false)}
        currentAddress={deliveryAddress}
        onSelectAddress={setDeliveryAddress}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

    </div>
  );
}
