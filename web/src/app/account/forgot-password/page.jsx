import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
    } catch (err) {
      console.error("Password reset request error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F5F0",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            backgroundColor: "#FFFFFF",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "40px",
              backgroundColor: "#ECFDF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#2C2C2C",
              marginBottom: "12px",
            }}
          >
            Check Your Email
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "#6B6B6B",
              marginBottom: "32px",
              lineHeight: "1.6",
            }}
          >
            We've sent a password reset link to <strong>{email}</strong>. Click
            the link in the email to reset your password.
          </p>

          <a
            href="/account/signin"
            style={{
              display: "block",
              width: "100%",
              padding: "14px 20px",
              borderRadius: "16px",
              border: "none",
              backgroundColor: "#C9B891",
              fontSize: "16px",
              fontWeight: "700",
              color: "#2C2C2C",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#B8A782";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#C9B891";
            }}
          >
            Back to Sign In
          </a>

          <p
            style={{
              marginTop: "20px",
              fontSize: "13px",
              color: "#9B9B9B",
            }}
          >
            Didn't receive the email?{" "}
            <button
              onClick={() => setSuccess(false)}
              style={{
                background: "none",
                border: "none",
                color: "#C9B891",
                fontWeight: "600",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F5F0",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "40px",
            backgroundColor: "#FEF3E2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C9B891"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#2C2C2C",
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Forgot Password?
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#6B6B6B",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          No worries, we'll send you reset instructions
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2C2C2C",
                marginBottom: "8px",
              }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #E0E0E0",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#C9B891";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E0E0E0";
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FEE2E2",
                fontSize: "14px",
                color: "#DC2626",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: "16px",
              border: "none",
              backgroundColor: loading ? "#D4C5A9" : "#C9B891",
              fontSize: "16px",
              fontWeight: "700",
              color: "#2C2C2C",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#B8A782";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#C9B891";
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <a
          href="/account/signin"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "24px",
            fontSize: "14px",
            color: "#6B6B6B",
            fontWeight: "600",
            textDecoration: "none",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Sign In
        </a>
      </div>
    </div>
  );
}
