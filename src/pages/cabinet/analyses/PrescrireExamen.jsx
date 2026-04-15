import CabinetLayout from "../../../components/CabinetLayout";

function PrescrireExamen() {
  return (
    <CabinetLayout>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Prescrire examen</h2>
        <p className="text-gray-300">Prescrire un nouvel examen ou analyse.</p>
      </div>
    </CabinetLayout>
  );
}

export default PrescrireExamen;
