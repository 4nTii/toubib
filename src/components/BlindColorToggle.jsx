import { useBlindColor } from "../context/BlindColorContext";

export default function BlindColorToggle() {
  const { isBlindColor, toggleBlindColor } = useBlindColor();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-300 font-medium">Blind color</span>
      <button
        onClick={toggleBlindColor}
        aria-label={isBlindColor ? "Désactiver le mode daltonisme" : "Activer le mode daltonisme"}
        title={isBlindColor ? "Mode daltonisme activé" : "Mode daltonisme désactivé"}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 focus:outline-none focus:ring-2
          focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${isBlindColor ? "bg-blue-600" : "bg-gray-600"}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full bg-white
            transition-transform duration-200
            ${isBlindColor ? "translate-x-5" : "translate-x-0.5"}
          `}
        />
      </button>
    </div>
  );
}
