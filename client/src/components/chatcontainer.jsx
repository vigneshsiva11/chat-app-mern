import React, { useEffect, useRef, useContext, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { chatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/Authcontext.jsx";
import toast from "react-hot-toast";

const Chatcontainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    deleteMessage,
    addReaction,
    removeReaction,
  } = useContext(chatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();

  const [input, setInput] = useState("");
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);

  const emojis = ["👍", "❤️", "😂", "😮"];

  //handle sending messages

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
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
      await sendMessage({ image: reader.result });
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
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* top area */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
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
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7"
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>
      {/* chat area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            onMouseEnter={() => setHoveredMessage(msg._id)}
            onMouseLeave={() => setHoveredMessage(null)}
            className={`flex items-end gap-2 justify-end relative group ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            }`}
          >
            <div className="relative">
              {msg.image ? (
                <img
                  src={msg.image}
                  alt=""
                  className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                    msg.senderId === authUser._id
                      ? "rounded-br-none"
                      : "rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </p>
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
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
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
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt=""
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden ">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime</p>
    </div>
  );
};

export default Chatcontainer;
