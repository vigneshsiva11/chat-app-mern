import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const TranslateButton = ({ message, onTranslate }) => {
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: "ta", name: "Tamil", flag: "🇮🇳" },
        { code: "hi", name: "Hindi", flag: "🇮🇳" },
        { code: "fr", name: "French", flag: "🇫🇷" },
        { code: "es", name: "Spanish", flag: "🇪🇸" },
        { code: "de", name: "German", flag: "🇩🇪" },
        { code: "ja", name: "Japanese", flag: "🇯🇵" },
        { code: "zh", name: "Chinese", flag: "🇨🇳" },
    ];

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const handleTranslate = async (langCode) => {
        if (!message?.text) return;

        setLoading(true);
        setShowDropdown(false); // Close dropdown immediately
        const loadingToast = toast.loading("Translating...");

        try {
            const { data } = await axios.post(
                "/api/ai/translate",
                {
                    messageId: message._id,
                    targetLanguage: langCode,
                },
                { headers: { token: localStorage.getItem("token") } }
            );

            if (data.success) {
                // Pass the result up to the parent
                onTranslate(data.translation);
                toast.success(`Translated to ${languages.find(l => l.code === langCode)?.name}`, { id: loadingToast });
            }
        } catch (error) {
            console.error("Translation error:", error);
            toast.error(error.response?.data?.message || "Translation failed", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    if (!message?.text) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button (Icon) */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-1 text-xs w-6 h-6 flex items-center justify-center transition-colors"
                title="Translate"
                disabled={loading}
            >
                {loading ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    "🌐"
                )}
            </button>

            {/* Language Selection Dropdown */}
            {showDropdown && (
                <div
                    className="absolute top-8 right-0 bg-purple-900/95 backdrop-blur-lg rounded-xl shadow-2xl border border-purple-500/30 z-50 min-w-[160px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    style={{ transformOrigin: 'top right' }}
                >
                    <div className="bg-purple-950/50 px-3 py-2 border-b border-purple-500/20">
                        <p className="text-[10px] uppercase tracking-wider text-purple-300 font-bold">
                            Translate to
                        </p>
                    </div>

                    <div className="max-h-[200px] overflow-y-auto py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleTranslate(lang.code)}
                                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-purple-600/50 transition-colors flex items-center gap-3"
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="font-medium">{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranslateButton;
