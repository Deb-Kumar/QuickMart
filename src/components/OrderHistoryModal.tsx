import React from 'react';
import { Order } from '../types';
import { X, PackageCheck, Bike, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onTrackOrder,
  onReorder
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[85vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-zinc-900">Your Orders</h3>
              <p className="text-xs text-zinc-600">Past & Live grocery orders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 flex items-center justify-center border border-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 space-y-3">
              <div className="text-5xl">📦</div>
              <h4 className="font-bold text-zinc-800 text-base">No orders yet</h4>
              <p className="text-xs max-w-xs mx-auto">
                Once you place an order, you can track the live delivery progress and reorder here.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const isLive = order.status !== 'delivered' && order.status !== 'cancelled';
              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isLive
                      ? 'bg-rose-50/40 border-rose-200 ring-1 ring-rose-200'
                      : 'bg-zinc-50/70 border-zinc-200/80 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-zinc-900 bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                        #{order.id}
                      </span>
                      <span className="text-[11px] text-zinc-600">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {isLive ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full animate-pulse">
                        <Bike className="w-3.5 h-3.5" />
                        <span>Tracking Active</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Delivered</span>
                      </span>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div className="flex items-center gap-2 my-2 overflow-x-auto pb-1">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="text-2xl p-1 bg-white rounded-lg border border-zinc-100" title={item.name}>
                        {item.image}
                      </span>
                    ))}
                    <span className="text-xs text-zinc-600 font-medium pl-1">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 mt-2 text-xs">
                    <span className="font-extrabold text-zinc-900 text-sm">
                      ₹{order.total.toFixed(0)}
                    </span>

                    <div className="flex items-center gap-2">
                      {isLive ? (
                        <button
                          onClick={() => {
                            onTrackOrder(order);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <span>Live Map</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onReorder(order)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reorder All</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
