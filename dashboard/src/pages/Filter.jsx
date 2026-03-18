import { useState, useEffect } from "react";
import T from "../lib/theme";
import { api } from "../lib/api";
import { Card, Btn, Toggle, useToast } from "../components/ui";

const MAX_WORD_LENGTH = 50;

export default function PageFilter({ user, onUserUpdate }) {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [filterOn, setFilterOn] = useState(user.filter_enabled);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api("/api/blocklist").then(d => setWords(d.words || [])).catch(() => {});
  }, []);

  const toggle = async () => {
    try {
      const d = await api("/api/settings/filter", { method: "POST", body: { enabled: !filterOn } });
      setFilterOn(d.filter_enabled);
      onUserUpdate({ ...user, filter_enabled: d.filter_enabled });
      toast(d.filter_enabled ? "Filter activated" : "Filter disabled", d.filter_enabled ? "success" : "info");
    } catch {
      toast("Failed to toggle filter", "error");
    }
  };

  const add = async () => {
    const word = newWord.trim().toLowerCase();
    if (!word) return;
    if (word.length > MAX_WORD_LENGTH) {
      toast(`Word too long (max ${MAX_WORD_LENGTH} characters)`, "error");
      return;
    }
    if (words.includes(word)) {
      toast(`"${word}" is already in your blocklist`, "error");
      return;
    }
    try {
      const d = await api("/api/blocklist", { method: "POST", body: { word } });
      setWords(d.words || []);
      toast(`"${word}" added to blocklist`, "success");
      setNewWord("");
    } catch {
      toast("Failed to add word", "error");
    }
  };

  const remove = async (w) => {
    try {
      const d = await api(`/api/blocklist/${encodeURIComponent(w)}`, { method: "DELETE" });
      setWords(d.words || []);
      toast(`"${w}" removed from blocklist`, "info");
    } catch {
      toast("Failed to remove word", "error");
    }
    setConfirmDelete(null);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Filter Settings</h2>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>NLP Judol Filter</div>
            <div style={{ fontSize: 13, color: T.textDim }}>
              {filterOn ? "Active — gambling spam is being filtered" : "Disabled — all donations pass through"}
            </div>
          </div>
          <Toggle on={filterOn} onToggle={toggle} />
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Custom Blocklist</div>
        <div style={{ fontSize: 13, color: T.textDim, marginBottom: 16 }}>
          Block additional words beyond the built-in judol filter
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <input value={newWord} onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Add word to block..."
            maxLength={MAX_WORD_LENGTH}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bg, color: T.text, fontSize: 14, fontFamily: "inherit", outline: "none",
            }} />
          <Btn onClick={add}>Add</Btn>
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 16 }}>
          {newWord.length > 0 && `${newWord.length}/${MAX_WORD_LENGTH}`}
        </div>

        {words.length === 0 ? (
          <div style={{ color: T.textDim, fontSize: 13, fontStyle: "italic" }}>No custom words added</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {words.map(w => (
              <span key={w} style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 13, fontWeight: 500,
                background: T.dangerDim, color: T.danger, border: `1px solid ${T.danger}22`,
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                {w}
                {confirmDelete === w ? (
                  <span style={{ display: "inline-flex", gap: 4 }}>
                    <span onClick={() => remove(w)} style={{
                      cursor: "pointer", fontWeight: 700, color: T.danger,
                      padding: "0 4px", borderRadius: 4, background: T.danger + "22",
                    }}>Yes</span>
                    <span onClick={() => setConfirmDelete(null)} style={{
                      cursor: "pointer", fontWeight: 600, opacity: 0.5, padding: "0 4px",
                    }}>No</span>
                  </span>
                ) : (
                  <span onClick={() => setConfirmDelete(w)} style={{ cursor: "pointer", fontWeight: 700, opacity: 0.6 }}>×</span>
                )}
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
