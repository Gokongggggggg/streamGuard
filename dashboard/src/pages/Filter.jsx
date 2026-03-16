import { useState, useEffect } from "react";
import T from "../lib/theme";
import { api } from "../lib/api";
import { Card, Btn, Toggle, useToast } from "../components/ui";

export default function PageFilter({ user, onUserUpdate }) {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [filterOn, setFilterOn] = useState(user.filter_enabled);
  const toast = useToast();

  useEffect(() => {
    api("/api/blocklist").then(d => setWords(d.words || []));
  }, []);

  const toggle = async () => {
    const d = await api("/api/settings/filter", { method: "POST", body: { enabled: !filterOn } });
    setFilterOn(d.filter_enabled);
    onUserUpdate({ ...user, filter_enabled: d.filter_enabled });
    toast(d.filter_enabled ? "Filter activated" : "Filter disabled", d.filter_enabled ? "success" : "info");
  };

  const add = async () => {
    if (!newWord.trim()) return;
    const d = await api("/api/blocklist", { method: "POST", body: { word: newWord.trim() } });
    setWords(d.words || []);
    toast(`"${newWord.trim()}" added to blocklist`, "success");
    setNewWord("");
  };

  const remove = async (w) => {
    const d = await api(`/api/blocklist/${encodeURIComponent(w)}`, { method: "DELETE" });
    setWords(d.words || []);
    toast(`"${w}" removed from blocklist`, "info");
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

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input value={newWord} onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Add word to block..."
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bg, color: T.text, fontSize: 14, fontFamily: "inherit", outline: "none",
            }} />
          <Btn onClick={add}>Add</Btn>
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
                <span onClick={() => remove(w)} style={{ cursor: "pointer", fontWeight: 700, opacity: 0.6 }}>×</span>
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
