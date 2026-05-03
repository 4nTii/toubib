import Layout from "../../components/Layout/Layout";

/* ── Statut badge ─────────────────────────────────────────────── */
const STATUS_MAP = {
  confirmed: { label: "Confirmé",   classes: "bg-green-900/40 text-green-300 border border-green-700" },
  pending:   { label: "En attente", classes: "bg-yellow-900/40 text-yellow-300 border border-yellow-700" },
  cancelled: { label: "Annulé",     classes: "bg-red-900/40 text-red-300 border border-red-700" },
  completed: { label: "Passé",      classes: "bg-gray-700 text-gray-400 border border-gray-600" },
};

function StatusBadge({ status }) {
  const { label, classes } = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${classes}`}>
      {label}
    </span>
  );
}

/* ── Appointment card (données à brancher sur l'API) ──────────── */
function AppointmentCard({ appointment }) {
  const {
    id,
    doctorFirstName,
    doctorLastName,
    doctorSpeciality,
    doctorAvatar,
    businessSiteName,
    businessSiteAddress,
    date,           // ex. "Jeudi 8 Mai 2026"
    timeStart,      // ex. "09:00"
    timeEnd,        // ex. "09:30"
    status,         // "confirmed" | "pending" | "cancelled" | "completed"
    notes,
  } = appointment;

  return (
    <div className="bg-gray-800 rounded-xl p-5 flex flex-col sm:flex-row gap-4">
      {/* Avatar */}
      <img
        src={doctorAvatar || `/images/user/avatar-doctor-male.webp`}
        alt={`Dr. ${doctorFirstName} ${doctorLastName}`}
        className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-600 shrink-0"
        onError={(e) => { e.currentTarget.src = "/images/user/avatar-doctor-male.webp"; }}
      />

      {/* Main info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-white font-semibold text-sm">
            Dr. {doctorFirstName} {doctorLastName}
          </p>
          <StatusBadge status={status} />
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
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{businessSiteName}{businessSiteAddress ? ` — ${businessSiteAddress}` : ""}</span>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <p className="text-gray-500 text-xs italic mt-1 truncate">
            Motif : {notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
        {status === "confirmed" || status === "pending" ? (
          <button
            disabled
            title="Disponible prochainement"
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-500 cursor-not-allowed"
          >
            Annuler
          </button>
        ) : null}
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
  // TODO: remplacer par un appel API quand le endpoint sera disponible
  const appointments = [];
  const upcoming = appointments.filter((a) => a.status === "confirmed" || a.status === "pending");
  const past     = appointments.filter((a) => a.status === "completed" || a.status === "cancelled");

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

        {appointments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  À venir
                </h2>
                {upcoming.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} />
                ))}
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Passés
                </h2>
                {past.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default Appointments;
