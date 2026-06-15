import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import GoogleMaps from "../../components/UiHTML/GoogleMaps";
import { getBusinessSiteById } from "../../services/businessSiteService";
import { parseWorkingSchedule } from "../../services/dateService";
import { FTP_TARGET } from "../../config/config";

function BusinessSite() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [businessSite, setBusinessSite] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBusinessSite() {
      setLoading(true);
      const result = await getBusinessSiteById(id);
      if (result.success) {
        setBusinessSite(result.data.businessSite);
        setDoctors(result.data.doctors ?? []);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
    fetchBusinessSite();
  }, [id]);

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

  if (!businessSite) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-100">
          <div className="text-gray-400 text-xl">Cabinet non trouvé</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-24 space-y-6">
        {/* ── Hero card ───────────────────────────────────────────── */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Icon */}
            <div className="shrink-0 self-start flex items-center justify-center w-40 h-40 rounded-xl bg-gray-700 ring-2 ring-gray-600">
              <svg
                className="w-40 h-40 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>

            {/* Main info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {businessSite.name}
              </h1>
              {businessSite.region && (
                <p className="text-blue-400 text-sm font-medium mt-0.5">
                  {businessSite.region.name}
                </p>
              )}
              <p className="text-gray-400 text-sm mt-1">
                {businessSite.address}
              </p>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-300">
                {businessSite.phone && (
                  <span className="flex items-center gap-1.5">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <a href={`tel:${businessSite.phone}`}>
                      {businessSite.phone}
                    </a>
                  </span>
                )}
                {businessSite.email && (
                  <span className="flex items-center gap-1.5">
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a href={`mailto:${businessSite.email}`}>
                      {businessSite.email}
                    </a>
                  </span>
                )}
              </div>

              {doctors.length > 0 && (
                <p className="mt-3 text-sm text-gray-500">
                  {doctors.length} médecin{doctors.length > 1 ? "s" : ""} dans
                  ce cabinet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Médecins du cabinet */}
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Médecins du cabinet
              </h2>

              {doctors.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  Aucun médecin associé à ce cabinet.
                </p>
              ) : (
                <div className="space-y-4">
                  {doctors.map((doc) => {
                    const openDays = parseWorkingSchedule(doc.workingSchedule)
                      .filter((day) => day.status === "ouvert")
                      .map((day) => day.dayName);
                    return (
                      <div
                        key={doc.doctorBusinessSiteId}
                        onClick={() =>
                          navigate(
                            `/doctor/${doc.doctorId}/${doc.lastName.toLowerCase()}`,
                          )
                        }
                        className="border border-gray-700 rounded-lg p-4 hover:border-gray-500 hover:bg-gray-750 transition cursor-pointer"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Avatar + infos */}
                          <div className="flex gap-3 flex-1">
                            <img
                              src={
                                doc.profilePicture
                                  ? `${FTP_TARGET}/${doc.profilePicture}`
                                  : "/images/user/avatar-doctor-male.webp"
                              }
                              alt={`Dr. ${doc.firstName} ${doc.lastName}`}
                              className="w-14 h-14 rounded-full object-cover shrink-0"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/images/user/avatar-doctor-male.webp";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold">
                                Dr. {doc.firstName} {doc.lastName}
                              </p>
                              {doc.speciality && (
                                <p className="text-blue-400 text-sm">
                                  {doc.speciality}
                                </p>
                              )}
                              {doc.biography && (
                                <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">
                                  {doc.biography}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Jours de disponibilité */}
                          {openDays.length > 0 && (
                            <div className="sm:w-44 shrink-0">
                              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                                Disponible
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {openDays.map((dayName) => (
                                  <span
                                    key={dayName}
                                    className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded"
                                  >
                                    {dayName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Expertises */}
            <section className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-3">
                Expertises et prestations
              </h2>
              {(() => {
                const specialities = doctors
                  .filter((doc) => doc.speciality)
                  .map((doc) => doc.speciality);
                const unique = [...new Set(specialities)];
                if (unique.length === 0) {
                  return (
                    <p className="text-gray-500 text-sm italic">
                      Informations disponibles prochainement.
                    </p>
                  );
                }
                return (
                  <div className="flex flex-wrap gap-2">
                    {unique.map((name) => (
                      <span
                        key={name}
                        className="bg-blue-900/40 text-blue-300 text-sm px-3 py-1 rounded-full"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </section>

            {/* Avis */}
            <section className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-3">Avis</h2>
              <p className="text-gray-500 text-sm italic">
                Informations disponibles prochainement.
              </p>
            </section>
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6 lg:sticky lg:top-6 self-start">
            {/* Localisation */}
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Localisation
              </h2>
              <p className="text-gray-300 text-sm">{businessSite.address}</p>
              {businessSite.region && (
                <p className="text-gray-500 text-sm">
                  {businessSite.region.name}
                </p>
              )}
              <div className="mt-3">
                <GoogleMaps
                  srcUrl={businessSite.locationGoogleMap}
                  query={`${businessSite.name} ${businessSite.address}`}
                />
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white mb-3">
                Contact
              </h2>
              <dl className="space-y-2 text-sm">
                {businessSite.phone && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Téléphone</dt>
                    <dd className="text-gray-200">{businessSite.phone}</dd>
                  </div>
                )}
                {businessSite.email && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-500">Email</dt>
                    <dd className="text-gray-200 truncate">
                      {businessSite.email}
                    </dd>
                  </div>
                )}
              </dl>
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
                Urgence&nbsp;: <strong>15 (SAMU)</strong>
              </p>
            </section>

            {/* Signaler */}
            <div className="text-center">
              <button className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-2 transition cursor-pointer">
                Signaler un problème avec ce profil
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default BusinessSite;
