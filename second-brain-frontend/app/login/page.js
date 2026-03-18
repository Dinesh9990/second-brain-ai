"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/");
    }
  }, []);

  const handleLogin = async () => {

    if (!email || !password) {
      return Swal.fire("Error", "All fields are required", "error");
    }

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return Swal.fire("Error", "Invalid credentials", "error");
      }

      // ✅ FIX: SAFE STORE (NO UNDEFINED)
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name || "User");

      await Swal.fire("Success", "Login successful", "success");

      // ✅ FORCE REFRESH (so Navbar updates)
      window.location.href = "/";

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center pt-12">

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Login
      </h1>

      <div
        className="bg-white p-8 rounded-xl w-full max-w-md transition duration-200"
        style={{ boxShadow: "1px 1px 5px goldenrod" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = "2px 2px 10px goldenrod")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow = "1px 1px 5px goldenrod")
        }
      >

        {/* Email */}
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full mb-4 border border-gray-300 px-3 py-2 rounded-lg 
          text-gray-800 placeholder-gray-500 
          focus:outline-none focus:ring-1 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Enter password"
          className="w-full mb-6 border border-gray-300 px-3 py-2 rounded-lg 
          text-gray-800 placeholder-gray-500 
          focus:outline-none focus:ring-1 focus:ring-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-black text-white w-full py-2 rounded-lg font-semibold hover:scale-105 transition cursor-pointer"
        >
          Login
        </button>

      </div>

    </div>
  );
}