import { useRef } from "react";

export default function ImagePicker({ label = "Photos", files, onChange }) {
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList || []);
    if (!arr.length) return;
    onChange([...(files || []), ...arr]); // append
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{label}</div>
        <button type="button"
          onClick={() => inputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg border text-sm">
          + Ajouter des photos
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {!files?.length ? (
        <div className="p-4 border rounded-xl text-sm text-slate-500">
          Aucune image sélectionnée.
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative">
              <img
                src={URL.createObjectURL(f)}
                alt={`preview-${i}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
