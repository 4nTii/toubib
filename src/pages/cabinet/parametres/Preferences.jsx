import { useState } from "react";
import CabinetLayout from "../../../components/Layout/CabinetLayout";
import { useDoctor } from "../../../context/DoctorContext";
import { DAYS_FR, DAYS_ORDER } from "../../../services/dateService";
import { DURATION_OPTIONS } from "../../../services/doctorService";

function CabinetCard({ site, onEdit }) {
  const {
    businessSite,
    isOwner,
    isPrimary,
    consultationDuration,
    consultationFee,
    workingSchedule,
  } = site;

  const formatFee = (fee) => {
    if (!fee) return "Non défini";
    return `${(fee / 100).toFixed(2)} €`;
  };

  const formatDuration = (duration) => {
    const option = DURATION_OPTIONS.find((o) => o.value === duration);
    return option ? option.label : `${duration} min`;
  };

  const getEnabledDays = () => {
    if (!workingSchedule) return "Non défini";
    const days = DAYS_ORDER.filter((day) => workingSchedule[day]?.enabled);
    if (days.length === 0) return "Aucun";
    return days.map((day) => DAYS_FR[day].substring(0, 3)).join(", ");
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-gray-600 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {businessSite.name}
          </h3>
          <p className="text-gray-400 text-sm">{businessSite.ville}</p>
        </div>
        <div className="flex gap-2">
          {isPrimary && (
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
              Principal
            </span>
          )}
          {isOwner && (
            <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
              Propriétaire
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p className="text-gray-300">
          <span className="text-gray-500">Adresse:</span> {businessSite.address}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">Téléphone:</span> {businessSite.phone}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">Email:</span> {businessSite.email}
        </p>
        <hr className="border-gray-700 my-3" />
        <p className="text-gray-300">
          <span className="text-gray-500">Durée consultation:</span>{" "}
          {formatDuration(consultationDuration)}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">Tarif:</span>{" "}
          {formatFee(consultationFee)}
        </p>
        <p className="text-gray-300">
          <span className="text-gray-500">Jours travaillés:</span>{" "}
          {getEnabledDays()}
        </p>
      </div>

      <button
        onClick={() => onEdit(site)}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
      >
        Modifier
      </button>
    </div>
  );
}

function AddCabinetCard({ onClick }) {
  return (
    <div className="flex items-center justify-center">
      <button
        onClick={onClick}
        className="bg-gray-800 rounded-lg p-4 shadow-lg border-2 border-dashed border-gray-600 hover:border-blue-500 transition flex items-center gap-3 cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <span className="text-gray-400 font-medium">Ajouter un cabinet</span>
      </button>
    </div>
  );
}

function EditCabinetModal({
  site,
  onClose,
  onSave,
  isSaving,
  isOwner,
  doctor,
}) {
  const [formData, setFormData] = useState({
    name: site.businessSite.name || "",
    address: site.businessSite.address || "",
    ville: site.businessSite.ville || "",
    phone: site.businessSite.phone || "",
    email: site.businessSite.email || "",
    consultationDuration: site.consultationDuration || 30,
    consultationFee: site.consultationFee || 0,
    workingSchedule: site.workingSchedule || {},
  });

  const [originalData] = useState({ ...formData });
  const [activeTab, setActiveTab] = useState(
    isOwner ? "cabinet" : "consultation",
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      workingSchedule: {
        ...prev.workingSchedule,
        [day]: {
          ...prev.workingSchedule[day],
          [field]: value,
        },
      },
    }));
  };

  const getChangedFields = () => {
    const businessSiteChanges = {};
    const doctorBusinessSiteChanges = {};

    // Seul le propriétaire peut modifier les infos du cabinet
    if (isOwner) {
      if (formData.name !== originalData.name)
        businessSiteChanges.name = formData.name;
      if (formData.address !== originalData.address)
        businessSiteChanges.address = formData.address;
      if (formData.ville !== originalData.ville)
        businessSiteChanges.ville = formData.ville;
      if (formData.phone !== originalData.phone)
        businessSiteChanges.phone = formData.phone;
      if (formData.email !== originalData.email)
        businessSiteChanges.email = formData.email;
    }

    // Tous les docteurs peuvent modifier ces champs
    if (formData.consultationDuration !== originalData.consultationDuration) {
      doctorBusinessSiteChanges.consultationDuration =
        formData.consultationDuration;
    }
    if (formData.consultationFee !== originalData.consultationFee) {
      doctorBusinessSiteChanges.consultationFee = formData.consultationFee;
    }
    if (
      JSON.stringify(formData.workingSchedule) !==
      JSON.stringify(originalData.workingSchedule)
    ) {
      doctorBusinessSiteChanges.workingSchedule = formData.workingSchedule;
    }

    return { businessSiteChanges, doctorBusinessSiteChanges };
  };

  const handleSubmit = () => {
    const { businessSiteChanges, doctorBusinessSiteChanges } =
      getChangedFields();

    if (
      Object.keys(businessSiteChanges).length === 0 &&
      Object.keys(doctorBusinessSiteChanges).length === 0
    ) {
      onClose();
      return;
    }

    const payload = {
      doctorBusinessSite: {
        id: site.id,
        ...doctorBusinessSiteChanges,
      },
    };

    if (Object.keys(businessSiteChanges).length > 0) {
      payload.doctorBusinessSite.businessSite = businessSiteChanges;
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Modifier le cabinet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        {/* Onglets - seulement si propriétaire */}
        {isOwner && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("cabinet")}
              className={`px-4 py-2 text-sm font-medium rounded-tl-lg rounded-tr-lg transition cursor-pointer ${
                activeTab === "cabinet"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
              }`}
            >
              Informations du cabinet
            </button>
            <button
              onClick={() => setActiveTab("consultation")}
              className={`px-4 py-2 text-sm font-medium rounded-tl-lg rounded-tr-lg transition cursor-pointer ${
                activeTab === "consultation"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
              }`}
            >
              Paramètres de consultation
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Onglet Infos cabinet - seulement pour le propriétaire */}
          {isOwner && activeTab === "cabinet" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2">
                    Nom du cabinet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Ville</label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => handleChange("ville", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section Propriétaires */}
              <hr className="border-gray-700 my-6" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Propriétaires
                </h3>
                <div className="space-y-2">
                  {/* Docteur connecté si propriétaire */}
                  {isOwner && doctor && (
                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300">
                        {doctor.user.firstName} {doctor.user.lastName}
                        <span className="text-gray-500 text-sm ml-2">
                          (vous)
                        </span>
                      </span>
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-300 transition cursor-pointer"
                        onClick={() => {
                          // TODO: Implémenter la suppression du privilège
                          alert("Fonctionnalité à venir");
                        }}
                      >
                        <svg
                          className="w-5 h-5"
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
                      </button>
                    </div>
                  )}
                  {/* Autres propriétaires depuis l'API */}
                  {(site.businessSite.owners || [])
                    .filter((owner) => owner.id !== doctor?.id)
                    .map((owner, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                      >
                        <span className="text-gray-300">
                          {owner.firstName} {owner.lastName}
                        </span>
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-300 transition cursor-pointer"
                          onClick={() => {
                            // TODO: Implémenter la suppression du privilège
                            alert("Fonctionnalité à venir");
                          }}
                        >
                          <svg
                            className="w-5 h-5"
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
                        </button>
                      </div>
                    ))}
                </div>

                {/* Ajouter un propriétaire */}
                <div className="flex items-center gap-2 p-1 mt-3 bg-gray-700/30 rounded-lg border border-dashed border-gray-600">
                  <input
                    type="text"
                    placeholder="Ajouter un docteur"
                    className="flex-1 px-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 transition cursor-pointer"
                    onClick={() => {
                      // TODO: Implémenter l'ajout d'un propriétaire
                      alert("Fonctionnalité à venir");
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Paramètres de consultation */}
          {(!isOwner || activeTab === "consultation") && (
            <>
              {/* Consultation */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Paramètres de consultation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">
                      Durée consultation
                    </label>
                    <select
                      value={formData.consultationDuration}
                      onChange={(e) =>
                        handleChange(
                          "consultationDuration",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      {DURATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">
                      Tarif consultation (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={
                        formData.consultationFee
                          ? (formData.consultationFee / 100).toFixed(2)
                          : ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "consultationFee",
                          Math.round(parseFloat(e.target.value || 0) * 100),
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Horaires */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Horaires de travail
                </h3>
                <div className="space-y-3">
                  {DAYS_ORDER.map((day) => {
                    const schedule = formData.workingSchedule[day] || {
                      enabled: false,
                      start: "08:00",
                      end: "18:00",
                    };
                    return (
                      <div
                        key={day}
                        className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg"
                      >
                        <label className="flex items-center gap-2 w-28">
                          <input
                            type="checkbox"
                            checked={schedule.enabled}
                            onChange={(e) =>
                              handleScheduleChange(
                                day,
                                "enabled",
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-gray-300">{DAYS_FR[day]}</span>
                        </label>
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={(e) =>
                            handleScheduleChange(day, "start", e.target.value)
                          }
                          disabled={!schedule.enabled}
                          className="px-3 py-1 bg-gray-600 text-white rounded border border-gray-500 disabled:opacity-50"
                        />
                        <span className="text-gray-400">à</span>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={(e) =>
                            handleScheduleChange(day, "end", e.target.value)
                          }
                          disabled={!schedule.enabled}
                          className="px-3 py-1 bg-gray-600 text-white rounded border border-gray-500 disabled:opacity-50"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Preferences() {
  const { doctor, isLoading, updateDoctor } = useDoctor();
  const [editingSite, setEditingSite] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSave = async (payload) => {
    setIsSaving(true);
    const result = await updateDoctor(payload);

    if (result.success) {
      setMessage({ type: "success", text: "Cabinet mis à jour avec succès" });
      setEditingSite(null);
    } else {
      setMessage({ type: "error", text: result.error });
    }

    setIsSaving(false);
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleAddCabinet = () => {
    // TODO: Implémenter l'ajout de cabinet
    alert("Fonctionnalité à venir");
  };

  if (isLoading) {
    return (
      <CabinetLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Chargement...</div>
        </div>
      </CabinetLayout>
    );
  }

  if (!doctor) {
    return (
      <CabinetLayout>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <p className="text-red-400">
            Impossible de charger les informations.
          </p>
        </div>
      </CabinetLayout>
    );
  }

  const sites = doctor.doctorBusinessSites || [];

  return (
    <CabinetLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Mes Cabinets</h2>
          <span className="text-gray-400">{sites.length} cabinet(s)</span>
        </div>

        {message.text && (
          <div
            className={`p-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-600/20 text-green-400"
                : "bg-red-600/20 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <CabinetCard key={site.id} site={site} onEdit={setEditingSite} />
          ))}
          <AddCabinetCard onClick={handleAddCabinet} />
        </div>
      </div>

      {editingSite && (
        <EditCabinetModal
          site={editingSite}
          onClose={() => setEditingSite(null)}
          onSave={handleSave}
          isSaving={isSaving}
          isOwner={editingSite.isOwner}
          doctor={doctor}
        />
      )}
    </CabinetLayout>
  );
}

export default Preferences;
