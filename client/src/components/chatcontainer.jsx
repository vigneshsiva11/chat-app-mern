import React, { useEffect, useRef, useContext, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { chatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/Authcontext.jsx";
import toast from "react-hot-toast";
import SummarizeButton from "./SummarizeButton";
import TranslateButton from "./TranslateButton";
import SmartReplies from "./SmartReplies";
import VoiceRecorder from "./VoiceRecorder";

const Chatcontainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    deleteMessage,
    editMessage,
    addReaction,
    removeReaction,
  } = useContext(chatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();

  const [input, setInput] = useState("");
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [translationMap, setTranslationMap] = useState({}); // { [msgId]: { translated: string, language: string, cached: boolean } }

  const emojis = ["👍", "❤️", "😂", "😮"];

  //handle sending messages

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const messageData = { text: input.trim() };
    if (replyingTo) {
      messageData.replyTo = replyingTo._id;
    }

    try {
      await sendMessage(messageData);
      setInput("");
      setReplyingTo(null);
    } catch (error) {
      // Handle banned user (403)
      if (error.response?.status === 403) {
        if (error.response.data?.banned) {
          toast.error(
            "🚫 " +
              (error.response.data.message ||
                "Your account has been banned due to repeated violations"),
            { duration: 8000 },
          );
        } else {
          toast.error(error.response.data?.message || "Access forbidden");
        }
        return;
      }

      // Handle toxic content blocking (400)
      if (error.response?.data?.moderation || error.response?.status === 400) {
        const mod = error.response.data.moderation;
        toast.error(
          `🛡️ This is a toxic message. You are not allowed to send.`,
          {
            duration: 5000,
            style: {
              background: "#ef4444",
              color: "#fff",
              fontWeight: "bold",
            },
          },
        );

        // Show additional details if available
        if (mod?.reason) {
          toast.error(`Reason: ${mod.reason}`, { duration: 4000 });
        }

        // Warn about violations
        if (error.response.data.violations >= 3) {
          toast.error(
            `⚠️ Warning: ${error.response.data.violations} violations recorded. Account will be banned after 5 violations.`,
            { duration: 7000 },
          );
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    }
  };

  //handle sending an image

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const messageData = { image: reader.result };
      if (replyingTo) {
        messageData.replyTo = replyingTo._id;
      }
      await sendMessage(messageData);
      setReplyingTo(null);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // handle delete message
  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(messageId);
    }
  };

  // handle edit message
  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setEditText(msg.text);
  };

  const handleSaveEdit = async () => {
    if (editText.trim() === "") {
      toast.error("Message cannot be empty");
      return;
    }
    await editMessage(editingMessage._id, editText.trim());
    setEditingMessage(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };

  // handle reply to message
  const handleReplyToMessage = (msg) => {
    setReplyingTo(msg);
  };

  // handle reaction
  const handleReaction = async (messageId, emoji) => {
    const message = messages.find((m) => m._id === messageId);
    const userReaction = message?.reactions?.find(
      (r) => r.userId === authUser._id,
    );

    if (userReaction?.emoji === emoji) {
      await removeReaction(messageId);
    } else {
      await addReaction(messageId, emoji);
    }
    setShowReactionPicker(null);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showReactionPicker &&
        !event.target.closest(".reaction-picker-container")
      ) {
        setShowReactionPicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReactionPicker]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg flex flex-col">
      {/* top area */}
      <div
        className="flex items-center gap-3 mx-4 border-b border-stone-500 shrink-0"
        style={{ height: "70px", minHeight: "70px" }}
      >
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>

        {/* AI Summarize Button - Moved to Context Menu */}

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7"
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>
      {/* chat area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            onMouseEnter={() => setHoveredMessage(msg._id)}
            onMouseLeave={() => setHoveredMessage(null)}
            className={`flex items-end gap-2 justify-end relative group ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            }`}
          >
            <div className="relative flex items-center gap-2">
              {/* Decorative circles - different colors for different users */}
              <div className="flex gap-1 items-center">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      msg.senderId === authUser._id ? "#fbbf24" : "#a855f7",
                  }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      msg.senderId === authUser._id ? "#ef4444" : "#ec4899",
                  }}
                ></div>
              </div>

              <div className="relative">
                {/* Reply indicator */}
                {msg.replyTo && (
                  <div
                    className="px-2 py-1 mb-1 rounded text-xs opacity-70 border-l-2 border-purple-400"
                    style={{ background: "rgba(139, 92, 246, 0.2)" }}
                  >
                    <div className="font-semibold">Replying to:</div>
                    <div className="truncate max-w-[180px]">
                      {msg.replyTo.text || "[Image]"}
                    </div>
                  </div>
                )}

                {msg.image ? (
                  <img
                    src={msg.image}
                    alt=""
                    className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                  />
                ) : (
                  <div>
                    <p
                      className={`p-3 max-w-[200px] md:text-sm font-light rounded-2xl mb-8 break-all text-white ${
                        msg.senderId === authUser._id
                          ? "rounded-br-none"
                          : "rounded-bl-none"
                      }`}
                      style={{
                        background: "rgba(139, 92, 246, 0.4)",
                        border: "1px solid rgba(168, 85, 247, 0.5)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {msg.text}
                    </p>
                    {/* Edited indicator */}
                    {/* Edited indicator */}
                    {msg.isEdited && (
                      <span className="text-xs text-gray-400 absolute bottom-0 right-0 mb-8">
                        edited
                      </span>
                    )}

                    {/* Translation Result Display */}
                    {translationMap[msg._id] && (
                      <div className="absolute -bottom-2 left-0 w-full min-w-[150px]">
                        <div className="bg-purple-900/40 p-2 rounded-lg border border-purple-500/30 text-xs text-white backdrop-blur-md">
                          <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/10">
                            <span className="text-purple-300 font-bold uppercase text-[10px]">
                              Translated ({translationMap[msg._id].language})
                            </span>
                            <button
                              onClick={() => {
                                const newMap = { ...translationMap };
                                delete newMap[msg._id];
                                setTranslationMap(newMap);
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                          {translationMap[msg._id].translated}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reactions display */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="absolute -bottom-2 left-2 flex gap-1 bg-gray-800/90 rounded-full px-2 py-1">
                    {msg.reactions.map((reaction, idx) => (
                      <span key={idx} className="text-xs">
                        {reaction.emoji}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action buttons - show on hover */}
                {hoveredMessage === msg._id && (
                  <div
                    className={`reaction-picker-container absolute top-0 flex gap-1 ${
                      msg.senderId === authUser._id
                        ? "right-full mr-2"
                        : "left-full ml-2"
                    }`}
                  >
                    {/* Reaction button */}
                    <button
                      onClick={() =>
                        setShowReactionPicker(
                          showReactionPicker === msg._id ? null : msg._id,
                        )
                      }
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-1 text-xs w-6 h-6"
                    >
                      😊
                    </button>

                    {/* Reply button */}
                    <button
                      onClick={() => handleReplyToMessage(msg)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1 text-xs w-6 h-6"
                      title="Reply"
                    >
                      ↩
                    </button>

                    {/* Edit button - only for sender's text messages */}
                    {msg.senderId === authUser._id && msg.text && (
                      <button
                        onClick={() => handleEditMessage(msg)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-1 text-xs w-6 h-6"
                        title="Edit"
                      >
                        ✎
                      </button>
                    )}

                    {/* Summarize Chat Button */}
                    <SummarizeButton selectedUserId={selectedUser?._id} />

                    {/* Translate Button - Icon only */}
                    {msg.text && (
                      <TranslateButton
                        message={msg}
                        onTranslate={(result) =>
                          setTranslationMap({
                            ...translationMap,
                            [msg._id]: result,
                          })
                        }
                      />
                    )}

                    {/* Delete button - only for sender */}
                    {msg.senderId === authUser._id && (
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 text-xs w-6 h-6"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}

                {/* Reaction picker */}
                {showReactionPicker === msg._id && (
                  <div
                    className={`reaction-picker-container absolute top-8 z-10 bg-gray-800 rounded-lg p-2 flex gap-2 shadow-lg ${
                      msg.senderId === authUser._id
                        ? "right-full mr-2"
                        : "left-full ml-2"
                    }`}
                  >
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(msg._id, emoji)}
                        className="hover:scale-125 transition-transform text-xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 rounded-full"
              />
              <p className="text-gray-500">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* bottom area */}
      <div className="shrink-0 p-3 bg-transparent">
        {/* Reply preview */}
        {replyingTo && (
          <div
            className="flex items-center justify-between mb-2 px-4 py-2 rounded-lg"
            style={{
              background: "rgba(139, 92, 246, 0.3)",
              border: "1px solid rgba(168, 85, 247, 0.5)",
            }}
          >
            <div className="flex-1">
              <div className="text-xs text-gray-300 font-semibold">
                Replying to:
              </div>
              <div className="text-sm text-white truncate">
                {replyingTo.text || "[Image]"}
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-white hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* Edit modal */}
        {editingMessage && (
          <div
            className="flex items-center gap-2 mb-2 px-4 py-2 rounded-lg"
            style={{
              background: "rgba(76, 175, 80, 0.3)",
              border: "1px solid rgba(76, 175, 80, 0.5)",
            }}
          >
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              className="flex-1 text-sm p-2 border-none rounded outline-none text-white placeholder-gray-400 bg-transparent"
              placeholder="Edit message..."
            />
            <button
              onClick={handleSaveEdit}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Smart Reply Suggestions */}
        {messages.length > 0 && !editingMessage && (
          <div className="mb-2">
            <SmartReplies
              lastMessage={messages[messages.length - 1]}
              onSelectReply={(reply) => setInput(reply)}
            />
          </div>
        )}

        {/* Message input */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 flex items-center px-4 rounded-full"
            style={{
              background: "rgba(139, 92, 246, 0.2)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
            }}
          >
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyDown={(e) =>
                e.key === "Enter" ? handleSendMessage(e) : null
              }
              type="text"
              placeholder="Send a Message"
              className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
            />
            <input
              onChange={handleSendImage}
              type="file"
              id="image"
              accept="image/png, image/jpeg"
              hidden
            />
            <label htmlFor="image">
              <img
                src={assets.gallery_icon}
                alt=""
                className="w-5 mr-2 cursor-pointer"
              />
            </label>
          </div>

          {/* Voice Recorder */}
          <VoiceRecorder onTranscription={(text) => setInput(text)} />

          <img
            onClick={handleSendMessage}
            src={assets.send_button}
            alt=""
            className="w-7 cursor-pointer"
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime</p>
    </div>
  );
};

export default Chatcontainer;
