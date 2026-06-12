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

    // ⚡ REAL-TIME SYNC
    const channel = supabase
      .channel("notes-channel")
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

  // ➕ ADD / UPDATE (INSTANT UI FIX)
  const saveNote = async () => {
    if (!title || !subject || !description) return;

    if (editId) {
      await supabase
        .from("notes")
        .update({ title, subject, description })
        .eq("id", editId);

      setNotes((prev) =>
        prev.map((n) =>
          n.id === editId ? { ...n, title, subject, description } : n
        )
      );

      setEditId(null);
    } else {
      const { data } = await supabase
        .from("notes")
        .insert([{ title, subject, description }])
        .select()
        .single();

      if (data) {
        setNotes((prev) => [data, ...prev]);
      }
    }

    setTitle("");
    setSubject("");
    setDescription("");
  };

  // ❌ DELETE (INSTANT)
  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // ✏️ EDIT
  const editNote = (note: Note) => {
    setTitle(note.title);
    setSubject(note.subject);
    setDescription(note.description);
    setEditId(note.id);
  };

  // 🔍 SEARCH
  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* 🎨 PLACEHOLDER COLOR FIX (INSIDE PAGE.TSX) */}
      <style>{`
        input::placeholder,
        textarea::placeholder {
          color: #60a5fa;
          opacity: 1;
        }
      `}</style>

      <div style={styles.page}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>🧠 Smart Notes App</h1>
          <p style={styles.subtitle}>Write • Organize • Search • Edit</p>
        </div>

        {/* SEARCH */}
        <input
          placeholder="🔍 Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        {/* FORM */}
        <div style={styles.card}>

          <input
            placeholder="✏️ Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="📚 Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={styles.input}
          />

          <textarea
            placeholder="📝 Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
          />

          <button onClick={saveNote} style={styles.button}>
            {editId ? "Update Note ✨" : "Add Note 🚀"}
          </button>

        </div>

        {/* NOTES */}
        {filtered.length === 0 ? (
          <p style={styles.empty}>No notes found 😴</p>
        ) : (
          filtered.map((note) => (
            <div
              key={note.id}
              style={styles.noteCard}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <h2 style={styles.noteTitle}>{note.title}</h2>

              <span style={styles.badge}>{note.subject}</span>

              <p style={styles.noteDesc}>{note.description}</p>

              <div style={styles.actions}>
                <button onClick={() => editNote(note)} style={styles.edit}>
                  Edit
                </button>

                <button onClick={() => deleteNote(note.id)} style={styles.delete}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* 🎨 UI STYLES (UNCHANGED) */
const styles: any = {
  page: {
    minHeight: "100vh",
    padding: 20,
    background: "linear-gradient(to right, #eef2ff, #f8fafc)",
    fontFamily: "sans-serif",
  },

  header: {
    textAlign: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
  },

  subtitle: {
    color: "#6b7280",
    marginTop: 5,
  },

  search: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #c7d2fe",
    marginBottom: 15,
    background: "white",
    outline: "none",
  },

  card: {
    background: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },

input: {
  width: "100%",
  padding: 12,
  marginBottom: 10,
  borderRadius: 10,
  border: "1px solid #e4e4e4",
  outline: "none",
  color: "#000",   // ✅ BLACK TEXT
},

textarea: {
  width: "100%",
  padding: 12,
  height: 100,
  borderRadius: 10,
  border: "1px solid #ddd",
  marginBottom: 10,
  outline: "none",
  color: "#000",   // ✅ BLACK TEXT
},

  button: {
    width: "100%",
    padding: 12,
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },

  noteCard: {
    background: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    transition: "0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  noteTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },

  badge: {
    display: "inline-block",
    marginTop: 5,
    fontSize: 12,
    padding: "3px 8px",
    borderRadius: 6,
    background: "#e0e7ff",
    color: "#4338ca",
  },

  noteDesc: {
    marginTop: 10,
    color: "#374151",
  },

  actions: {
    marginTop: 10,
    display: "flex",
    gap: 10,
  },

  edit: {
    color: "green",
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },

  delete: {
    color: "red",
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },

  empty: {
    textAlign: "center",
    color: "#6b7280",
  },
};