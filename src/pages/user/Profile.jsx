import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";
import { VerifiedIcon } from "../../components/UiHTML/VerifiedIcon";
import DateUtils from "../../services/dateService";
import { updateUserProfile } from "../../services/authService";

function Profile() {
  const { user, fetchUserInfo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDay: "",
    gender: "",
    address: "",
    email: "",
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

  // Mock appointment data
  const appointments = [
    {
      id: 1,
      date: "15/03/2026 - 10:30",
      patient: "Marie Dupont",
      docteur: "Dr. Marie Dupont",
      speciality: "Pédiatrie",
      adresse: "12 Rue de la Santé, 75014 Paris",
      detail: "Bilan annuel",
    },
    {
      id: 2,
      date: "02/02/2026 - 14:00",
      patient: "Moi",
      docteur: "Dr. Jean Martin",
      speciality: "Cardiologie",
      adresse: "45 Avenue des Champs, 75008 Paris",
      detail: "Contrôle tension",
    },
    {
      id: 3,
      date: "18/01/2026 - 09:15",
      patient: "Lucas Dupont",
      docteur: "Dr. Sophie Bernard",
      speciality: "Ophtalmologie",
      adresse: "8 Boulevard Haussmann, 75009 Paris",
      detail: "Examen cutané",
    },
    {
      id: 4,
      date: "05/12/2025 - 16:45",
      patient: "Moi",
      docteur: "Dr. Pierre Lefebvre",
      speciality: "Orthopédie",
      adresse: "23 Rue du Commerce, 75015 Paris",
      detail: "Rappel vaccin grippe",
    },
  ];

  const handleProfileEditClick = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      birthDay: DateUtils.toInputFormat(user?.birthDayRaw),
      gender: user?.gender || "",
      address: user?.address || "",
      email: user?.email || "",
    });
    setIsEditing(true);
  };

  const handleProfileCancelClick = () => {
    setIsEditing(false);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (Object.keys(changedFields).length === 0) {
      setIsEditing(false);
      setIsSaving(false);
      return;
    }

    const result = await updateUserProfile(changedFields);

    if (result.success) {
      await fetchUserInfo();
      setIsEditing(false);
    } else {
      console.error("Failed to update profile:", result.error);
    }

    setIsSaving(false);
  };

  return (
    <Layout>
      {/* First Row - 3 inline divs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* User Info */}
        <div className="bg-gray-800 rounded-lg p-4">
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
              </>
            )}
          </div>
        </div>

        {/* Connection & Payment Methods */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
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

      {/* Second Row - Appointment History */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Historique des rendez-vous
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-gray-400 font-medium">Date</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Patient</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Docteur</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Adresse</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Détail</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b border-gray-700 hover:bg-gray-700 transition duration-200"
                >
                  <td className="px-4 py-3 text-white">{appointment.date}</td>
                  <td className="px-4 py-3 text-white">
                    {appointment.patient}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {appointment.docteur} - {appointment.speciality}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {appointment.adresse}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {appointment.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
