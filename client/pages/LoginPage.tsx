/// <reference types="vite/client" />
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    /* global google */
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogle
    });

    // @ts-ignore
    google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      { theme: "outline", size: "large" }
    );
  }, []);

  async function handleGoogle(response: any) {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential })
    });

    const data = await res.json();

    if (!res.ok) return alert(data.error);

    navigate("/portal", { state: { email: data.email } });
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Login with your RIT Google Account</h1>
      <div id="googleBtn"></div>
    </div>
  );
}
