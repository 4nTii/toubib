import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { search, searchGeo } from "../../services/searchService";
import { buildDoctorSlug } from "../../services/doctorService";
import {
  SearchIcon,
  LocationPinIcon,
  LocationIcon,
  BuildingIcon,
  MedicalIcon,
  RegionIcon,
} from "../icons/IconService";

const CONFIG = {
  DEBOUNCE_DELAY: 300,
  MIN_SEARCH_LENGTH: 3,
  DEFAULT_AVATARS: {
    female: "/images/user/avatar-doctor-female.webp",
    male: "/images/user/avatar-doctor-male.webp",
  },
};

function SearchBar({ variant = "header", initialSearch = "", initialLocation = "" }) {
  const navigate = useNavigate();
  const isCompact = variant === "header";

  // Search state
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [searchResults, setSearchResults] = useState({
    doctors: [],
    businessSite: [],
    specialities: [],
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Location state
  const [locationQuery, setLocationQuery] = useState(initialLocation || "");
  const [locationResults, setLocationResults] = useState({ regions: [], villes: [] });
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [hasSearchedLocation, setHasSearchedLocation] = useState(false);

  // Refs
  const searchRef = useRef(null);
  const locationRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const locationTimeoutRef = useRef(null);

  // Modal state for mobile
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Click outside handler
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

  // Helpers
  const getDoctorImageUrl = (imagePath, gender) => {
    if (imagePath) return imagePath;
    return CONFIG.DEFAULT_AVATARS[gender] || CONFIG.DEFAULT_AVATARS.male;
  };

  const hasResults = () => {
    const { doctors, businessSite, specialities } = searchResults;
    return (
      doctors?.length > 0 ||
      businessSite?.length > 0 ||
      specialities?.length > 0
    );
  };

  const hasLocationResults = () => {
    const { regions, villes } = locationResults;
    return (regions?.length > 0) || (villes?.length > 0);
  };

  // API calls
  const fetchSearchResults = async (value) => {
    setIsLoadingSearch(true);
    const result = await search(value);
    if (result.success) {
      setSearchResults(result.data);
    } else {
      setSearchResults({ doctors: [], businessSite: [], specialities: [] });
    }
    setHasSearched(true);
    setIsLoadingSearch(false);
  };

  const fetchLocationResults = async (value) => {
    setIsLoadingLocation(true);
    const result = await searchGeo(value);
    if (result.success) {
      setLocationResults(result.data);
    } else {
      setLocationResults({ regions: [], villes: [] });
    }
    setHasSearchedLocation(true);
    setIsLoadingLocation(false);
  };

  // Event handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < CONFIG.MIN_SEARCH_LENGTH) {
      setSearchResults({ doctors: [], businessSite: [], specialities: [] });
      setHasSearched(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(
      () => fetchSearchResults(value),
      CONFIG.DEBOUNCE_DELAY,
    );
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);

    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    if (value.length < CONFIG.MIN_SEARCH_LENGTH) {
      setLocationResults({ regions: [], villes: [] });
      setHasSearchedLocation(false);
      return;
    }

    locationTimeoutRef.current = setTimeout(
      () => fetchLocationResults(value),
      CONFIG.DEBOUNCE_DELAY,
    );
  };

  const handleDoctorSelect = (doctor) => {
    const slug = buildDoctorSlug(doctor.firstName, doctor.lastName);
    navigate(`/doctor/${doctor.id}/${slug}`);
    closeSearchDropdown();
  };

  const handleBusinessSiteSelect = (site) => {
    navigate(`/cabinet/${site.id}`);
    closeSearchDropdown();
  };

  const handleSpecialitySelect = (speciality) => {
    setSearchQuery(speciality.name);
    closeSearchDropdown();
  };

  const handleRegionSelect = (location) => {
    setLocationQuery(location);
    closeLocationDropdown();
  };

  const closeLocationDropdown = () => {
    setLocationResults({ regions: [], villes: [] });
    setIsLocationFocused(false);
    setHasSearchedLocation(false);
  };

  const closeSearchDropdown = () => {
    setSearchResults({ doctors: [], businessSite: [], specialities: [] });
    setIsSearchFocused(false);
    setHasSearched(false);
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

  // Render helpers
  const renderDoctorItem = (doctor) => (
    <button
      key={`doctor-${doctor.id}`}
      type="button"
      onClick={() => handleDoctorSelect(doctor)}
      className="w-full text-left px-3 py-2 text-white hover:bg-gray-600 transition cursor-pointer flex items-center gap-2"
    >
      <div className="w-9 h-9 rounded-full bg-gray-600 shrink-0 overflow-hidden">
        <img
          src={getDoctorImageUrl(doctor.image, doctor.gender)}
          alt={doctor.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm truncate">{doctor.name}</div>
        <div className="text-xs text-blue-400">{doctor.speciality}</div>
        {doctor.cities?.length > 0 && (
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <LocationIcon size="2.5" />
            <span className="truncate">{doctor.cities.join(" • ")}</span>
          </div>
        )}
      </div>
    </button>
  );

  const renderBusinessSiteItem = (site) => (
    <button
      key={`site-${site.id}`}
      type="button"
      onClick={() => handleBusinessSiteSelect(site)}
      className="w-full text-left px-3 py-2 text-white hover:bg-gray-600 transition cursor-pointer flex items-center gap-2"
    >
      <div className="w-9 h-9 rounded-lg bg-green-600/20 shrink-0 flex items-center justify-center">
        <BuildingIcon />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm truncate">{site.name}</div>
        <div className="text-xs text-green-400">Etablissement</div>
      </div>
    </button>
  );

  const renderSpecialityItem = (speciality) => (
    <button
      key={`spec-${speciality.id}`}
      type="button"
      onClick={() => handleSpecialitySelect(speciality)}
      className="w-full text-left px-3 py-2 text-white hover:bg-gray-600 transition cursor-pointer flex items-center gap-2"
    >
      <div className="w-9 h-9 rounded-lg bg-purple-600/20 shrink-0 flex items-center justify-center">
        <MedicalIcon />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm truncate">{speciality.name}</div>
        <div className="text-xs text-purple-400">Spécialité</div>
      </div>
    </button>
  );

  const renderSearchResults = () => {
    const { doctors, businessSite, specialities } = searchResults;
    const sections = [];

    if (doctors?.length > 0) {
      sections.push(<div key="doctors">{doctors.map(renderDoctorItem)}</div>);
    }

    if (businessSite?.length > 0) {
      sections.push(
        <div key="businessSite">
          {sections.length > 0 && <div className="border-t border-gray-600" />}
          {businessSite.map(renderBusinessSiteItem)}
        </div>,
      );
    }

    if (specialities?.length > 0) {
      sections.push(
        <div key="specialities">
          {sections.length > 0 && <div className="border-t border-gray-600" />}
          {specialities.map(renderSpecialityItem)}
        </div>,
      );
    }

    return sections;
  };

  const renderLocationItem = (name, type) => {
    const isVille = type === "ville";
    const icon = isVille ? <LocationPinIcon /> : <RegionIcon />;
    const bgColor = isVille ? "bg-blue-600/20" : "bg-orange-600/20";
    const textColor = isVille ? "text-blue-400" : "text-orange-400";
    const label = isVille ? "Ville" : "Région";
    const key = isVille ? `ville-${name}` : `region-${name}`;

    return (
      <button
        key={key}
        type="button"
        onClick={() => handleRegionSelect(name)}
        className="w-full text-left px-3 py-2 text-white hover:bg-gray-600 transition cursor-pointer flex items-center gap-2"
      >
        <div className={`w-9 h-9 rounded-lg ${bgColor} shrink-0 flex items-center justify-center`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm truncate">{name}</div>
          <div className={`text-xs ${textColor}`}>{label}</div>
        </div>
      </button>
    );
  };

  const renderLocationResults = () => {
    const { regions, villes } = locationResults;
    const sections = [];

    if (villes?.length > 0) {
      sections.push(<div key="villes">{villes.map((name) => renderLocationItem(name, "ville"))}</div>);
    }

    if (regions?.length > 0) {
      if (sections.length > 0) {
        sections.push(<div key="divider" className="border-t border-gray-600" />);
      }
      sections.push(<div key="regions">{regions.map((name) => renderLocationItem(name, "region"))}</div>);
    }

    return sections;
  };

  return (
    <>
      {/* Mobile < 576px: Show search button that triggers modal */}
      <div className="min-[576px]:hidden w-full flex justify-center">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-800 text-white font-medium transition cursor-pointer flex items-center justify-center gap-2 rounded-lg px-6 py-3 w-full max-w-sm"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Rechercher</span>
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setIsModalOpen(false)}
        >
          <form
            onSubmit={(e) => {
              handleSubmit(e);
              setIsModalOpen(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gray-800 rounded-t-2xl p-6 space-y-3"
          >
            {/* Search Field */}
            <div className="relative" ref={searchRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Nom, spécialité, établissement"
                className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2" />

              {isSearchFocused && (hasSearched || isLoadingSearch) && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto min-[576px]:top-full min-[576px]:bottom-auto min-[576px]:mt-1 min-[576px]:mb-0">
                  {isLoadingSearch ? (
                    <div className="px-4 py-3 text-gray-400 text-sm">Recherche...</div>
                  ) : !hasResults() ? (
                    <div className="px-4 py-3 text-gray-400 text-sm">Aucun résultat trouvé</div>
                  ) : (
                    renderSearchResults()
                  )}
                </div>
              )}
            </div>

            {/* Location Field */}
            <div className="relative" ref={locationRef}>
              <input
                type="text"
                value={locationQuery}
                onChange={handleLocationChange}
                onFocus={() => setIsLocationFocused(true)}
                placeholder="Où ?"
                className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg"
              />
              <LocationPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2" />

              {isLocationFocused && (hasSearchedLocation || isLoadingLocation) && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto min-[576px]:top-full min-[576px]:bottom-auto min-[576px]:mt-1 min-[576px]:mb-0">
                  {isLoadingLocation ? (
                    <div className="px-4 py-3 text-gray-400 text-sm">Recherche...</div>
                  ) : !hasLocationResults() ? (
                    <div className="px-4 py-3 text-gray-400 text-sm">Aucun résultat trouvé</div>
                  ) : (
                    renderLocationResults()
                  )}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-800 text-white font-medium transition cursor-pointer flex items-center justify-center gap-2 rounded-lg px-4 py-3"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher
            </button>
          </form>
        </div>
      )}

      {/* Tablet/Desktop version (min-[576px] and up) */}
      <form
        onSubmit={handleSubmit}
        className={`hidden min-[576px]:flex ${isCompact ? "" : "w-full max-w-3xl mx-auto"}`}
      >
      {/* Search Field */}
      <div className="relative flex-1" ref={searchRef}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          placeholder="Nom, spécialité, établissement"
          className={`w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 pl-10 focus:outline-none focus:z-10 rounded-l-lg border-r border-gray-600 ${isCompact ? "text-sm" : "py-3"}`}
        />
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2" />

        {isSearchFocused && (hasSearched || isLoadingSearch) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {isLoadingSearch ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                Recherche...
              </div>
            ) : !hasResults() ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                Aucun résultat trouvé
              </div>
            ) : (
              renderSearchResults()
            )}
          </div>
        )}
      </div>

      {/* Location Field */}
      <div
        className={`relative ${isCompact ? "flex-1 sm:w-48 lg:w-58" : "flex-1 lg:w-66"}`}
        ref={locationRef}
      >
        <input
          type="text"
          value={locationQuery}
          onChange={handleLocationChange}
          onFocus={() => setIsLocationFocused(true)}
          placeholder="Où ?"
          className={`w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 pl-10 focus:outline-none focus:z-10 rounded-none border-r border-gray-600 ${isCompact ? "text-sm" : "py-3"}`}
        />
        <LocationPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2" />

        {isLocationFocused && (hasSearchedLocation || isLoadingLocation) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {isLoadingLocation ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                Recherche...
              </div>
            ) : !hasLocationResults() ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                Aucun résultat trouvé
              </div>
            ) : (
              renderLocationResults()
            )}
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className={`bg-green-600 hover:bg-green-800 text-white font-medium transition cursor-pointer flex items-center justify-center gap-2 rounded-r-lg ${isCompact ? "px-4 py-2 text-sm" : "px-6 py-3"}`}
      >
        <svg
          className={isCompact ? "h-4 w-4" : "h-5 w-5"}
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
        <span className={isCompact ? "hidden min-[1200px]:inline" : ""}>Rechercher</span>
      </button>
    </form>
    </>
  );
}

export default SearchBar;
