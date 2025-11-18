import { useState } from "react";

type BuySellHoldApiRow = {
  PlayerId: number;
  Player: string;
  ["Calculated Verdict"]: string;
  ["Manual Override"]: string;
};

type BuySellHoldRow = {
  playerId: number;
  playerName: string;
  calculatedVerdict: string;
  initialManualOverride: string;
};

const MANUAL_OVERRIDE_OPTIONS = [
  "HARD SELL",
  "SOFT SELL",
  "HOLD",
  "SOFT BUY",
  "HARD BUY",
];

const API_BASE_URL = "https://domainffapi.azurewebsites.net";

const BuySellHoldOverrides: React.FC = () => {
  const [weekId, setWeekId] = useState<number>(1);
  const [rows, setRows] = useState<BuySellHoldRow[]>([]);
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [originalOverrides, setOriginalOverrides] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadWeek = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const resp = await fetch(`${API_BASE_URL}/api/BuySellHold/${weekId}`);
      if (!resp.ok) {
        throw new Error(`Failed to load data for week ${weekId}. Status: ${resp.status}`);
      }

      const data: BuySellHoldApiRow[] = await resp.json();

      const mappedRows: BuySellHoldRow[] = data.map((r) => ({
        playerId: r.PlayerId,
        playerName: r.Player,
        calculatedVerdict: r["Calculated Verdict"],
        initialManualOverride: r["Manual Override"] ?? "",
      }));

      setRows(mappedRows);

      const initialOverrideMap: Record<number, string> = {};
      mappedRows.forEach((row) => {
        if (row.initialManualOverride) {
          initialOverrideMap[row.playerId] = row.initialManualOverride;
        }
      });

      setOverrides(initialOverrideMap);
      setOriginalOverrides(initialOverrideMap);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "An error occurred while loading data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverrideChange = (playerId: number, value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [playerId]: value,
    }));
  };

  const handleSaveOverrides = async () => {
    setError(null);
    setMessage(null);

    const payload = rows
      .map((row) => {
        const value = overrides[row.playerId] ?? "";
        const original = originalOverrides[row.playerId] ?? "";

        if (!value) return null;

        if (value === original) return null;

        return {
          playerId: row.playerId,
          overrideValue: value,
        };
      })
      .filter((x): x is { playerId: number; overrideValue: string } => x !== null);

    if (payload.length === 0) {
      setMessage("No new overrides to save.");
      return;
    }

    setIsSaving(true);
    try {
      const resp = await fetch(
        `${API_BASE_URL}/api/BuySellHold/overrides?weekId=${weekId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(
          `Failed to save overrides. Status: ${resp.status}. Response: ${text}`
        );
      }

      const affected = await resp.json();

      const newOriginal = { ...originalOverrides };
      payload.forEach((item) => {
        newOriginal[item.playerId] = item.overrideValue;
      });
      setOriginalOverrides(newOriginal);

      setMessage(`Overrides saved successfully (rows affected: ${affected}).`);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "An error occurred while saving overrides.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: 900, margin: "0 auto" }}>
      <h2>Buy / Sell / Hold Manual Overrides</h2>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <label htmlFor="week-select">Week:</label>
        <select
          id="week-select"
          value={weekId}
          onChange={(e) => setWeekId(Number(e.target.value))}
        >
          {Array.from({ length: 22 }).map((_, idx) => {
            const w = idx + 1;
            return (
              <option key={w} value={w}>
                Week {w}
              </option>
            );
          })}
        </select>

        <button onClick={loadWeek} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load Week"}
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "0.5rem" }}>
          {error}
        </div>
      )}
      {message && (
        <div style={{ color: "green", marginBottom: "0.5rem" }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handleSaveOverrides} disabled={isSaving || rows.length === 0}>
          {isSaving ? "Saving..." : "Save Overrides"}
        </button>
      </div>

      {rows.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>
                Player Name
              </th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>
                Calculated Verdict
              </th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>
                Manual Override
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const currentOverride = overrides[row.playerId] ?? "";
              return (
                <tr key={row.playerId}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                    {row.playerName}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                    {row.calculatedVerdict}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                    <select
                      value={currentOverride}
                      onChange={(e) =>
                        handleOverrideChange(row.playerId, e.target.value)
                      }
                    >
                      <option value="">-- No override --</option>
                      {MANUAL_OVERRIDE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        !isLoading && <div>No data loaded. Select a week and click "Load Week".</div>
      )}
    </div>
  );
};

export default BuySellHoldOverrides;
