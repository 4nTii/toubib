import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { getDoctorById } from "../../services/doctorService";
import { FTP_TARGET } from "../../config/config";

function Doctor() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDoctor() {
      setLoading(true);
      const result = await getDoctorById(id);

      if (result.success) {
        setDoctor(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }

    fetchDoctor();
  }, [id]);

  const getProfileImage = () => {
    if (doctor?.profilePicture) {
      return `${FTP_TARGET}/${doctor.profilePicture}`;
    }
    const gender = doctor?.user?.gender || "male";
    return `/images/user/avatar-doctor-${gender}.webp`;
  };

  const formatWorkingDays = (schedule) => {
    if (!schedule) return [];
    const days = {
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
      saturday: "Samedi",
      sunday: "Dimanche",
    };

    return Object.entries(days)
      .map(([key, label]) => {
        const day = schedule[key];
        if (day?.enabled) {
          return { label, start: day.start, end: day.end };
        }
        return null;
      })
      .filter(Boolean);
  };

  const formatFee = (fee) => {
    if (!fee) return "N/A";
    return `${(fee / 100).toFixed(2)} €`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-xl">Chargement...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-400 text-xl">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-400 text-xl">Médecin non trouvé</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Doctor Profile Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="relative shrink-0">
              <img
                src={getProfileImage()}
                alt={`Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`}
                className="w-40 h-40 rounded-full object-cover"
              />
              {/* Status Badges */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                {doctor.isActive ? (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    Actif
                  </span>
                ) : (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    Inactif
                  </span>
                )}
                {doctor.verified && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Vérifié
                  </span>
                )}
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">
                Dr. {doctor.user?.firstName} {doctor.user?.lastName}
              </h1>
              <p className="text-blue-400 text-lg mb-2">
                {doctor.speciality?.name}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                {doctor.user?.gender === "male" ? "Homme" : "Femme"}
              </p>

              {doctor.biography && (
                <p className="text-gray-300 mb-4">{doctor.biography}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {doctor.acceptNewPatients && (
                  <span className="flex items-center gap-1 text-green-400">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Accepte nouveaux patients
                  </span>
                )}
                {doctor.teleconsultationEnabled && (
                  <span className="flex items-center gap-1 text-purple-400">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    Téléconsultation
                  </span>
                )}
              </div>

              {/* Appointment Button */}
              {doctor.isActive && (
                <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200 cursor-pointer">
                  Prendre un rendez-vous
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Business Sites */}
        <h2 className="text-xl font-semibold text-white mb-4">
          Lieux de consultation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctor.doctorBusinessSites?.map((dbs) => (
            <div
              key={dbs.id}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition duration-200"
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                {dbs.businessSite?.name}
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  <span className="text-gray-500">Adresse: </span>
                  {dbs.businessSite?.address}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Ville: </span>
                  {dbs.businessSite?.ville}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Région: </span>
                  {dbs.businessSite?.region?.name}
                </p>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <p className="text-gray-400">
                    <span className="text-gray-500">Durée: </span>
                    {dbs.consultationDuration} min
                  </p>
                  <p className="text-gray-400">
                    <span className="text-gray-500">Tarif: </span>
                    {formatFee(dbs.consultationFee)}
                  </p>
                </div>
                {dbs.workingSchedule && (
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <p className="text-gray-500 text-xs mb-1">Horaires:</p>
                    <div className="space-y-1">
                      {formatWorkingDays(dbs.workingSchedule).map((day) => (
                        <div
                          key={day.label}
                          className="flex justify-between text-xs"
                        >
                          <span className="text-gray-400">{day.label}</span>
                          <span className="text-gray-300">
                            {day.start} - {day.end}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Doctor;
