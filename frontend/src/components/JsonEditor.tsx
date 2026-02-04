import { useState } from "react";

interface JsonEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  exampleJson?: object;
}

export default function JsonEditor({
  label,
  value,
  onChange,
  rows = 6,
  placeholder = '{\n  "key": "value"\n}',
  exampleJson,
}: JsonEditorProps) {
  const [error, setError] = useState<string>("");

  const handleValidate = () => {
    if (!value.trim()) {
      setError("الحقل فارغ");
      return;
    }

    try {
      JSON.parse(value);
      setError("");
      alert("✓ JSON صحيح");
    } catch (e) {
      setError(`خطأ في التنسيق: ${(e as Error).message}`);
    }
  };

  const handleCopyExample = () => {
    if (exampleJson) {
      const formatted = JSON.stringify(exampleJson, null, 2);
      onChange(formatted);
      setError("");
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
      setError("");
    } catch (e) {
      setError(`تعذر تنسيق JSON: ${(e as Error).message}`);
    }
  };

  return (
    <div>
      <label>
        {label}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            className="secondary btn-sm"
            onClick={handleValidate}
            style={{ flex: "0 0 auto" }}
          >
            تحقق من JSON
          </button>
          <button
            type="button"
            className="secondary btn-sm"
            onClick={handleFormat}
            style={{ flex: "0 0 auto" }}
          >
            تنسيق
          </button>
          {exampleJson && (
            <button
              type="button"
              className="secondary btn-sm"
              onClick={handleCopyExample}
              style={{ flex: "0 0 auto" }}
            >
              نسخ مثال
            </button>
          )}
        </div>
        <textarea
          className="code-editor"
          rows={rows}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setError("");
          }}
          placeholder={placeholder}
          style={{
            marginTop: "0.5rem",
            fontFamily: "'Courier New', monospace",
            fontSize: "0.875rem",
          }}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
