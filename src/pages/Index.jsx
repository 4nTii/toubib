import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { APP_NAME } from "../config/config";
import CGUBanner from "../components/Layout/CGUBanner";
import SearchBar from "../components/ui/SearchBar";
import BlindColorToggle from "../components/BlindColorToggle";

import logo from "../assets/images/app/toubib-logo-w500.webp";

const logoSmall = "/images/app/toubib-logo-small.webp";

function Index() {
  const { isAuthenticated, logout, user, fetchUserInfo } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get user's first name or fallback
  const userName = user?.firstName || "Utilisateur";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    // Fetch user info if authenticated but user data is missing
    const checkUserInfo = async () => {
      if (isAuthenticated && !user) {
        const result = await fetchUserInfo();
        if (!result) {
          // User info fetch failed, redirect to login
          logout();
          navigate("/auth");
        }
      }
    };
    checkUserInfo();
  }, [isAuthenticated, user, fetchUserInfo, logout, navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img src={logo} alt={APP_NAME} className="h-10 w-auto hidden min-[1200px]:block" />
              <img src={logoSmall} alt={APP_NAME} className="h-10 w-auto min-[1200px]:hidden" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                <BlindColorToggle />
              </div>
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 hover:bg-gray-700 px-3 py-2 rounded-lg transition duration-200"
                  >
                    {/* Avatar */}
                    <div
                      className={`avatar-user-${user?.gender || "male"} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0`}
                      style={{ backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
                    ></div>
                    <span className="text-white hidden min-[1200px]:inline">Bonjour {userName}</span>
                    <svg
                      className={`h-4 w-4 text-white transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-1 z-50">
                      <div className="block lg:hidden px-4 py-2">
                        <BlindColorToggle />
                      </div>
                      <hr className="my-1 border-gray-600 block lg:hidden" />
                      <Link
                        to="/messages"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-600 transition duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Mes messages
                      </Link>
                      <Link
                        to="/appointments"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-600 transition duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Mes rendez-vous
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-600 transition duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profil
                      </Link>
                      <hr className="my-1 border-gray-600" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 transition duration-200"
                      >
                        Déconnexion
                      </button>
                      <Link
                        to="/help"
                        className="block px-4 py-2 text-gray-200 hover:bg-gray-600 transition duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Aide
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Bienvenue sur {APP_NAME}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Votre plateforme de santé de confiance pour gérer vos rendez-vous et
            entrer en contact avec des professionnels médicaux.
          </p>

          <div className="mb-10">
            <SearchBar variant="index" />
          </div>

          <div className="flex justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/home"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-200"
              >
                Accéder au tableau de bord
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-200"
                >
                  Commencer
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3">
              Rendez-vous faciles
            </h3>
            <p className="text-gray-400">
              Prenez rapidement et facilement des rendez-vous avec des
              professionnels de santé.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3">
              Plateforme sécurisée
            </h3>
            <p className="text-gray-400">
              Vos données de santé sont protégées selon les standards de
              sécurité de l'industrie.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3">
              Accès 24/7
            </h3>
            <p className="text-gray-400">
              Accédez à vos informations médicales à tout moment, où que vous
              soyez.
            </p>
          </div>
        </div>
      </main>
      <CGUBanner />
    </div>
  );
}

export default Index;
