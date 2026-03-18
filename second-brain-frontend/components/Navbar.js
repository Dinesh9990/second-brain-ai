"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {

  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("User");

  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("name");

    if (token) {
      setIsLoggedIn(true);
      setName(userName || "User");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");

    setIsLoggedIn(false);
    setName("User");

    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div
      className="bg-white px-6 py-4 flex justify-between items-center"
      style={{ boxShadow: "1px 1px 5px goldenrod" }}
    >

      {/* ✅ LOGO IMAGE */}
      <div
        onClick={() => router.push("/")}
        className="cursor-pointer flex items-center"
      >
        <img
          src="/logo.png"
          alt="logo"
          className="h-10 object-contain"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {/* ALWAYS SHOW HOME */}
        <button
          onClick={() => router.push("/")}
          className="bg-black text-white px-4 py-1 rounded-lg font-semibold hover:scale-105 transition"
        >
          Home
        </button>

        {!isLoggedIn ? (
          <>
            <button
              onClick={() => router.push("/login")}
              className="bg-black text-white px-4 py-1 rounded-lg font-semibold hover:scale-105 transition"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/signup")}
              className="bg-black text-white px-4 py-1 rounded-lg font-semibold hover:scale-105 transition"
            >
              Signup
            </button>
          </>
        ) : (
          <>
            <span className="text-gray-700 font-medium">
              Hi, {name || "User"}
            </span>

            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-1 rounded-lg font-semibold hover:scale-105 transition"
            >
              Logout
            </button>
          </>
        )}

      </div>

    </div>
  );
}