import { useState } from "react";
import Layout from "../components/Layout";
import { apiFetch } from "../api";
import DataTable, { Column } from "../components/DataTable";

type Client = {
  id?: number | string;
  accountId?: number;
  account?: { id: number; name: string } | null;
  name?: string;
  nationalId?: string | null;
  national_id?: string | null;
  phone?: string | null;
  contracts?: string | null;
  sellDate?: string | null;
  sell_date?: string | null;
  work?: string | null;
  homeAddress?: string | null;
  home_address?: string | null;
  workAddress?: string | null;
  work_address?: string | null;
  status?: string | null;
  courtStatus?: string | null;
  court_status?: string | null;
  _count?: { attachments?: number };
  account_name?: string;
  sourceLabel?: string;
};

type RemoteResult = {
  label: string;
  data?: Client[];
  error?: string;
};

type SearchResponse = {
  data: Client[];
  remote: RemoteResult[];
  errors: RemoteResult[];
};

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);

  async function runSearch() {
    setLoading(true);
    try {
      const data = await apiFetch<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  function renderContractCell(value?: string | number | null, fallbackId?: number | string) {
    const rawValue = value ?? (fallbackId ? String(fallbackId) : "");
    const raw = String(rawValue);
    const parts = raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (parts.length === 0) return "-";
    return (
      <>
        {parts.map((part, index) => (
          <div key={`${part}-${index}`}>
            {part}
            {index < parts.length - 1 && <hr />}
          </div>
        ))}
      </>
    );
  }

  const combinedResults = result
    ? [
        ...result.data,
        ...result.remote.flatMap((remote) =>
          (remote.data ?? []).map((item) => ({
            ...item,
            sourceLabel: remote.label
          }))
        )
      ]
    : [];

  const columns: Column<Client>[] = [
    {
      key: "account",
      label: "الشركة",
      render: (client) =>
        client.account?.name ??
        client.account_name ??
        (client as any).account ??
        client.sourceLabel ??
        "-",
    },
    {
      key: "contracts",
      label: "العقود",
      render: (client) => renderContractCell(client.contracts ?? null, client.id),
    },
    {
      key: "sellDate",
      label: "تاريخ البيع",
      render: (client) => client.sellDate ?? client.sell_date ?? "-",
    },
    { key: "name", label: "الاسم" },
    {
      key: "nationalId",
      label: "الرقم الوطني",
      render: (client) => client.nationalId ?? client.national_id ?? "-",
    },
    { key: "work", label: "الوظيفة" },
    {
      key: "homeAddress",
      label: "عنوان السكن",
      render: (client) => client.homeAddress ?? client.home_address ?? "-",
    },
    {
      key: "workAddress",
      label: "عنوان العمل",
      render: (client) => client.workAddress ?? client.work_address ?? "-",
    },
    { key: "phone", label: "الهاتف" },
    { key: "status", label: "حالة العقد" },
    {
      key: "courtStatus",
      label: "حالة الشكوى",
      render: (client) => client.courtStatus ?? client.court_status ?? "-",
    },
    {
      key: "attachments",
      label: "المرفقات",
      render: (client) => client._count?.attachments ?? "-",
    },
  ];

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">البحث الموحد</h1>
        <p className="page-description">
          ابحث في جميع قواعد البيانات المحلية والخارجية
        </p>
      </div>

      <div className="card">
        <div className="flex" style={{ gap: "var(--spacing-sm)" }}>
          <input
            type="search"
            placeholder="ابحث بالاسم، الرقم الوطني أو الهاتف..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query && !loading) {
                runSearch();
              }
            }}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={runSearch}
            disabled={!query || loading}
          >
            {loading ? "⏳ جاري البحث..." : "🔍 بحث"}
          </button>
        </div>
      </div>

      {result && (
        <div className="card mt-md">
          <div className="card-header">
            <h3 className="card-title">
              نتائج البحث ({combinedResults.length})
            </h3>
          </div>
          <DataTable
            columns={columns}
            data={combinedResults}
            keyExtractor={(row, index) => row.id?.toString() ?? `row-${index}`}
            emptyMessage="لا توجد نتائج للبحث"
          />
        </div>
      )}

      {result && result.errors.length > 0 && (
        <div className="card mt-md" style={{ borderRight: "4px solid var(--color-warning)" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            ⚠️ تنبيهات
          </h4>
          {result.errors.map((err, index) => (
            <p key={`${err.label}-${index}`} className="text-sm text-muted">
              <strong>{err.label}:</strong> {err.error}
            </p>
          ))}
        </div>
      )}
    </Layout>
  );
}
