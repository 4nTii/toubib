import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { getDoctorById } from "../../services/doctorService";
import { getAvailableSlots } from "../../services/appointmentService";
import DateUtils, {
  formatSlotDate,
  offsetDate,
  offsetDateFrom,
} from "../../services/dateService";
import { FTP_TARGET } from "../../config/config";

function Appointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Doctor info
  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);

  // Slots
  const [slots, setSlots] = useState({});
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState(null);

  // Date range for the slot picker (week window)
  const [startDate, setStartDate] = useState(offsetDate(0));
  const [endDate, setEndDate] = useState(offsetDate(6));

  // Selected slot
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Appointment reason
  const [reason, setReason] = useState("");

  /* ── Fetch doctor info ─────────────────────────────────────── */
  useEffect(() => {
    async function fetchDoctor() {
      setDoctorLoading(true);
      const result = await getDoctorById(id);
      if (result.success) {
        setDoctor(result.data.doctor);
      }
      setDoctorLoading(false);
    }
    fetchDoctor();
  }, [id]);

  /* ── Fetch available slots whenever date range changes ──────── */
  useEffect(() => {
    async function fetchSlots() {
      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedDate(null);
      setSelectedSlot(null);
      const result = await getAvailableSlots(id, startDate, endDate);
      if (result.success) {
        setSlots(result.data.availableSlots ?? {});
      } else {
        setSlotsError(result.error);
        setSlots({});
      }
      setSlotsLoading(false);
    }
    fetchSlots();
  }, [id, startDate, endDate]);

  /* ── Navigate week ─────────────────────────────────────────── */
  const goToPrevWeek = () => {
    const newStart = offsetDateFrom(startDate, -7);
    if (newStart < offsetDate(0)) return; // don't go before today
    setStartDate(newStart);
    setEndDate(offsetDateFrom(newStart, 6));
  };

  const goToNextWeek = () => {
    const newStart = offsetDateFrom(startDate, 7);
    setStartDate(newStart);
    setEndDate(offsetDateFrom(newStart, 6));
  };

  /* ── Helpers ───────────────────────────────────────────────── */
  const getProfileImage = () => {
    if (doctor?.profilePicture) return `${FTP_TARGET}/${doctor.profilePicture}`;
    const gender = doctor?.user?.gender || "male";
    return `/images/user/avatar-doctor-${gender}.webp`;
  };

  const sortedDates = Object.keys(slots).sort();
  const isFirstWeek = startDate <= offsetDate(0);

  const formatWeekRange = () => {
    const s = DateUtils.formatDate(startDate, "fr-FR");
    const e = DateUtils.formatDate(endDate, "fr-FR");
    return `${s} — ${e}`;
  };

  /* ── Loading / error states ────────────────────────────────── */
  if (doctorLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-100">
          <div className="text-white text-xl">Chargement...</div>
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

  const primarySite =
    doctor.doctorBusinessSites?.find((dbs) => dbs.isPrimary) ??
    doctor.doctorBusinessSites?.[0];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-24 space-y-6">
        {/* ── Back link ──────────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition cursor-pointer"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour au profil
        </button>

        {/* ── Doctor summary card ─────────────────────────────────── */}
        <div className="bg-gray-800 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start">
          <img
            src={getProfileImage()}
            alt={`Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-600 shrink-0"
            onError={(e) => {
              e.currentTarget.src = `/images/user/avatar-doctor-${doctor.user?.gender || "male"}.webp`;
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">
              Dr. {doctor.user?.firstName} {doctor.user?.lastName}
            </h1>
            {doctor.speciality?.name && (
              <p className="text-blue-400 text-sm">{doctor.speciality.name}</p>
            )}
            {primarySite?.businessSite && (
              <p className="text-gray-400 text-sm mt-0.5">
                {primarySite.businessSite.name} —{" "}
                {primarySite.businessSite.ville}
              </p>
            )}
          </div>
          <div className="shrink-0">
            <span className="bg-blue-900/40 text-blue-300 text-xs px-3 py-1 rounded-full">
              Prise de rendez-vous
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left : slot picker ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Appointment form — visible only when a slot is selected */}
            {selectedSlot && (
              <div className="bg-gray-800 rounded-xl p-5 space-y-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Confirmer le rendez-vous
                </h2>

                {/* Selected slot recap */}
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg px-4 py-3 flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-blue-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {formatSlotDate(selectedDate)}
                    </p>
                    <p className="text-blue-300 text-xs">
                      {selectedSlot.start} – {selectedSlot.end}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSlot(null);
                      setSelectedDate(null);
                    }}
                    className="ml-auto text-gray-500 hover:text-gray-300 transition cursor-pointer"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">
                    Motif de consultation{" "}
                    <span className="text-gray-600">(optionnel)</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Décrivez brièvement le motif de votre visite…"
                    className="w-full bg-gray-700 text-white placeholder-gray-500 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>

                {/* Submit */}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer">
                  Confirmer le rendez-vous
                </button>
              </div>
            )}

            {/* Week navigation */}
            <div className="bg-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPrevWeek}
                  disabled={isFirstWeek}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-gray-300 text-sm font-medium">
                  {formatWeekRange()}
                </span>
                <button
                  onClick={goToNextWeek}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Slots */}
              {slotsLoading ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Chargement des créneaux...
                </div>
              ) : slotsError ? (
                <div className="text-center py-8 text-red-400 text-sm">
                  {slotsError}
                </div>
              ) : sortedDates.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="w-10 h-10 text-gray-600 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm">
                    Aucun créneau disponible sur cette période.
                  </p>
                  <button
                    onClick={goToNextWeek}
                    className="mt-3 text-blue-400 hover:text-blue-300 text-sm underline underline-offset-2 cursor-pointer"
                  >
                    Voir la semaine suivante
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedDates.map((dateKey) => (
                    <div key={dateKey}>
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">
                        {formatSlotDate(dateKey)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {slots[dateKey].map((slot) => {
                          const isSelected =
                            selectedDate === dateKey &&
                            selectedSlot?.start === slot.start;
                          return (
                            <button
                              key={slot.start}
                              onClick={() => {
                                setSelectedDate(dateKey);
                                setSelectedSlot(slot);
                              }}
                              className={`text-sm font-medium px-3 py-1.5 rounded transition cursor-pointer ${
                                isSelected
                                  ? "bg-blue-600 text-white ring-2 ring-blue-400"
                                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                              }`}
                            >
                              {slot.start}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right : doctor contact info ─────────────────────────── */}
          <div className="space-y-5 lg:sticky lg:top-6 self-start">
            {/* Contact */}
            {primarySite?.businessSite && (
              <section className="bg-gray-800 rounded-xl p-5">
                <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-400"
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
                  Cabinet
                </h2>
                <p className="text-gray-200 text-sm font-medium">
                  {primarySite.businessSite.name}
                </p>
                <p className="text-gray-400 text-sm mt-0.5">
                  {primarySite.businessSite.address},{" "}
                  {primarySite.businessSite.ville}
                </p>
                {primarySite.businessSite.region && (
                  <p className="text-gray-500 text-sm">
                    {primarySite.businessSite.region.name}
                  </p>
                )}
                <dl className="mt-3 space-y-1.5 text-sm border-t border-gray-700 pt-3">
                  {primarySite.businessSite.phone && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-500">Tél.</dt>
                      <dd>
                        <a
                          href={`tel:${primarySite.businessSite.phone}`}
                          className="text-gray-200 hover:text-white transition"
                        >
                          {primarySite.businessSite.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {primarySite.businessSite.email && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-500">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${primarySite.businessSite.email}`}
                          className="text-gray-200 hover:text-white transition truncate block max-w-36"
                        >
                          {primarySite.businessSite.email}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {/* Infos RDV */}
            <section className="bg-gray-800 rounded-xl p-5 space-y-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Informations
              </h2>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Confirmation immédiate
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Rappel envoyé 24h avant
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Annulation gratuite jusqu'à 2h avant
                </li>
              </ul>
            </section>

            {/* Urgence */}
            <div className="bg-yellow-900 border border-orange-800 rounded-xl p-4">
              <p className="text-orange-400 text-xs font-medium flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                En cas d'urgence médicale
              </p>
              <p className="text-orange-300 text-xs mt-1">
                Appelez le <strong>15 (SAMU)</strong> ou le{" "}
                <strong>18 (Pompiers)</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Appointment;
