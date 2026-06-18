import { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import { getUserAppointments } from "../../services/userAppointmentsService";
import { getAppointmentStatusLabel } from "../../services/dateService";
import DateUtils from "../../services/dateService";

/* ── Statut badge ─────────────────────────────────────────────── */
const STATUS_MAP = {
  scheduled: { classes: "bg-blue-900/40 text-blue-300 border border-blue-700" },
  confirmed: { classes: "bg-green-900/40 text-green-300 border border-green-700" },
  canceled: { label: "Annulé", classes: "bg-red-900/40 text-red-300 border border-red-700" },
  completed: { label: "Passé",  classes: "bg-gray-700 text-gray-400 border border-gray-600" },
};

function StatusBadge({ status, appointmentDate }) {
  let statusInfo = STATUS_MAP[status] ?? STATUS_MAP.scheduled;

  if ((status === "scheduled" || status === "confirmed") && appointmentDate) {
    const computed = getAppointmentStatusLabel(appointmentDate);
    if (computed === "Passé") {
      return (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap text-center ${STATUS_MAP.completed.classes}`} style={{ minWidth: "75px" }}>
          Passé
        </span>
      );
    }
    return (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap text-center ${statusInfo.classes}`} style={{ minWidth: "75px" }}>
        {computed}
      </span>
    );
  }

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap text-center ${statusInfo.classes}`} style={{ minWidth: "75px" }}>
      {statusInfo.label}
    </span>
  );
}

/* ── Appointment card ──────────────────────────────────────────── */
function AppointmentCard({ appointment, showActions = true }) {
  const {
    id,
    doctorFirstName,
    doctorLastName,
    doctorSpeciality,
    doctorAvatar,
    doctorEmail,
    doctorPhone,
    businessSiteName,
    businessSiteAddress,
    date,
    dateIso,
    timeStart,
    timeEnd,
    status,
  } = appointment;

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelClick = () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      // TODO: Appeler API pour annuler le rendez-vous
      console.log("Annulation du rendez-vous:", id);
    }
  };

  const mapsUrl = businessSiteAddress
    ? `https://www.google.com/maps/dir//${encodeURIComponent(businessSiteAddress)}`
    : null;

  return (
    <div className="bg-gray-800 rounded-xl p-5 flex flex-col sm:flex-row gap-4">
      {/* Avatar */}
      <img
        src={doctorAvatar || `/images/user/avatar-doctor-male.webp`}
        alt={`Dr. ${doctorFirstName} ${doctorLastName}`}
        className="w-14 h-14 rounded-full object-cover shrink-0"
        onError={(e) => { e.currentTarget.src = "/images/user/avatar-doctor-male.webp"; }}
      />

      {/* Main info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-white font-semibold text-sm">
            Dr. {doctorFirstName} {doctorLastName}
          </p>
        </div>

        {doctorSpeciality && (
          <p className="text-blue-400 text-xs">{doctorSpeciality}</p>
        )}

        {/* Date / time */}
        <div className="flex items-center gap-1.5 text-gray-300 text-sm mt-1">
          <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{date}</span>
          <span className="text-gray-500">·</span>
          <span>{timeStart} – {timeEnd}</span>
        </div>

        {/* Cabinet */}
        {businessSiteName && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{businessSiteName}{businessSiteAddress ? ` — ${businessSiteAddress}` : ""}</span>
            </div>

            {/* Email and phone - side by side */}
            {(doctorEmail || doctorPhone) && (
              <div className="flex gap-4 text-gray-400 text-xs">
                {doctorEmail && (
                  <span>Email: {doctorEmail}</span>
                )}
                {doctorPhone && (
                  <span>Tél: {doctorPhone}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col gap-2 shrink-0 justify-end items-center sm:items-end self-center">
        <StatusBadge status={status} appointmentDate={dateIso} />

        {showActions && (
          <>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition w-full text-center"
              >
                Itinéraire
              </a>
            )}

            <button
              onClick={() => alert('Fonctionnalité à venir')}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer w-full text-center"
            >
              Documents
            </button>

            {(status === "scheduled" || status === "confirmed") && (
              <button
                onClick={handleCancelClick}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition cursor-pointer w-full text-center"
              >
                Annuler
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg className="w-14 h-14 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-gray-400 font-medium">Aucun rendez-vous pour le moment</p>
      <p className="text-gray-600 text-sm mt-1">
        Prenez rendez-vous avec un médecin pour le voir apparaître ici.
      </p>
    </div>
  );
}

/* ── Page principale ─────────────────────────────────────────── */
function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMoreHistory, setShowMoreHistory] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getUserAppointments();
      if (result.success) {
        setAppointments(result.data || []);
      } else {
        setError(result.error);
        setAppointments([]);
      }
      setIsLoading(false);
    };
    fetchAppointments();
  }, []);

  // Helper function to check if a date is in the future
  const isFutureDate = (dateString) => {
    const date = DateUtils.parseDate(dateString);
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(date);
    apptDate.setHours(0, 0, 0, 0);
    return apptDate > today;
  };

  // Future appointments (with future date: scheduled, confirmed, pending, or canceled)
  const upcoming = appointments.filter((a) => {
    const isFuture = isFutureDate(a.dateIso || a.date);
    if (isFuture && ["scheduled", "confirmed", "pending", "canceled"].includes(a.status)) return true;
    return false;
  });

  // Past appointments (with past date: scheduled, confirmed, pending, canceled, or completed)
  const past = appointments.filter((a) => {
    const isFuture = isFutureDate(a.dateIso || a.date);
    if (!isFuture && ["scheduled", "confirmed", "pending", "canceled"].includes(a.status)) return true;
    if (a.status === "completed") return true;
    return false;
  });

  const historyToShow = showMoreHistory ? past : past.slice(0, 3);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pb-24 space-y-8">
        {/* ── Header ──────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-white">Mes rendez-vous</h1>
          <p className="text-gray-400 text-sm mt-1">
            Historique et suivi de vos consultations
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Prochains rendez-vous */}
            {upcoming.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Prochains rendez-vous
                </h2>
                {upcoming.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} />
                ))}
              </section>
            )}

            {/* Historique des rendez-vous */}
            {past.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Historique des rendez-vous
                </h2>
                {historyToShow.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} showActions={false} />
                ))}

                {/* Bouton "Afficher plus" */}
                {past.length > 3 && !showMoreHistory && (
                  <button
                    onClick={() => setShowMoreHistory(true)}
                    className="w-full mt-4 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition font-medium text-sm"
                  >
                    Afficher plus ({past.length - 3} rendez-vous supplémentaires)
                  </button>
                )}

                {/* Bouton "Afficher moins" */}
                {showMoreHistory && (
                  <button
                    onClick={() => setShowMoreHistory(false)}
                    className="w-full mt-4 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition font-medium text-sm"
                  >
                    Afficher moins
                  </button>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default Appointments;
