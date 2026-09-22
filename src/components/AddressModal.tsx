import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, MapPin, Home, Briefcase, Plus, Check, Navigation, Loader2, Search, ChevronLeft, LocateFixed, Building2, Pencil } from 'lucide-react';

interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
  area: string;
  city: string;
  fullAddress: string;
}

interface SavedAddress {
  id: number;
  type: string;
  label: string;
  address: string;
  time: string;
  icon: React.FC<{ className?: string }>;
}

type ModalView = 'list' | 'detecting' | 'confirm' | 'search';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onSelectAddress: (addr: string) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onSelectAddress
}) => {
  const [view, setView] = useState<ModalView>('list');
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    { id: 1, type: 'home', label: 'Home', address: 'Flat 402, Sunshine Heights, Indiranagar, Bengaluru', time: '8-10 MINS', icon: Home },
    { id: 2, type: 'work', label: 'Work', address: 'Floor 5, WeWork Galaxy, Residency Road, Bengaluru', time: '6-8 MINS', icon: Briefcase },
    { id: 3, type: 'other', label: 'Gym / Fitness Club', address: 'Cult.Fit, 100ft Road, Indiranagar, Bengaluru', time: '10-12 MINS', icon: MapPin },
  ]);

  const [geoResult, setGeoResult] = useState<GeoResult | null>(null);
  const [geoError, setGeoError] = useState('');
  const [houseFloor, setHouseFloor] = useState('');
  const [landmark, setLandmark] = useState('');
  const [saveAs, setSaveAs] = useState<'home' | 'work' | 'other'>('home');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [newAddrInput, setNewAddrInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setView('list');
      setGeoResult(null);
      setGeoError('');
      setHouseFloor('');
      setLandmark('');
      setSaveAs('home');
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat: number, lng: number): Promise<GeoResult | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'QuickMart-App/1.0' } }
      );
      const data = await res.json();
      if (!data?.display_name) return null;

      const p = data.address || {};
      const area = p.suburb || p.neighbourhood || p.quarter || p.residential || p.village || '';
      const road = p.road || p.pedestrian || p.footway || '';
      const houseNum = p.house_number || '';
      const building = p.building || '';
      const city = p.city || p.town || p.municipality || p.state_district || '';
      const state = p.state || '';
      const postcode = p.postcode || '';

      const displayParts = [
        building || houseNum ? `${building} ${houseNum}`.trim() : '',
        road,
        area
      ].filter(Boolean);
      const displayName = displayParts.join(', ') || data.display_name.split(',').slice(0, 3).join(',');

      const fullParts = [road, area, city, state, postcode].filter(Boolean);
      const fullAddress = fullParts.join(', ') || data.display_name;

      return { lat, lng, displayName, area, city, fullAddress };
    } catch {
      return null;
    }
  };

  // Detect current location via GPS
  const handleDetectLocation = useCallback(() => {
    setGeoError('');
    setView('detecting');

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setView('list');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const result = await reverseGeocode(latitude, longitude);

        if (result) {
          setGeoResult(result);
          setView('confirm');
        } else {
          setGeoError('Could not determine your address. Please try again.');
          setView('list');
        }
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location access denied. Enable location permission in your browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('Location unavailable. Make sure GPS is enabled on your device.');
            break;
          case err.TIMEOUT:
            setGeoError('Location request timed out. Check your GPS signal and try again.');
            break;
          default:
            setGeoError('An unknown error occurred while fetching location.');
        }
        setView('list');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }, []);

  // Search for addresses using Nominatim
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&countrycodes=in`,
          { headers: { 'Accept-Language': 'en', 'User-Agent': 'QuickMart-App/1.0' } }
        );
        const data = await res.json();
        const results: GeoResult[] = data.map((item: any) => {
          const p = item.address || {};
          const area = p.suburb || p.neighbourhood || p.village || '';
          const city = p.city || p.town || p.state_district || '';
          const road = p.road || p.pedestrian || '';
          const displayName = [road, area, city].filter(Boolean).join(', ') || item.display_name.split(',').slice(0, 3).join(',');
          return {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            displayName,
            area,
            city,
            fullAddress: item.display_name
          };
        });
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  // Select a search result → go to confirm
  const handleSelectSearchResult = (result: GeoResult) => {
    setGeoResult(result);
    setView('confirm');
  };

  // Confirm and save the address
  const handleConfirmAddress = () => {
    if (!geoResult) return;

    const details = [houseFloor, landmark].filter(Boolean).join(', ');
    const finalAddress = details
      ? `${details}, ${geoResult.fullAddress}`
      : geoResult.fullAddress;

    const labelMap = { home: 'Home', work: 'Work', other: 'Other' };
    const iconMap = { home: Home, work: Briefcase, other: MapPin };

    const newEntry: SavedAddress = {
      id: Date.now(),
      type: saveAs,
      label: labelMap[saveAs],
      address: finalAddress,
      time: '5-10 MINS',
      icon: iconMap[saveAs]
    };

    setAddresses(prev => [newEntry, ...prev]);
    onSelectAddress(finalAddress);
    onClose();
  };

  // Add manual address
  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrInput.trim()) return;
    const newEntry: SavedAddress = {
      id: Date.now(),
      type: 'other',
      label: 'Other',
      address: newAddrInput.trim(),
      time: '10 MINS',
      icon: MapPin
    };
    setAddresses(prev => [...prev, newEntry]);
    onSelectAddress(newEntry.address);
    setNewAddrInput('');
    setShowAddForm(false);
    onClose();
  };

  if (!isOpen) return null;

  // ──────────────── DETECTING VIEW ────────────────
  if (view === 'detecting') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col items-center py-16 px-8">
          {/* Pulsing radar animation */}
          <div className="relative mb-8">
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-blue-500/10 animate-ping" />
            <div className="absolute inset-2 w-20 h-20 rounded-full bg-blue-500/15 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <LocateFixed className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="font-extrabold text-lg text-zinc-900 mb-2">Detecting Your Location</h3>
          <p className="text-sm text-zinc-500 text-center mb-6 max-w-xs">
            Using high-accuracy GPS to pinpoint your exact delivery location...
          </p>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-full">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Accessing GPS satellites</span>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────── CONFIRM LOCATION VIEW ────────────────
  if (view === 'confirm' && geoResult) {
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${geoResult.lng - 0.004},${geoResult.lat - 0.002},${geoResult.lng + 0.004},${geoResult.lat + 0.002}&layer=mapnik&marker=${geoResult.lat},${geoResult.lng}`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
            <button
              onClick={() => setView('list')}
              className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 text-zinc-600 flex items-center justify-center border border-zinc-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-extrabold text-base text-zinc-900">Confirm Delivery Location</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 text-zinc-600 flex items-center justify-center border border-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Map Preview */}
          <div className="relative w-full h-48 bg-zinc-100">
            <iframe
              src={mapUrl}
              className="w-full h-full border-0"
              title="Location preview"
              loading="eager"
            />
            {/* Pin overlay for better visibility */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 ring-4 ring-white">
                  <MapPin className="w-4 h-4 fill-white" />
                </div>
                <div className="w-2 h-2 rounded-full bg-rose-600 mt-0.5 shadow-md" />
              </div>
            </div>
            {/* Re-detect button */}
            <button
              onClick={handleDetectLocation}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white hover:bg-zinc-50 text-xs font-bold text-blue-600 shadow-lg border border-zinc-200 flex items-center gap-1.5"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              Re-detect
            </button>
          </div>

          {/* Address Details */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Detected Address */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <Navigation className="w-3 h-3" /> Detected Location
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  GPS Accurate
                </span>
              </div>
              <p className="text-sm font-bold text-zinc-900 leading-snug">{geoResult.displayName}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{geoResult.city}</p>
            </div>

            {/* House / Flat / Floor */}
            <div>
              <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5 block">
                House / Flat / Floor No. *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={houseFloor}
                  onChange={(e) => setHouseFloor(e.target.value)}
                  placeholder="e.g., Flat 402, 4th Floor, Tower B"
                  className="w-full text-sm p-3 pl-10 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Landmark */}
            <div>
              <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5 block">
                Nearby Landmark (Optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g., Near Metro Station, Opposite Big Bazaar"
                  className="w-full text-sm p-3 pl-10 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Save As */}
            <div>
              <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-2 block">
                Save As
              </label>
              <div className="flex gap-2">
                {([
                  { key: 'home' as const, label: 'Home', icon: Home },
                  { key: 'work' as const, label: 'Work', icon: Briefcase },
                  { key: 'other' as const, label: 'Other', icon: MapPin },
                ]).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSaveAs(key)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border-2 transition-all ${
                      saveAs === key
                        ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/20'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-rose-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmAddress}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-extrabold text-sm shadow-lg shadow-rose-600/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm & Deliver Here
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────── SEARCH VIEW ────────────────
  if (view === 'search') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[80vh]">
          {/* Search Header */}
          <div className="p-4 border-b border-zinc-100 bg-zinc-50">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setView('list')}
                className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 text-zinc-600 flex items-center justify-center border border-zinc-200 shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="font-extrabold text-base text-zinc-900">Search Location</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search for area, street, or landmark..."
                className="w-full text-sm p-3 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:border-rose-500 transition-colors"
                autoFocus
              />
              {searchLoading && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="p-4 space-y-2 overflow-y-auto flex-1">
            {/* Use Current Location option in search */}
            <button
              onClick={() => { handleDetectLocation(); }}
              className="w-full p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-left flex items-center gap-3 transition-colors border border-blue-100"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <LocateFixed className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-blue-700 block">Use Current Location</span>
                <span className="text-[11px] text-blue-500">Via GPS</span>
              </div>
            </button>

            {searchQuery.trim().length >= 3 && searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-8 text-zinc-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}

            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSearchResult(result)}
                className="w-full p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-left flex items-start gap-3 transition-colors border border-zinc-100"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-zinc-900 block truncate">{result.displayName}</span>
                  <span className="text-[11px] text-zinc-500 block truncate">{result.fullAddress}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────── DEFAULT LIST VIEW ────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[80vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-lg text-zinc-900">Select Delivery Location</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 text-zinc-600 flex items-center justify-center border border-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          {/* Search Bar */}
          <button
            onClick={() => {
              setView('search');
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            className="w-full p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-left flex items-center gap-2.5 transition-colors"
          >
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-sm text-zinc-400">Search for area, street, or landmark...</span>
          </button>

          {/* Detect Location Button */}
          <button
            onClick={handleDetectLocation}
            className="w-full p-3.5 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-zinc-900 flex items-center gap-3 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-blue-500/20">
              <LocateFixed className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <span className="font-extrabold text-sm block">Detect Current Location</span>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Using GPS
              </span>
            </div>
            <Navigation className="w-4 h-4 text-blue-500 shrink-0" />
          </button>

          {geoError && (
            <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{geoError}</span>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Saved Addresses</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          {/* Saved Addresses */}
          {addresses.map((addr) => {
            const Icon = addr.icon;
            const isSelected = currentAddress === addr.address;
            return (
              <div
                key={addr.id}
                onClick={() => {
                  onSelectAddress(addr.address);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-rose-50/70 border-rose-500 text-zinc-900 shadow-xs'
                    : 'bg-zinc-50/60 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-rose-600 text-white' : 'bg-white text-zinc-600 border border-zinc-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-zinc-900">{addr.label}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                        {addr.time}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed line-clamp-2">{addr.address}</p>
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-rose-600 shrink-0 mt-1" />
                )}
              </div>
            );
          })}

          {/* Add New Address */}
          {showAddForm ? (
            <form onSubmit={handleAddNew} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="relative">
                <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={newAddrInput}
                  onChange={(e) => setNewAddrInput(e.target.value)}
                  placeholder="Enter complete address with pincode..."
                  className="w-full text-xs p-2.5 pl-9 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:border-rose-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Save & Select
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-rose-400 text-zinc-600 hover:text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
