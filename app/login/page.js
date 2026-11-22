
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, getToken } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <p>Checking authentication...</p>;
  }

  return (
    <main className="container p-4">
      <h1>Workboard Login</h1>
      <p>Welcome back! Please sign in.</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="form-control"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-control"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p className="text-danger">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
