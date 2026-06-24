# Forge 7维AI段位测评

新页面地址：

```text
https://forgeeason.github.io/forgeai/ai-level-7d/
```

后台地址：

```text
https://forgeeason.github.io/forgeai/ai-level-7d/admin.html
```

## 文件说明

- `index.html`：学员测评页，7维度18题。
- `admin.html`：对应后台看板。
- `config.js`：Supabase 与管理员邮箱配置。
- `supabase_schema.sql`：数据库表和权限策略。

## 开启真实后台

1. 新建 Supabase 项目。
2. 在 Supabase SQL Editor 执行 `supabase_schema.sql`。
3. 把 `supabase_schema.sql` 中的 `your-email@example.com` 替换成你的管理员邮箱。
4. 修改 `config.js`：

```js
SUPABASE_URL: "你的 Supabase URL",
SUPABASE_ANON_KEY: "你的 Supabase anon public key",
ADMIN_EMAILS: ["你的管理员邮箱"]
```

配置后，学员测评提交会写入 `ai_level_7d_submissions`，后台只展示这个页面的数据。
