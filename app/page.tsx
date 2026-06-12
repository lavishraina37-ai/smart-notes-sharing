"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NotesPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<any[]>([]);

  // FETCH NOTES
  const fetchNotes = async () => {
    const { data } = await supabase.from("notes").select("*");
    setNotes(data || []);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // ADD NOTE
  const addNote = async () => {
    await supabase.from("notes").insert([{ title, content }]);
    setTitle("");
    setContent("");
    fetchNotes();
  };

  // DELETE NOTE
  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    fetchNotes();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Smart Notes App</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br />

      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <br />

      <button onClick={addNote}>Add Note</button>

      <hr />

      {notes.map((note) => (
        <div key={note.id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>

          <button onClick={() => deleteNote(note.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}