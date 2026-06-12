"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Note = {
  id: string;
  title: string;
  subject: string;
  description: string;
};

export default function Page() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [editId, setEditId] = useState<string | null>(null);

  // 📥 FETCH NOTES
  const fetchNotes = async () => {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    setNotes(data || []);
  };

  useEffect(() => {
    fetchNotes();

    // ⚡ REAL-TIME UPDATES
    const channel = supabase
      .channel("notes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        () => fetchNotes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ➕ ADD / UPDATE NOTE
  const saveNote = async () => {
    if (!title || !subject || !description) return;

    if (editId) {
      await supabase
        .from("notes")
        .update({ title, subject, description })
        .eq("id", editId);
    } else {
      await supabase.from("notes").insert([
        { title, subject, description },
      ]);
    }

    setTitle("");
    setSubject("");
    setDescription("");
    setEditId(null);
  };

  // ❌ DELETE
  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
  };

  // ✏️ EDIT
  const editNote = (note: Note) => {
    setTitle(note.title);
    setSubject(note.subject);
    setDescription(note.description);
    setEditId(note.id);
  };

  // 🔍 SEARCH FILTER
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20, background: "#f3f4f6", minHeight: "100vh" }}>

      {/* HEADER */}
      <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: "bold" }}>
        🧠 Smart Notes App
      </h1>

      {/* SEARCH */}
      <input
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginTop: 20,
          marginBottom: 20,
          border: "1px solid #ccc",
          borderRadius: 8,
          background: "white",
        }}
      />

      {/* FORM */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...inputStyle, height: 100 }}
        />

        <button onClick={saveNote} style={buttonStyle}>
          {editId ? "Update Note" : "Add Note"}
        </button>

      </div>

      {/* NOTES */}
      {filteredNotes.length === 0 ? (
        <p style={{ textAlign: "center", color: "gray" }}>
          No notes found 😴
        </p>
      ) : (
        filteredNotes.map((note) => (
          <div key={note.id} style={cardStyle}>

            <h2 style={{ fontWeight: "bold" }}>{note.title}</h2>

            <span style={{ fontSize: 12, color: "blue" }}>
              {note.subject}
            </span>

            <p style={{ marginTop: 10 }}>{note.description}</p>

            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button onClick={() => editNote(note)} style={{ color: "green" }}>
                Edit
              </button>

              <button onClick={() => deleteNote(note.id)} style={{ color: "red" }}>
                Delete
              </button>
            </div>

          </div>
        ))
      )}
    </div>
  );
}

// 🎨 Styles
const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  border: "1px solid #ccc",
  borderRadius: 8,
  background: "white",
  color: "#111",
};

const buttonStyle = {
  width: "100%",
  padding: 10,
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const cardStyle = {
  background: "white",
  padding: 15,
  borderRadius: 10,
  marginBottom: 10,
};