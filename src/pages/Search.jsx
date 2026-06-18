import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchResults } from "../services/searchService";
import { buildDoctorSlug } from "../services/doctorService";
import { LocationIcon } from "../components/icons/IconService";
import Layout from "../components/Layout/Layout";

const DEFAULT_AVATARS = {
  female: "/images/user/avatar-doctor-female.webp",
  male: "/images/user/avatar-doctor-male.webp",
};

function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchValue = searchParams.get("q") || "";
  const location = searchParams.get("loc") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchValue && !location) {
      setError("Veuillez saisir des critères de recherche");
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      const data = await searchResults(searchValue, location, page);
      if (data.status) {
        setResults(data.data || []);
        setMeta(data.meta || { total: 0, page: 1, limit: 10, pages: 1 });
      } else {
        setError(data.message || "Erreur lors de la recherche");
        setResults([]);
      }
      setIsLoading(false);
    };

    fetchResults();
  }, [searchValue, location, page]);

  const getDoctorImageUrl = (imagePath, gender) => {
    if (imagePath) return imagePath;
    return DEFAULT_AVATARS[gender] || DEFAULT_AVATARS.male;
  };

  const handleDoctorClick = (doctor) => {
    const slug = buildDoctorSlug(doctor.firstName, doctor.lastName);
    navigate(`/doctor/${doctor.id}/${slug}`);
  };

  const handleBusinessSiteClick = (siteId) => {
    navigate(`/cabinet/${siteId}`);
  };

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= meta.pages) {
      const params = new URLSearchParams();
      if (searchValue) params.set("q", searchValue);
      if (location) params.set("loc", location);
      params.set("page", newPage);
      setSearchParams(params);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Résultats de recherche</h1>
        <p className="text-gray-400">
          {searchValue && location && (
            <>Recherche: <strong>{searchValue}</strong> à <strong>{location}</strong></>
          )}
          {searchValue && !location && (
            <>Recherche: <strong>{searchValue}</strong></>
          )}
          {!searchValue && location && (
            <>Lieu: <strong>{location}</strong></>
          )}
        </p>
        {meta.total > 0 && (
          <p className="text-gray-500 text-sm mt-2">
            {meta.total} résultat{meta.total > 1 ? "s" : ""} trouvé{meta.total > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Error message */}
      {error && !isLoading && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="text-gray-400">Chargement...</div>
        </div>
      )}

      {/* No results */}
      {!isLoading && results.length === 0 && !error && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">Aucun résultat ne correspond à votre recherche</p>
        </div>
      )}

      {/* Results list */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-4 mb-8">
          {results.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition cursor-pointer"
              onClick={() => handleDoctorClick(doctor)}
            >
              {/* Doctor header */}
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-600 shrink-0 overflow-hidden">
                  <img
                    src={getDoctorImageUrl(doctor.profilePicture, doctor.gender)}
                    alt={doctor.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-white">
                      {doctor.fullName}
                    </h3>
                    {doctor.verified && (
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-2.77 3.066 3.066 0 00-3.58 3.03A3.066 3.066 0 006.267 3.455zm9.8 6.984a3.066 3.066 0 01-2.77 1.745 3.066 3.066 0 003.03-3.58 3.066 3.066 0 00-.26 1.835zm6.728 9.387a3.066 3.066 0 01-1.745 2.77 3.066 3.066 0 003.58-3.03 3.066 3.066 0 00.26-1.835zm-12.793-6.984a3.066 3.066 0 012.77-1.745 3.066 3.066 0 01-3.03 3.58 3.066 3.066 0 00.26-1.835z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-blue-400 mt-1">{doctor.speciality}</p>
                  {doctor.acceptNewPatients && (
                    <p className="text-green-400 text-sm mt-1">
                      ✓ Accepte les nouveaux patients
                    </p>
                  )}
                  {doctor.teleconsultationEnabled && (
                    <p className="text-purple-400 text-sm">
                      💻 Téléconsultation disponible
                    </p>
                  )}
                </div>
              </div>

              {/* Business sites */}
              {doctor.businessSites && doctor.businessSites.length > 0 && (
                <div className="space-y-2 mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300">Lieux de consultation</h4>
                  <div className="space-y-2">
                    {doctor.businessSites.map((site) => (
                      <button
                        key={site.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBusinessSiteClick(site.id);
                        }}
                        className="w-full text-left bg-gray-700/50 hover:bg-gray-700 p-3 rounded transition flex items-start gap-3"
                      >
                        <LocationIcon size="4" className="text-orange-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{site.name}</p>
                          <p className="text-gray-400 text-xs">{site.address}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-gray-500 text-xs">{site.ville}</span>
                            <span className="text-gray-500 text-xs">•</span>
                            <span className="text-gray-500 text-xs">{site.phone}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && meta.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
          >
            ← Précédent
          </button>

          <div className="flex gap-1">
            {Array.from({ length: meta.pages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-3 py-2 rounded transition ${
                  pageNum === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === meta.pages}
            className="px-3 py-2 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
          >
            Suivant →
          </button>
        </div>
      )}
    </Layout>
  );
}

export default Search;
