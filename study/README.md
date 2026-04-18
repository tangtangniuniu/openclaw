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

### 1.1 安装到全局 pnpm

如果你已经在当前仓库里完成了构建：

```bash
pnpm install
pnpm ui:build
pnpm build
```

那么可以把这个本地构建产物安装到全局 `pnpm`，常用有两种方式。

#### 方式 A：全局安装

适合你想把当前源码目录当成一个“本地已构建安装包”来安装，得到一个相对稳定的全局快照。

在仓库根目录执行：

```bash
pnpm add -g "$(pwd)"
```

或者直接指定目录：

```bash
pnpm add -g /path/to/openclaw
```

验证：

```bash
openclaw --help
openclaw --version
which openclaw
```

特点：

- 全局环境里得到的是当前目录的一次安装快照
- 之后你如果重新改了源码并重新 `pnpm build`，全局安装不会自动刷新
- 想更新全局版本时，再执行一次 `pnpm add -g "$(pwd)"` 即可

#### 方式 B：全局链接

适合你长期在本仓库开发，希望全局 `openclaw` 直接指向当前源码目录。

在仓库根目录执行：

```bash
pnpm link --global
```

验证：

```bash
openclaw --help
openclaw --version
which openclaw
```

特点：

- 全局命令直接链接到当前仓库
- 适合开发调试
- 你改完源码后，通常只需要重新 `pnpm build`，全局命令就会用到新的 `dist/`
- 如果当前仓库缺少 `dist/`，`openclaw.mjs` 会报缺少构建产物

#### 两种方式怎么选

- `pnpm add -g "$(pwd)"`：更像“安装一个本地构建包”，适合稳定使用
- `pnpm link --global`：更像“把当前仓库暴露成全局命令”，适合开发联调

如果你只是要验证本地构建能否作为全局 CLI 使用，优先推荐：

```bash
pnpm add -g "$(pwd)"
```

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

## 6. 配置详解

OpenClaw 的主配置文件通常在：

```bash
~/.openclaw/openclaw.json
```

如果你使用 profile、环境变量或自定义路径，实际路径可能会变化，但默认学习和本地部署时先按这个路径理解即可。

### 6.1 配置修改方式

常用三种方式：

#### 方式 A：交互式向导

```bash
openclaw onboard
openclaw configure
```

适合第一次初始化。

#### 方式 B：命令行按路径修改

```bash
openclaw config get agents.defaults.workspace
openclaw config set gateway.port 18789 --strict-json
openclaw config set gateway.mode local
openclaw config validate
```

适合精确修改单个键。

#### 方式 C：直接编辑 JSON5

适合你已经熟悉结构，需要一次性改多项配置。

### 6.2 最重要的配置块

#### `gateway`

控制 Gateway 的运行方式、端口、鉴权和 HTTP 接口。

最常用字段：

- `gateway.mode`
  - 本地学习/开发通常设为 `"local"`
- `gateway.port`
  - 默认常见端口是 `18789`
- `gateway.auth.mode`
  - 常见值：`"token"`、`"password"`、`"trusted-proxy"`、`"none"`
- `gateway.auth.token`
  - token 模式下的访问令牌
- `gateway.http.endpoints.chatCompletions.enabled`
  - 是否启用 `/v1/chat/completions`
- `gateway.http.endpoints.responses.enabled`
  - 是否启用 `/v1/responses`

示例：

```json5
{
  gateway: {
    mode: "local",
    port: 18789,
    auth: {
      mode: "token",
      token: "replace-me",
    },
    http: {
      endpoints: {
        chatCompletions: { enabled: true },
        responses: { enabled: true },
      },
    },
  },
}
```

#### `agents.defaults`

控制默认 agent 的工作目录、默认 skill、默认子智能体行为等。

最常用字段：

- `agents.defaults.workspace`
  - 默认工作目录
- `agents.defaults.skills`
  - 默认 skill 白名单
- `agents.defaults.subagents`
  - 子智能体深度、并发、超时等

#### `agents.list`

定义多个独立 agent。

每个 agent 常见字段：

- `id`
- `workspace`
- `agentDir`
- `skills`
- `identity`

示例：

```json5
{
  agents: {
    list: [
      { id: "main", workspace: "~/.openclaw/workspace" },
      { id: "work", workspace: "~/.openclaw/workspace-work", skills: ["research_kickoff"] },
      { id: "ops", workspace: "~/.openclaw/workspace-ops", skills: [] },
    ],
  },
}
```

#### `bindings`

把外部消息入口路由到指定 agent。

最常见用途：

- 某个 Telegram 账号走 `work`
- 某个 Discord 账号走 `ops`
- 某个用户或群组固定走一个 agent

#### `session`

控制会话隔离和生命周期。

重点字段：

- `session.dmScope`
  - `main`：默认，所有 DM 共享主会话
  - `per-peer`
  - `per-channel-peer`
  - `per-account-channel-peer`
- `session.reset.idleMinutes`
  - 空闲多久后重建新 session
- `session.maintenance`
  - 会话清理策略

如果是多人或多入口使用，推荐至少考虑：

```json5
{
  session: {
    dmScope: "per-channel-peer",
  },
}
```

#### `skills`

控制 skill 的启用、密钥、运行参数。

重点字段：

- `skills.entries.<name>.enabled`
- `skills.entries.<name>.env`
- `skills.entries.<name>.apiKey`
- `skills.load.extraDirs`

#### `models`

控制默认模型和提供商配置。

常见关注点：

- provider API key
- 默认主模型
- 每个 agent 的模型覆盖

### 6.3 推荐配置分层思路

可以按下面的思路理解：

1. `gateway`
   负责“服务怎么启动、怎么暴露、怎么鉴权”
2. `agents.defaults`
   负责“默认 agent 怎么工作”
3. `agents.list`
   负责“有哪些独立 agent”
4. `bindings`
   负责“外部入口怎么路由到 agent”
5. `session`
   负责“消息怎样归并成会话”
6. `skills`
   负责“agent 能看到和使用哪些 skill”
7. `models`
   负责“模型和认证”

### 6.4 一个比较完整的学习型配置

见：

- `examples/config-detailed.openclaw.json5`

这个文件适合用来理解：

- 本地 Gateway
- token 鉴权
- OpenAI 兼容接口
- 多 agent
- session 隔离
- 默认 skill 和子智能体

### 6.5 常用配置命令

```bash
openclaw config file
openclaw config get gateway.port
openclaw config get agents.defaults.workspace
openclaw config set gateway.mode local
openclaw config set gateway.port 18789 --strict-json
openclaw config set session.dmScope per-channel-peer
openclaw config validate
```

### 6.6 配置修改后要不要重启

通常可以按这个原则理解：

- 改了 `gateway.*`、HTTP endpoint、认证、插件、skill 装载、路由绑定等关键配置后，建议执行：

```bash
openclaw gateway restart
```

- 前台模式下，直接停止当前进程后重新启动

## 7. 连接 Gateway

### 7.1 OpenAI Chat Completions

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

### 7.2 OpenResponses API

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

### 7.3 Tools Invoke HTTP API

这个接口默认可用：

- `POST /tools/invoke`

调用示例：

- `examples/tools-invoke.sh`

### 7.4 WebSocket 协议

Gateway 是统一的 WebSocket 控制面，客户端连接后首先走 `connect` 握手。

最小示例见：

- `examples/ws-client.mjs`

运行方式：

```bash
OPENCLAW_WS_URL=ws://127.0.0.1:18789 \
OPENCLAW_GATEWAY_TOKEN=your-token \
node examples/ws-client.mjs
```

## 8. 常见实操组合

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

## 9. 重点文档镜像

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

## 10. 说明

你给出的线上文档地址是 `news-openclaw.smzdm.com/docs/zh-CN/...`。本次尝试直接抓取时遇到 WAF challenge，所以 `downloads/` 目录使用了仓库内对应源文档做离线镜像，并在索引里保留原始 URL 对照。
