import CabinetLayout from "../../../components/CabinetLayout";

function Traitements() {
  return (
    <CabinetLayout>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Traitements</h2>
        <p className="text-gray-300">Gestion des traitements en cours.</p>
      </div>
    </CabinetLayout>
  );
}

export default Traitements;
