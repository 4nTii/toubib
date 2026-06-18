import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import GoogleMaps from "../../components/UiHTML/GoogleMaps";
import { getDoctorById } from "../../services/doctorService";
import {
  parseWorkingSchedule,
  formatDuration,
  formatSlotDate,
} from "../../services/dateService";
import { formatFee } from "../../services/mathService";

function Doctor() {
  const { id, name } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [availableSlot, setAvailableSlot] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDoctor() {
      setLoading(true);
      const result = await getDoctorById(id, name);
      if (result.success) {
        setDoctor(result.data.doctor);
        setAvailableSlot(result.data.availableSlots ?? {});
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
    fetchDoctor();
  }, [id]);

  /**
   * Returns the first 3 dates (with up to 3 slots each) from availableSlot.
   * Returns null if there are no slots at all.
   */
  const getNextAvailabilities = () => {
    const dates = Object.keys(availableSlot).sort();
    if (dates.length === 0) return null;
    return dates.slice(0, 3).map((dateKey) => ({
      dateKey,
      label: formatSlotDate(dateKey),
      slots: (availableSlot[dateKey] ?? []).slice(0, 5),
    }));
  };

  const getProfileImage = () => {
    if (doctor?.profilePicture) {
      return doctor.profilePicture;
    }
    const gender = doctor?.user?.gender || "male";
    return `/images/user/avatar-doctor-${gender}.webp`;
  };

  const formatActivityStart = (dateStr) => {
    if (!dateStr) return null;
    const year = new Date(dateStr).getFullYear();
    const current = new Date().getFullYear();
    return `${current - year} ans d'expérience (depuis ${year})`;
  };

  const getPrimaryBusinessSite = () => {
    if (!doctor?.doctorBusinessSites?.length) return null;
    const primary = doctor.doctorBusinessSites.find((dbs) => dbs.isPrimary);
    return primary || doctor.doctorBusinessSites[0];
  };

  const getOtherBusinessSites = () => {
    if (!doctor?.doctorBusinessSites?.length) return [];
    const primary = doctor.doctorBusinessSites.find((dbs) => dbs.isPrimary);
    if (!primary) return [];
    return doctor.doctorBusinessSites.filter((dbs) => dbs.id !== primary.id);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-100">
          <div className="text-white text-xl">Chargement...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-100">
          <div className="text-red-400 text-xl">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-100">
          <div className="text-gray-400 text-xl">Médecin non trouvé</div>
        </div>
      </Layout>
    );
  }

  const primarySite = getPrimaryBusinessSite();
  const otherSites = getOtherBusinessSites();
  const workingDays = parseWorkingSchedule(primarySite?.workingSchedule);

  return (
    <>
      <Layout>
        <div className="max-w-5xl mx-auto pb-24 space-y-6">
        {/* ── Hero card ───────────────────────────────────────────── */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={getProfileImage()}
                alt={`Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`}
                className="w-36 h-36 rounded-full object-cover ring-4 ring-gray-700"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {doctor.isActive ? (
                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                    Actif
                  </span>
                ) : (
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    Inactif
                  </span>
                )}
                {doctor.verified && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
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

            {/* Main info */}
            <div className="flex-1 pt-2 text-center md:text-left">
              <h1 className="text-2xl font-bold text-white">
                Dr. {doctor.user?.firstName} {doctor.user?.lastName}
              </h1>
              <p className="text-blue-400 text-base font-medium mt-0.5">
                {doctor.speciality?.name}
              </p>
              {doctor.speciality?.description && (
                <p className="text-gray-500 text-sm mt-0.5">
                  {doctor.speciality.description}
                </p>
              )}
              {doctor.activityStarted && (
                <p className="text-gray-400 text-sm mt-1">
                  {formatActivityStart(doctor.activityStarted)}
                </p>
              )}

              {doctor.biography && (
                <p className="text-gray-300 text-sm mt-3 leading-relaxed">
                  {doctor.biography}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mt-4 text-sm">
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
                    Accepte de nouveaux patients
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
                    Téléconsultation disponible
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cabinet principal */}
            {primarySite && (
              <section className="bg-gray-800 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Cabinet principal
                </h2>

                {/* Infos cabinet + Horaires côte à côte */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Infos cabinet */}
                  <div className="space-y-1 text-sm">
                    <p className="text-white font-medium text-base">
                      {primarySite.businessSite?.name}
                    </p>
                    <p className="text-gray-400">
                      {primarySite.businessSite?.address},{" "}
                      {primarySite.businessSite?.ville}
                    </p>
                    <p className="text-gray-500">
                      {primarySite.businessSite?.region?.name} —{" "}
                      {primarySite.businessSite?.region?.country}
                    </p>
                    <div className="pt-1 flex flex-col gap-1 text-gray-300">
                      <span>
                        <span className="text-gray-500">Tél. </span>
                        <a href={`tel:${primarySite.businessSite?.phone}`}>
                          {primarySite.businessSite?.phone}
                        </a>
                      </span>
                      <span>
                        <span className="text-gray-500">Email </span>
                        <a href={`mailto:${primarySite.businessSite?.email}`}>
                          {primarySite.businessSite?.email}
                        </a>
                      </span>
                    </div>
                    <div className="pt-3 mt-2 border-t border-gray-700">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                        Informations légales
                      </p>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">N° de licence</dt>
                          <dd className="text-gray-200 font-mono">
                            {doctor.licenseNumber || "Non renseigné"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Horaires */}
                  {workingDays.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                        Horaires d'ouverture
                      </p>
                      <div className="space-y-1">
                        {workingDays.map((day) => (
                          <div
                            key={day.dayName}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-400 w-24">
                              {day.dayName}:
                            </span>
                            {day.status === "ouvert" ? (
                              <span className="text-gray-200">
                                {day.start} – {day.end}
                              </span>
                            ) : (
                              <span className="text-red-400">Fermé</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-orange-400 flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Contact d'urgence&nbsp;:
                        <strong>15 (SAMU)</strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* Mini map placeholder */}
                <div className="mt-4 border-t border-gray-700 pt-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                    Localisation
                  </p>
                  <GoogleMaps
                    srcUrl={primarySite.businessSite?.locationGoogleMap}
                    query={`${primarySite.businessSite?.name} ${primarySite.businessSite?.address} ${primarySite.businessSite?.ville} ${primarySite.businessSite?.region?.name} ${primarySite.businessSite?.region?.country}`}
                  />
                </div>
              </section>
            )}

            {/* Autres cabinets */}
            {otherSites.length > 0 && (
              <section className="bg-gray-800 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Exerce également dans
                </h2>
                <ul className="divide-y divide-gray-700">
                  {otherSites.map((dbs) => (
                    <li
                      key={dbs.id}
                      onClick={() =>
                        navigate(`/cabinet/${dbs.businessSite?.id}`)
                      }
                      className="py-2 flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-700 rounded px-2 -mx-2 transition"
                    >
                      <svg
                        className="w-4 h-4 text-gray-500 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      <span className="text-gray-200">
                        {dbs.businessSite?.name}
                      </span>
                      <span className="text-gray-500">—</span>
                      <span className="text-gray-400">
                        {dbs.businessSite?.ville}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Expertises et prestations */}
            <section className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-3">
                Expertises et prestations
              </h2>
              <p className="text-gray-500 text-sm italic">
                Informations disponibles prochainement.
              </p>
            </section>

            {/* Avis */}
            <section className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-3">Avis</h2>
              <p className="text-gray-500 text-sm italic">
                Informations disponibles prochainement.
              </p>
            </section>

            {/* FAQ */}
            <section className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-3">FAQ</h2>
              <p className="text-gray-500 text-sm italic">
                Questions fréquentes disponibles prochainement.
              </p>
            </section>
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6 lg:sticky lg:top-6 self-start transition-all duration-300">
            {/* Tarifs et remboursement */}

            {/* Sticky appointment button */}
            {doctor.isActive && (
              <button
                onClick={() => navigate(`/doctor/${id}/appointment`)}
                className="hidden md:block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition duration-200 cursor-pointer"
              >
                Prendre rendez-vous
              </button>
            )}

            {/* Prochaine disponibilité */}
            <section className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white mb-3">
                Prochaine disponibilité
              </h2>
              {(() => {
                const availabilities = getNextAvailabilities();
                if (!availabilities) {
                  return (
                    <>
                      <p className="text-gray-500 text-sm italic">
                        Aucune disponibilité pour l'instant.
                      </p>
                      <p className="text-gray-500 text-sm italic">
                        Pour plus d'informations, contactez le docteur.
                      </p>
                    </>
                  );
                }
                return (
                  <div className="space-y-3">
                    {availabilities.map(({ dateKey, label, slots }) => (
                      <div key={dateKey}>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                          {`- ${label}`}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-start">
                          {slots.map((slot) => (
                            <button
                              key={slot.start}
                              onClick={() =>
                                navigate(`/doctor/${id}/appointment`, {
                                  state: {
                                    preselectedDate: dateKey,
                                    preselectedSlot: slot,
                                  },
                                })
                              }
                              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-2.5 py-1 rounded-sm cursor-pointer transition"
                            >
                              {slot.start}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </section>

            <section className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white mb-3">
                Tarifs et remboursement
              </h2>
              {primarySite ? (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Durée de consultation</dt>
                    <dd className="text-gray-200">
                      {formatDuration(primarySite.consultationDuration)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Tarif de consultation</dt>
                    <dd className="text-white font-medium">
                      {formatFee(primarySite.consultationFee)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  Informations disponibles prochainement.
                </p>
              )}
            </section>

            {/* Moyens de paiement */}
            <section className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white mb-3">
                Moyens de paiement
              </h2>
              <p className="text-gray-500 text-sm italic">
                Informations disponibles prochainement.
              </p>
            </section>

            {/* Report a problem */}
            <div className="text-center">
              <button className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-2 transition cursor-pointer">
                Signaler un problème avec ce profil
              </button>
            </div>
          </div>
        </div>
        </div>
      </Layout>

      {/* Fixed appointment button for mobile */}
      {doctor?.isActive && (
        <button
          onClick={() => navigate(`/doctor/${id}/appointment`)}
          className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 shadow-lg transition duration-200 cursor-pointer"
        >
          Prendre rendez-vous
        </button>
      )}
    </>
  );
}

export default Doctor;
