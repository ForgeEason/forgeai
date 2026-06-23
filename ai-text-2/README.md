# AI LEVEL｜Forge 锻造AI训战营

一个面向培训现场的 AI 能力段位测评工具。学员扫码填写身份信息，完成 15 个真实工作情境题，获得 AI 能力层级、身份称谓、动态徽章、五维能力地图和升级建议。

## 已包含能力

- Forge 锻造AI训战营抬头与品牌露出。
- 15 题、5 个维度：任务定义、指令协作、实战工作流、判断核验、安全责任。
- 每位学员进入测评时，选项顺序随机打散，避免“全选某个字母”。
- 轻量脱口秀式表达，但评分仍按行为成熟度计分。
- 学员登录信息：姓名/昵称、联系方式、公司/团队、岗位。
- 管理后台入口：`?admin=1`。
- 支持 Supabase 后台：实时提交、完整答题明细、段位分布、五维平均分。
- 未配置后台时自动退回本地体验模式。

## 本地预览

在本目录启动静态服务后访问首页即可。

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

学员端：

```text
http://127.0.0.1:4173/
```

后台端：

```text
http://127.0.0.1:4173/?admin=1
```

## 配置真实后台

1. 新建 Supabase 项目。
2. 在 SQL Editor 中执行 `supabase_schema.sql`。
3. 到 Authentication → Providers 开启 Email 登录。
4. 到 Database → Replication 开启 `ai_level_submissions` 的实时订阅。
5. 修改 `config.js`：

```js
window.FORGE_AI_CONFIG = {
  enableBackend: true,
  supabaseUrl: "你的 Supabase URL",
  supabaseAnonKey: "你的 Supabase anon public key",
  adminEmails: ["你的管理员邮箱"],
  requireParticipantProfile: true,
  organizationName: "Forge 锻造AI训战营"
};
```

注意：Supabase anon key 可以放在前端，真正的权限由 `supabase_schema.sql` 里的 RLS 策略控制。不要把 service role key 放进前端。

## GitHub Pages

把本目录所有文件推到 GitHub 仓库根目录，然后在仓库 Settings → Pages 中选择：

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/root`

公开地址通常是：

```text
https://ForgeEason.github.io/forgeai/
```

最终二维码应指向这个公开地址。
