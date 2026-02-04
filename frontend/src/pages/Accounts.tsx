import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiFetch } from "../api";
import DataTable, { Column } from "../components/DataTable";
import TableToolbar from "../components/TableToolbar";
import Modal, { ConfirmModal } from "../components/Modal";

type Account = {
  id: number;
  name: string;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
};

type ExternalSource = {
  id: number;
  name: string;
  urlTemplate: string;
  enabled: boolean;
};

export default function Accounts() {
  const [activeTab, setActiveTab] = useState<"local" | "external">("local");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sources, setSources] = useState<ExternalSource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", mobile: "", address: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadAccounts() {
    const response = await apiFetch<{ data: Account[] }>("/accounts");
    setAccounts(response.data);
  }

  async function loadSources() {
    const response = await apiFetch<{ data: ExternalSource[] }>("/external-sources");
    setSources(response.data);
  }

  useEffect(() => {
    loadAccounts();
    loadSources();
  }, []);

  const filteredAccounts = accounts.filter((acc) =>
    acc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSources = sources.filter((src) =>
    src.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function openAddModal() {
    setEditingAccount(null);
    setForm({ name: "", phone: "", mobile: "", address: "" });
    setError("");
    setShowAddModal(true);
  }

  function openEditModal(account: Account) {
    setEditingAccount(account);
    setForm({
      name: account.name,
      phone: account.phone ?? "",
      mobile: account.mobile ?? "",
      address: account.address ?? "",
    });
    setError("");
    setShowAddModal(true);
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim()) {
      setError("اسم الشركة مطلوب");
      return;
    }

    const data = {
      name: form.name,
      phone: form.phone || null,
      mobile: form.mobile || null,
      address: form.address || null,
    };

    if (editingAccount) {
      await apiFetch(`/accounts/${editingAccount.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } else {
      await apiFetch("/accounts", {
        method: "POST",
        body: JSON.stringify(data),
      });
    }

    setShowAddModal(false);
    setEditingAccount(null);
    setForm({ name: "", phone: "", mobile: "", address: "" });
    await loadAccounts();
  }

  async function handleDelete(account: Account) {
    await apiFetch(`/accounts/${account.id}`, {
      method: "DELETE",
    });
    setDeleteConfirm(null);
    await loadAccounts();
  }

  const accountColumns: Column<Account>[] = [
    { key: "name", label: "الاسم" },
    {
      key: "phone",
      label: "الهاتف",
      render: (row) => row.phone ?? "-",
    },
    {
      key: "mobile",
      label: "الموبايل",
      render: (row) => row.mobile ?? "-",
    },
    {
      key: "address",
      label: "العنوان",
      render: (row) => row.address ?? "-",
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (row) => (
        <div className="table-actions">
          <button
            type="button"
            className="btn-sm secondary"
            onClick={() => openEditModal(row)}
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

  const sourceColumns: Column<ExternalSource>[] = [
    { key: "name", label: "الاسم" },
    {
      key: "urlTemplate",
      label: "رابط API",
      render: (row) => (
        <code style={{ fontSize: "var(--font-size-xs)", wordBreak: "break-all" }}>
          {row.urlTemplate}
        </code>
      ),
    },
    {
      key: "enabled",
      label: "الحالة",
      render: (row) => (
        <span className={`badge ${row.enabled ? "badge-success" : "badge-info"}`}>
          {row.enabled ? "مفعّل" : "موقوف"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (row) => (
        <button
          type="button"
          className="btn-sm secondary"
          onClick={() => navigate("/external-sources")}
        >
          ⚙️ تعديل
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">الشركات</h1>
        <p className="page-description">
          إدارة الشركات المحلية والمصادر الخارجية
        </p>
      </div>

      <div className="card">
        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeTab === "local" ? "active" : ""}`}
            onClick={() => setActiveTab("local")}
          >
            🏢 الشركات المحلية ({accounts.length})
          </button>
          <button
            type="button"
            className={`tab ${activeTab === "external" ? "active" : ""}`}
            onClick={() => setActiveTab("external")}
          >
            🔗 الشركات الخارجية ({sources.length})
          </button>
        </div>

        {activeTab === "local" && (
          <>
            <TableToolbar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="بحث في الشركات المحلية..."
              actions={
                <>
                  <button
                    type="button"
                    className="btn-sm secondary"
                    onClick={loadAccounts}
                  >
                    🔄 تحديث
                  </button>
                  <button
                    type="button"
                    className="btn-sm btn-primary"
                    onClick={openAddModal}
                  >
                    ➕ إضافة شركة
                  </button>
                </>
              }
            />
            <DataTable
              columns={accountColumns}
              data={filteredAccounts}
              keyExtractor={(row) => row.id.toString()}
              emptyMessage="لا توجد شركات محلية"
            />
          </>
        )}

        {activeTab === "external" && (
          <>
            <TableToolbar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="بحث في الشركات الخارجية..."
              actions={
                <button
                  type="button"
                  className="btn-sm secondary"
                  onClick={loadSources}
                >
                  🔄 تحديث
                </button>
              }
            />
            <DataTable
              columns={sourceColumns}
              data={filteredSources}
              keyExtractor={(row) => row.id.toString()}
              emptyMessage="لا توجد مصادر خارجية"
            />
          </>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingAccount ? "تعديل الشركة" : "إضافة شركة جديدة"}
        footer={
          <>
            <button type="button" className="btn-primary" onClick={handleSave}>
              {editingAccount ? "💾 حفظ التعديلات" : "➕ إضافة"}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setShowAddModal(false)}
            >
              إلغاء
            </button>
          </>
        }
      >
        <label>
          اسم الشركة *
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="أدخل اسم الشركة"
          />
        </label>
        <label>
          الهاتف
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="أدخل رقم الهاتف"
          />
        </label>
        <label>
          الموبايل
          <input
            type="text"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            placeholder="أدخل رقم الموبايل"
          />
        </label>
        <label>
          العنوان
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="أدخل العنوان"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف الشركة "${deleteConfirm?.name}"؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </Layout>
  );
}
