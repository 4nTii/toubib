import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout/Layout";

// Random sample messages data
const sampleMessages = [
  {
    id: 1,
    sender: "Dr. Martin Dupont",
    subject: "Résultats de vos analyses",
    preview:
      "Bonjour, je vous contacte concernant vos dernières analyses sanguines...",
    date: "2024-01-15",
    time: "14:30",
    unread: true,
    avatar: "MD",
  },
  {
    id: 2,
    sender: "Dr. Sophie Bernard",
    subject: "Confirmation de rendez-vous",
    preview: "Votre rendez-vous du 20 janvier est bien confirmé. Merci de...",
    date: "2024-01-14",
    time: "09:15",
    unread: true,
    avatar: "SB",
  },
  {
    id: 3,
    sender: "Cabinet Médical Saint-Jean",
    subject: "Rappel de vaccination",
    preview: "Nous vous rappelons que votre rappel de vaccination est prévu...",
    date: "2024-01-12",
    time: "16:45",
    unread: false,
    avatar: "CM",
  },
  {
    id: 4,
    sender: "Dr. Pierre Leroy",
    subject: "Ordonnance disponible",
    preview:
      "Votre nouvelle ordonnance est disponible dans votre espace patient...",
    date: "2024-01-10",
    time: "11:20",
    unread: false,
    avatar: "PL",
  },
  {
    id: 5,
    sender: "Service Administratif",
    subject: "Documents à fournir",
    preview:
      "Pour compléter votre dossier, merci de nous transmettre les documents...",
    date: "2024-01-08",
    time: "08:00",
    unread: false,
    avatar: "SA",
  },
];

function Messages() {
  const { user } = useAuth();
  const [messages] = useState(sampleMessages);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <Layout>
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[calc(100vh-140px)]">
        {/* Header - Reduced height */}
        <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-white">Mes Messages</h1>
              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition duration-200 flex items-center gap-2 text-sm">
              <svg
                className="h-4 w-4"
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
              Nouveau message
            </button>
          </div>
        </div>

        {/* Main Content */}
        {messages.length === 0 ? (
          /* No Messages State - Full width centered */
          <div className="h-[calc(100%-48px)] flex items-center justify-center">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-400">
                Aucun message reçu
              </h3>
            </div>
          </div>
        ) : (
          /* Side by side layout when messages exist */
          <div className="flex h-[calc(100%-48px)]">
            {/* Messages List - Left Panel */}
            <div className={`${selectedMessage ? "hidden md:w-2/5 md:block" : "w-full md:w-2/5"} border-r border-gray-700 overflow-y-auto`}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`px-4 py-3 cursor-pointer transition duration-200 hover:bg-gray-700 border-b border-gray-700 ${
                    message.unread ? "bg-gray-750" : ""
                  } ${selectedMessage?.id === message.id ? "bg-gray-700 border-l-2 border-l-blue-500" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 ${
                        message.unread ? "bg-blue-600" : "bg-gray-600"
                      }`}
                    >
                      {message.avatar}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3
                          className={`text-sm truncate ${
                            message.unread
                              ? "font-bold text-white"
                              : "font-medium text-gray-300"
                          }`}
                        >
                          {message.sender}
                        </h3>
                        {message.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 ml-2"></div>
                        )}
                      </div>
                      <p
                        className={`text-xs truncate ${
                          message.unread ? "text-blue-400" : "text-gray-400"
                        }`}
                      >
                        {message.subject}
                      </p>
                      <p className="text-gray-500 text-xs truncate mt-0.5">
                        {message.preview}
                      </p>
                      <span className="text-gray-500 text-xs mt-1 block">
                        {message.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Message - Right Panel */}
            <div className={`${selectedMessage ? "w-full md:w-3/5" : "hidden md:w-3/5 md:flex"} overflow-y-auto bg-gray-850`}>
              {selectedMessage ? (
                <div className="h-full flex flex-col w-full">
                  {/* Message Header */}
                  <div className="px-6 py-4 border-b border-gray-700 bg-gray-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="md:hidden text-gray-400 hover:text-white transition flex items-center justify-center flex-shrink-0 w-6 h-6"
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-white">
                          {selectedMessage.subject}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          De:{" "}
                          <span className="text-white">
                            {selectedMessage.sender}
                          </span>
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {selectedMessage.date} à {selectedMessage.time}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="hidden md:block text-gray-400 hover:text-white transition p-1"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="flex-1 px-6 py-4 overflow-y-auto">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-300 leading-relaxed">
                        {selectedMessage.preview}
                        <br />
                        <br />
                        Ceci est un message de démonstration. Dans une vraie
                        application, le contenu complet du message serait
                        affiché ici avec tous les détails nécessaires concernant
                        votre santé ou vos rendez-vous.
                        <br />
                        <br />
                        N'hésitez pas à me contacter si vous avez des questions.
                        <br />
                        <br />
                        Cordialement,
                        <br />
                        {selectedMessage.sender}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 py-3 border-t border-gray-700 bg-gray-800">
                    <div className="flex gap-3">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm">
                        Répondre
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition duration-200 text-sm">
                        Transférer
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm ml-auto">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* No Message Selected */
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-400">
                      Sélectionnez un message
                    </h3>
                    <p className="mt-2 text-gray-500 text-sm">
                      Cliquez sur un message pour afficher son contenu
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Messages;
