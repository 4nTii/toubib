import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout/Layout";
import { VerifiedIcon } from "../../components/UiHTML/VerifiedIcon";
import DateUtils from "../../services/dateService";
import { updateUserProfile, changePassword, addOrUpdateCard } from "../../services/authService";
import { getUserAppointments } from "../../services/userAppointmentsService";
import { FTP_TARGET } from "../../config/config";
import { CreditCardVisa } from "../../components/icons/IconService";

// Format social security number: 1 23 45 67 890 123 123
const formatSocialNumber = (number) => {
  if (!number) return "";
  const cleaned = number.toString().replace(/\D/g, "").slice(0, 15);
  if (cleaned.length === 0) return "";

  let formatted = "";
  const groups = [1, 2, 2, 2, 3, 3, 3];
  let position = 0;

  for (let i = 0; i < groups.length; i++) {
    const groupSize = groups[i];
    const end = position + groupSize;
    if (position < cleaned.length) {
      if (formatted) formatted += " ";
      formatted += cleaned.substring(position, Math.min(end, cleaned.length));
      position = end;
    }
  }

  return formatted;
};

function Profile() {
  const { user, fetchUserInfo } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [cardMessage, setCardMessage] = useState(null);
  const [cardError, setCardError] = useState("");
  const [cardInfo, setCardInfo] = useState(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [newCardData, setNewCardData] = useState({
    card_holder: "",
    card_number: "",
    expire_date: "",
    card_cvv: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDay: "",
    gender: "",
    address: "",
    email: "",
    socialNumber: "",
  });

  // Mock proches (attached accounts) data
  const proches = [
    {
      id: 1,
      firstName: "Marie",
      lastName: "Dupont",
      relation: "Épouse",
    },
    {
      id: 2,
      firstName: "Lucas",
      lastName: "Dupont",
      relation: "Fils",
    },
    {
      id: 3,
      firstName: "Emma",
      lastName: "Dupont",
      relation: "Fille",
    },
  ];

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const ITEMS_PER_PAGE = 5;
  const INITIAL_ITEMS = 3;

  useEffect(() => {
    if (user?.userCard) {
      const lastDigits = user.userCard.cardNumber?.slice(-4) || "";
      setCardInfo({
        holder: user.userCard.cardHolder,
        lastDigits: lastDigits,
        type: "Visa",
      });
    } else {
      setCardInfo(null);
      setShowNewCardForm(false);
    }
  }, [user?.userCard]);

  useEffect(() => {
    async function fetchAppointments() {
      setAppointmentsLoading(true);
      const result = await getUserAppointments();
      if (result.success) {
        const allAppointments = result.data || [];

        // Filter to show only past appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pastAppointments = allAppointments.filter(appointment => {
          // Use dateIso if available, otherwise use date
          const dateStr = appointment.dateIso || appointment.date;
          if (!dateStr) return false;

          const appointmentDate = new Date(dateStr);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate < today;
        });

        setAppointments(pastAppointments);
        setFilteredAppointments(pastAppointments);
      }
      setAppointmentsLoading(false);
    }
    fetchAppointments();
  }, []);

  const displayedAppointments = showAllAppointments
    ? filteredAppointments
    : filteredAppointments.slice(0, INITIAL_ITEMS);

  const handleProfileEditClick = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      birthDay: DateUtils.toInputFormat(user?.birthDayRaw),
      gender: user?.gender || "",
      address: user?.address || "",
      email: user?.email || "",
      socialNumber: user?.socialNumber || "",
    });
    setIsEditing(true);
  };

  const handleProfileCancelClick = () => {
    setIsEditing(false);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "socialNumber") {
      // Remove spaces from social number before saving
      const cleaned = value.replace(/\s/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileSaveClick = async () => {
    setIsSaving(true);

    // Build payload with only changed fields
    const changedFields = {};
    if (formData.firstName !== user?.firstName)
      changedFields.firstName = formData.firstName;
    if (formData.lastName !== user?.lastName)
      changedFields.lastName = formData.lastName;
    if (formData.birthDay !== DateUtils.toInputFormat(user?.birthDayRaw))
      changedFields.birthDay = formData.birthDay;
    if (formData.gender !== user?.gender)
      changedFields.gender = formData.gender;
    if (formData.address !== user?.address)
      changedFields.address = formData.address;
    if (formData.email !== user?.email) changedFields.email = formData.email;
    if (formData.socialNumber !== (user?.socialNumber || ""))
      changedFields.socialNumber = formData.socialNumber;

    if (Object.keys(changedFields).length === 0) {
      setIsEditing(false);
      setIsSaving(false);
      return;
    }

    const result = await updateUserProfile(changedFields);

    if (result.success) {
      // Wait a moment and fetch user info to ensure the update is persisted
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchUserInfo({ force: true });
      setIsEditing(false);
      setSaveMessage({ type: "success", text: "Profil mis à jour avec succès" });
      // Reset form data after successful update
      setFormData({
        firstName: "",
        lastName: "",
        birthDay: "",
        gender: "",
        address: "",
        email: "",
        socialNumber: "",
      });
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      console.error("Failed to update profile:", result.error);
      setSaveMessage({ type: "error", text: result.error || "Erreur lors de la mise à jour du profil" });
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }

    setIsSaving(false);
  };

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("au moins 8 caractères");
    if (!/[A-Z]/.test(password)) errors.push("une majuscule");
    if (!/[a-z]/.test(password)) errors.push("une minuscule");
    if (!/[0-9]/.test(password)) errors.push("un chiffre");
    if (!/[!@#$%^&*()_+\-=\[\]{};:'".,<>?\/\\|`~]/.test(password)) errors.push("un caractère spécial");
    return errors;
  };

  const isPasswordStrong = (password) => {
    return validatePasswordStrength(password).length === 0;
  };

  const handlePasswordSave = async () => {
    setPasswordError("");

    if (!oldPassword) {
      setPasswordError("L'ancien mot de passe est requis");
      return;
    }
    if (!newPassword) {
      setPasswordError("Le nouveau mot de passe est requis");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    if (!isPasswordStrong(newPassword)) {
      const errors = validatePasswordStrength(newPassword);
      setPasswordError("Le mot de passe doit contenir: " + errors.join(", "));
      return;
    }

    setIsSaving(true);
    const result = await changePassword(oldPassword, newPassword);
    if (result.success) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsEditingPassword(false);
      setSaveMessage({ type: "success", text: "Mot de passe mis à jour avec succès" });
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setPasswordError(result.error || "Erreur lors de la mise à jour du mot de passe");
    }
    setIsSaving(false);
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    return parts.join(" ");
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  const handleDeleteCard = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette carte bancaire ?")) {
      setCardInfo(null);
      setShowNewCardForm(true);
    }
  };

  const handleNewCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "card_number") {
      formattedValue = formatCardNumber(value);
    } else if (name === "expire_date") {
      formattedValue = formatExpiryDate(value);
    } else if (name === "card_cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setNewCardData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const isExpiryDateValid = (expiryDate) => {
    if (!expiryDate || expiryDate.length !== 5) return false;
    const [month, year] = expiryDate.split("/");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expiryYear = parseInt(year, 10);
    const expiryMonth = parseInt(month, 10);

    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;

    return true;
  };

  const handleAddNewCard = async () => {
    setCardError("");

    if (!newCardData.card_holder || !newCardData.card_number || !newCardData.expire_date || !newCardData.card_cvv) {
      setCardError("Tous les champs de la carte sont requis");
      return;
    }
    if (newCardData.card_cvv.length < 3) {
      setCardError("Le CVV doit contenir au moins 3 caractères");
      return;
    }
    if (!isExpiryDateValid(newCardData.expire_date)) {
      setCardError("La date d'expiration doit être une date future (MM/AA)");
      return;
    }

    setIsSaving(true);
    const result = await addOrUpdateCard(newCardData);
    if (result.success) {
      const lastDigits = newCardData.card_number.replace(/\s/g, "").slice(-4);
      setNewCardData({ card_holder: "", card_number: "", expire_date: "", card_cvv: "" });
      setShowNewCardForm(false);
      setCardInfo({ holder: newCardData.card_holder, lastDigits: lastDigits, type: <CreditCardVisa /> });
      setCardMessage({ type: "success", text: "Carte bancaire ajoutée avec succès" });
      // Refresh user info to update card data
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchUserInfo({ force: true });
      setTimeout(() => setCardMessage(null), 3000);
    } else {
      setCardError(result.error || "Erreur lors de l'ajout de la carte bancaire");
    }
    setIsSaving(false);
  };

  return (
    <Layout>
      {/* First Row - 3 inline divs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* User Info */}
        <div className="bg-gray-800 rounded-lg p-4">
          {saveMessage && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                saveMessage.type === "success"
                  ? "bg-green-900/30 border border-green-700 text-green-300"
                  : "bg-red-900/30 border border-red-700 text-red-300"
              }`}
            >
              {saveMessage.text}
            </div>
          )}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-white">
              Informations personnelles
            </h2>
            {isEditing ? (
              <div className="flex gap-2">
                {!isSaving && (
                  <button
                    onClick={handleProfileCancelClick}
                    className="text-sm text-gray-400 hover:text-gray-300 transition duration-200 cursor-pointer"
                  >
                    Annuler
                  </button>
                )}
                <button
                  onClick={handleProfileSaveClick}
                  className="text-sm text-green-400 hover:text-green-300 transition duration-200 cursor-pointer"
                  disabled={isSaving}
                >
                  {isSaving ? "..." : "Enregistrer"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleProfileEditClick}
                className="text-sm text-blue-400 hover:text-blue-300 transition duration-200 cursor-pointer"
              >
                Modifier
              </button>
            )}
          </div>
          <div className="space-y-2">
            {isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 text-xs">Prénom</span>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleProfileInputChange}
                      className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Nom</span>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleProfileInputChange}
                      className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 text-xs">Genre</span>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleProfileInputChange}
                      className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="male">Masculin</option>
                      <option value="female">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">
                      Date de naissance
                    </span>
                    <input
                      type="date"
                      name="birthDay"
                      value={formData.birthDay}
                      onChange={handleProfileInputChange}
                      className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Adresse</span>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleProfileInputChange}
                    className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleProfileInputChange}
                    className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Numéro de sécurité sociale</span>
                  <input
                    type="text"
                    name="socialNumber"
                    value={formatSocialNumber(formData.socialNumber)}
                    onChange={handleProfileInputChange}
                    className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-gray-400 text-xs">Nom complet</span>
                  <p className="text-white text-sm">
                    {user?.firstName} {user?.lastName}
                    <span className="text-xs">
                      {" "}
                      ({user?.gender === "male" ? "Masculin" : "Féminin"})
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">
                    Date de naissance
                  </span>
                  <p className="text-white text-sm">{user?.birthDay}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Adresse</span>
                  <p className="text-white text-sm">{user?.address}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">
                    Téléphone
                    <VerifiedIcon verified={user?.isPhoneVerified} />
                  </span>
                  <p className="text-white text-sm">{user?.phone}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">
                    Email
                    <VerifiedIcon verified={user?.isEmailVerified} />
                  </span>
                  <p className="text-white text-sm">{user?.email}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-xs">
                    Numéro de sécurité sociale
                  </span>
                  <p className="text-white text-sm font-mono">{formatSocialNumber(user?.socialNumber) || "Non renseigné"}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Doctor & Connection & Payment */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-6">
          {/* Médecin traitant */}
          {!isEditingPassword && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Médecin traitant
            </h2>
            {user?.mainDoctor ? (
              <button
                onClick={() => {
                  const slug = encodeURIComponent(
                    `${user.mainDoctor.firstName}-${user.mainDoctor.lastName}`.toLowerCase().replace(/\s+/g, "-")
                  );
                  navigate(`/doctor/${user.mainDoctor.id}/${slug}`);
                }}
                className="w-full flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 cursor-pointer"
              >
                <img
                  src={user.mainDoctor.photo ? `${FTP_TARGET}/${user.mainDoctor.photo}` : "/images/user/avatar-doctor-male.webp"}
                  alt={`Dr. ${user.mainDoctor.firstName} ${user.mainDoctor.lastName}`}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                  onError={(e) => { e.currentTarget.src = "/images/user/avatar-doctor-male.webp"; }}
                />
                <div className="flex-1 text-left">
                  <p className="text-white font-semibold text-sm">
                    Dr. {user.mainDoctor.firstName} {user.mainDoctor.lastName}
                  </p>
                  <p className="text-blue-400 text-xs">{user.mainDoctor.speciality}</p>
                </div>
              </button>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">Aucun médecin traitant</p>
            )}
          </div>
          )}

          {/* Mot de passe */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                Mot de passe
              </h2>
              {!isEditingPassword && (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition duration-200 cursor-pointer"
                >
                  Modifier
                </button>
              )}
            </div>
            {isEditingPassword ? (
              <div className="space-y-3">
                {passwordError && (
                  <div className="p-2 bg-red-900/30 border border-red-700 text-red-300 rounded text-xs">
                    {passwordError}
                  </div>
                )}
                <div>
                  <span className="text-gray-400 text-xs">Ancien mot de passe</span>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSaving && oldPassword && newPassword && confirmPassword && isPasswordStrong(newPassword) && newPassword === confirmPassword) {
                        handlePasswordSave();
                      }
                    }}
                    className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1"
                    placeholder="Entrez votre ancien mot de passe"
                  />
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Nouveau mot de passe</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSaving && oldPassword && newPassword && confirmPassword && isPasswordStrong(newPassword) && newPassword === confirmPassword) {
                        handlePasswordSave();
                      }
                    }}
                    className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1"
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                  {newPassword && (
                    <div className="mt-2 p-2 bg-gray-700 rounded text-xs space-y-1">
                      <div className={validatePasswordStrength(newPassword).includes("au moins 8 caractères") ? "text-red-400" : "text-green-400"}>
                        ✓ Au moins 8 caractères
                      </div>
                      <div className={validatePasswordStrength(newPassword).includes("une majuscule") ? "text-red-400" : "text-green-400"}>
                        ✓ Une majuscule (A-Z)
                      </div>
                      <div className={validatePasswordStrength(newPassword).includes("une minuscule") ? "text-red-400" : "text-green-400"}>
                        ✓ Une minuscule (a-z)
                      </div>
                      <div className={validatePasswordStrength(newPassword).includes("un chiffre") ? "text-red-400" : "text-green-400"}>
                        ✓ Un chiffre (0-9)
                      </div>
                      <div className={validatePasswordStrength(newPassword).includes("un caractère spécial") ? "text-red-400" : "text-green-400"}>
                        ✓ Un caractère spécial (!@#$%...)
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Confirmer le nouveau mot de passe</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSaving && oldPassword && newPassword && confirmPassword && isPasswordStrong(newPassword) && newPassword === confirmPassword) {
                        handlePasswordSave();
                      }
                    }}
                    className={`w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 mt-1 ${
                      newPassword && confirmPassword && newPassword === confirmPassword
                        ? "focus:ring-green-500 border border-green-600"
                        : newPassword && confirmPassword && newPassword !== confirmPassword
                        ? "focus:ring-red-500 border border-red-600"
                        : "focus:ring-blue-500"
                    }`}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                  {newPassword && confirmPassword && newPassword === confirmPassword && (
                    <p className="text-green-400 text-xs mt-1">Les mots de passe correspondent</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditingPassword(false);
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordError("");
                    }}
                    className="text-sm text-gray-400 hover:text-gray-300 transition duration-200 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handlePasswordSave}
                    className="text-sm text-green-400 hover:text-green-300 transition duration-200 cursor-pointer disabled:opacity-50"
                    disabled={isSaving || !isPasswordStrong(newPassword) || newPassword !== confirmPassword || !oldPassword}
                  >
                    {isSaving ? "..." : "Enregistrer"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-green-400 text-sm">●</span>
                <p className="text-white text-sm">Protégé par mot de passe</p>
              </div>
            )}
          </div>

          {/* Carte bancaire */}
          {!isEditingPassword && (
          <div className="border-t border-gray-700 pt-4">
            {cardMessage && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  cardMessage.type === "success"
                    ? "bg-green-900/30 border border-green-700 text-green-300"
                    : "bg-red-900/30 border border-red-700 text-red-300"
                }`}
              >
                {cardMessage.text}
              </div>
            )}
            <h2 className="text-lg font-semibold text-white mb-4">
              Carte bancaire
            </h2>
            {cardInfo && !showNewCardForm ? (
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-white text-sm">
                      {cardInfo.holder}{" "}
                      <span className="bg-blue-800 rounded-xl p-1 text-white">
                        •••• •••• •••• {cardInfo.lastDigits}
                      </span>
                    </p>
                  </div>
                  <CreditCardVisa className="w-10 h-6" />
                </div>
                <button
                  onClick={handleDeleteCard}
                  className="text-red-400 hover:text-red-300 transition duration-200 cursor-pointer text-lg"
                  title="Supprimer la carte"
                >
                  ✕
                </button>
              </div>
            ) : showNewCardForm ? (
              <div className="space-y-3">
                {cardError && (
                  <div className="p-2 bg-red-900/30 border border-red-700 text-red-300 rounded text-xs">
                    {cardError}
                  </div>
                )}
                <div>
                  <span className="text-gray-400 text-xs">Titulaire de la carte</span>
                  <input
                    type="text"
                    name="card_holder"
                    value={newCardData.card_holder}
                    onChange={handleNewCardChange}
                    className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1"
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <span className="text-gray-400 text-xs">Numéro de carte</span>
                  <input
                    type="text"
                    name="card_number"
                    value={newCardData.card_number}
                    onChange={handleNewCardChange}
                    className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1 font-mono tracking-wide"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 text-xs">Date d'expiration</span>
                    <input
                      type="text"
                      name="expire_date"
                      value={newCardData.expire_date}
                      onChange={handleNewCardChange}
                      className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1 font-mono"
                      placeholder="MM/AA"
                    />
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">CVV</span>
                    <input
                      type="text"
                      name="card_cvv"
                      value={newCardData.card_cvv}
                      onChange={handleNewCardChange}
                      className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1 font-mono"
                      placeholder="123"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowNewCardForm(false);
                      setNewCardData({ card_holder: "", card_number: "", expire_date: "", card_cvv: "" });
                    }}
                    className="text-sm text-gray-400 hover:text-gray-300 transition duration-200 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddNewCard}
                    className="text-sm text-green-400 hover:text-green-300 transition duration-200 cursor-pointer"
                    disabled={isSaving}
                  >
                    {isSaving ? "..." : "Ajouter la carte"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-3">Aucune carte bancaire</p>
                <button
                  onClick={() => setShowNewCardForm(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition duration-200 cursor-pointer px-4 py-2 bg-blue-900/30 rounded border border-blue-700 hover:bg-blue-900/50"
                >
                  Ajouter une carte
                </button>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Mes proches */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-white">Mes proches</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition duration-200 cursor-pointer">
              Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {proches.map((proche) => (
              <div
                key={proche.id}
                className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {proche.firstName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    {proche.firstName} {proche.lastName}
                  </p>
                  <p className="text-gray-400 text-xs">{proche.relation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment History */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Historique des rendez-vous
        </h2>
        {appointmentsLoading ? (
          <div className="text-center py-8 text-gray-400">Chargement...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Aucun rendez-vous</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="w-16 px-2 py-3 hidden sm:table-cell"></th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Date</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Patient</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Docteur</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-b border-gray-700 hover:bg-gray-700 transition duration-200"
                    >
                      <td className="w-16 px-2 py-3 hidden sm:table-cell">
                        {appointment.status === 'canceled' && (
                          <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
                            Annulé
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white">
                        <span className="md:hidden">{DateUtils.formatDateDDMMYYYY(appointment.dateIso || appointment.date)}</span>
                        <span className="hidden md:inline">{appointment.date}</span>
                      </td>
                      <td className="px-4 py-3 text-white text-sm">
                        {user?.firstName} {user?.lastName}
                      </td>
                      <td className="px-4 py-3 text-white text-sm">
                        Dr. {appointment.doctorFirstName} {appointment.doctorLastName} <span className="hidden lg:inline">({appointment.businessSiteAddress?.split(',').pop()?.trim() || 'N/A'})</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => alert('Fonctionnalité à venir')}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded text-xs px-3 py-1 transition duration-200 cursor-pointer"
                        >
                          Documents
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!showAllAppointments && filteredAppointments.length > INITIAL_ITEMS && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowAllAppointments(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition duration-200"
                >
                  Afficher plus
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default Profile;
