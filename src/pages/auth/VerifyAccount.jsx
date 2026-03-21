import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { API_URL } from "../../config/config";
import logo from "../../assets/images/app/toubib-logo-w500.webp";

function VerifyAccount() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false);

  const user = searchParams.get("user");
  const token = searchParams.get("token");

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyAccount = async () => {
      // Validate query params
      const userId = parseInt(user, 10);

      if (!user || !token || isNaN(userId)) {
        setStatus("error");
        setMessage("Lien de vérification invalide. Les paramètres requis sont manquants.");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/verify-account/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            user: userId,
            token: token,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Votre compte a été vérifié avec succès !");
        } else {
          setStatus("error");
          setMessage(data.message || data.error || "Une erreur est survenue lors de la vérification.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Erreur de connexion au serveur. Veuillez réessayer plus tard.");
      }
    };

    verifyAccount();
  }, [user, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-8">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Toubib" className="h-20 w-auto" />
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Vérification du compte
        </h1>

        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Vérification en cours...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded mb-6">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {message}
            </div>
            <Link
              to="/auth?method=login"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 text-center"
            >
              Se connecter
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {message}
            </div>
            <Link
              to="/"
              className="inline-block w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 text-center"
            >
              Retour à l'accueil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyAccount;
