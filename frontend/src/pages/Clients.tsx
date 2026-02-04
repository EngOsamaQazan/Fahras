import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiDelete, apiFetch, apiUpload } from "../api";

type Client = {
  id: number;
  name: string;
  accountId: number;
  account?: { id: number; name: string } | null;
  nationalId?: string | null;
  phone?: string | null;
  contracts?: string | null;
  sellDate?: string | null;
  work?: string | null;
  homeAddress?: string | null;
  workAddress?: string | null;
  status?: string | null;
  courtStatus?: string | null;
  _count?: { attachments?: number };
  attachmentsCount?: number;
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function load() {
    const response = await apiFetch<{ data: Client[] }>(`/clients?q=${encodeURIComponent(query)}`);
    setClients(response.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function loadAttachments(clientId: number) {
    const response = await apiFetch<{ data: any[] }>(`/attachments/clients/${clientId}`);
    setAttachments(response.data);
  }

  async function handleUpload() {
    if (!selected || !file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await apiUpload(`/attachments/clients/${selected.id}`, form);
      setFile(null);
      await loadAttachments(selected.id);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(attachmentId: number) {
    await apiDelete(`/attachments/${attachmentId}`);
    if (selected) {
      await loadAttachments(selected.id);
    }
  }

  return (
    <Layout>
      <section className="card">
        <div className="flex">
          <h3>العملاء</h3>
          <input
            placeholder="بحث سريع"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" onClick={load}>تحديث</button>
        </div>
        <div className="table-scroll" style={{ marginTop: "1rem" }}>
          <table>
            <thead>
              <tr>
                <th>الشركة</th>
                <th>العقود</th>
                <th>تاريخ البيع</th>
                <th>الاسم</th>
                <th>الرقم الوطني</th>
                <th>الوظيفة</th>
                <th>عنوان السكن</th>
                <th>عنوان العمل</th>
                <th>الهاتف</th>
                <th>الحالة</th>
                <th>حالة الشكوى</th>
                <th>المرفقات</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.account?.name ?? "-"}</td>
                  <td>{client.contracts ?? "-"}</td>
                  <td>{client.sellDate ?? "-"}</td>
                  <td>{client.name}</td>
                  <td>{client.nationalId ?? "-"}</td>
                  <td>{client.work ?? "-"}</td>
                  <td>{client.homeAddress ?? "-"}</td>
                  <td>{client.workAddress ?? "-"}</td>
                  <td>{client.phone ?? "-"}</td>
                  <td>{client.status ?? "-"}</td>
                  <td>{client.courtStatus ?? "-"}</td>
                  <td>
                    <button
                      type="button"
                      onClick={async () => {
                        setSelected(client);
                        await loadAttachments(client.id);
                      }}
                    >
                      عرض {client._count?.attachments ?? client.attachmentsCount ?? 0}
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={12}>لا يوجد بيانات.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <dialog open>
          <article>
            <header className="flex">
              <strong>مرفقات: {selected.name}</strong>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setSelected(null);
                  setAttachments([]);
                }}
              >
                إغلاق
              </button>
            </header>

            <div className="flex" style={{ marginBottom: "1rem" }}>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button type="button" onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? "جاري الرفع..." : "رفع"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "1rem"
              }}
            >
              {attachments.map((item) => (
                <div key={item.id} className="card" style={{ padding: "0.75rem" }}>
                  {item.url ? (
                    <img
                      src={item.url}
                      alt="attachment"
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  ) : (
                    <div style={{ textAlign: "center" }}>لا يوجد رابط</div>
                  )}
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => handleDelete(item.id)}
                    style={{ marginTop: "0.5rem" }}
                  >
                    حذف
                  </button>
                </div>
              ))}
              {attachments.length === 0 && <p>لا يوجد مرفقات.</p>}
            </div>
          </article>
        </dialog>
      )}
    </Layout>
  );
}
