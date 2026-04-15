import CabinetLayout from "../../../components/CabinetLayout";

function Preferences() {
  return (
    <CabinetLayout>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Préférences</h2>
        <p className="text-gray-300">Vos préférences d'utilisation.</p>
      </div>
    </CabinetLayout>
  );
}

export default Preferences;
