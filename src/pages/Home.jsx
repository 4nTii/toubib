import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

import logo from "../assets/images/app/toubib-logo-w500.webp";

function Home() {
  const { token, user } = useAuth();

  return (
    <Layout>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Welcome!</h2>
        <p className="text-gray-300 mb-4">
          Vous êtes connecté en tant que{" "}
          <span className="text-blue-400 font-semibold">{user?.role}</span>
        </p>

        <div className="bg-gray-700 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Token utilisé:
          </h3>
          <p className="text-gray-400 text-sm break-all font-mono bg-gray-900 p-3 rounded">
            {token}
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
