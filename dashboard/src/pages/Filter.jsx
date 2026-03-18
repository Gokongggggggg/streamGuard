import { useState, useEffect } from "react";
import T from "../lib/theme";
import { api } from "../lib/api";
import { Card, Btn, Toggle, useToast } from "../components/ui";
import { useLang } from "../lib/i18n";

const MAX_WORD_LENGTH = 50;

export default function PageFilter({ user, onUserUpdate }) {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [filterOn, setFilterOn] = useState(user.filter_enabled);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const toast = useToast();
  const { t } = useLang();

  useEffect(() => {
    api("/api/blocklist").then(d => setWords(d.words || [])).catch(() => {});
  }, []);

  const toggle = async () => {
    try {
      const d = await api("/api/settings/filter", { method: "POST", body: { enabled: !filterOn } });
      setFilterOn(d.filter_enabled);
      onUserUpdate({ ...user, filter_enabled: d.filter_enabled });
      toast(d.filter_enabled ? t("filter.active") : t("filter.disabled"), d.filter_enabled ? "success" : "info");
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
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>{t("filter.title")}</h2>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: filterOn ? 16 : 0 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{t("filter.nlpTitle")}</div>
            <div style={{ fontSize: 13, color: T.textDim }}>
              {filterOn ? t("filter.active") : t("filter.disabled")}
            </div>
          </div>
          <Toggle on={filterOn} onToggle={toggle} />
        </div>
        {filterOn && (
          <div style={{
            display: "flex", gap: 12, flexWrap: "wrap",
          }}>
            {[
              { label: t("filter.highKeywords"), count: 27, color: T.danger },
              { label: t("filter.ctxKeywords"), count: 10, color: T.warning },
              { label: t("filter.regexPatterns"), count: 10, color: T.accent },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12,
                background: T.bg, border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontWeight: 700, color: item.color }}>{item.count}</span>
                <span style={{ color: T.textDim }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {filterOn && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{t("filter.pipeline")}</div>
          <div style={{ fontSize: 13, color: T.textDim, marginBottom: 16 }}>
            {t("filter.pipelineDesc")}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 0,
            overflowX: "auto", paddingBottom: 4,
          }}>
            {[
              { name: t("filter.normalization"), desc: t("filter.normDesc"), active: true },
              { name: t("filter.blocklist"), desc: t("filter.blockDesc"), active: true },
              { name: t("filter.keywords"), desc: t("filter.keyDesc"), active: true },
              { name: t("filter.regex"), desc: t("filter.regexDesc"), active: true },
              { name: t("filter.ml"), desc: t("filter.mlDesc"), active: false },
            ].map((step, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  padding: "10px 16px", borderRadius: 8, minWidth: 120,
                  background: T.bg, border: `1px solid ${T.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", display: "inline-block",
                      background: step.active ? T.success : T.warning,
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>
                      {i < 4 ? `Layer ${i === 0 ? "1" : "2" + String.fromCharCode(97 + i - 1)}` : "Layer 3"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{step.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{step.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <span style={{
                    color: T.textMuted, fontSize: 18, padding: "0 6px",
                    userSelect: "none", flexShrink: 0,
                  }}>{"\u2192"}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{t("filter.customBlocklist")}</div>
        <div style={{ fontSize: 13, color: T.textDim, marginBottom: 16 }}>
          {t("filter.customDesc")}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <input value={newWord} onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder={t("filter.addPlaceholder")}
            maxLength={MAX_WORD_LENGTH}
            className="sg-input"
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bg, color: T.text, fontSize: 14, fontFamily: "inherit", outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }} />
          <Btn onClick={add}>{t("filter.add")}</Btn>
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 16 }}>
          {newWord.length > 0 && `${newWord.length}/${MAX_WORD_LENGTH}`}
        </div>

        {words.length === 0 ? (
          <div style={{ color: T.textDim, fontSize: 13, fontStyle: "italic" }}>{t("filter.noWords")}</div>
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
