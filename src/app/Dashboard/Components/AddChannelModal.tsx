"use client";

export default function AddChannelModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-30 flex items-center justify-center">
      <div className="bg-white w-[872px] h-[539px] rounded-[30px] p-[40px] flex flex-col gap-[20px] shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-xl font-bold text-gray-500 cursor-pointer"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold">Channel erstellen</h2>
        <p className="text-sm text-gray-600">
          Channels dienen deinem Team zur Kommunikation. Am besten sollten sie
          themenbezogen sein – z. B.{" "}
          <span className="font-medium text-[#5D5FEF]">#marketing</span>.
        </p>

        <div>
          <label className="block font-medium mt-4">Channel-Name</label>
          <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 mt-2">
            <span className="text-gray-400 mr-2">#</span>
            <input
              type="text"
              placeholder="z. B. Kooperationsprojekte"
              className="w-full outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mt-4 text-gray-700">
            Beschreibung{" "}
            <span className="text-gray-400 text-sm">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Dein Text hier"
            className="w-full mt-2 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none"
          />
        </div>

        <div className="mt-auto flex justify-end">
          <button
            className="bg-[#5D5FEF] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#4a4cdb] transition cursor-pointer"
            onClick={onClose}
          >
            Erstellen
          </button>
        </div>
      </div>
    </div>
  );
}
