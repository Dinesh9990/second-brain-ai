"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";

const BASE_URL = "https://second-brain-ai-5au3.onrender.com";

export default function NoteDetailPage() {

  const { id } = useParams();
  const router = useRouter();

  const [note, setNote] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        title: "Access Restricted",
        text: "Please login or signup to continue",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Signup",
        confirmButtonColor: "#000000",
        cancelButtonColor: "#e8c75f"
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login");
        } else {
          router.push("/signup");
        }
      });

      return;
    }

    // ✅ FIXED HERE
    fetch(`${BASE_URL}/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setNote(data));

  }, [id, router]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This note will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e8c75f",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete"
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("token");

      // ✅ FIXED HERE
      await fetch(`${BASE_URL}/notes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      await Swal.fire("Deleted!", "Your note has been deleted.", "success");

      router.push("/notes");
    }
  };

  if (!note) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center pt-8">

      <div
        className="relative bg-white p-8 rounded-xl w-full max-w-xl transition duration-200"
        style={{ boxShadow: "1px 1px 5px goldenrod" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = "2px 2px 10px goldenrod")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.boxShadow = "1px 1px 5px goldenrod")
        }
      >

        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 text-black hover:text-red-600 transition duration-200 cursor-pointer"
        >
          <Trash2 size={26} />
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {note.title}
        </h1>

        <hr className="my-4 border-gray-300" />

        <div className="mb-4">
          <h2 className="font-semibold text-gray-700 mb-1">
            Content
          </h2>
          <p className="text-gray-600 whitespace-pre-line">
            {note.content}
          </p>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold text-gray-700 mb-1">
            AI Summary
          </h2>
          <p className="text-gray-600">
            {note.summary || "No summary available"}
          </p>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold text-gray-700 mb-1">
            Tags
          </h2>

          {note.tags && note.tags.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {note.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-800 hover:bg-gray-800 hover:text-white transition cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tags available</p>
          )}
        </div>

        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-1">
            Source
          </h2>

          {note.sourceUrl ? (
            <a
              href={note.sourceUrl}
              target="_blank"
              className="text-blue-600 underline"
            >
              Open Source
            </a>
          ) : (
            <p className="text-gray-500">No source provided</p>
          )}
        </div>

        <button
          onClick={() => router.push("/notes")}
          className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer transition hover:scale-105 active:scale-95"
        >
          ← Back
        </button>

      </div>

    </div>
  );
}