import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useIsMobile } from "../hooks/useIsMobile";

export default function Layout({ children }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0b1929" }}>
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: "rgba(0,0,0,0.55)",
          }}
        />
      )}

      <Sidebar
        isOpen={!isMobile || sidebarOpen}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : "260px",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Topbar
          onMenuToggle={() => setSidebarOpen(o => !o)}
          isMobile={isMobile}
        />
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
