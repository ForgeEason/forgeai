window.FORGE_AI_CONFIG = {
  // 后台数据开关：配置 Supabase 后改为 true。
  enableBackend: false,

  // 在 Supabase 项目 Settings → API 中复制。
  supabaseUrl: "",
  supabaseAnonKey: "",

  // 只有这些邮箱登录后可以进入实时看板。必须配合 README 里的 RLS 策略使用。
  adminEmails: ["your-email@example.com"],

  // 学员端是否要求留下身份信息。建议培训现场保持 true，方便课后复盘。
  requireParticipantProfile: true,

  // 用于看板标题。
  organizationName: "Forge 锻造AI训战营"
};
