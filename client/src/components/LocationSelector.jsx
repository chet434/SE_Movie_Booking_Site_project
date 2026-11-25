import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  IconSearch,
  IconCurrentLocation
} from '@tabler/icons-react';
import { useLocationContext, isSupportedCity, ONLY_BHUBANESWAR_ACTIVE } from '../context/LocationContext';
import { detectCity } from '../services/api';
import '../styles/location-modal.css';

// ─── 10 LANDMARK SVG ICONS ──────────────────────────────────────────────────
const GatewayOfIndiaIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={active ? 1.6 : 1.3} strokeLinecap="round" strokeLinejoin="round">
    {/* Base foundation */}
    <path d="M4 42h40" />
    <path d="M7 39h34" />
    {/* Main columns */}
    <path d="M9 39V18h3v21" />
    <path d="M36 39V18h3v21" />
    <path d="M16 39V22h2v17" />
    <path d="M30 39V22h2v17" />
    {/* Central Arch */}
    <path d="M18 39v-13c0-3.3 2.7-6 6-6s6 2.7 6 6v13" />
    <path d="M21 39v-11c0-1.7 1.3-3 3-3s3 1.3 3 3v11" />
    {/* Top entablature & parapet */}
    <path d="M8 18h32v-3H8v3z" />
    <path d="M10 15h28v-3H10v3z" />
    {/* Cornice details */}
    <path d="M12 12v-2h4v2M22 12v-2h4v2M32 12v-2h4v2" />
    {/* Side turrets / chhatris */}
    <path d="M9 12V8l2-2 2 2v4" />
    <path d="M35 12V8l2-2 2 2v4" />
    {/* Central small dome */}
    <path d="M20 9c0-2.2 1.8-4 4-4s4 1.8 4 4v3h-8V9z" />
    <path d="M24 5V3" />
  </svg>
);

const IndiaGateIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={active ? 1.6 : 1.3} strokeLinecap="round" strokeLinejoin="round">
    {/* Steps base */}
    <path d="M5 43h38" />
    <path d="M7 40h34" />
    <path d="M9 37h30" />
    {/* Main massive pylons */}
    <path d="M11 37V18" />
    <path d="M37 37V18" />
    <path d="M17 37V24" />
    <path d="M31 37V24" />
    {/* Central monumental arch */}
    <path d="M17 24c0-3.9 3.1-7 7-7s7 3.1 7 7v13H17V24z" />
    {/* Internal arch moulding */}
    <path d="M19 25c0-2.8 2.2-5 5-5s5 2.2 5 5v12H19V25z" />
    {/* Heavy beam / lintel */}
    <path d="M10 18h28v-4H10v4z" />
    {/* Stepped top attic */}
    <path d="M12 14h24v-3H12v3z" />
    <path d="M15 11h18V8H15v3z" />
    <path d="M19 8h10V6H19v2z" />
    {/* Shallow bowl finial */}
    <path d="M22 6c0-.6.9-1 2-1s2 .4 2 1h-4z" />
  </svg>
);

const VidhanaSoudhaIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={active ? 1.6 : 1.3} strokeLinecap="round" strokeLinejoin="round">
    {/* Ground and stepped plinth */}
    <path d="M4 42h40" />
    <path d="M7 39h34" />
    {/* Main facade colonnade */}
    <path d="M8 39V24h32v15" />
    <path d="M12 39V24M16 39V24M20 39V24M28 39V24M32 39V24M36 39V24" />
    {/* Central entrance arch */}
    <path d="M21 39v-8c0-1.7 1.3-3 3-3s3 1.3 3 3v8" />
    {/* Cornice line */}
    <path d="M6 24h36v-3H6v3z" />
    {/* Left and Right chhatris */}
    <path d="M8 21v-5l3-2 3 2v5" />
    <path d="M34 21v-5l3-2 3 2v5" />
    {/* Central grand ribbed dome with drum */}
    <path d="M19 21v-4h10v4" />
    <path d="M18 17c0-3.3 2.7-6 6-6s6 2.7 6 6H18z" />
    <path d="M24 11V7l1-2" />
    <path d="M24 5v-2" />
  </svg>
);

const CharminarIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={active ? 1.6 : 1.3} strokeLinecap="round" strokeLinejoin="round">
    {/* Base plinth */}
    <path d="M5 42h38" />
    {/* Left outer and inner minaret lines */}
    <path d="M7 42V14l1.5-6L10 6l1.5 2L13 14v28" />
    {/* Right outer and inner minaret lines */}
    <path d="M35 42V14l1.5-6L38 6l1.5 2L41 14v28" />
    {/* Minaret balcony rings */}
    <path d="M6 31h8M6 20h8" />
    <path d="M34 31h8M34 20h8" />
    {/* Central structure */}
    <path d="M13 36h22v-18H13v18z" />
    {/* Great central arch */}
    <path d="M18 42v-12c0-3.3 2.7-6 6-6s6 2.7 6 6v12" />
    {/* Upper decorative arcade row */}
    <path d="M14 22h20v-4H14v4z" />
    <path d="M16 22v-3M20 22v-3M24 22v-3M28 22v-3M32 22v-3" />
    {/* Upper dome chhatris */}
    <path d="M20 18c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    <path d="M24 14V11" />
  </svg>
);

const ChandigarhHandIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={active ? 1.6 : 1.3} strokeLinecap="round" strokeLinejoin="round">
    {/* Ground & stepped base */}
    <path d="M8 43h32" />
    <path d="M14 40h20" />
    {/* Pylon / pedestal */}
    <path d="M22 40v-10h4v10" />
    <path d="M20 30h8v-3h-8v3z" />
    {/* Rotating hinge bearing */}
    <circle cx="24" cy="25" r="2" />
    {/* Le Corbusier Open Hand Monument outline */}
    <path d="M24 23v-5c0-1.1-.9-2-2-2s-2 .9-2 2v3c-1.5-.8-3-1-4-.5s-1.2 1.8-.7 3l3.7 4.5" />
    <path d="M24 18v-7c0-1.1.9-2 2-2s2 .9 2 2v7" />
    <path d="M28 12c0-1.1.9-2 2-2s2 .9 2 2v8" />
    <path d="M32 15c0-1.1.9-2 2-2s2 .9 2 2v6c0 4-3 7-7 8h-4" />
    <path d="M19 21c-2-1.5-4 0-4 1.5s2 3 5 5" />
  </svg>
);

const SidiSaiyyedIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={active ? 1.6 : 1.3} strokeLinecap="round" strokeLinejoin="round">
    {/* Base line */}
    <path d="M5 42h38" />
    {/* Left minaret tower */}
    <path d="M7 42V16l2-6 2 6v26" />
    <path d="M6 32h6M6 22h6M8 10V7" />
    {/* Right minaret tower */}
    <path d="M37 42V16l2-6 2 6v26" />
    <path d="M36 32h6M36 22h6M38 10V7" />
    {/* Central mosque wall */}
    <path d="M11 42V20h26v22" />
    {/* Arch with Sidi Saiyyed tree-of-life jali pattern */}
    <path d="M17 42v-11c0-3.9 3.1-7 7-7s7 3.1 7 7v11" />
    {/* Tree of life branch motif inside the arch */}
    <path d="M24 35v-9" />
    <path d="M24 29c-2-1.5-3.5-1-4 0" />
    <path d="M24 29c2-1.5 3.5-1 4 0" />
    <path d="M24 26c-1.5-1.5-2.5-1-3 0" />
    <path d="M24 26c1.5-1.5 2.5-1 3 0" />
    {/* Parapet battlements */}
    <path d="M11 20h26v-3H11v3z" />
    <path d="M14 17v-2h3v2M20 17v-2h3v2M26 17v-2h3v2M32 17v-2h3v2" />
  </svg>
);

const ShaniwarWadaIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={active ? 1.6 : 1.3} strokeLinecap="round" strokeLinejoin="round">
    {/* Ground base */}
    <path d="M4 42h40" />
    {/* Left semi-circular bastion tower */}
    <path d="M7 42V20c0-2.2 1.8-4 4-4h2v26" />
    <path d="M7 26h6M7 34h6" />
    {/* Right semi-circular bastion tower */}
    <path d="M35 42V16h2c2.2 0 4 1.8 4 4v22" />
    <path d="M35 26h6M35 34h6" />
    {/* Central Dilli Darwaza recessed curtain wall */}
    <path d="M13 38h22V16H13v22z" />
    {/* Pointed fortress gateway arch */}
    <path d="M19 42v-10l5-4 5 4v10" />
    {/* Spiked wooden gates */}
    <path d="M24 42V29" />
    <path d="M21 34h1M27 34h1M21 38h1M27 38h1" />
    {/* Upper wooden Nagarkhana gallery */}
    <path d="M11 16h26v-5H11v5z" />
    <path d="M13 11V7l2-2h18l2 2v4" />
    <path d="M17 11V8M24 11V8M31 11V8" />
  </svg>
);

const TempleGopuramIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={active ? 1.6 : 1.3} strokeLinecap="round" strokeLinejoin="round">
    {/* Base entrance level */}
    <path d="M6 43h36" />
    <path d="M8 39h32v4H8v-4z" />
    {/* Gateway opening */}
    <path d="M20 43v-7c0-2.2 1.8-4 4-4s4 1.8 4 4v7" />
    {/* Stepped diminishing pyramidal tiers */}
    <path d="M10 39l2-6h24l2 6" />
    <path d="M12 33h24v-1H12v1z" />
    <path d="M13 32l2-6h18l2 6" />
    <path d="M15 26h18v-1H15v1z" />
    <path d="M16 25l2-6h12l2 6" />
    <path d="M18 19h12v-1H18v1z" />
    <path d="M19 18l1.5-5h7l1.5 5" />
    {/* Barrel vault / Sala roof finial */}
    <path d="M19 13c0-1.7 2.2-3 5-3s5 1.3 5 3H19z" />
    {/* Golden Kalasam spires */}
    <path d="M21 10V7M24 10V6M27 10V7" />
  </svg>
);

const VictoriaMemorialIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={active ? 1.6 : 1.3} strokeLinecap="round" strokeLinejoin="round">
    {/* Ground steps */}
    <path d="M4 42h40" />
    <path d="M7 39h34" />
    {/* Colonnade wings */}
    <path d="M8 39v-12h32v12" />
    <path d="M12 39v-11M16 39v-11M32 39v-11M36 39v-11" />
    {/* Central pedimented portico */}
    <path d="M19 39v-13h10v13" />
    <path d="M17 26l7-5 7 5H17z" />
    {/* Main central Renaissance dome with drum */}
    <path d="M18 21v-4h12v4" />
    <path d="M17 17c0-3.9 3.1-7 7-7s7 3.1 7 7H17z" />
    {/* Angel of Victory finial */}
    <path d="M24 10V6" />
    <path d="M22 6l2-2 2 2-2 1-2-1z" />
    {/* Corner cupolas / domes */}
    <path d="M9 27v-3c0-1.7 1.3-3 3-3s3 1.3 3 3v3" />
    <path d="M33 27v-3c0-1.7 1.3-3 3-3s3 1.3 3 3v3" />
  </svg>
);

const KeralaHouseboatIcon = ({ active }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={active ? 1.6 : 1.3} strokeLinecap="round" strokeLinejoin="round">
    {/* Backwaters wave lines */}
    <path d="M5 42c3-.8 6-.8 9 0s6 .8 9 0 6-.8 9 0 6 .8 9 0" />
    <path d="M8 45c3-.6 6-.6 9 0s6 .6 9 0 6-.6 9 0" />
    {/* Kettuvallam hull with curved prow and stern */}
    <path d="M7 38c5 2 24 2 34-1l-3 4H10l-3-3z" />
    {/* Thatched curved roof */}
    <path d="M13 37v-9c0-2.2 1.8-4 4-4h14c2.2 0 4 1.8 4 4v9" />
    <path d="M14 28h20" />
    <path d="M14 32h20" />
    {/* Houseboat windows / arches */}
    <path d="M17 37v-4h3v4M23 37v-4h3v4M29 37v-4h3v4" />
    {/* Left Coconut Palm Tree */}
    <path d="M7 37c-1-6 2-13 4-18" />
    <path d="M11 19c-2-3-5-4-8-3" />
    <path d="M11 19c0-4-2-6-5-8" />
    <path d="M11 19c2-3 5-4 8-3" />
    <path d="M11 19c3-1 6 0 7 2" />
    {/* Right Coconut Palm Tree */}
    <path d="M41 37c1-6-2-13-4-18" />
    <path d="M37 19c2-3 5-4 8-3" />
    <path d="M37 19c0-4 2-6 5-8" />
    <path d="M37 19c-2-3-5-4-8-3" />
  </svg>
);

// ─── POPULAR CITIES DEFINITION ───────────────────────────────────────────────
const POPULAR_CITIES = [
  {
    name: 'Mumbai',
    slug: 'mumbai',
    hasSubregions: true,
    icon: (active) => <GatewayOfIndiaIcon active={active} />,
    subregions: [
      'Mumbai: Western',
      'Mumbai: South & Central',
      'Navi Mumbai',
      'Thane',
      'Kalyan',
      'Ulhasnagar'
    ]
  },
  {
    name: 'Delhi-NCR',
    slug: 'delhi-ncr',
    hasSubregions: true,
    icon: (active) => <IndiaGateIcon active={active} />,
    subregions: [
      'Delhi',
      'Gurugram (Gurgaon)',
      'Noida',
      'Ghaziabad',
      'Kundli',
      'Greater Noida',
      'Faridabad',
      'Pilkhuwa'
    ]
  },
  {
    name: 'Bengaluru',
    slug: 'bengaluru',
    hasSubregions: false,
    icon: (active) => <VidhanaSoudhaIcon active={active} />
  },
  {
    name: 'Hyderabad',
    slug: 'hyderabad',
    hasSubregions: false,
    icon: (active) => <CharminarIcon active={active} />
  },
  {
    name: 'Chandigarh',
    slug: 'chandigarh',
    hasSubregions: false,
    icon: (active) => <ChandigarhHandIcon active={active} />
  },
  {
    name: 'Ahmedabad',
    slug: 'ahmedabad',
    hasSubregions: false,
    icon: (active) => <SidiSaiyyedIcon active={active} />
  },
  {
    name: 'Pune',
    slug: 'pune',
    hasSubregions: false,
    icon: (active) => <ShaniwarWadaIcon active={active} />
  },
  {
    name: 'Chennai',
    slug: 'chennai',
    hasSubregions: false,
    icon: (active) => <TempleGopuramIcon active={active} />
  },
  {
    name: 'Kolkata',
    slug: 'kolkata',
    hasSubregions: false,
    icon: (active) => <VictoriaMemorialIcon active={active} />
  },
  {
    name: 'Kochi',
    slug: 'kochi',
    hasSubregions: false,
    icon: (active) => <KeralaHouseboatIcon active={active} />
  }
];

const LocationSelector = ({ isOpen = true, onClose }) => {
  const {
    selectedLocation,
    setSelectedLocation,
    setSelectedCity,
    setUnavailableCity,
    cities = []
  } = useLocationContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetro, setSelectedMetro] = useState(null); // 'Mumbai' or 'Delhi-NCR'
  const [showAllCities, setShowAllCities] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // "Oops!" Permission / Position Error Modal
  const [oopsModal, setOopsModal] = useState({
    isOpen: false,
    message: ''
  });

  const searchInputRef = useRef(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      setSearchQuery('');
      setSelectedMetro(null);
      setShowAllCities(false);
      setOopsModal({ isOpen: false, message: '' });
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (oopsModal.isOpen) {
          setOopsModal({ isOpen: false, message: '' });
        } else if (onClose) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, oopsModal.isOpen, onClose]);

  // Listen for close-city-modal event when user clicks "Continue with Bhubaneswar" in Unavailable modal
  useEffect(() => {
    const handleCloseFromUnavailable = () => {
      if (onClose) onClose();
    };
    window.addEventListener('close-city-modal', handleCloseFromUnavailable);
    return () => window.removeEventListener('close-city-modal', handleCloseFromUnavailable);
  }, [onClose]);

  // Determine current active city name
  const currentCityNorm = (selectedLocation || 'Bhubaneswar').toLowerCase();

  // Filter searchable items across Popular, Sub-regions, and All Cities
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matches = [];
    const seenNames = new Set();

    // 1. Check popular cities
    POPULAR_CITIES.forEach((pc) => {
      if (pc.name.toLowerCase().includes(q)) {
        if (!seenNames.has(pc.name)) {
          seenNames.add(pc.name);
          matches.push({ name: pc.name, parentCity: pc.name, badge: 'Popular City' });
        }
      }
      // Check subregions
      if (pc.subregions) {
        pc.subregions.forEach((sub) => {
          if (sub.toLowerCase().includes(q)) {
            if (!seenNames.has(sub)) {
              seenNames.add(sub);
              matches.push({ name: sub, parentCity: pc.name, badge: `${pc.name} Region` });
            }
          }
        });
      }
    });

    // 2. Check all MongoDB cities
    cities.forEach((c) => {
      if (c.name.toLowerCase().includes(q) && !seenNames.has(c.name)) {
        seenNames.add(c.name);
        matches.push({ name: c.name, parentCity: c.name, cityObj: c, badge: c.state || 'City' });
      }
    });

    return matches;
  }, [searchQuery, cities]);

  // Helper to select a city/subregion cleanly
  const handleSelectCity = (cityName, parentCityName) => {
    if (!isSupportedCity(cityName)) {
      setUnavailableCity(cityName);
      return;
    }

    const matchedCityObj = cities.find(
      (c) =>
        c.name.toLowerCase() === (parentCityName || cityName).toLowerCase() ||
        c.slug.toLowerCase() === (parentCityName || cityName).toLowerCase()
    );

    if (matchedCityObj) {
      setSelectedCity(matchedCityObj, cityName !== matchedCityObj.name ? cityName : undefined);
    } else {
      setSelectedLocation(cityName);
    }

    if (onClose) onClose();
  };

  // Click on a popular city card
  const handlePopularCityClick = (cityDef) => {
    if (cityDef.hasSubregions) {
      // Toggle or set sub-regions tray
      setSelectedMetro((prev) => (prev === cityDef.name ? null : cityDef.name));
    } else {
      handleSelectCity(cityDef.name);
    }
  };

  // Real Browser GPS Geolocation Detection
  const handleDetectLocation = () => {
    if (isDetecting) return;

    if (!navigator.geolocation) {
      setOopsModal({
        isOpen: true,
        message: 'Geolocation is not supported by your browser. Please select your city manually.'
      });
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await detectCity(latitude, longitude);

          if (res.data?.success && res.data.data?.city) {
            const detectedCity = res.data.data.city;
            const displayName = detectedCity.name;

            if (!isSupportedCity(displayName)) {
              setUnavailableCity(displayName);
              return;
            }

            setSelectedCity(detectedCity);

            // Show non-intrusive floating toast
            setToastMessage(`Location set to ${displayName}`);
            setTimeout(() => setToastMessage(''), 3500);

            if (onClose) onClose();
          } else {
            setOopsModal({
              isOpen: true,
              message: 'Unable to detect your location right now. Please allow location access and try again.'
            });
          }
        } catch {
          setOopsModal({
            isOpen: true,
            message: 'Unable to detect your location right now. Please allow location access and try again.'
          });
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setOopsModal({
            isOpen: true,
            message: 'Location access denied. Please allow location access and try again.'
          });
        } else {
          // POSITION_UNAVAILABLE or TIMEOUT
          setOopsModal({
            isOpen: true,
            message: 'Unable to detect your location right now. Please allow location access and try again.'
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  if (!isOpen) {
    return toastMessage ? (
      <div className="cb-loc-toast" role="status">
        <IconCurrentLocation size={18} />
        <span>{toastMessage}</span>
      </div>
    ) : null;
  }

  // Active metro subregion object if expanded
  const activeMetroObj = POPULAR_CITIES.find((pc) => pc.name === selectedMetro);

  // Sort other cities alphabetically for 5-col view
  const otherCitiesSorted = [...cities].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {/* Modal Dimmed Backdrop */}
      <div
        className="cb-loc-modal-backdrop"
        onClick={() => {
          if (!oopsModal.isOpen && onClose) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="City Selection"
      >
        <div
          className="cb-loc-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Search Input Row */}
          <div className="cb-loc-search-row">
            <div className="cb-loc-search-wrap">
              <IconSearch size={18} className="cb-loc-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="cb-loc-search-input"
                placeholder="Search for your city"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />

              {/* Dynamic Search Results Dropdown */}
              {searchQuery.trim().length > 0 && (
                <div className="cb-loc-search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        className="cb-loc-search-item"
                        onClick={() => handleSelectCity(item.name, item.parentCity)}
                      >
                        <span className="fw-medium">{item.name}</span>
                        {item.badge && (
                          <span className="cb-loc-search-item-badge">{item.badge}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-muted small">
                      No cities found matching &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* "Detect my location" Action Bar */}
          <div className="cb-loc-detect-bar">
            <button
              type="button"
              className="cb-loc-detect-btn"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              aria-label="Detect my location via GPS"
            >
              {isDetecting ? (
                <>
                  <span className="spinner-border spinner-border-sm text-danger" role="status" aria-hidden="true" />
                  <span>Detecting your location...</span>
                </>
              ) : (
                <>
                  <IconCurrentLocation size={18} stroke={2} />
                  <span>Detect my location</span>
                </>
              )}
            </button>
          </div>

          {/* "Popular Cities" 10-City Monument Grid */}
          <div className="cb-loc-popular-section">
            <h5 className="cb-loc-section-title">Popular Cities</h5>

            <div className="cb-loc-cities-grid">
              {POPULAR_CITIES.map((pc) => {
                const isSelected =
                  currentCityNorm === pc.name.toLowerCase() ||
                  currentCityNorm.startsWith(pc.name.toLowerCase()) ||
                  (pc.subregions && pc.subregions.some((s) => s.toLowerCase() === currentCityNorm)) ||
                  selectedMetro === pc.name;

                return (
                  <button
                    key={pc.name}
                    type="button"
                    className={`cb-loc-city-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handlePopularCityClick(pc)}
                    aria-label={`Select city: ${pc.name}`}
                  >
                    <div className="cb-loc-city-icon-wrap">
                      {pc.icon(isSelected)}
                    </div>
                    <span className="cb-loc-city-name">{pc.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Expandable Metro Sub-Regions Tray (Directly Below 10 Popular Cities) */}
            {activeMetroObj && activeMetroObj.subregions && (
              <div className="cb-loc-subregions-tray" aria-label={`${activeMetroObj.name} sub-regions`}>
                {activeMetroObj.subregions.map((subName) => {
                  const isSubActive = currentCityNorm === subName.toLowerCase();
                  return (
                    <button
                      key={subName}
                      type="button"
                      className={`cb-loc-subregion-btn ${isSubActive ? 'active' : ''}`}
                      onClick={() => handleSelectCity(subName, activeMetroObj.name)}
                    >
                      {subName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* "View All Cities" / "Hide All Cities" Expandable Directory */}
          <div className="cb-loc-all-cities-toggle-wrap">
            <button
              type="button"
              className="cb-loc-all-cities-toggle-btn"
              onClick={() => setShowAllCities((prev) => !prev)}
            >
              {showAllCities ? 'Hide All Cities' : 'View All Cities'}
            </button>
          </div>

          {showAllCities && (
            <div className="cb-loc-other-cities-tray">
              <div className="cb-loc-other-cities-title">Other Cities</div>
              <div className="cb-loc-other-cities-grid">
                {otherCitiesSorted.map((c) => {
                  const isSupported = isSupportedCity(c.name);
                  const isActive = currentCityNorm === c.name.toLowerCase();
                  return (
                    <button
                      key={c._id || c.name}
                      type="button"
                      className={`cb-loc-other-city-link ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectCity(c.name)}
                      title={c.name}
                    >
                      <span>{c.name}</span>
                      {isSupported && (
                        <span
                          className="badge bg-success ms-1"
                          style={{ fontSize: '9px', padding: '2px 5px', verticalAlign: 'middle' }}
                        >
                          Available
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          Nested "Oops!" Error Modal (Exact BookMyShow Dialog)
          ==================================================================== */}
      {oopsModal.isOpen && (
        <div
          className="cb-loc-oops-overlay"
          onClick={() => setOopsModal({ isOpen: false, message: '' })}
          role="alertdialog"
          aria-modal="true"
        >
          <div
            className="cb-loc-oops-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="cb-loc-oops-title">Oops!</h4>
            <p className="cb-loc-oops-msg">{oopsModal.message}</p>
            <button
              type="button"
              className="cb-loc-oops-btn"
              onClick={() => setOopsModal({ isOpen: false, message: '' })}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Non-Intrusive Floating Toast */}
      {toastMessage && (
        <div className="cb-loc-toast" role="status">
          <IconCurrentLocation size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};

export default LocationSelector;
