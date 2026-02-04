import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, apiUpload } from "../api";

type Account = {
  id: number;
  name: string;
};

export default function ImportClients() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState<number | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAccounts() {
    const response = await apiFetch<{ data: Account[] }>("/accounts");
    setAccounts(response.data);
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleSubmit() {
    if (!file || accountId === "") {
      setError("الرجاء اختيار الشركة والملف");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("accountId", String(accountId));

      const response = await apiUpload<{ inserted: number; skipped: number }>(
        "/imports/clients",
        form
      );
      setResult(response);
      setFile(null);
    } catch (err) {
      setError("حدث خطأ أثناء الاستيراد");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setAccountId("");
    setFile(null);
    setResult(null);
    setError("");
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">استيراد العملاء</h1>
        <p className="page-description">
          رفع ملف Excel لاستيراد بيانات العملاء بشكل جماعي
        </p>
      </div>

      <div className="card">
        <div
          style={{
            background: "var(--color-primary-soft)",
            padding: "var(--spacing-md)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--spacing-md)",
            borderRight: "4px solid var(--color-primary)",
          }}
        >
          <h4 style={{ margin: 0, marginBottom: "var(--spacing-xs)" }}>
            📋 ترتيب الأعمدة المطلوب
          </h4>
          <p style={{ margin: 0, fontSize: "var(--font-size-sm)", lineHeight: 1.8 }}>
            تأكد من أن ملف Excel يحتوي على الأعمدة بالترتيب التالي:
          </p>
          <ol style={{ margin: "var(--spacing-sm) 0 0", paddingRight: "var(--spacing-md)" }}>
            <li>الاسم</li>
            <li>العقود</li>
            <li>الرقم الوطني</li>
            <li>تاريخ البيع</li>
            <li>العمل</li>
            <li>عنوان السكن</li>
            <li>عنوان العمل</li>
            <li>الهاتف</li>
            <li>الحالة</li>
            <li>حالة الشكوى</li>
          </ol>
        </div>

        <label>
          الشركة المالكة *
          <select
            value={accountId}
            onChange={(e) => {
              const value = e.target.value;
              setAccountId(value ? Number(value) : "");
            }}
          >
            <option value="">-- اختر الشركة --</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <small className="form-helper">اختر الشركة التي تنتمي إليها البيانات المستوردة</small>
        </label>

        <label>
          ملف Excel (.xlsx, .xls) *
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && (
            <small className="form-helper" style={{ color: "var(--color-success)" }}>
              ✓ تم اختيار: {file.name}
            </small>
          )}
        </label>

        {error && <p className="form-error">{error}</p>}

        <div style={{ display: "flex", gap: "var(--spacing-sm)", marginTop: "var(--spacing-md)" }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!file || accountId === "" || loading}
          >
            {loading ? "⏳ جاري الاستيراد..." : "📥 تنفيذ الاستيراد"}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={handleReset}
            disabled={loading}
          >
            إعادة تعيين
          </button>
        </div>

        {result && (
          <div
            style={{
              marginTop: "var(--spacing-md)",
              padding: "var(--spacing-md)",
              background: "var(--color-success-soft)",
              borderRadius: "var(--radius-md)",
              borderRight: "4px solid var(--color-success)",
            }}
          >
            <h4 style={{ margin: 0, marginBottom: "var(--spacing-sm)", color: "var(--color-success)" }}>
              ✓ اكتمل الاستيراد بنجاح
            </h4>
            <div style={{ display: "flex", gap: "var(--spacing-lg)", fontSize: "var(--font-size-sm)" }}>
              <div>
                <strong>تمت الإضافة:</strong>{" "}
                <span className="badge badge-success">{result.inserted}</span>
              </div>
              <div>
                <strong>تم التجاوز:</strong>{" "}
                <span className="badge badge-info">{result.skipped}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
