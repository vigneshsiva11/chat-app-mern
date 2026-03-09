import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Authcontext.jsx";
import AnimatedBackground from "../components/AnimatedBackground";
import assets from "../assets/assets";

// Profile page component
const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [SelectedImg, SetSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "Hi everyone!");

  const handlesubmit = async (e) => {
    e.preventDefault();
    if (!SelectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(SelectedImg);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate("/");
    };
  };

  return (
    <AnimatedBackground>
      <div className="w-full min-h-screen flex items-center justify-center">
        <div
          className="w-5/6 max-w-2xl relative z-10 text-gray-300 flex items-center justify-between max-sm:flex-col-reverse rounded-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          }}
        >
          <form
            onSubmit={handlesubmit}
            className="flex flex-col gap-5 p-10 flex-1"
          >
            <h3 className="text-lg text-white">Profile details</h3>
            <label
              htmlFor="avatar"
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                onChange={(e) => SetSelectedImg(e.target.files[0])}
                type="file"
                id="avatar"
                accept=".png, .jpg, .jpeg"
                hidden
              />
              <img
                src={
                  SelectedImg
                    ? URL.createObjectURL(SelectedImg)
                    : assets.avatar_icon
                }
                alt=""
                className={`w-12 h-12 ${SelectedImg && "rounded-full"}`}
              />
              Upload profile image
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              required
              placeholder="Your name"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-transparent text-white"
            />
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              placeholder="Write profile bio"
              required
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-transparent text-white"
              rows={4}
            ></textarea>

            <button
              type="submit"
              className="text-white p-2 rounded-full text-lg cursor-pointer transition-transform hover:scale-[1.02]"
              style={{
                background: "linear-gradient(90deg, #a855f7 0%, #7c3aed 100%)",
              }}
            >
              Save
            </button>
          </form>
          <img
            className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${SelectedImg && "rounded-full"}`}
            src={authUser?.profilePic || assets.logo_icon}
            alt=""
          />
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default ProfilePage;
