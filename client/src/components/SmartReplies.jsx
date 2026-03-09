import React, { useState } from "react";
import axios from "axios";

const SmartReplies = ({ lastMessage, onSelectReply }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const loadSuggestions = async () => {
    if (!lastMessage?.text) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/smart-replies`,
        {
          messageText: lastMessage.text,
          conversationContext: "", // Could add recent messages here
        },
        { headers: { token: localStorage.getItem("token") } },
      );

      if (data.success) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Smart reply error:", error);
      // Fallback suggestions
      setSuggestions(["Thanks!", "Sounds good!", "Let me check"]);
      setShowSuggestions(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReply = (reply) => {
    onSelectReply(reply);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  if (!lastMessage) return null;

  return (
    <div className="relative">
      {/* Suggest Replies Button */}
      <button
        onClick={loadSuggestions}
        disabled={loading}
        className="text-sm px-3 py-1 rounded-full bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 transition-all flex items-center gap-2 disabled:opacity-50"
        title="Get AI reply suggestions"
      >
        <span>💡</span>
        <span>{loading ? "Loading..." : "Smart Replies"}</span>
      </button>

      {/* Suggestions Display */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectReply(reply)}
              className="px-4 py-2 rounded-full bg-purple-700/60 hover:bg-purple-600 text-white text-sm transition-all transform hover:scale-105 border border-purple-500/30"
            >
              {reply}
            </button>
          ))}
          <button
            onClick={() => setShowSuggestions(false)}
            className="px-3 py-2 rounded-full bg-gray-700/60 hover:bg-gray-600 text-white text-sm transition-all"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartReplies;
