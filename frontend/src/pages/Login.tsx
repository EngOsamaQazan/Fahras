import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

type LoginResponse = {
  token: string;
};

type UserContextResponse = {
  user: {
    id: number;
    name: string;
    username: string;
  };
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const response = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem("token", response.token);
      
      // Fetch user context after login
      try {
        const userContext = await apiFetch<UserContextResponse>("/auth/me");
        localStorage.setItem("user", JSON.stringify(userContext));
      } catch {
        // Continue even if user context fails
      }
      
      navigate("/");
    } catch (err) {
      setError("بيانات الدخول غير صحيحة");
    }
  }

  return (
    <main className="container" style={{ maxWidth: 460, marginTop: "10vh" }}>
      <article className="card">
        <h3>تسجيل الدخول</h3>
        <form onSubmit={handleSubmit}>
          <label>
            اسم المستخدم
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label>
            كلمة المرور
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <small style={{ color: "crimson" }}>{error}</small>}
          <button type="submit" style={{ marginTop: "1rem" }}>
            دخول
          </button>
        </form>
      </article>
    </main>
  );
}
