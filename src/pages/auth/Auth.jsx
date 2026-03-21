import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { forgotPassword } from "../../services/authService";
import logo from "../../assets/images/app/toubib-logo-w500.webp";

const VALID_METHODS = ["login", "register", "forgotPassword"];

function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const methodParam = searchParams.get("method");

  // Map URL param to internal mode (forgotPassword -> forgot)
  const getInitialMode = () => {
    if (methodParam === "register") return "register";
    if (methodParam === "forgotPassword") return "forgot";
    return "login";
  };

  const [mode, setMode] = useState(getInitialMode);
  const [registerStep, setRegisterStep] = useState(1); // 1 or 2 for multi-step register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setGender("");
    setBirthDay("");
    setPhone("");
    setError("");
    setSuccess("");
    setRegisterStep(1);
  };

  // Sync mode with URL param changes
  useEffect(() => {
    setMode(getInitialMode());
  }, [methodParam]);

  const switchMode = (newMode) => {
    resetForm();
    // Map internal mode to URL param
    const urlMethod =
      newMode === "forgot"
        ? "forgotPassword"
        : newMode === "register"
          ? "register"
          : "login";
    setSearchParams({ method: urlMethod });
    setMode(newMode);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await login(email, password);

    if (result.success) {
      navigate("/home");
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  // Validate step 1 fields
  const validateStep1 = () => {
    if (!firstName.trim()) {
      setError("Le prénom est requis");
      return false;
    }
    if (!lastName.trim()) {
      setError("Le nom est requis");
      return false;
    }
    if (!gender) {
      setError("Le genre est requis");
      return false;
    }
    if (!birthDay) {
      setError("La date de naissance est requise");
      return false;
    }
    setError("");
    return true;
  };

  // Validate step 2 fields
  const validateStep2 = () => {
    if (!email.trim()) {
      setError("L'email est requis");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("L'email n'est pas valide");
      return false;
    }
    if (!password) {
      setError("Le mot de passe est requis");
      return false;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    setError("");
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setRegisterStep(2);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setRegisterStep(1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);

    const result = await register({
      email,
      password,
      firstName,
      lastName,
      gender,
      birthDay,
      phone,
    });

    if (result.success) {
      setSuccess(
        "Inscription réussie ! Vous pouvez maintenant vous connecter.",
      );
      setTimeout(() => {
        setSearchParams({ method: "login" });
        setMode("login");
      }, 2000);
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setSuccess("Un email de réinitialisation a été envoyé à votre adresse.");
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  const getTitle = () => {
    switch (mode) {
      case "register":
        return "S'inscrire";
      case "forgot":
        return "Mot de passe oublié";
      default:
        return "Se connecter";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-8">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-start mb-6">
          <Link
            to="/"
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
          {getTitle()}
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

        {/* Login Form */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez votre mot de passe"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>

            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="text-blue-400 hover:text-blue-300 text-sm transition duration-200"
              >
                Pas encore de compte ? S'inscrire
              </button>
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-gray-400 hover:text-gray-300 text-sm transition duration-200"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>
        )}

        {/* Register Form - Step 1 */}
        {mode === "register" && registerStep === 1 && (
          <div className="space-y-4">
            {/* Step indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  1
                </div>
                <div className="w-12 h-1 bg-gray-600"></div>
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 font-semibold text-sm">
                  2
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Prénom"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sexe
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 w-full flex justify-center items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`w-20 h-20 flex flex-col cursor-pointer items-center justify-center rounded-full border transition ${
                      gender === "female"
                        ? "bg-pink-600 border-pink-500 text-white"
                        : "bg-gray-700 border-gray-600 text-gray-300"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="8" r="5" />
                      <line x1="12" y1="13" x2="12" y2="22" />
                      <line x1="8" y1="18" x2="16" y2="18" />
                    </svg>
                    <span className="text-xs">Féminin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`w-20 h-20 flex flex-col cursor-pointer items-center justify-center rounded-full border transition ${
                      gender === "male"
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-700 border-gray-600 text-gray-300"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="9" cy="15" r="5" />
                      <line x1="15" y1="9" x2="22" y2="2" />
                      <line x1="16" y1="2" x2="22" y2="2" />
                      <line x1="22" y1="2" x2="22" y2="8" />
                    </svg>
                    <span className="text-xs">M</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="birthday"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Date de naissance
              </label>
              <input
                type="date"
                id="birthday"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 cursor-pointer"
            >
              Suivant
            </button>

            <div className="pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full text-blue-400 hover:text-blue-300 text-sm transition duration-200 cursor-pointer"
              >
                Déjà un compte ? Se connecter
              </button>
            </div>
          </div>
        )}

        {/* Register Form - Step 2 */}
        {mode === "register" && registerStep === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Step indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  <svg
                    className="w-4 h-4"
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
                </div>
                <div className="w-12 h-1 bg-blue-600"></div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  2
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="reg-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Téléphone
              </label>
              <input
                type="tel"
                id="reg-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="06 12 34 56 78"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="reg-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mot de passe"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirmer
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirmer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/*
                fonctionnement des button avec le cursor et l'affiche de précédent si submit

              */}

              <button
                type="button"
                onClick={handlePrevStep}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 cursor-pointer"
              >
                Précédent
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ${isSubmitting ? `cursor-not-allowed` : `cursor-pointer`}`}
              >
                {isSubmitting ? "..." : "S'inscrire"}
              </button>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full text-blue-400 hover:text-blue-300 text-sm transition duration-200"
              >
                Déjà un compte ? Se connecter
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <p className="text-gray-400 text-sm text-center mb-4">
              Entrez votre adresse email et nous vous enverrons un lien pour
              réinitialiser votre mot de passe.
            </p>

            <div>
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="forgot-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              {isSubmitting ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Auth;
