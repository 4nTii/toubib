import CabinetLayout from "../../../components/CabinetLayout";

function Notifications() {
  return (
    <CabinetLayout>
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Notifications</h2>
        <p className="text-gray-300">Vos notifications.</p>
      </div>
    </CabinetLayout>
  );
}

export default Notifications;
