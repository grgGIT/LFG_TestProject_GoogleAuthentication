import { useLocation } from "react-router-dom";
import { useState } from "react";

export default function PortalPage() {
  const location = useLocation();
  const email = (location.state as any)?.email;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/create-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleEmail: email, username, password })
    });

    const data = await res.json();

    if (!res.ok) return alert(data.error);

    alert("Account created successfully!");
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Welcome, {email}</h2>
      <p>Create your app login:</p>

      <form onSubmit={createAccount}>
        <input
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button>Create Account</button>
      </form>
    </div>
  );
}
