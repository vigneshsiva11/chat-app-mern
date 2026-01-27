import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const SummarizeButton = ({ selectedUserId }) => {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleSummarize = async () => {
        if (!selectedUserId) return;

        setLoading(true);
        const loadingToast = toast.loading("Analyzing conversation...");

        try {
            const { data } = await axios.post(
                "/api/ai/summarize",
                { receiverId: selectedUserId },
                { headers: { token: localStorage.getItem("token") } }
            );

            if (data.success) {
                setSummary(data.summary);
                setShowModal(true);
                toast.success("Summary generated!", { id: loadingToast });
            }
        } catch (error) {
            console.error("Summarization error:", error);
            toast.error(error.response?.data?.message || "Failed to generate summary", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Summarize Button */}
            {/* Summarize Button (Icon Style) */}
            <button
                onClick={handleSummarize}
                disabled={loading || !selectedUserId}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-1 text-xs w-6 h-6 flex items-center justify-center transition-all shadow-sm"
                title="Summarize Chat"
            >
                {loading ? (
                    <span className="animate-spin text-[10px]">⌛</span>
                ) : (
                    <span>✨</span>
                )}
            </button>

            {/* Summary Modal */}
            {showModal && summary && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-gradient-to-br from-purple-900/90 to-purple-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-purple-500/30"
                        onClick={(e) => e.stopPropagation()}
                        style={{ boxShadow: "0 20px 60px rgba(139, 92, 246, 0.4)" }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                ✨ Chat Summary
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white hover:text-gray-300 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Key Points */}
                        {summary.bulletPoints && summary.bulletPoints.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-purple-200 mb-2">
                                    📋 Key Discussion Points
                                </h3>
                                <ul className="space-y-2">
                                    {summary.bulletPoints.map((point, idx) => (
                                        <li
                                            key={idx}
                                            className="text-white bg-purple-800/40 rounded-lg p-3 border-l-4 border-purple-400"
                                        >
                                            • {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Decisions */}
                        {summary.keyDecisions && summary.keyDecisions.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-purple-200 mb-2">
                                    ✅ Decisions Made
                                </h3>
                                <ul className="space-y-2">
                                    {summary.keyDecisions.map((decision, idx) => (
                                        <li
                                            key={idx}
                                            className="text-white bg-green-900/40 rounded-lg p-3 border-l-4 border-green-400"
                                        >
                                            • {decision}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Action Items */}
                        {summary.actionItems && summary.actionItems.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-purple-200 mb-2">
                                    ⚡ Action Items
                                </h3>
                                <ul className="space-y-2">
                                    {summary.actionItems.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className="text-white bg-orange-900/40 rounded-lg p-3 border-l-4 border-orange-400"
                                        >
                                            • {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="text-sm text-purple-300 mt-4 pt-4 border-t border-purple-500/30">
                            <p>📊 {summary.messageCount || 0} messages analyzed</p>
                            {summary.cached && (
                                <p className="text-purple-400">⚡ Loaded from cache</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SummarizeButton;
