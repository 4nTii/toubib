import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const cabinetMenu = [
  {
    label: "Tableau de bord",
    path: "/cabinet",
    children: [
      { label: "Vue globale", path: "/cabinet" },
      { label: "Activité récente", path: "/cabinet/activite" },
    ],
  },
  {
    label: "Patients",
    path: "/cabinet/patients",
    children: [
      { label: "Liste des patients", path: "/cabinet/patients" },
      { label: "Ajouter un patient", path: "/cabinet/patients/ajouter" },
      { label: "Recherche avancée", path: "/cabinet/patients/recherche" },
    ],
  },
  {
    label: "Dossiers médicaux",
    path: "/cabinet/dossiers",
    children: [
      { label: "Tous les dossiers", path: "/cabinet/dossiers" },
      { label: "Antécédents", path: "/cabinet/dossiers/antecedents" },
      { label: "Traitements", path: "/cabinet/dossiers/traitements" },
      { label: "Documents", path: "/cabinet/dossiers/documents" },
    ],
  },
  {
    label: "Rendez-vous",
    path: "/cabinet/rendez-vous",
    children: [
      { label: "Agenda", path: "/cabinet/rendez-vous" },
      { label: "Nouveau rendez-vous", path: "/cabinet/rendez-vous/nouveau" },
      { label: "En attente", path: "/cabinet/rendez-vous/attente" },
    ],
  },
  {
    label: "Consultations",
    path: "/cabinet/consultations",
    children: [
      {
        label: "Nouvelle consultation",
        path: "/cabinet/consultations/nouvelle",
      },
      { label: "Historique", path: "/cabinet/consultations" },
    ],
  },
  {
    label: "Ordonnances",
    path: "/cabinet/ordonnances",
    children: [
      { label: "Créer ordonnance", path: "/cabinet/ordonnances/creer" },
      { label: "Historique", path: "/cabinet/ordonnances" },
    ],
  },
  {
    label: "Analyses",
    path: "/cabinet/analyses",
    children: [
      { label: "Prescrire examen", path: "/cabinet/analyses/prescrire" },
      { label: "Résultats", path: "/cabinet/analyses" },
    ],
  },
  {
    label: "Facturation",
    path: "/cabinet/facturation",
    children: [
      { label: "Factures", path: "/cabinet/facturation" },
      { label: "Paiements", path: "/cabinet/facturation/paiements" },
    ],
  },
  {
    label: "Messagerie",
    path: "/cabinet/messagerie",
    children: [
      { label: "Boîte de réception", path: "/cabinet/messagerie" },
      { label: "Notifications", path: "/cabinet/messagerie/notifications" },
    ],
  },
  {
    label: "Paramètres",
    path: "/cabinet/parametres",
    children: [
      { label: "Profil", path: "/cabinet/parametres" },
      { label: "Préférences", path: "/cabinet/parametres/preferences" },
      { label: "Sécurité", path: "/cabinet/parametres/securite" },
    ],
  },
];

function CabinetLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Find active parent based on current path
  const findActiveParent = () => {
    for (const item of cabinetMenu) {
      if (
        location.pathname === item.path ||
        item.children.some((child) => location.pathname === child.path)
      ) {
        return item;
      }
    }
    return cabinetMenu[0];
  };

  const [activeParent, setActiveParent] = useState(findActiveParent);

  if (!user?.doctor) {
    return <Navigate to="/" replace />;
  }

  const isActiveChild = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header horizontal menu */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/home"
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
              <span className="text-sm">Quitter</span>
            </Link>
            <div className="flex space-x-1 overflow-x-auto">
              {cabinetMenu.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveParent(item)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition duration-200 whitespace-nowrap cursor-pointer ${
                    activeParent.label === item.label
                      ? "bg-gray-900 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar vertical menu */}
        <aside className="w-64 bg-gray-800 min-h-[calc(100vh-3.5rem)] border-r border-gray-700">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              {activeParent.label}
            </h3>
            <nav className="space-y-1">
              {activeParent.children.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  className={`block px-4 py-2 rounded-lg transition duration-200 ${
                    isActiveChild(child.path)
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default CabinetLayout;
