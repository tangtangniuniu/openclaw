# OpenClaw Study

这个目录是面向源码学习和本地实操的离线资料包，覆盖：

- 从源码编译 OpenClaw
- 前台运行、后台启动、停止、重启 Gateway
- 创建和使用独立 agent
- 给独立 agent 配置独立 skill
- 连接 OpenClaw Gateway 的 HTTP / WebSocket 接口
- 可直接改造的代码示例
- 重点文档的本地镜像副本

## 目录结构

- `downloads/`：重点文档本地镜像
- `examples/`：命令、配置、HTTP、WebSocket、skill 示例

## 1. 从源码编译

建议环境：

- Node 22.16+，仓库 README 推荐 Node 24
- 包管理器优先用 `pnpm`

在仓库根目录执行：

```bash
pnpm install
pnpm ui:build
pnpm build
```

说明：

- `pnpm install`：安装根依赖
- `pnpm ui:build`：构建控制台 UI
- `pnpm build`：生成 `dist/`

开发态常用命令：

```bash
pnpm openclaw onboard --install-daemon
pnpm gateway:watch
```

说明：

- `pnpm openclaw ...`：直接跑 TypeScript CLI
- `pnpm gateway:watch`：源码或配置变化时自动重启 Gateway，适合开发

## 2. 运行方式

### 前台运行

适合调试和观察日志：

```bash
openclaw gateway
openclaw gateway run
openclaw gateway --port 18789 --verbose
openclaw gateway --force
```

说明：

- `openclaw gateway` 和 `openclaw gateway run` 都是前台进程
- `--verbose` 适合排查模型路由、认证、RPC、频道登录问题
- `--force` 会先清理目标端口已有监听，再启动

### 后台服务运行

适合日常常驻：

```bash
openclaw gateway install
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
openclaw gateway status
```

重点区别：

- `openclaw gateway restart`：重启后台服务
- `openclaw gateway`：只在当前终端前台运行一次

### 健康检查

```bash
openclaw gateway status
openclaw status
openclaw channels status --probe
openclaw logs --follow
```

## 3. 推荐启动闭环

第一次从源码跑起来，建议顺序：

```bash
pnpm install
pnpm ui:build
pnpm build
pnpm openclaw onboard --install-daemon
openclaw gateway status
openclaw agent --message "hello"
```

如果只想临时前台调试：

```bash
pnpm install
pnpm ui:build
pnpm build
openclaw gateway --allow-unconfigured --verbose
```

## 4. 创建独立 agent

最简单的方式是直接走 CLI：

```bash
openclaw agents add work --workspace ~/.openclaw/workspace-work
openclaw agents add ops --workspace ~/.openclaw/workspace-ops
openclaw agents list --bindings
```

创建后，每个 agent 都有自己独立的：

- workspace
- `AGENTS.md` / `SOUL.md` / `USER.md`
- `agentDir`
- session 存储
- 模型认证状态

调用指定 agent：

```bash
openclaw agent --agent work --message "总结今天的 issue"
openclaw agent --agent ops --message "检查 gateway 状态"
```

如果要把某个频道入口绑定到指定 agent：

```bash
openclaw agents bind --agent work --bind telegram:ops
openclaw agents bind --agent ops --bind discord:default
openclaw agents list --bindings
```

完整配置例子见：

- `examples/multi-agent.openclaw.json5`

## 5. 给独立 agent 配置独立 skill

每个 agent 的 workspace 都可以有自己的 `skills/` 目录，优先级最高。

例如给 `work` agent 的 workspace 放一个 skill：

```bash
mkdir -p ~/.openclaw/workspace-work/skills/hello-work
```

然后写入 `SKILL.md`。示例见：

- `examples/custom-skill/SKILL.md`

加载 skill 的常见方式：

```bash
/new
openclaw gateway restart
openclaw skills list
openclaw skills check
```

验证 skill：

```bash
openclaw agent --agent work --message "帮我输出研究启动清单"
```

如果你要限制不同 agent 可见的 skill 集合，可在配置里用：

- `agents.defaults.skills`
- `agents.list[].skills`

示例也已经放到：

- `examples/multi-agent.openclaw.json5`

## 6. 连接 Gateway

### 6.1 OpenAI Chat Completions

先在配置里启用：

```json5
{
  gateway: {
    mode: "local",
    http: {
      endpoints: {
        chatCompletions: { enabled: true },
      },
    },
  },
}
```

调用示例：

- `examples/gateway-openai-chat.sh`

接口路径：

- `POST /v1/chat/completions`
- `GET /v1/models`
- `GET /v1/models/{id}`

### 6.2 OpenResponses API

先启用：

```json5
{
  gateway: {
    mode: "local",
    http: {
      endpoints: {
        responses: { enabled: true },
      },
    },
  },
}
```

调用示例：

- `examples/gateway-responses.sh`

接口路径：

- `POST /v1/responses`

### 6.3 Tools Invoke HTTP API

这个接口默认可用：

- `POST /tools/invoke`

调用示例：

- `examples/tools-invoke.sh`

### 6.4 WebSocket 协议

Gateway 是统一的 WebSocket 控制面，客户端连接后首先走 `connect` 握手。

最小示例见：

- `examples/ws-client.mjs`

运行方式：

```bash
OPENCLAW_WS_URL=ws://127.0.0.1:18789 \
OPENCLAW_GATEWAY_TOKEN=your-token \
node examples/ws-client.mjs
```

## 7. 常见实操组合

### 从源码到可调用 HTTP API

```bash
pnpm install
pnpm ui:build
pnpm build
pnpm openclaw onboard --install-daemon
openclaw gateway restart
bash study/examples/gateway-openai-chat.sh
```

### 新增一个独立研究 agent

```bash
openclaw agents add research --workspace ~/.openclaw/workspace-research
openclaw agent --agent research --message "建立一个调研模板"
```

### 给研究 agent 增加独立 skill

```bash
mkdir -p ~/.openclaw/workspace-research/skills/research-kickoff
cp study/examples/custom-skill/SKILL.md ~/.openclaw/workspace-research/skills/research-kickoff/SKILL.md
openclaw gateway restart
openclaw agent --agent research --message "开始一个新的研究任务"
```

## 8. 重点文档镜像

见：

- `downloads/README.md`

其中已包含以下主题的本地镜像：

- OpenAI HTTP API
- OpenResponses HTTP API
- Gateway protocol WebSocket 接口
- Tools Invoke HTTP API
- agent send
- 多智能体路由
- subagents
- session
- lobster
- context

## 9. 说明

你给出的线上文档地址是 `news-openclaw.smzdm.com/docs/zh-CN/...`。本次尝试直接抓取时遇到 WAF challenge，所以 `downloads/` 目录使用了仓库内对应源文档做离线镜像，并在索引里保留原始 URL 对照。
