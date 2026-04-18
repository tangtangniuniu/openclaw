# Downloaded Docs Index

这里保存的是重点文档的本地镜像。

说明：

- 目标在线站点：`https://news-openclaw.smzdm.com/docs/zh-CN/...`
- 本次直接抓取该站点时返回了 WAF challenge 页面，未拿到正文
- 因此这里采用仓库中的对应源文档作为离线镜像
- 这样可以离线阅读，也便于后续继续补充

## URL 对照表

| 在线地址                                                                    | 本地镜像                            | 仓库源文件                               |
| --------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| `https://news-openclaw.smzdm.com/docs/zh-CN/gateway/openai-http-api`        | `gateway-openai-http-api.md`        | `docs/gateway/openai-http-api.md`        |
| `https://news-openclaw.smzdm.com/docs/zh-CN/gateway/openresponses-http-api` | `gateway-openresponses-http-api.md` | `docs/gateway/openresponses-http-api.md` |
| `https://news-openclaw.smzdm.com/docs/zh-CN/gateway/protocol`               | `gateway-protocol.md`               | `docs/gateway/protocol.md`               |
| `https://news-openclaw.smzdm.com/docs/zh-CN/gateway/tools-invoke-http-api`  | `gateway-tools-invoke-http-api.md`  | `docs/gateway/tools-invoke-http-api.md`  |
| `https://news-openclaw.smzdm.com/docs/zh-CN/tools/agent-send`               | `tools-agent-send.md`               | `docs/tools/agent-send.md`               |
| `https://news-openclaw.smzdm.com/docs/zh-CN/concepts/multi-agent`           | `concepts-multi-agent.md`           | `docs/concepts/multi-agent.md`           |
| `https://news-openclaw.smzdm.com/docs/zh-CN/tools/subagents`                | `tools-subagents.md`                | `docs/tools/subagents.md`                |
| `https://news-openclaw.smzdm.com/docs/zh-CN/concepts/session`               | `concepts-session.md`               | `docs/concepts/session.md`               |
| `https://news-openclaw.smzdm.com/docs/zh-CN/tools/lobster`                  | `tools-lobster.md`                  | `docs/tools/lobster.md`                  |
| `https://news-openclaw.smzdm.com/docs/zh-CN/concepts/context`               | `concepts-context.md`               | `docs/concepts/context.md`               |

## 建议阅读顺序

1. `concepts-multi-agent.md`
2. `concepts-session.md`
3. `concepts-context.md`
4. `tools-agent-send.md`
5. `tools-subagents.md`
6. `gateway-openai-http-api.md`
7. `gateway-openresponses-http-api.md`
8. `gateway-tools-invoke-http-api.md`
9. `gateway-protocol.md`
10. `tools-lobster.md`
