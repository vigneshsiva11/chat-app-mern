import mangoose from "mongoose";

//  function to connect to mongodb database

export const connectDB = async (url) => {
  try {
    mangoose.connection.on("connected", () => console.log("databse connected"));

    await mangoose.connect(`${process.env.MONGODB_URI}/chat-app`);
  } catch (error) {
    console.log(error);
  }
};
