import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./Authcontext.jsx";
import toast from "react-hot-toast";

export const chatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({}); // {userId: count}

  const { socket, axios } = useContext(AuthContext);

  //function to get all users for sidebar

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to get messages for selected user

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
        // Clear unseen count for this user since we're viewing their messages
        setUnseenMessages((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //function to send message to selected user

  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData,
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to delete message

  const deleteMessage = async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/messages/delete/${messageId}`);
      if (data.success) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== messageId),
        );
        toast.success("Message deleted");
      } else {
        toast.error(data.message || "Failed to delete message");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to add reaction to message

  const addReaction = async (messageId, emoji) => {
    try {
      const { data } = await axios.post(`/api/messages/react/${messageId}`, {
        emoji,
      });
      if (data.success) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, reactions: data.reactions } : msg,
          ),
        );
      } else {
        toast.error(data.message || "Failed to add reaction");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to remove reaction from message

  const removeReaction = async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/messages/react/${messageId}`);
      if (data.success) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, reactions: data.reactions } : msg,
          ),
        );
      } else {
        toast.error(data.message || "Failed to remove reaction");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to subscribe to messaages for selected user
  const subscribeToMessages = async () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      // Only update messages if currently viewing that specific chat
      if (selectedUser?._id === newMessage.senderId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        // Mark as seen since user is actively viewing this chat
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        // Increment unseen count for the sender
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]:
            (prevUnseenMessages[newMessage.senderId] || 0) + 1,
        }));
      }
    });

    // Listen for profile updates
    socket.on("profileUpdated", (updatedProfile) => {
      // Update user in users list
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === updatedProfile.userId
            ? {
                ...user,
                profilePic: updatedProfile.profilePic,
                fullName: updatedProfile.fullName,
                bio: updatedProfile.bio,
              }
            : user,
        ),
      );

      // Update selected user if it's the one that was updated
      if (selectedUser?._id === updatedProfile.userId) {
        setSelectedUser((prev) => ({
          ...prev,
          profilePic: updatedProfile.profilePic,
          fullName: updatedProfile.fullName,
          bio: updatedProfile.bio,
        }));
      }
    });

    // Listen for message deletion
    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId),
      );
    });

    // Listen for message reactions
    socket.on("messageReaction", ({ messageId, reactions }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg,
        ),
      );
    });
  };

  // function to unsubscribe from messages

  const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off("newMessage");
    socket.off("profileUpdated");
    socket.off("messageDeleted");
    socket.off("messageReaction");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  return <chatContext.Provider value={value}>{children}</chatContext.Provider>;
};
