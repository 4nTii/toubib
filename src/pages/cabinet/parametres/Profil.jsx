import CabinetLayout from "../../../components/CabinetLayout";

function ProfilCabinet() {
  return (
    <CabinetLayout>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Profil</h2>
        <p className="text-gray-300">Paramètres de votre profil cabinet.</p>
      </div>
    </CabinetLayout>
  );
}

export default ProfilCabinet;
