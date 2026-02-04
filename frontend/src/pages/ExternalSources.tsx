import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch } from "../api";
import DataTable, { Column } from "../components/DataTable";
import TableToolbar from "../components/TableToolbar";
import JsonEditor from "../components/JsonEditor";
import { ConfirmModal } from "../components/Modal";

type ExternalSource = {
  id: number;
  name: string;
  urlTemplate: string;
  enabled: boolean;
  mapping: Record<string, string>;
  headers: Record<string, string>;
};

const emptySource: ExternalSource = {
  id: 0,
  name: "",
  urlTemplate: "",
  enabled: true,
  mapping: {},
  headers: {},
};

const exampleMapping = {
  name: "name",
  national_id: "national_id",
  phone: "phone",
  account_name: "account",
  contracts: "contracts",
  sell_date: "sell_date",
  work: "work",
  home_address: "home_address",
  work_address: "work_address",
  status: "status",
  court_status: "court_status",
};

const exampleHeaders = {
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_TOKEN_HERE",
};

export default function ExternalSources() {
  const [sources, setSources] = useState<ExternalSource[]>([]);
  const [form, setForm] = useState<ExternalSource>(emptySource);
  const [mappingText, setMappingText] = useState("{}");
  const [headersText, setHeadersText] = useState("{}");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<ExternalSource | null>(null);

  async function load() {
    const response = await apiFetch<{ data: ExternalSource[] }>("/external-sources");
    setSources(response.data);
  }

  useEffect(() => {
    load();
  }, []);

  const filteredSources = sources.filter((src) =>
    src.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function selectSource(source: ExternalSource) {
    setForm(source);
    setMappingText(JSON.stringify(source.mapping ?? {}, null, 2));
    setHeadersText(JSON.stringify(source.headers ?? {}, null, 2));
    setError("");
    // Scroll to form
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptySource);
    setMappingText("{}");
    setHeadersText("{}");
    setError("");
  }

  async function save() {
    setError("");
    
    if (!form.name.trim()) {
      setError("اسم الشركة مطلوب");
      return;
    }
    
    if (!form.urlTemplate.trim()) {
      setError("رابط API مطلوب");
      return;
    }

    let mapping: Record<string, string>;
    let headers: Record<string, string>;
    try {
      mapping = JSON.parse(mappingText || "{}");
      headers = JSON.parse(headersText || "{}");
    } catch (err) {
      setError("صيغة JSON غير صحيحة");
      return;
    }

    const payload = {
      name: form.name,
      urlTemplate: form.urlTemplate,
      enabled: form.enabled,
      mapping,
      headers,
    };

    if (form.id) {
      await apiFetch(`/external-sources/${form.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch("/external-sources", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    await load();
  }

  async function handleDelete(source: ExternalSource) {
    await apiFetch(`/external-sources/${source.id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    await load();
  }

  const columns: Column<ExternalSource>[] = [
    { key: "name", label: "اسم الشركة" },
    {
      key: "urlTemplate",
      label: "رابط API",
      render: (row) => (
        <code
          style={{
            fontSize: "var(--font-size-xs)",
            wordBreak: "break-all",
            display: "block",
            maxWidth: "400px",
          }}
        >
          {row.urlTemplate}
        </code>
      ),
    },
    {
      key: "enabled",
      label: "الحالة",
      render: (row) => (
        <span className={`badge ${row.enabled ? "badge-success" : "badge-info"}`}>
          {row.enabled ? "✓ مفعّل" : "⊗ موقوف"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (row) => (
        <div className="table-actions">
          <button
            type="button"
            className="btn-sm secondary"
            onClick={() => selectSource(row)}
          >
            ✏️ تعديل
          </button>
          <button
            type="button"
            className="btn-sm danger"
            onClick={() => setDeleteConfirm(row)}
          >
            🗑️ حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">المصادر الخارجية</h1>
        <p className="page-description">
          إدارة APIs الخارجية وتخصيص طرق الربط والبيانات
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">المصادر المُعرّفة ({sources.length})</h3>
        </div>
        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="بحث في المصادر..."
          actions={
            <button type="button" className="btn-sm secondary" onClick={load}>
              🔄 تحديث
            </button>
          }
        />
        <DataTable
          columns={columns}
          data={filteredSources}
          keyExtractor={(row) => row.id.toString()}
          emptyMessage="لا توجد مصادر خارجية. أضف مصدر جديد أدناه."
        />
      </div>

      <div className="card mt-lg">
        <div className="card-header">
          <h3 className="card-title">
            {form.id ? "✏️ تعديل المصدر" : "➕ إضافة مصدر جديد"}
          </h3>
          {form.id && (
            <button
              type="button"
              className="btn-sm secondary"
              onClick={resetForm}
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        <label>
          اسم الشركة *
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="مثال: شركة زجل"
          />
        </label>

        <label>
          رابط API *
          <input
            type="text"
            value={form.urlTemplate}
            onChange={(e) => setForm({ ...form, urlTemplate: e.target.value })}
            placeholder="https://example.com/api?search={{query}}"
          />
          <small className="form-helper">
            استخدم {"{{query}}"} كمتغير للبحث. سيتم استبداله تلقائياً بكلمة البحث.
          </small>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            style={{ width: "auto", margin: 0 }}
          />
          <span>تفعيل هذا المصدر في البحث</span>
        </label>

        <JsonEditor
          label="Mapping (تخصيص حقول البيانات)"
          value={mappingText}
          onChange={setMappingText}
          rows={8}
          exampleJson={exampleMapping}
        />

        <JsonEditor
          label="Headers (رؤوس HTTP)"
          value={headersText}
          onChange={setHeadersText}
          rows={4}
          exampleJson={exampleHeaders}
        />

        {error && <p className="form-error">{error}</p>}

        <button type="button" className="btn-primary" onClick={save}>
          {form.id ? "💾 حفظ التعديلات" : "➕ إضافة المصدر"}
        </button>
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف المصدر "${deleteConfirm?.name}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </Layout>
  );
}
