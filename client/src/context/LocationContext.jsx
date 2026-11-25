import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getCities } from '../services/api';
import LocationUnavailableModal from '../components/LocationUnavailableModal';

// ─── TEMPORARY SERVICE RESTRICTION CONFIG ───────────────────────────────────
// To unlock all cities in the future, simply switch this flag to false:
export const ONLY_BHUBANESWAR_ACTIVE = true;

export const isSupportedCity = (cityName = '') => {
  if (!ONLY_BHUBANESWAR_ACTIVE) return true;
  if (!cityName) return false;
  const normalized = String(cityName).trim().toLowerCase();
  return (
    normalized === 'bhubaneswar' ||
    normalized === 'bbsr' ||
    normalized.startsWith('bhubaneswar') ||
    normalized.startsWith('bbsr')
  );
};

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [cities, setCities] = useState([]);

  // Popup modal state for unsupported city attempts
  const [unavailableCity, setUnavailableCity] = useState(null);
  const clearUnavailableCity = useCallback(() => setUnavailableCity(null), []);

  // Force default to Bhubaneswar if ONLY_BHUBANESWAR_ACTIVE is true
  const [selectedLocation, setSelectedLocationState] = useState(() => {
    const saved = localStorage.getItem('selectedLocation');
    if (ONLY_BHUBANESWAR_ACTIVE) {
      if (!saved || !isSupportedCity(saved)) {
        localStorage.setItem('selectedLocation', 'Bhubaneswar');
        return 'Bhubaneswar';
      }
    }
    return saved || 'Bhubaneswar';
  });

  const [cityId, setCityId] = useState(() => {
    return localStorage.getItem('selectedCityId') || '';
  });

  const [selectedCity, setSelectedCityState] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedCityObj');
      const parsed = saved ? JSON.parse(saved) : null;
      if (ONLY_BHUBANESWAR_ACTIVE && parsed && !isSupportedCity(parsed.name)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  // On initial mount, verify and enforce Bhubaneswar in localStorage
  useEffect(() => {
    if (ONLY_BHUBANESWAR_ACTIVE) {
      const savedLoc = localStorage.getItem('selectedLocation');
      if (savedLoc && !isSupportedCity(savedLoc)) {
        localStorage.setItem('selectedLocation', 'Bhubaneswar');
        setSelectedLocationState('Bhubaneswar');
      }
    }
  }, []);

  const refreshCities = useCallback(async () => {
    try {
      const res = await getCities();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCities(res.data.data);

        // Always resolve Bhubaneswar record
        const bhubaneswarCity = res.data.data.find(
          (c) => isSupportedCity(c.name) || isSupportedCity(c.slug)
        );

        if (ONLY_BHUBANESWAR_ACTIVE) {
          if (bhubaneswarCity) {
            setCityId(bhubaneswarCity._id);
            setSelectedCityState(bhubaneswarCity);
            localStorage.setItem('selectedLocation', 'Bhubaneswar');
            localStorage.setItem('selectedCityId', bhubaneswarCity._id);
            localStorage.setItem('selectedCityObj', JSON.stringify(bhubaneswarCity));
          }
        } else {
          // Normal multi-city resolution when restriction is inactive
          const currentLoc = localStorage.getItem('selectedLocation') || 'Bhubaneswar';
          const match = res.data.data.find(
            (c) =>
              c.name.toLowerCase() === currentLoc.toLowerCase() ||
              currentLoc.toLowerCase().startsWith(c.name.toLowerCase()) ||
              c.name.toLowerCase().includes(currentLoc.toLowerCase())
          );

          if (match) {
            if (!localStorage.getItem('selectedCityId')) {
              setCityId(match._id);
              localStorage.setItem('selectedCityId', match._id);
            }
            if (!localStorage.getItem('selectedCityObj')) {
              setSelectedCityState(match);
              localStorage.setItem('selectedCityObj', JSON.stringify(match));
            }
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load cities in LocationContext:', err);
    }
  }, []);

  // Fetch active cities on mount
  useEffect(() => {
    refreshCities();
  }, [refreshCities]);

  const setSelectedLocation = (locationName, optionalCityId) => {
    if (!locationName) return false;

    // Block any unsupported city if restriction is active
    if (!isSupportedCity(locationName)) {
      setUnavailableCity(locationName);
      return false;
    }

    setSelectedLocationState(locationName);
    localStorage.setItem('selectedLocation', locationName);

    // Resolve parent city from loaded cities list
    let resolvedId = optionalCityId;
    let resolvedCity = null;

    if (!resolvedId && cities.length > 0) {
      resolvedCity = cities.find(
        (c) =>
          c.name.toLowerCase() === locationName.toLowerCase() ||
          locationName.toLowerCase().startsWith(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(locationName.toLowerCase())
      );
      if (resolvedCity) resolvedId = resolvedCity._id;
    }

    if (resolvedId) {
      setCityId(resolvedId);
      localStorage.setItem('selectedCityId', resolvedId);
    }
    if (resolvedCity) {
      setSelectedCityState(resolvedCity);
      localStorage.setItem('selectedCityObj', JSON.stringify(resolvedCity));
    }
    return true;
  };

  const setSelectedCity = (cityObj, subRegionName) => {
    if (!cityObj) return false;
    const targetName = subRegionName || cityObj.name;

    // Block any unsupported city if restriction is active
    if (!isSupportedCity(targetName) && !isSupportedCity(cityObj.name)) {
      setUnavailableCity(targetName);
      return false;
    }

    const displayName = subRegionName || cityObj.name;
    setSelectedLocationState(displayName);
    setCityId(cityObj._id);
    setSelectedCityState(cityObj);

    localStorage.setItem('selectedLocation', displayName);
    localStorage.setItem('selectedCityId', cityObj._id);
    localStorage.setItem('selectedCityObj', JSON.stringify(cityObj));
    return true;
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        selectedCity,
        setSelectedCity,
        city: selectedLocation,
        cityId,
        setCityId,
        cities,
        refreshCities,
        unavailableCity,
        setUnavailableCity,
        clearUnavailableCity,
        isSupportedCity,
        ONLY_BHUBANESWAR_ACTIVE
      }}
    >
      {children}
      {/* Shared Global Popup Modal mounted across the entire app */}
      <LocationUnavailableModal />
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  return useContext(LocationContext);
};
