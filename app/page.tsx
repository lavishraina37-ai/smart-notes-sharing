"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NotesPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    setNotes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async () => {
    if (!title.trim() || !content.trim()) return;

    await supabase.from("notes").insert([{ title, content }]);

    setTitle("");
    setContent("");
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    fetchNotes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">

      {/* HEADER */}
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
        🧠 Smart Notes App
      </h1>

      {/* INPUT CARD */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-5 hover:shadow-2xl transition">

        <input
          className="w-full border rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          placeholder="Enter Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          placeholder="Write your content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* LIVE PREVIEW */}
        {(title || content) && (
          <div className="bg-gray-50 p-3 rounded-lg mb-3 border">
            <p className="font-semibold">{title || "No title yet..."}</p>
            <p className="text-sm text-gray-600">
              {content || "Start typing content..."}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={addNote}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition transform hover:scale-105"
          >
            ➕ Add Note
          </button>

          <button
            onClick={() => {
              setTitle("");
              setContent("");
            }}
            className="bg-gray-300 hover:bg-gray-400 px-4 rounded-lg transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center mt-6 text-gray-600">Loading notes...</p>
      )}

      {/* EMPTY STATE */}
      {!loading && notes.length === 0 && (
        <p className="text-center mt-6 text-gray-500">
          No notes yet 😴 Add your first note!
        </p>
      )}

      {/* NOTES GRID */}
      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <h2 className="font-bold text-lg mb-2">{note.title}</h2>
            <p className="text-gray-600 mb-4">{note.content}</p>

            <button
              onClick={() => deleteNote(note.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}