"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function HomePage() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const textareaRef = useRef(null);

  // ✅ AUTH CHECK (FIXED)
  const checkAuthAndRedirect = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      const result = await Swal.fire({
        title: "Access Restricted",
        text: "Please login or signup to continue",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Signup",
        confirmButtonColor: "#000000",
        cancelButtonColor: "#e8c75f"
      });

      if (result.isConfirmed) {
        router.push("/login");
      } else {
        router.push("/signup");
      }

      return false;
    }

    return true;
  };

  const handleSummarize = async () => {
    if (!content.trim()) {
      setError(true);

      await Swal.fire({
        icon: "warning",
        title: "Content Required",
        text: "Please enter content before summarizing",
        confirmButtonColor: "#e8c75f",
      });

      textareaRef.current.focus();
      return;
    }

    setError(false);

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setContent("");
    setSummary("");
    setError(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      <h1 className="text-5xl font-bold mb-4 text-center text-gray-800">
        🧠 Second Brain
      </h1>

      <p className="text-gray-600 text-center max-w-xl mb-8">
        Capture your ideas, organize your thoughts, and let AI summarize everything instantly.
      </p>

      {/* Buttons */}
      <div className="flex gap-4 mb-12">
        <button
          onClick={async () => {
            if (await checkAuthAndRedirect()) {
              router.push("/notes/create");
            }
          }}
          className="bg-[#e8c75f] text-black px-6 py-2 rounded-xl font-semibold transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          ✨ Create Note
        </button>

        <button
          onClick={async () => {
            if (await checkAuthAndRedirect()) {
              router.push("/notes");
            }
          }}
          className="bg-white text-black px-6 py-2 rounded-xl font-semibold border border-gray-300 transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          📚 View Notes
        </button>
      </div>

      {/* Card */}
      <div
        className="bg-white p-6 rounded-2xl w-full max-w-xl transition duration-200"
        style={{ boxShadow: "1px 1px 5px goldenrod" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = "2px 2px 10px goldenrod")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow = "1px 1px 5px goldenrod")
        }
      >

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Try AI Summarization
        </h2>

        {/* Content */}
        <textarea
          ref={textareaRef}
          placeholder="Enter content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`w-full mb-3 px-3 py-2 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none resize-none transition
            ${error 
              ? "border border-red-500 focus:ring-1 focus:ring-red-500" 
              : "border border-gray-300 focus:ring-1 focus:ring-black"
            }`}
          rows={4}
        />

        {/* Button */}
        <button
          onClick={handleSummarize}
          className="bg-black text-white px-4 py-2 rounded-lg w-full transition hover:scale-105 cursor-pointer"
        >
          {loading ? "Summarizing..." : "Summarize"}
        </button>

        {/* Summary */}
        {summary && (
          <div className="mt-4 bg-gray-100 p-3 rounded-lg">
            <h3 className="font-semibold mb-1 text-gray-800">Summary:</h3>
            <p className="text-gray-600 mb-3">{summary}</p>

            <button
              onClick={handleReset}
              className="bg-[#e8c75f] text-black px-4 py-2 rounded-lg transition hover:scale-105 cursor-pointer"
            >
              Try Another Summary
            </button>
          </div>
        )}

      </div>
    </div>
  );
}