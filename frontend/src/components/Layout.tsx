import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

interface UserContext {
  user: {
    name: string;
    username: string;
  };
}

export default function Layout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userContext, setUserContext] = useState<UserContext | null>(null);

  useEffect(() => {
    // Get user context from localStorage or API
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserContext(JSON.parse(storedUser));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const navLinks = [
    { to: "/", label: "لوحة البحث", icon: "🔍" },
    { to: "/clients", label: "العملاء", icon: "👥" },
    { to: "/accounts", label: "الشركات", icon: "🏢" },
    { to: "/external-sources", label: "مصادر خارجية", icon: "🔗" },
    { to: "/import", label: "استيراد", icon: "📥" },
    { to: "/users", label: "المستخدمون", icon: "👤" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">
            <span>📚</span>
            <span>الفهرس</span>
          </h1>
        </div>
        
        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link ${location.pathname === link.to ? "active" : ""}`}
            >
              <span className="sidebar-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {userContext?.user && (
            <div className="sidebar-user">
              <p className="sidebar-user-name">{userContext.user.name}</p>
              <p className="sidebar-user-role">@{userContext.user.username}</p>
            </div>
          )}
          <button
            type="button"
            className="btn-logout secondary"
            onClick={handleLogout}
          >
            تسجيل الخروج ←
          </button>
        </div>
      </aside>
      
      <main className="main-content">{children}</main>
    </div>
  );
}
