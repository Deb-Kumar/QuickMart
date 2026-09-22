import React, { useEffect } from 'react';
import { X, ShieldCheck, Lock, Eye, Database, Bell, Cookie, UserCheck, Globe, Mail } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
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
      icon: Database,
      title: 'Information We Collect',
      content: [
        '**Personal Information:** Name, email address, phone number, and delivery address when you create an account or place an order.',
        '**Order Data:** Items purchased, order history, payment method (last 4 digits only), delivery preferences, and feedback.',
        '**Device Information:** Device type, operating system, browser type, IP address, and unique device identifiers for app optimization.',
        '**Location Data:** GPS coordinates (only when you grant permission) to enable accurate delivery and show nearby dark store availability.',
        '**Usage Analytics:** Pages visited, features used, search queries, and interaction patterns to improve your shopping experience.'
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: [
        '**Order Fulfillment:** Processing, packing, and delivering your grocery orders within our 10-minute delivery promise.',
        '**Personalization:** Tailoring product recommendations, AI-powered meal planning suggestions, and smart shopping features to your preferences.',
        '**Communication:** Sending order confirmations, delivery updates, promotional offers (with your consent), and critical service notifications.',
        '**Service Improvement:** Analyzing usage patterns to improve our app, optimize delivery routes, and enhance dark store operations.',
        '**Security:** Preventing fraud, protecting your account, and ensuring safe transactions across our platform.'
      ]
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: [
        'All data transmissions are encrypted using industry-standard TLS 1.3 encryption protocols.',
        'Payment information is processed through PCI-DSS Level 1 compliant payment gateways. We never store full card details on our servers.',
        'Passwords are hashed using bcrypt with salt rounds, ensuring they cannot be reverse-engineered.',
        'We employ Firebase Authentication with multi-factor authentication support for account security.',
        'Regular security audits and penetration testing are conducted to identify and address vulnerabilities.'
      ]
    },
    {
      icon: Cookie,
      title: 'Cookies & Local Storage',
      content: [
        '**Essential Cookies:** Required for core functionality like authentication, cart persistence, and session management.',
        '**Analytics Cookies:** Google Analytics and Firebase Analytics help us understand user behavior and improve our service.',
        '**Preference Cookies:** Store your language, theme, delivery address, and notification preferences locally.',
        'You can manage cookie preferences in your browser settings. Disabling essential cookies may affect app functionality.'
      ]
    },
    {
      icon: UserCheck,
      title: 'Third-Party Services',
      content: [
        '**Firebase (Google):** Authentication, real-time database, cloud storage, and crash reporting.',
        '**Google Gemini AI:** Powers our AI Chef Assistant, Meal Planner, and Smart Substitute recommendations. Queries are sent anonymously without personal identifiers.',
        '**OpenStreetMap Nominatim:** Reverse geocoding for address detection. Only coordinates are shared; no personal data.',
        '**Payment Processors:** Razorpay / Stripe for secure payment processing, governed by their respective privacy policies.',
        'We do not sell, rent, or trade your personal information to any third party for marketing purposes.'
      ]
    },
    {
      icon: Bell,
      title: 'Your Rights & Choices',
      content: [
        '**Access:** Request a copy of all personal data we hold about you at any time.',
        '**Correction:** Update or correct inaccurate personal information through your account settings.',
        '**Deletion:** Request complete deletion of your account and associated data (subject to legal retention requirements).',
        '**Opt-Out:** Unsubscribe from marketing communications, disable push notifications, or revoke location permissions.',
        '**Data Portability:** Export your order history and account data in a machine-readable format.',
        '**Complaint:** File a complaint with the relevant data protection authority if you believe your rights have been violated.'
      ]
    },
    {
      icon: Globe,
      title: 'Data Retention & Transfers',
      content: [
        'Account data is retained for as long as your account is active, plus 30 days after deletion request for recovery purposes.',
        'Order history and transaction records are retained for 7 years as required by financial regulations.',
        'Analytics data is anonymized and aggregated after 26 months.',
        'Data may be processed on servers located in India, the United States, and the European Union through our cloud service providers (Google Cloud Platform).',
        'All international transfers comply with applicable data protection laws including India\'s Digital Personal Data Protection Act (DPDPA) 2023.'
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
        <div className="p-6 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-blue-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-zinc-900">Privacy Policy</h2>
              <p className="text-[11px] text-zinc-500 font-medium">Last updated: September 2026</p>
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
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 mb-4">
            <p className="text-sm text-zinc-700 leading-relaxed">
              At <strong>QuickMart Technologies Inc.</strong>, your privacy is our top priority. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our 10-minute grocery delivery platform. By using QuickMart, you agree to the practices described in this policy.
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
                  <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-600 flex items-center justify-center shrink-0 group-open:bg-blue-600 group-open:text-white group-open:border-blue-600 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-zinc-900 flex-1">{section.title}</span>
                  <span className="text-xs text-zinc-400 group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className="p-4 pt-2 space-y-2.5 border-t border-zinc-100">
                  {section.content.map((item, i) => (
                    <p key={i} className="text-[13px] text-zinc-600 leading-relaxed pl-4 border-l-2 border-zinc-200">
                      {item.split('**').map((part, j) =>
                        j % 2 === 1 ? <strong key={j} className="text-zinc-800">{part}</strong> : part
                      )}
                    </p>
                  ))}
                </div>
              </details>
            );
          })}

          {/* Contact */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-zinc-600" />
              <span className="font-bold text-sm text-zinc-900">Contact Our Privacy Team</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              For any privacy-related questions, data access requests, or concerns, please contact us at{' '}
              <span className="font-bold text-rose-600">privacy@quickmart.delivery</span> or write to:
              QuickMart Technologies Inc., 4th Floor, Innovation Tower, HSR Layout, Bengaluru - 560102, India.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
