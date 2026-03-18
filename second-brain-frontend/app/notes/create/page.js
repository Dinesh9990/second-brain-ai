"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const BASE_URL = "https://second-brain-ai-5au3.onrender.com";

export default function CreateNotePage() {

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("note");
  const [tags, setTags] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const [errors, setErrors] = useState({
    title: false,
    content: false,
    type: false
  });

  const createNote = async () => {

    const newErrors = {
      title: !title.trim(),
      content: !content.trim(),
      type: !type
    };

    setErrors(newErrors);

    if (newErrors.title || newErrors.content || newErrors.type) {
      await Swal.fire({
        title: "Incomplete Form",
        text: "Please fill all required fields",
        icon: "warning",
        confirmButtonColor: "#e8c75f"
      });
      return;
    }

    const formattedTags = tags
      ? tags.split(",").map(tag => tag.trim())
      : [];

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // ✅ ONLY CHANGE HERE
      const res = await fetch(`${BASE_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content,
          type,
          tags: formattedTags,
          sourceUrl
        })
      });

      const data = await res.json();

      if (!res.ok) {
        return Swal.fire(
          "Error",
          data.error || "Failed to create note",
          "error"
        );
      }

      await Swal.fire(
        "Success",
        "Note created successfully",
        "success"
      );

      router.push("/notes");

    } catch (err) {
      console.error("Error creating note:", err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center pt-8">

      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Create New Knowledge Note
      </h1>

      <div
        className="bg-white p-8 rounded-xl w-full max-w-xl transition duration-200"
        style={{ boxShadow: "1px 1px 5px goldenrod" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = "2px 2px 10px goldenrod")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow = "1px 1px 5px goldenrod")
        }
      >

        {/* Title */}
        <div className="mb-5">
          <label className={`block font-semibold mb-1 ${errors.title ? "text-red-500" : "text-gray-800"}`}>
            Title *
          </label>

          <input
            type="text"
            placeholder="Enter note title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors(prev => ({ ...prev, title: false }));
            }}
            className={`w-full px-3 py-2 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none
              ${errors.title
                ? "border border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400"
                : "border border-gray-300 bg-white focus:ring-1 focus:ring-black"
              }`}
          />
        </div>

        {/* Content */}
        <div className="mb-5">
          <label className={`block font-semibold mb-1 ${errors.content ? "text-red-500" : "text-gray-800"}`}>
            Content *
          </label>

          <textarea
            placeholder="Write your note content here..."
            rows={6}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setErrors(prev => ({ ...prev, content: false }));
            }}
            className={`w-full px-3 py-2 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none resize-none
              ${errors.content
                ? "border border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400"
                : "border border-gray-300 bg-white focus:ring-1 focus:ring-black"
              }`}
          />
        </div>

        {/* Type */}
        <div className="mb-5">
          <label className={`block font-semibold mb-1 ${errors.type ? "text-red-500" : "text-gray-800"}`}>
            Type *
          </label>

          <div className="relative">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setErrors(prev => ({ ...prev, type: false }));
              }}
              className={`w-full px-3 py-2 pr-10 rounded-lg text-gray-800 appearance-none focus:outline-none cursor-pointer
                ${errors.type
                  ? "border border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400"
                  : "border border-gray-300 bg-white focus:ring-1 focus:ring-black"
                }`}
            >
              <option value="">Select type</option>
              <option value="note">Note</option>
              <option value="article">Article</option>
              <option value="idea">Idea</option>
              <option value="resource">Resource</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-600">
              ▼
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-5">
          <label className="block font-semibold text-gray-800 mb-1">
            Tags (Optional)
          </label>

          <input
            type="text"
            placeholder="Example: productivity, AI, learning"
            className="w-full border border-gray-300 bg-white px-3 py-2 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {/* Source URL */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-800 mb-1">
            Source URL (Optional)
          </label>

          <input
            type="text"
            placeholder="Paste article, video, or reference link"
            className="w-full border border-gray-300 bg-white px-3 py-2 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
        </div>

        <button
          onClick={createNote}
          className="bg-[#e8c75f] text-black px-5 py-2 rounded-lg font-semibold transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          Save Note
        </button>

      </div>

    </div>
  );
}