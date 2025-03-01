import React from "react";

const Header = () => {
  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Xparsify</a>
      </div>

      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar"
      >
        <a
          target="_blank"
          href="https://github.com/thekiranmahajan/XParsify"
          className="w-10 rounded-full bg-amber-50"
        >
          <img alt="GitHub Profile Link Kiran Mahajan" src="./github.svg" />
        </a>
      </div>
    </div>
  );
};

export default Header;
