import { useState } from "react"

export default function QuickReplies({ options, onSelect, multiSelect = false }) {
  const [selected, setSelected] = useState([])

  const toggle = (opt) => {
    if (!multiSelect) {
      onSelect([opt])   // single select — submit immediately
      return
    }
    setSelected(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    )
  }

  return (
    <div className="mt-2 mb-4">
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-4 py-2 rounded-full text-sm border transition-all
              ${selected.includes(opt)
                ? "bg-saffron text-white border-saffron"
                : "bg-white text-gray-700 border-gray-300 hover:border-saffron hover:text-saffron"
              }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {multiSelect && selected.length > 0 && (
        <button
          onClick={() => onSelect(selected)}
          className="mt-3 w-full py-2.5 bg-india text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors"
        >
          ✓ Confirm Selection
        </button>
      )}
    </div>
  )
}