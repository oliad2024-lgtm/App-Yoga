import { useState, useEffect } from "react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get("token");
      if (tokenParam) {
        setToken(tokenParam);
      } else {
        setError("Invalid reset link. Please request a new password reset.");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);
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
            Password Reset!
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "#6B6B6B",
              marginBottom: "32px",
              lineHeight: "1.6",
            }}
          >
            Your password has been successfully reset. You can now sign in with
            your new password.
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
            Continue to Sign In
          </a>
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
          Set New Password
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#6B6B6B",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          Create a strong password for your account
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2C2C2C",
                marginBottom: "8px",
              }}
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
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

          <div>
            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2C2C2C",
                marginBottom: "8px",
              }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
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
            disabled={loading || !token}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: "16px",
              border: "none",
              backgroundColor: loading || !token ? "#D4C5A9" : "#C9B891",
              fontSize: "16px",
              fontWeight: "700",
              color: "#2C2C2C",
              cursor: loading || !token ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading && token)
                e.currentTarget.style.backgroundColor = "#B8A782";
            }}
            onMouseLeave={(e) => {
              if (!loading && token)
                e.currentTarget.style.backgroundColor = "#C9B891";
            }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
