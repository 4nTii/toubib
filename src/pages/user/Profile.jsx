import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout/Layout";
import { VerifiedIcon } from "../../components/UiHTML/VerifiedIcon";
import DateUtils from "../../services/dateService";
import { updateUserProfile } from "../../services/authService";
import { getUserAppointments } from "../../services/userAppointmentsService";

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
          const appointmentDate = new Date(appointment.appointmentDate);
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
                    <th className="px-4 py-3 text-gray-400 font-medium">Date</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Patient</th>
                    <th className="px-4 py-3 text-gray-400 font-medium">Docteur</th>
                    <th className="px-4 py-3 text-gray-400 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-b border-gray-700 hover:bg-gray-700 transition duration-200"
                    >
                      <td className="px-4 py-3 text-white">
                        <span className="md:hidden">{appointment.dateIso}</span>
                        <span className="hidden md:inline">{appointment.date}</span>
                      </td>
                      <td className="px-4 py-3 text-white text-sm">
                        {user?.firstName} {user?.lastName}
                      </td>
                      <td className="px-4 py-3 text-white text-sm">
                        Dr. {appointment.doctorFirstName} {appointment.doctorLastName} ({appointment.businessSiteAddress?.split(',').pop()?.trim() || 'N/A'})
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => alert('Fonctionnalité à venir')}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded text-xs px-3 py-1 transition duration-200"
                        >
                          Document
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
