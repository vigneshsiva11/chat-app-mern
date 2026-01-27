import message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// get all user except logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userid = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: userid } }).select(
      "-password",
    );

    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await message.find({
        senderId: user._id,
        receiverId: userid,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get all messages for selected user

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).populate('replyTo');

    await message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true },
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to mark message as seen using message id

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// send message to selected user

export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // upload image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      replyTo: replyTo || null,
    });

    // Populate replyTo if it exists
    if (newMessage.replyTo) {
      await newMessage.populate('replyTo');
    }

    // emit new message to receiver socket

    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// delete message

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const msg = await message.findById(id);

    if (!msg) {
      return res.json({ success: false, message: "Message not found" });
    }

    // Only sender can delete the message
    if (msg.senderId.toString() !== userId.toString()) {
      return res.json({
        success: false,
        message: "Unauthorized to delete this message",
      });
    }

    await message.findByIdAndDelete(id);

    // Emit delete event to receiver
    const receiverSocketId = userSocketMap[msg.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId: id });
    }

    res.json({ success: true, messageId: id });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// edit message

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const msg = await message.findById(id);

    if (!msg) {
      return res.json({ success: false, message: "Message not found" });
    }

    // Only sender can edit the message
    if (msg.senderId.toString() !== userId.toString()) {
      return res.json({
        success: false,
        message: "Unauthorized to edit this message",
      });
    }

    // Update message
    msg.text = text;
    msg.isEdited = true;
    msg.editedAt = new Date();
    await msg.save();

    // Emit edit event to receiver
    const receiverSocketId = userSocketMap[msg.receiverId];
    const senderSocketId = userSocketMap[msg.senderId];

    const editData = {
      messageId: id,
      text,
      isEdited: true,
      editedAt: msg.editedAt,
    };

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", editData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageEdited", editData);
    }

    res.json({ success: true, message: msg });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// add reaction to message

export const addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const msg = await message.findById(id);

    if (!msg) {
      return res.json({ success: false, message: "Message not found" });
    }

    // Check if user already reacted
    const existingReaction = msg.reactions.find(
      (r) => r.userId.toString() === userId.toString(),
    );

    if (existingReaction) {
      // Update existing reaction
      existingReaction.emoji = emoji;
    } else {
      // Add new reaction
      msg.reactions.push({ userId, emoji });
    }

    await msg.save();

    // Emit reaction event to both users
    const receiverSocketId = userSocketMap[msg.receiverId];
    const senderSocketId = userSocketMap[msg.senderId];

    const reactionData = { messageId: id, reactions: msg.reactions };

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", reactionData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReaction", reactionData);
    }

    res.json({ success: true, reactions: msg.reactions });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// remove reaction from message

export const removeReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const msg = await message.findById(id);

    if (!msg) {
      return res.json({ success: false, message: "Message not found" });
    }

    msg.reactions = msg.reactions.filter(
      (r) => r.userId.toString() !== userId.toString(),
    );

    await msg.save();

    // Emit reaction event to both users
    const receiverSocketId = userSocketMap[msg.receiverId];
    const senderSocketId = userSocketMap[msg.senderId];

    const reactionData = { messageId: id, reactions: msg.reactions };

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", reactionData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReaction", reactionData);
    }

    res.json({ success: true, reactions: msg.reactions });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
