"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  // Log unexpected errors to the browser console for debugging.
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="error-page">
      <div className="error-panel">
        <h1>Something went wrong</h1>

        <p>
          An unexpected error occurred while loading this page. Please try
          again.
        </p>

        <button
          type="button"
          className="ui-button ui-button-primary"
          onClick={() => reset()}
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
