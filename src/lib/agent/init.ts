let initialized = false;

export async function initAgentServer() {
  if (initialized) return;
  if (typeof window !== "undefined") return; // Don't run on client
  if (process.env.NEXT_RUNTIME === "edge") return; // Don't run on edge runtime

  try {
    const { initWebSocketServer } = await import("./server");
    initWebSocketServer();
    initialized = true;
    console.log("Agent WebSocket server initialized");
  } catch (e) {
    console.error("Failed to initialize agent WebSocket server:", e);
  }
}

// Initialize immediately when this module is loaded on server startup
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  // Delay initialization slightly to avoid issues during build
  setTimeout(() => {
    initAgentServer();
  }, 1000);
}
