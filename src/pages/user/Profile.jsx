import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout/Layout";
import { VerifiedIcon } from "../../components/UiHTML/VerifiedIcon";
import DateUtils from "../../services/dateService";
import { updateUserProfile } from "../../services/authService";
import { getUserAppointments } from "../../services/userAppointmentsService";
import { FTP_TARGET } from "../../config/config";

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

          {/* Connexion et paiement */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                Connexion et paiement
              </h2>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition duration-200 cursor-pointer">
                Modifier
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-xs">Connexion</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-green-400 text-sm">●</span>
                  <p className="text-white text-sm">Email / Mot de passe</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-400 text-sm">●</span>
                  <p className="text-white text-sm">Numéro de téléphone</p>
                </div>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Carte bancaire</span>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-white text-sm">
                    CardHolder FullName{" "}
                    <span className="bg-blue-800 rounded-xl p-1 text-white">
                      •••• •••• •••• 4582
                    </span>
                  </p>
                  <span className="text-gray-500 text-xs">Visa</span>
                </div>
              </div>
            </div>
          </div>
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
