import { useState } from "react";
import useAuth from "@/utils/useAuth";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { signUpWithCredentials, signIn } = useAuth();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        name: name || undefined,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-up. Please try again or use a different method.",
        OAuthCallback: "Sign-up failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-up option. Try another one.",
        EmailCreateAccount:
          "This email can't be used. It may already be registered.",
        Callback: "Something went wrong during sign-up. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Invalid email or password. If you already have an account, try signing in instead.",
        AccessDenied: "You don't have permission to sign up.",
        Configuration:
          "Sign-up isn't working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signIn("google");
    } catch (err) {
      setError("Google sign up failed. Please try again.");
    }
  };

  const handleAppleSignUp = async () => {
    try {
      await signIn("apple");
    } catch (err) {
      setError("Apple sign up failed. Please try again.");
    }
  };

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
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#2C2C2C",
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Join the Journey
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#6B6B6B",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          Create your account and start your wellness practice
        </p>

        {/* OAuth Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={handleGoogleSignUp}
            type="button"
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: "16px",
              border: "1px solid #E0E0E0",
              backgroundColor: "#FFFFFF",
              fontSize: "15px",
              fontWeight: "600",
              color: "#2C2C2C",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F9F9F9";
              e.currentTarget.style.borderColor = "#C9B891";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
              e.currentTarget.style.borderColor = "#E0E0E0";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path
                d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
                fill="#4285F4"
              />
              <path
                d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
                fill="#34A853"
              />
              <path
                d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
                fill="#FBBC05"
              />
              <path
                d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleAppleSignUp}
            type="button"
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: "16px",
              border: "1px solid #E0E0E0",
              backgroundColor: "#000000",
              fontSize: "15px",
              fontWeight: "600",
              color: "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1a1a1a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#000000";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15.5 8.5c-.1 2.8 2.5 3.7 2.5 3.8-.1.2-.4 1.3-1.3 2.5-.8 1.1-1.6 2.1-2.9 2.1s-1.5-.8-2.9-.8-1.7.8-2.8.8c-1.2.1-2.2-1.1-3-2.2-1.6-2.3-2.8-6.4-1.2-9.2.8-1.4 2.2-2.3 3.7-2.3 1.2 0 2.4.8 3.2.8.7 0 2-.9 3.5-.8.6 0 2.2.2 3.3 1.9-.1.1-2 1.2-1.9 3.5zm-2.3-6.8c.7-.8 1.1-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.3z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        <div
          style={{
            position: "relative",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: "1px",
              backgroundColor: "#E0E0E0",
            }}
          />
          <span
            style={{
              position: "relative",
              backgroundColor: "#FFFFFF",
              padding: "0 16px",
              fontSize: "13px",
              color: "#9B9B9B",
            }}
          >
            Or sign up with email
          </span>
        </div>

        <form
          onSubmit={handleEmailSignUp}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label
              htmlFor="name"
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2C2C2C",
                marginBottom: "8px",
              }}
            >
              Name (optional)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
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
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "14px",
            color: "#6B6B6B",
          }}
        >
          Already have an account?{" "}
          <a
            href={`/account/signin${
              typeof window !== "undefined" ? window.location.search : ""
            }`}
            style={{
              color: "#C9B891",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
