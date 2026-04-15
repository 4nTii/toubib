import CabinetLayout from "../../../components/CabinetLayout";

function EnAttente() {
  return (
    <CabinetLayout>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">En attente</h2>
        <p className="text-gray-300">Rendez-vous en attente de confirmation.</p>
      </div>
    </CabinetLayout>
  );
}

export default EnAttente;
