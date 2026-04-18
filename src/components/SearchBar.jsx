import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchDoctors, searchGeo } from "../services/searchService";

function SearchBar({ variant = "header" }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [locationResults, setLocationResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const searchRef = useRef(null);
  const locationRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const locationTimeoutRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsLocationFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSearchResults = async (value) => {
    setIsLoadingSearch(true);
    const result = await searchDoctors(value);
    if (result.success) {
      setSearchResults(result.data);
    }
    setIsLoadingSearch(false);
  };

  const fetchLocationResults = async (value) => {
    setIsLoadingLocation(true);
    const result = await searchGeo(value);
    if (result.success) {
      setLocationResults(result.data);
    }
    setIsLoadingLocation(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchSearchResults(value);
    }, 300);
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);

    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    if (value.length < 3) {
      setLocationResults([]);
      return;
    }

    locationTimeoutRef.current = setTimeout(() => {
      fetchLocationResults(value);
    }, 300);
  };

  const handleSearchSelect = (item) => {
    setSearchQuery(item.title || "");
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "doctor":
        return "Médecin";
      case "businessSite":
        return "Établissement";
      case "speciality":
        return "Spécialité";
      default:
        return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "doctor":
        return "text-blue-400";
      case "businessSite":
        return "text-green-400";
      case "speciality":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  const handleLocationSelect = (item) => {
    setLocationQuery(item.name || item.label || "");
    setLocationResults([]);
    setIsLocationFocused(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery || locationQuery) {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (locationQuery) params.set("loc", locationQuery);
      navigate(`/search?${params.toString()}`);
    }
  };

  const isCompact = variant === "header";

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex ${isCompact ? "" : "w-full max-w-3xl mx-auto"}`}
    >
      {/* Search Field */}
      <div className="relative flex-1" ref={searchRef}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          placeholder="Nom, spécialité, établissement"
          className={`w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 rounded-l-lg border-r border-gray-600 ${isCompact ? "text-sm" : "py-3"}`}
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {isSearchFocused && (searchResults.length > 0 || isLoadingSearch) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {isLoadingSearch ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                Recherche...
              </div>
            ) : (
              searchResults.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSearchSelect(item)}
                  className="w-full text-left px-4 py-3 text-white hover:bg-gray-600 transition cursor-pointer border-b border-gray-600 last:border-b-0 flex items-center gap-3"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={getTypeColor(item.type)}>
                        {getTypeLabel(item.type)}
                      </span>
                      {item.ville && (
                        <>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{item.ville}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Location Field */}
      <div
        className={`relative ${isCompact ? "w-36" : "w-48"}`}
        ref={locationRef}
      >
        <input
          type="text"
          value={locationQuery}
          onChange={handleLocationChange}
          onFocus={() => setIsLocationFocused(true)}
          placeholder="Où ?"
          className={`w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 rounded-none border-r border-gray-600 ${isCompact ? "text-sm" : "py-3"}`}
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>

        {isLocationFocused &&
          (locationResults.length > 0 || isLoadingLocation) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {isLoadingLocation ? (
                <div className="px-4 py-3 text-gray-400 text-sm">
                  Recherche...
                </div>
              ) : (
                locationResults.map((item, index) => (
                  <button
                    key={item.id || index}
                    type="button"
                    onClick={() => handleLocationSelect(item)}
                    className="w-full text-left px-4 py-3 text-white hover:bg-gray-600 transition cursor-pointer border-b border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium">{item.name || item.label}</div>
                    {item.postalCode && (
                      <div className="text-sm text-gray-400">
                        {item.postalCode}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className={`bg-blue-600 hover:bg-blue-700 text-white font-medium transition cursor-pointer flex items-center justify-center gap-2 rounded-r-lg ${isCompact ? "px-4 py-2 text-sm" : "px-6 py-3"}`}
      >
        <svg
          className={`${isCompact ? "h-4 w-4" : "h-5 w-5"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className={isCompact ? "hidden sm:inline" : ""}>Rechercher</span>
      </button>
    </form>
  );
}

export default SearchBar;
