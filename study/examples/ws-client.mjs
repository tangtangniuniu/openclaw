const url = process.env.OPENCLAW_WS_URL ?? "ws://127.0.0.1:18789";
const token = process.env.OPENCLAW_GATEWAY_TOKEN ?? "replace-me";

const ws = new WebSocket(url);
let connected = false;
let pendingStatusRequest = false;

function sendConnect() {
  if (connected) {
    return;
  }
  connected = true;
  ws.send(
    JSON.stringify({
      type: "req",
      id: "connect-1",
      method: "connect",
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: "study-ws-client",
          version: "0.1.0",
          platform: process.platform,
          mode: "operator",
        },
        role: "operator",
        scopes: ["operator.read"],
        caps: [],
        commands: [],
        permissions: {},
        auth: { token },
        locale: "zh-CN",
        userAgent: "study-ws-client/0.1.0",
      },
    }),
  );
}

ws.addEventListener("open", () => {
  // Some deployments send a pre-connect challenge event first.
  pendingStatusRequest = true;
});

ws.addEventListener("message", (event) => {
  const payload = JSON.parse(event.data);
  console.log("<<", JSON.stringify(payload, null, 2));

  if (payload.type === "event" && payload.event === "connect.challenge") {
    sendConnect();
    return;
  }

  if (!connected && pendingStatusRequest) {
    sendConnect();
    pendingStatusRequest = false;
    return;
  }

  if (payload.type === "res" && payload.id === "connect-1" && payload.ok) {
    ws.send(
      JSON.stringify({
        type: "req",
        id: "status-1",
        method: "status",
        params: {},
      }),
    );
    return;
  }

  if (payload.type === "res" && payload.id === "status-1") {
    ws.close(0, "done");
  }
});

ws.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
});

ws.addEventListener("close", (event) => {
  console.log(`closed: code=${event.code} reason=${event.reason}`);
});
