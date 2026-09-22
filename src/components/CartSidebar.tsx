import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onClearCart: () => void;
  onProceedToCheckout: (appliedPromo: string, instructions: string, tip: number) => void;
  appliedPromo: string;
  onApplyPromo: (code: string) => Promise<boolean>;
  promoDiscount: number;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onClearCart,
  onProceedToCheckout,
  appliedPromo,
  onApplyPromo,
  promoDiscount
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [selectedInstruction, setSelectedInstruction] = useState('Leave at door');
  const [selectedTip, setSelectedTip] = useState(20);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeDeliveryThreshold = 199.0;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const deliveryFee = isFreeDelivery ? 0 : 25;
  const platformFee = 5;
  const grandTotal = Math.max(0, subtotal - promoDiscount + deliveryFee + platformFee + selectedTip);

  const handleApplyPromoCode = async () => {
    if (!promoInput.trim()) return;
    setPromoError('');
    setPromoSuccess('');
    const success = await onApplyPromo(promoInput.trim());
    if (success) {
      setPromoSuccess(`Coupon '${promoInput.toUpperCase()}' applied!`);
      setPromoInput('');
    } else {
      setPromoError('Invalid coupon or minimum order requirement not met.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
            <div className="flex items-center gap-2.5">
              <h3 className="font-extrabold text-lg text-zinc-900">My Basket</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {cartItems.reduce((a, b) => a + b.quantity, 0)} items
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs font-medium text-zinc-600 hover:text-rose-600 transition-colors p-1.5"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                id="close-cart-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 flex items-center justify-center border border-zinc-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Free Delivery Bar */}
          <div className="bg-rose-50/70 px-4 py-2.5 border-b border-rose-100">
            {isFreeDelivery ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>You unlocked FREE Express 10-Min Delivery! 🎉</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-rose-900">
                  <span className="font-semibold">
                    Add <strong className="font-bold text-rose-700">₹{amountToFreeDelivery.toFixed(0)}</strong> for FREE delivery
                  </span>
                  <span className="font-bold text-[10px] uppercase text-rose-600">
                    Threshold: ₹{freeDeliveryThreshold}
                  </span>
                </div>
                <div className="w-full bg-rose-200/70 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600 space-y-3">
                <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-4xl shadow-inner">
                  🛍️
                </div>
                <h4 className="font-extrabold text-zinc-900 text-lg">Your cart is empty</h4>
                <p className="text-xs text-zinc-600 max-w-xs">
                  Fresh produce, snacks, and chilled drinks are just 10 minutes away. Start adding items!
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50/90 border border-zinc-100 hover:border-zinc-200 transition-all"
                    >
                      {/* Product Emoji */}
                      <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-3xl shadow-xs border border-zinc-100 shrink-0">
                        {item.image}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-zinc-900 text-xs sm:text-sm truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-600 mt-0.5">
                          <span>{item.unit}</span>
                          <span>•</span>
                          <span className="font-bold text-zinc-900">₹{item.price}</span>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white border border-zinc-200/80 rounded-xl p-1 shadow-xs shrink-0">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-rose-100 text-zinc-700 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold text-xs text-zinc-900 min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-rose-100 text-zinc-700 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="pt-2">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-rose-600" />
                        <span>Have a Promo Code?</span>
                      </div>
                      {appliedPromo && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {appliedPromo} Active
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="e.g. QUICK20 or FRESH10"
                        className="flex-1 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xl border border-zinc-200 bg-white focus:outline-none focus:border-rose-500"
                      />
                      <button
                        onClick={handleApplyPromoCode}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>

                    {promoError && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {promoError}
                      </p>
                    )}
                    {promoSuccess && (
                      <p className="text-[11px] text-emerald-600 font-medium">
                        {promoSuccess}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Instructions */}
                <div>
                  <label className="text-xs font-bold text-zinc-900 block mb-2">
                    Delivery Instructions
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    {[
                      'Leave at door',
                      'Ring bell',
                      'Avoid calling'
                    ].map((instruction) => (
                      <button
                        key={instruction}
                        onClick={() => setSelectedInstruction(instruction)}
                        className={`p-2 rounded-xl text-center font-semibold border transition-all cursor-pointer ${
                          selectedInstruction === instruction
                            ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                            : 'bg-zinc-50 border-zinc-200/70 text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        {instruction}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Partner Tip */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-900 mb-2">
                    <span>Tip your delivery partner</span>
                    <span className="text-[10px] text-zinc-600 font-normal">100% goes to rider</span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 10, 20, 30].map((tip) => (
                      <button
                        key={tip}
                        onClick={() => setSelectedTip(tip)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedTip === tip
                            ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                            : 'bg-zinc-50 border-zinc-200/70 text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {tip === 0 ? 'No Tip' : `₹${tip}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="border-t border-zinc-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Item Total</span>
                    <span className="font-semibold text-zinc-900">₹{subtotal.toFixed(0)}</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Promo Discount ({appliedPromo})</span>
                      <span>-₹{promoDiscount.toFixed(0)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-600">
                    <span>Delivery Fee (10-Min Rush)</span>
                    <span className={isFreeDelivery ? 'text-emerald-600 font-bold' : 'font-semibold text-zinc-900'}>
                      {isFreeDelivery ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-600">
                    <span>Small Order & Platform Fee</span>
                    <span className="font-semibold text-zinc-900">₹{platformFee}</span>
                  </div>

                  {selectedTip > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>Rider Tip</span>
                      <span className="font-semibold text-zinc-900">₹{selectedTip}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black text-zinc-900 pt-2 border-t border-dashed border-zinc-200">
                    <span>To Pay</span>
                    <span className="text-rose-600">₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Trigger */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-white border-t border-zinc-100 shadow-lg">
              <button
                id="proceed-checkout-button"
                onClick={() => onProceedToCheckout(appliedPromo, selectedInstruction, selectedTip)}
                className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] opacity-90 font-semibold tracking-wider uppercase">
                    10 MINS ARRIVAL
                  </span>
                  <span className="text-base font-black">₹{grandTotal.toFixed(0)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Proceed to Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
