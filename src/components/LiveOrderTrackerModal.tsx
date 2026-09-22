import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types';
import { X, MapPin, Phone, MessageSquare, ShieldCheck, Bike, Package, Store, Home } from 'lucide-react';

interface LiveOrderTrackerModalProps {
  order: Order | null;
  onClose: () => void;
  onRefreshOrders: () => void;
}

export const LiveOrderTrackerModal: React.FC<LiveOrderTrackerModalProps> = ({
  order: initialOrder,
  onClose,
  onRefreshOrders
}) => {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 mins

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  // Periodic polling for order status updates
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`);
        if (res.ok) {
          const updated = await res.json();
          setOrder(updated);
          onRefreshOrders();
        }
      } catch (err) {
        // Local simulation fallback
        setOrder(prev => {
          if (!prev) return null;
          const nextSec = prev.elapsedSeconds + 5;
          let nextStatus: OrderStatus = prev.status;
          if (nextSec >= 25 && nextSec < 65) nextStatus = 'packing';
          else if (nextSec >= 65 && nextSec < 160) nextStatus = 'out_for_delivery';
          else if (nextSec >= 160) nextStatus = 'delivered';
          return { ...prev, elapsedSeconds: nextSec, status: nextStatus };
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order?.id, order?.status]);

  // Local live countdown timer
  useEffect(() => {
    if (!order) return;
    const initialRemaining = Math.max(0, 600 - (order.elapsedSeconds || 0));
    setSecondsRemaining(initialRemaining);

    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [order?.elapsedSeconds]);

  if (!order) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const steps = [
    { key: 'confirmed', label: 'Order Confirmed', sub: 'Dark store received', icon: Store },
    { key: 'packing', label: 'Items Packed', sub: 'Bag sealed & checked', icon: Package },
    { key: 'out_for_delivery', label: 'On The Way', sub: 'Rider en route', icon: Bike },
    { key: 'delivered', label: 'Delivered', sub: 'Arrived at door', icon: Home },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed': return 0;
      case 'packing': return 1;
      case 'out_for_delivery': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[92vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-md">
              <Bike className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">Live Order Tracking</h3>
                <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  #{order.id}
                </span>
              </div>
              <p className="text-xs text-zinc-400">10-Minute Dark Store Express Delivery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tracker Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Big ETA Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white p-5 shadow-lg">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-200">
                  {order.status === 'delivered' ? 'Order Completed' : 'Estimated Arrival Time'}
                </span>
                <div className="text-3xl sm:text-4xl font-black tracking-tight mt-0.5">
                  {order.status === 'delivered' ? 'Delivered 🎉' : `${timeString} MINS`}
                </div>
                <p className="text-xs text-rose-100 mt-1">
                  {order.status === 'confirmed' && 'Picking items at nearest dark store...'}
                  {order.status === 'packing' && 'Packing with thermal temperature seals...'}
                  {order.status === 'out_for_delivery' && 'Rider on super scooter zooming your way!'}
                  {order.status === 'delivered' && 'Enjoy your fresh groceries!'}
                </p>
              </div>

              <div className="text-5xl select-none animate-bounce duration-1000">
                {order.status === 'delivered' ? '🎉' : '⚡'}
              </div>
            </div>
          </div>

          {/* Animated Milestone Timeline */}
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="relative flex items-center justify-between">
              {/* Progress Line */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-zinc-200 z-0">
                <div 
                  className="h-full bg-rose-600 transition-all duration-500"
                  style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Step Icons */}
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isPassed
                        ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'bg-white border-zinc-300 text-zinc-600'
                    } ${isCurrent ? 'ring-4 ring-rose-200 scale-110' : ''}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-bold mt-2 whitespace-nowrap ${
                      isPassed ? 'text-zinc-900' : 'text-zinc-600'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rider Profile Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-xs">
                {order.rider.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-zinc-900">{order.rider.name}</h4>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md">
                    ⭐ {order.rider.rating}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600">{order.rider.vehicle}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Vaccinated & Temperature Checked (98.2°F)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${order.rider.phone}`}
                className="w-9 h-9 rounded-xl bg-white hover:bg-rose-50 text-zinc-700 hover:text-rose-600 border border-zinc-200 flex items-center justify-center transition-colors shadow-xs"
                title="Call Rider"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => alert(`Chat with rider ${order.rider.name}: "I am right outside your building!"`)}
                className="w-9 h-9 rounded-xl bg-white hover:bg-rose-50 text-zinc-700 hover:text-rose-600 border border-zinc-200 flex items-center justify-center transition-colors shadow-xs"
                title="Message Rider"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Destination Details */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs space-y-1">
            <div className="flex items-center gap-2 text-zinc-900 font-bold">
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Delivering to: {order.address}</span>
            </div>
            <p className="text-[11px] text-zinc-600 pl-5.5">
              Instructions: {order.deliveryInstructions}
            </p>
          </div>

          {/* Ordered Items Summary */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
              Items in this shipment ({order.items.length})
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.image}</span>
                    <span className="font-semibold text-zinc-900">{item.name}</span>
                    <span className="text-[10px] text-zinc-600 font-bold">x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-zinc-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-zinc-600 block">Total Paid via {order.paymentMethod}</span>
            <span className="font-extrabold text-sm text-zinc-900">₹{order.total.toFixed(0)}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done & Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
};
