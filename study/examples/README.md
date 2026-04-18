# Examples

本目录包含可直接改造的示例：

- `multi-agent.openclaw.json5`：多 agent 配置草稿
- `config-detailed.openclaw.json5`：较完整的学习型配置样例
- `custom-skill/SKILL.md`：最小自定义 skill
- `gateway-openai-chat.sh`：`/v1/chat/completions` 调用
- `gateway-responses.sh`：`/v1/responses` 调用
- `tools-invoke.sh`：`/tools/invoke` 调用
- `ws-client.mjs`：最小 WebSocket operator 客户端

## 使用前要改的环境变量

```bash
export OPENCLAW_GATEWAY_TOKEN="your-token"
export OPENCLAW_BASE_URL="http://127.0.0.1:18789"
export OPENCLAW_WS_URL="ws://127.0.0.1:18789"
```

如果你使用密码模式，把 `Authorization: Bearer ...` 中的 token 换成密码即可。
