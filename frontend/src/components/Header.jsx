import React from "react";

const Header = () => {
  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="flex-1">
        <div className="flex items-center">
          <a className="btn p-3 btn-ghost text-xl gap-2 ">
            <img className="size-8" src="./favicon.svg" alt="XParsify Logo" />
            XParsify
          </a>
        </div>
      </div>

      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar"
      >
        <a
          target="_blank"
          href="https://github.com/thekiranmahajan/XParsify"
          className="w-10 rounded-full bg-white/90"
        >
          <img alt="GitHub Profile Link Kiran Mahajan" src="./github.svg" />
        </a>
      </div>
    </div>
  );
};

export default Header;
