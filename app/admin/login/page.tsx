"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const MOCK_PASSWORD = "pdm-admin";
export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password !== MOCK_PASSWORD) { setError("Incorrect mock password."); return; }
    window.sessionStorage.setItem("pdm-admin-auth", "true");
    router.push("/admin");
  };
  return <main><div className="card stack" style={{ maxWidth: 520, margin: "40px auto" }}><h1 style={{ margin: 0 }}>Admin Login</h1><div className="warning">
  <strong>Temporary admin login:</strong> use password <code>pdm-admin</code>. This will be replaced when real authentication is added.
</div><form className="stack" onSubmit={submit}><div className="field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>{error && <div className="warning">{error}</div>}<button className="btn btn-primary">Login</button></form></div></main>;
}
