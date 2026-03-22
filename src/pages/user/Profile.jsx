import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";

function Profile() {
  const { user } = useAuth();

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
  console.log(user);
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
            <button className="text-sm text-blue-400 hover:text-blue-300 transition duration-200">
              Modifier
            </button>
          </div>
          <div className="space-y-1">
            <div>
              <span className="text-gray-400 text-xs">Nom complet</span>
              <p className="text-white text-sm">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Date de naissance</span>
              <p className="text-white text-sm">{user?.birthDay}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Adresse</span>
              <p className="text-white text-sm">{user?.address}</p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Téléphone</span>
              <p className="text-white text-sm">
                {user?.phone || "06 12 34 56 78"}
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-xs">Email</span>
              <p className="text-white text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Connection & Payment Methods */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-white">
              Connexion et paiement
            </h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition duration-200">
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
            <button className="text-sm text-blue-400 hover:text-blue-300 transition duration-200">
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
