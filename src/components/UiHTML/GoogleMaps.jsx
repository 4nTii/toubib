/**
 * GoogleMaps
 *
 * Props:
 *   srcUrl {string}  — embed URL (iframe src). Takes priority over query.
 *   query  {string}  — plain-text address used to build a Google Maps search link.
 *
 * Priority: srcUrl > query > null (renders nothing)
 */
function GoogleMaps({ srcUrl, query }) {
  if (srcUrl) {
    return (
      <iframe
        className="w-full h-75 rounded-lg border-0"
        src={srcUrl}
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  if (query) {
    const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    return (
      <div className="w-full rounded-lg border border-gray-600 bg-gray-800 overflow-hidden">
        <div className="h-30 flex items-center justify-center bg-linear-to-br from-gray-800 to-gray-900">
          <div className="text-center text-gray-300">
            <svg
              className="w-8 h-8 mx-auto mb-2 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7"
              />
            </svg>
            <p className="text-sm">{query}</p>
          </div>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 transition text-sm text-gray-200"
        >
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
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7"
            />
          </svg>
          Ouvrir dans Google Maps
        </a>
      </div>
    );
  }

  return null;
}

export default GoogleMaps;
