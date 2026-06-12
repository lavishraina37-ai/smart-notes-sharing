"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Note = {
  id: string;
  title: string;
  content: string;
  created_at?: string;
};

export default function Page() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch notes
  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error.message);
    } else {
      setNotes(data || []);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // ✅ Add note
  const addNote = async () => {
    if (!title || !content) return;

    setLoading(true);

    const { error } = await supabase.from("notes").insert([
      {
        title,
        content,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setTitle("");
      setContent("");
      fetchNotes(); // refresh list
    }
  };

  // ✅ Delete note
  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      setNotes(notes.filter((n) => n.id !== id));
    }
  };

  return (
    <main style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>🧠 Smart Notes App</h1>

      {/* INPUT SECTION */}
      <input
        placeholder="Enter Title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: "10px", marginTop: "10px" }}
      />

      <textarea
        placeholder="Write your content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", padding: "10px", marginTop: "10px" }}
      />

      <button
        onClick={addNote}
        disabled={loading}
        style={{
          marginTop: "10px",
          padding: "10px",
          width: "100%",
          background: "black",
          color: "white",
        }}
      >
        ➕ {loading ? "Adding..." : "Add Note"}
      </button>

      {/* NOTES LIST */}
      <div style={{ marginTop: "20px" }}>
        {notes.length === 0 ? (
          <p>No notes yet 😴 Add your first note!</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginTop: "10px",
                borderRadius: "8px",
              }}
            >
              <h3>{note.title}</h3>
              <p>{note.content}</p>

              <button
                onClick={() => deleteNote(note.id)}
                style={{
                  marginTop: "5px",
                  padding: "5px 10px",
                  background: "red",
                  color: "white",
                  border: "none",
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}