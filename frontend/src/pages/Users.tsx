import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch } from "../api";
import DataTable, { Column } from "../components/DataTable";
import TableToolbar from "../components/TableToolbar";

type User = {
  id: number;
  name: string;
  username: string;
  active: boolean;
  role: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await apiFetch<{ data: User[] }>("/users");
      setUsers(response.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "الاسم الكامل",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            @{row.username}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "الصلاحيات",
      render: (row) => (
        <span className="badge badge-primary">
          {row.role === "Administrator" ? "👑 مسؤول" : "👤 مستخدم"}
        </span>
      ),
    },
    {
      key: "active",
      label: "الحالة",
      render: (row) => (
        <span className={`badge ${row.active ? "badge-success" : "badge-danger"}`}>
          {row.active ? "✓ فعال" : "✗ موقوف"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: () => (
        <div className="table-actions">
          <button type="button" className="btn-sm secondary" disabled>
            ✏️ تعديل
          </button>
        </div>
      ),
    },
  ];

  const uniqueRoles = Array.from(new Set(users.map((u) => u.role)));

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">المستخدمون</h1>
        <p className="page-description">
          إدارة حسابات المستخدمين وصلاحياتهم
        </p>
      </div>

      <div className="card">
        <TableToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="بحث في المستخدمين..."
          actions={
            <>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ width: "auto", padding: "var(--spacing-xs) var(--spacing-sm)" }}
              >
                <option value="all">جميع الصلاحيات</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role === "Administrator" ? "مسؤول" : role}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-sm secondary" onClick={load}>
                🔄 تحديث
              </button>
            </>
          }
        />

        <DataTable
          columns={columns}
          data={filteredUsers}
          keyExtractor={(row) => row.id.toString()}
          emptyMessage="لا يوجد مستخدمون"
          loading={loading}
        />
      </div>
    </Layout>
  );
}
