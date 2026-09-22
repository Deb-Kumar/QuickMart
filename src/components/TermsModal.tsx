import React, { useEffect } from 'react';
import { X, ScrollText, ShoppingCart, Truck, CreditCard, AlertTriangle, Scale, RefreshCw, Ban, MessageSquare, Gavel, Mail } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections = [
    {
      icon: ShoppingCart,
      title: 'Use of Service',
      items: [
        { label: 'Eligibility', text: 'You must be at least 18 years of age to create an account and place orders on QuickMart. By using our services, you confirm that you meet this requirement.' },
        { label: 'Account Responsibility', text: 'You are responsible for maintaining the confidentiality of your account credentials. All activities under your account are your responsibility. Notify us immediately of any unauthorized access.' },
        { label: 'Accurate Information', text: 'You agree to provide accurate, current, and complete information during registration and checkout. Providing false delivery addresses or contact information may result in order cancellation.' },
        { label: 'Service Availability', text: 'QuickMart operates in select cities and pin codes. Our 10-minute delivery promise is subject to dark store availability, weather conditions, and demand in your area.' }
      ]
    },
    {
      icon: Truck,
      title: 'Orders & Delivery',
      items: [
        { label: 'Order Acceptance', text: 'All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order due to stock unavailability, pricing errors, or suspected fraudulent activity.' },
        { label: 'Delivery Timeline', text: 'Our 10-minute delivery promise starts from order confirmation and applies to orders within serviceable dark store radius. Delays due to weather, traffic, or high demand do not qualify for refunds unless specified.' },
        { label: 'Delivery Instructions', text: 'Ensure someone is available to receive the order at the provided address. Our delivery partners will attempt to contact you via the registered phone number. Orders undelivered after 2 contact attempts may be returned.' },
        { label: 'Product Freshness', text: 'All products are sourced and packed from our temperature-controlled micro dark stores. If you receive a damaged or incorrect item, report it within 24 hours for a full refund or replacement.' }
      ]
    },
    {
      icon: CreditCard,
      title: 'Pricing & Payments',
      items: [
        { label: 'Product Pricing', text: 'All prices displayed include applicable taxes (GST). Prices are subject to change without prior notice. The price at the time of order placement is final.' },
        { label: 'Delivery Fee', text: 'A platform and delivery fee may apply based on order value, distance, and demand. Orders above the free delivery threshold (currently ₹149) qualify for free delivery.' },
        { label: 'Payment Methods', text: 'We accept UPI, credit/debit cards, net banking, and digital wallets. Cash on delivery (COD) may be available in select areas with an order value limit.' },
        { label: 'Promotional Offers', text: 'Discount codes, coupons, and promotional offers are subject to specific terms, validity periods, and usage limits. QuickMart reserves the right to modify or discontinue promotions at any time.' }
      ]
    },
    {
      icon: RefreshCw,
      title: 'Returns & Refunds',
      items: [
        { label: 'Refund Eligibility', text: 'Refunds are processed for missing items, damaged products, wrong deliveries, or quality issues reported within 24 hours of delivery. Perishable items must be reported within 4 hours.' },
        { label: 'Refund Process', text: 'Approved refunds are credited to your original payment method within 5-7 business days. For wallet-based refunds, credits are instant and usable on your next order.' },
        { label: 'Non-Refundable Items', text: 'Items marked as non-returnable, products with broken seals (for hygiene reasons), and correctly delivered items are not eligible for refunds unless defective.' },
        { label: 'Cancellation', text: 'Orders can be cancelled before the "Packed" stage. Once an order is packed or out for delivery, cancellation requests may not be honored, and applicable charges may apply.' }
      ]
    },
    {
      icon: Ban,
      title: 'Prohibited Activities',
      items: [
        { label: 'Account Misuse', text: 'Creating multiple accounts for abusing promotions, using bots or automated systems to place orders, or sharing account credentials for commercial purposes is strictly prohibited.' },
        { label: 'Fraudulent Activity', text: 'Filing false refund claims, using stolen payment methods, providing fake delivery addresses, or any form of fraud will result in immediate account suspension and legal action.' },
        { label: 'Abuse & Harassment', text: 'Verbal or physical abuse, threats, or harassment directed at our delivery partners, customer support team, or any QuickMart employee is a zero-tolerance offense.' },
        { label: 'Reselling', text: 'Products purchased on QuickMart are for personal consumption. Bulk purchasing for the purpose of commercial resale is not permitted and may lead to order cancellation.' }
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Limitation of Liability',
      items: [
        { label: 'Service "As Is"', text: 'QuickMart is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, error-free operation, or that defects will be corrected immediately.' },
        { label: 'AI Features Disclaimer', text: 'Our AI-powered features (Meal Planner, Smart Substitutes, Chef Assistant powered by Google Gemini) provide suggestions only. We are not responsible for dietary reactions, allergies, or nutritional inaccuracies in AI-generated recommendations.' },
        { label: 'Maximum Liability', text: 'Our total liability for any claim arising from the use of our services shall not exceed the amount paid by you for the specific order in question.' },
        { label: 'Force Majeure', text: 'QuickMart is not liable for delays or failures caused by natural disasters, pandemics, government restrictions, internet outages, or any events beyond our reasonable control.' }
      ]
    },
    {
      icon: Scale,
      title: 'Intellectual Property',
      items: [
        { label: 'Ownership', text: 'All content, trademarks, logos, UI designs, code, and intellectual property on the QuickMart platform are owned by QuickMart Technologies Inc. and protected under applicable IP laws.' },
        { label: 'User Content', text: 'By submitting reviews, ratings, or feedback, you grant QuickMart a non-exclusive, royalty-free license to use, display, and distribute such content for service improvement purposes.' },
        { label: 'Restrictions', text: 'You may not copy, modify, distribute, reverse engineer, or create derivative works based on our platform without prior written permission from QuickMart Technologies Inc.' }
      ]
    },
    {
      icon: Gavel,
      title: 'Governing Law & Disputes',
      items: [
        { label: 'Jurisdiction', text: 'These Terms are governed by the laws of the Republic of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.' },
        { label: 'Dispute Resolution', text: 'We encourage resolving disputes amicably. Please contact our support team first. If unresolved, disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996.' },
        { label: 'Severability', text: 'If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.' },
        { label: 'Modifications', text: 'QuickMart reserves the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated Terms.' }
      ]
    }
  ];

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in cursor-pointer">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-rose-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-zinc-900">Terms & Conditions</h2>
              <p className="text-[11px] text-zinc-500 font-medium">Effective from: September 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 text-zinc-600 flex items-center justify-center border border-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-2">
          {/* Intro */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 mb-4">
            <p className="text-sm text-zinc-700 leading-relaxed">
              Welcome to <strong>QuickMart</strong>. These Terms and Conditions ("Terms") govern your use of the QuickMart platform, including our website, mobile application, and all related services. By accessing or using QuickMart, you agree to be bound by these Terms. If you do not agree, please do not use our services.
            </p>
          </div>

          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <details
                key={idx}
                className="group rounded-2xl border border-zinc-200 overflow-hidden transition-all"
                open={idx === 0}
              >
                <summary className="flex items-center gap-3 p-4 cursor-pointer select-none bg-zinc-50/60 hover:bg-zinc-100/80 transition-colors list-none">
                  <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-600 flex items-center justify-center shrink-0 group-open:bg-rose-600 group-open:text-white group-open:border-rose-600 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-zinc-900 flex-1">{section.title}</span>
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                    {section.items.length} clauses
                  </span>
                  <span className="text-xs text-zinc-400 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="p-4 pt-2 space-y-3 border-t border-zinc-100">
                  {section.items.map((item, i) => (
                    <div key={i} className="pl-4 border-l-2 border-zinc-200">
                      <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">
                        {idx + 1}.{i + 1} — {item.label}
                      </p>
                      <p className="text-[13px] text-zinc-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}

          {/* Contact */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-zinc-600" />
              <span className="font-bold text-sm text-zinc-900">Questions About These Terms?</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              If you have any questions or concerns about these Terms, please reach out to our legal team at{' '}
              <span className="font-bold text-rose-600">legal@quickmart.delivery</span> or contact our 24/7 support at{' '}
              <span className="font-bold text-rose-600">support@quickmart.delivery</span>.
            </p>
          </div>

          {/* Agreement Footer */}
          <div className="text-center pt-4 pb-2">
            <p className="text-[11px] text-zinc-400">
              By continuing to use QuickMart, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
