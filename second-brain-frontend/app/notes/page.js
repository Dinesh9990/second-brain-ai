"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { Trash2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const router = useRouter();

  // ✅ FETCH NOTES WITH TOKEN
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("NOTES RESPONSE:", data);

      // ✅ Handle any response shape safely
      setNotes(Array.isArray(data) ? data : data.notes || []);

    } catch (err) {
      Swal.fire("Error", "Failed to fetch notes", "error");
    }
  };

  // ✅ PROTECT PAGE
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("Unauthorized", "Please login first", "warning");
      router.push("/login");
      return;
    }

    fetchNotes();
  }, []);

  // ✅ DELETE NOTE (WITH TOKEN)
  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

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
      await fetch(`http://localhost:5000/notes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchNotes();
      Swal.fire("Deleted!", "Your note has been deleted.", "success");
    }
  };

  // ✅ SAFE FILTER (NO CRASH EVER)
  let filteredNotes = Array.isArray(notes)
    ? notes.filter((note) => {
        const searchText = search.toLowerCase();

        const inTitle = note.title?.toLowerCase().includes(searchText);
        const inSummary = note.summary?.toLowerCase().includes(searchText);
        const inTags = note.tags?.some(tag =>
          tag.toLowerCase().includes(searchText)
        );

        return (inTitle || inSummary || inTags) &&
               (typeFilter === "all" || note.type === typeFilter);
      })
    : [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Notes Dashboard
        </h1>

        <div className="flex items-center gap-20">

          <div className="flex items-center gap-20">

            {/* Create Button */}
            {notes.length > 0 && (
              <Link href="/notes/create">
                <button className="bg-[#e8c75f] text-black px-5 py-2 rounded-lg font-semibold transition hover:scale-105 active:scale-95 cursor-pointer">
                  Create Note
                </button>
              </Link>
            )}

            {/* Search + Filters */}
            <div className="flex items-center gap-3">

              {/* Search */}
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-72 focus-within:ring-1 focus-within:ring-black">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 outline-none text-gray-800 placeholder-gray-500"
                />
                <Search size={18} className="text-gray-500" />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-400 bg-gray-100 text-gray-800 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All</option>
                <option value="note">Note</option>
                <option value="article">Article</option>
                <option value="idea">Idea</option>
                <option value="resource">Resource</option>
              </select>

              {/* Sort */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-gray-400 bg-gray-100 text-gray-800 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>

            </div>

          </div>

        </div>
      </div>

      <hr className="border-t border-gray-800 mb-6" />

      {/* EMPTY STATE */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-center">

          <div className="text-6xl mb-4">📭</div>

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No notes yet
          </h2>

          <p className="text-gray-500 mb-6">
            Start capturing your thoughts by creating your first note
          </p>

          <Link href="/notes/create">
            <button className="bg-[#e8c75f] text-black px-6 py-2 rounded-lg font-semibold transition hover:scale-105 cursor-pointer">
              Create Your First Note
            </button>
          </Link>

        </div>
      ) : filteredNotes.length === 0 ? (

        <div className="text-center mt-20 text-gray-600">
          No matching notes found
        </div>

      ) : (

        filteredNotes.map((note) => (
          <Link key={note._id} href={`/notes/${note._id}`}>
            <div
              className="group relative p-5 mb-5 rounded-xl bg-white cursor-pointer transition duration-200"
              style={{ boxShadow: "1px 1px 5px goldenrod" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "2px 2px 10px goldenrod")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "1px 1px 5px goldenrod")
              }
            >

              <button
                onClick={(e) => handleDelete(e, note._id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition text-black hover:text-red-600 cursor-pointer"
              >
                <Trash2 size={22} />
              </button>

              <h2 className="text-xl font-semibold text-gray-800">
                {note.title}
              </h2>

              <p className="text-gray-600 mt-2">
                {note.summary}
              </p>

              <div className="mt-3 flex gap-2 flex-wrap">
                {note.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-800 hover:bg-gray-800 hover:text-white transition"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

            </div>
          </Link>
        ))
      )}

    </div>
  );
}