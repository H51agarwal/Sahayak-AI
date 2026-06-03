export default function MessageBubble({ message, isBot }) {
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-3`}>

      {isBot && (
        <div className="w-8 h-8 rounded-full bg-saffron flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
          स
        </div>
      )}

      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isBot
          ? "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
          : "bg-saffron text-white rounded-tr-sm"
        }`}
      >
        {message}
      </div>
    </div>
  )
}