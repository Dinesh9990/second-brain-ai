"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const BASE_URL = "https://second-brain-ai-5au3.onrender.com";

export default function SignupPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/");
    }
  }, []);

  const handleSignup = async () => {

    if (!name || !email || !password) {
      return Swal.fire("Error", "All fields are required", "error");
    }

    if (name.length < 5) {
      return Swal.fire("Error", "Name must be at least 5 characters", "error");
    }

    if (!email.includes("@")) {
      return Swal.fire("Error", "Enter valid email", "error");
    }

    if (password.length < 8) {
      return Swal.fire("Error", "Password must be at least 8 characters", "error");
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return Swal.fire("Error", data.error || "Signup failed", "error");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name || "User");

      await Swal.fire("Success", "Signup successful", "success");

      window.location.href = "/";

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server not reachable", "error");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center pt-12">

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Signup
      </h1>

      <div className="bg-white p-8 rounded-xl w-full max-w-md"
        style={{ boxShadow: "1px 1px 5px goldenrod" }}>

        <input
          type="text"
          placeholder="Enter your name"
          className="w-full mb-4 border px-3 py-2 rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full mb-4 border px-3 py-2 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter password"
          className="w-full mb-6 border px-3 py-2 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="bg-[#e8c75f] w-full py-2 rounded-lg font-semibold"
        >
          Signup
        </button>

      </div>
    </div>
  );
}