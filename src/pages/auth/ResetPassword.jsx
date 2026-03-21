import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { checkResetToken, resetPassword } from "../../services/authService";
import logo from "../../assets/images/app/toubib-logo-w500.webp";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Token manquant");
        setIsCheckingToken(false);
        return;
      }

      const result = await checkResetToken(token);

      if (result.valid) {
        setIsValidToken(true);
      } else {
        setError(result.message);
      }

      setIsCheckingToken(false);
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsSubmitting(true);

    const result = await resetPassword(token, password);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate("/auth?method=login");
      }, 2000);
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Vérification du token...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-8">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-start mb-6">
          <Link
            to="/auth?method=login"
            className="text-gray-400 hover:text-white transition duration-200 flex items-center gap-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-sm">Retour</span>
          </Link>
        </div>
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Toubib" className="h-20 w-auto" />
        </div>
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Réinitialiser le mot de passe
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {isValidToken && !success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez votre nouveau mot de passe"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirmez votre mot de passe"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              {isSubmitting ? "Réinitialisation..." : "Réinitialiser"}
            </button>
          </form>
        )}

        {!isValidToken && !isCheckingToken && (
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Le lien de réinitialisation est invalide ou a expiré.
            </p>
            <Link
              to="/"
              className="text-blue-400 hover:text-blue-300 transition duration-200"
            >
              Quitter cette page
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
