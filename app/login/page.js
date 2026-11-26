"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, getToken } from "../../lib/auth";

export default function LoginPage() {
  // useRouter allows the component to navigate between pages programmatically.
  const router = useRouter();

  // Store the values entered into the login form.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Store an error message if authentication fails.
  const [error, setError] = useState("");

  // Track whether the login request is currently processing.
  const [loading, setLoading] = useState(false);

  // Track whether the initial authentication check is still running.
  const [checking, setChecking] = useState(true);

  // Check whether the user already has an authentication token.
  // This runs when the login page first mounts.
  useEffect(() => {
    if (getToken()) {
      // If a token exists, redirect the user to the dashboard.
      // replace() prevents the login page from remaining in browser history.
      router.replace("/dashboard");
    } else {
      // No token was found, so allow the login form to be displayed.
      setChecking(false);
    }
  }, [router]);

  // Handle submission of the login form.
  async function handleSubmit(event) {
    // Prevent the browser from performing its default form submission,
    // which would cause a page reload.
    event.preventDefault();

    // Clear any previous errors and indicate that login is processing.
    setError("");
    setLoading(true);

    try {
      // Call the login function from lib/auth.js.
      // It handles the authentication request and token storage.
      await login(email, password);

      // Once login succeeds, navigate the user to the dashboard.
      router.push("/dashboard");
    } catch (error) {
      // If login fails, display the error message returned by the API.
      // Use a fallback message if the API does not provide one.
      setError(
        error.response?.data?.message || "Unable to log in. Please try again.",
      );
    } finally {
      // Runs regardless of whether login succeeds or fails.
      // Re-enable the form after the request finishes.
      setLoading(false);
    }
  }

  // Prevent the login form from appearing before the initial
  // authentication check has finished.
  if (checking) {
    return <p>Checking authentication...</p>;
  }

  // Render the login form once the authentication check is complete.
  return (
    <main className="container p-4">
      <h1>Workboard Login</h1>
      <p>Welcome back! Please sign in.</p>

      {/* Submit the form using the handleSubmit function. */}
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
            // Update the email state whenever the user types.
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
            // Update the password state whenever the user types.
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {/* Only display the error paragraph when an error exists. */}
        {error && <p className="text-danger">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary"
          // Prevent additional submissions while login is processing.
          disabled={loading}
        >
          {/* Change the button label to provide feedback during login. */}
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
