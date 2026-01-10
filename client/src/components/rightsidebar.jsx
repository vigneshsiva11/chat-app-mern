import React from "react";
import assets, { imagesDummyData } from "../assets/assets";

// Accept both prop casings for robustness
const Rightsidebar = ({ selectedUser, Selecteduser }) => {
  const user = selectedUser || Selecteduser; // normalize
  if (!user) return null; // early return if no user selected
  return (
    <div className="bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll max-md:hidden">
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img
          src={user?.profilePic || assets.avatar_icon}
          alt=""
          className="w-20 aspect-[1/1] rounded-full"
        />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          <p className="w-2 h-2 rounded-full bg-green-500"></p>
          {user.fullName}
        </h1>
        <p className="px-10 mx-auto">{user.bio}</p>
      </div>
      <hr className="border-[#ffffff50] my-4" />

      <div className="px-5 text-xs ">
        <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
          {imagesDummyData.map((url, index) => (
            <div
              key={index}
              onClick={() => window.open(url)}
              className="cursor-pointer rounded"
            >
              <img src={url} alt="" className="h-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <button className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-400 via-violet-500 to-violet-600 hover:from-violet-500 hover:to-fuchsia-600 text-white text-sm font-medium py-2 px-20 rounded-full cursor-pointer shadow-lg shadow-violet-700/30 transition-colors duration-300">
        logout
      </button>
    </div>
  );
};

export default Rightsidebar;
