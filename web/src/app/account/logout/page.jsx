import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
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
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "40px",
            backgroundColor: "#FEF2F2",
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
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
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
          Sign Out
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#6B6B6B",
            marginBottom: "32px",
          }}
        >
          Are you sure you want to sign out of your account?
        </p>

        <button
          onClick={handleSignOut}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: "16px",
            border: "none",
            backgroundColor: "#DC2626",
            fontSize: "16px",
            fontWeight: "700",
            color: "#FFFFFF",
            cursor: "pointer",
            marginBottom: "12px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#B91C1C";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#DC2626";
          }}
        >
          Yes, Sign Out
        </button>

        <a
          href="/"
          style={{
            display: "block",
            width: "100%",
            padding: "14px 20px",
            borderRadius: "16px",
            border: "1px solid #E0E0E0",
            backgroundColor: "#FFFFFF",
            fontSize: "16px",
            fontWeight: "600",
            color: "#2C2C2C",
            cursor: "pointer",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F9F9F9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
          }}
        >
          Cancel
        </a>
      </div>
    </div>
  );
}
