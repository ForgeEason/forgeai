window.FORGE_AI_LEVEL_7D_CONFIG = {
  BRAND: "Forge 锻造 AI 训战营",
  REQUIRE_NAME: true,

  // 填入 Supabase 项目 Settings → API 里的 URL 和 anon public key 后，即可跨设备收集数据。
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",

  // 本页面专属数据表。不要和其他测评页混用。
  TABLE: "ai_level_7d_submissions",
  LS_KEY: "forge_ailevel_7d_records",

  // 后台白名单。配合 supabase_schema.sql 里的 RLS 策略使用。
  ADMIN_EMAILS: ["your-email@example.com"]
};
