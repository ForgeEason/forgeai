(() => {
  "use strict";

  const CONFIG = window.FORGE_AI_CONFIG || {};
  const ORG = CONFIG.organizationName || "Forge 锻造AI训战营";
  const STORAGE_KEY = "forge_ai_level_submissions";

  const DIMENSIONS = {
    framing: { label: "任务定义", short: "看清问题", color: "#38bdf8", weight: 0.2 },
    prompting: { label: "指令协作", short: "驯服表达", color: "#9b8afb", weight: 0.2 },
    workflow: { label: "实战工作流", short: "形成复用", color: "#ff9f43", weight: 0.25 },
    verification: { label: "判断核验", short: "不被幻觉带跑", color: "#55e6a5", weight: 0.2 },
    safety: { label: "安全责任", short: "守住边界", color: "#ff6b7a", weight: 0.15 }
  };

  const ROLES = {
    management: { name: "管理与决策", icon: "♟", desc: "经营、团队与决策", material: "经营材料", output: "决策建议", audience: "团队" },
    sales: { name: "销售与客户", icon: "↗", desc: "客户、方案与沟通", material: "客户资料", output: "客户方案", audience: "客户" },
    marketing: { name: "市场与运营", icon: "◐", desc: "内容、活动与增长", material: "市场资料", output: "运营方案", audience: "目标用户" },
    education: { name: "教育与培训", icon: "◈", desc: "课程、教学与学习", material: "课程材料", output: "教学方案", audience: "学员" },
    hr: { name: "人力与行政", icon: "♢", desc: "人才、组织与协同", material: "员工资料", output: "人力方案", audience: "同事" },
    finance: { name: "财务与专业服务", icon: "▣", desc: "数据、报告与审慎判断", material: "业务数据", output: "分析报告", audience: "业务部门" },
    creative: { name: "内容与创意", icon: "✦", desc: "创作、设计与表达", material: "创作素材", output: "内容作品", audience: "受众" },
    general: { name: "通用工作场景", icon: "●", desc: "适用于多数知识工作", material: "工作材料", output: "工作成果", audience: "同事" }
  };

  const LEVELS = [
    { level: 0, name: "AI星门探索者", color: "#7f9bb8", quote: "你已经发现入口。下一步，不是收藏100个工具，而是让AI帮你完成第一个真实任务。", maturity: "启蒙探索阶段" },
    { level: 1, name: "灵感点火学徒", color: "#55e6a5", quote: "你会点火，但火候还看缘分。偶尔灵感爆棚，偶尔像在跟复读机掰手腕。", maturity: "初步使用阶段" },
    { level: 2, name: "指令驯兽师", color: "#9b8afb", quote: "你已经能让AI听懂人话，并开始稳定驯服它。现在需要从“会问”走向“会交付”。", maturity: "结构化协作阶段" },
    { level: 3, name: "人机协作领航员", color: "#38bdf8", quote: "你不只是向AI提问，而是在带领它完成工作。方向盘大体在你手里，挺稳。", maturity: "进阶应用阶段" },
    { level: 4, name: "智能体编队长", color: "#ffd166", quote: "你正在把工具、知识和流程编成生产力小队。AI不是外卖员，是你的工位搭子。", maturity: "工作流领导阶段" },
    { level: 5, name: "AI价值架构师", color: "#e4b8ff", quote: "你设计的不是提示词，而是更好的工作方式。你已经从“用AI”走到“造系统”。", maturity: "价值架构阶段" }
  ];

  const QUESTIONS = [
    {
      dimension: "framing", type: "开局姿势",
      title: "你收到一个模糊任务：“用AI尽快做一份{{output}}。”你通常从哪里开始？",
      options: [
        { text: "先明确目标、对象、成功标准和边界，再决定AI怎么参与。先搭地图，再开车。", score: 4 },
        { text: "直接让AI先做完整版本，反正错了再说，主打一个先冲。", score: 1 },
        { text: "搜索一个热门提示词模板套上，像给所有病开同一味感冒药。", score: 2 },
        { text: "把现有{{material}}全部扔给AI，让它自行悟道。", score: 0 }
      ]
    },
    {
      dimension: "prompting", type: "沟通返工",
      title: "AI第一版内容很普通，离你想要的差了一个“周一早会”。你更可能怎么做？",
      options: [
        { text: "指出具体差距，补充样例、限制和评价标准，让AI分步修。", score: 4 },
        { text: "重新开一个对话，再问一遍同样的问题，期待玄学刷新。", score: 1 },
        { text: "要求它“更专业、更高级、更有灵魂”。这话很熟，但AI也很懵。", score: 2 },
        { text: "直接自己重写，宣布AI从此打入冷宫。", score: 0 }
      ]
    },
    {
      dimension: "safety", type: "隐私边界", consistency: "privacy",
      title: "{{material}}里有姓名、联系方式或内部信息。为了让AI分析，你会怎么处理？",
      options: [
        { text: "先确认公司规则、工具数据政策和授权边界，并做必要脱敏。", score: 4 },
        { text: "删掉姓名就上传，其他信息应该问题不大。", score: 2 },
        { text: "拆成几段上传，感觉风险会变小，像把大象分装进冰箱。", score: 1 },
        { text: "只要不公开发布，就可以直接上传。", score: 0 }
      ]
    },
    {
      dimension: "verification", type: "识别幻觉",
      title: "AI生成的{{output}}语言流畅，还引用了几个你没见过的数据来源。最值得警惕的信号是？",
      options: [
        { text: "来源可能不存在，关键数据需要回到原始出处核验。AI会一本正经地胡说，语气还很像专家。", score: 4 },
        { text: "文章语气不够热情。", score: 0 },
        { text: "没有使用足够多的专业词汇。", score: 1 },
        { text: "篇幅比预期短。", score: 0 }
      ]
    },
    {
      dimension: "workflow", type: "复用能力",
      title: "你每周都要重复整理类似的{{material}}。哪种做法最接近你的真实状态？",
      options: [
        { text: "建立了输入模板、AI处理步骤和人工检查清单，能稳定复用。", score: 4 },
        { text: "有一个固定提示词，但每次仍需大量返工。", score: 2 },
        { text: "偶尔想到时会让AI帮忙，像临时抓壮丁。", score: 1 },
        { text: "这类工作不适合AI，所以从不尝试。", score: 0 }
      ]
    },
    {
      dimension: "framing", type: "任务判断",
      title: "面对一项新任务，你如何判断是否值得使用AI？",
      options: [
        { text: "判断任务风险、重复度、信息条件、验证难度和人的责任边界。", score: 4 },
        { text: "只要能省时间就该用，速度就是王道。", score: 2 },
        { text: "看身边的人有没有用，群众的眼睛有时也会散光。", score: 1 },
        { text: "所有文字与数据任务都适合AI。", score: 0 }
      ]
    },
    {
      dimension: "prompting", type: "提示词质量",
      title: "下面哪条指令最可能产生可评估、可交付的结果？",
      options: [
        { text: "根据这些资料写{{output}}，面向{{audience}}；给出结构、依据和待确认项，不确定处明确标注。", score: 4 },
        { text: "帮我写一个专业的{{output}}。", score: 1 },
        { text: "你是世界顶级专家，请发挥最高水平。帽子很大，但路很窄。", score: 0 },
        { text: "先写一版，字数越多越好。", score: 1 }
      ]
    },
    {
      dimension: "verification", type: "因果判断",
      title: "AI对一份数据表得出结论：“A导致了B”。你下一步最合理的动作是？",
      options: [
        { text: "检查数据口径、样本和其他解释，区分相关和因果。", score: 4 },
        { text: "让AI把结论写得更有说服力。", score: 0 },
        { text: "换一个AI模型，如果答案相同就相信。", score: 2 },
        { text: "让AI给结论打一个可信度分数。", score: 1 }
      ]
    },
    {
      dimension: "workflow", type: "流程设计",
      title: "如果让AI参与高频工作，哪种流程最成熟？",
      options: [
        { text: "人定义目标与边界，AI处理，关键节点由人核验，并记录改进。", score: 4 },
        { text: "AI完成全过程，人只看最终结果。希望它懂事，最好还能自带KPI。", score: 1 },
        { text: "人先做一遍，再让AI模仿。", score: 2 },
        { text: "同时问多个AI，采用最像正确答案的版本。", score: 1 }
      ]
    },
    {
      dimension: "safety", type: "责任归属",
      title: "AI生成内容可能涉及偏见、版权，或影响{{audience}}。最终责任应该如何安排？",
      options: [
        { text: "由使用者或组织设定边界、保留人工审核，并承担最终责任。", score: 4 },
        { text: "工具提供方承担，使用者无需负责。", score: 0 },
        { text: "只要注明AI生成，就不需要审核。", score: 1 },
        { text: "让AI自己检查一遍即可，自己审自己，听起来就很公正。", score: 2 }
      ]
    },
    {
      dimension: "framing", type: "复杂拆解",
      title: "复杂任务包含调研、分析、创作和决策，你会怎样与AI协作？",
      options: [
        { text: "把任务拆成可验证的小步骤，为每步选择合适的人机分工。", score: 4 },
        { text: "一次性把所有要求发给AI，祈祷它能参透宇宙。", score: 1 },
        { text: "只让AI负责最后的文字润色。", score: 2 },
        { text: "让AI自行规划并直接交付最终版本。", score: 1 }
      ]
    },
    {
      dimension: "prompting", type: "迭代策略",
      title: "连续修改几轮后，AI输出开始偏离原目标。你通常会怎么做？",
      options: [
        { text: "回到目标与标准，整理有效信息，必要时重建清晰上下文。", score: 4 },
        { text: "继续强调“不要跑题”。像对导航喊“别堵车”。", score: 1 },
        { text: "不断缩短指令，让AI自由发挥。", score: 0 },
        { text: "换一个模型并复制全部聊天记录。", score: 2 }
      ]
    },
    {
      dimension: "workflow", type: "真实行为", evidence: true,
      title: "过去30天，你把AI用于真实工作的最高程度是？",
      options: [
        { text: "形成包含输入、处理、审核和复用的工作流程。", score: 4 },
        { text: "稳定完成某一类任务，并有自己的模板。", score: 3 },
        { text: "完成过零散内容或信息整理。", score: 1 },
        { text: "几乎没有在真实任务中使用。", score: 0 }
      ]
    },
    {
      dimension: "safety", type: "合规复核", consistency: "privacy",
      title: "同事建议把内部{{material}}上传到免费的AI网站，效率会提升很多。你首先会做什么？",
      options: [
        { text: "确认数据分类、授权边界和平台条款，再决定是否脱敏或换合规工具。", score: 4 },
        { text: "先试一小份，确认效果再说。", score: 1 },
        { text: "只要不包含密码就可以使用。", score: 0 },
        { text: "让同事上传，这样责任不在自己。职场甩锅学，不是AI素养。", score: 0 }
      ]
    },
    {
      dimension: "verification", type: "关键交付", evidence: true,
      title: "时间紧，AI给出一个看起来不错但无法完全核验的关键结论。你会怎么交付？",
      options: [
        { text: "区分已确认事实、推测与未知，并说明风险和人工判断。", score: 4 },
        { text: "直接采用，时间比准确更重要。", score: 0 },
        { text: "删除所有不确定表述，让结果更坚定。", score: 1 },
        { text: "再问一次AI是否确定，它确认后再采用。", score: 2 }
      ]
    }
  ];

  // 基础顺序也做一次错位；进入测评时还会再次随机洗牌。
  QUESTIONS.forEach((q, index) => {
    const shift = [0, 2, 1, 3, 1][index % 5];
    q.options = [...q.options.slice(shift), ...q.options.slice(0, shift)];
  });

  const ACTIONS = {
    framing: ["每次使用AI前写清目标、对象、成功标准。", "把复杂任务拆成可验证的小步骤。", "建立“哪些任务适合AI”的判断清单。"],
    prompting: ["指令里加入背景、限制、样例和输出标准。", "把高质量结果沉淀为可复用模板。", "跑偏时重建上下文，而不是只说“再专业一点”。"],
    workflow: ["选择一个高频任务建立固定流程。", "明确输入、AI处理、人工审核和复用步骤。", "记录返工原因，持续优化流程。"],
    verification: ["关键事实回到原始来源交叉核验。", "要求AI区分事实、推测和未知。", "为高风险结果建立人工审核清单。"],
    safety: ["上传资料前检查授权、脱敏和平台条款。", "为团队建立可用与不可用信息边界。", "保留人工最终责任与审核记录。"]
  };

  const state = {
    view: "home",
    participant: {},
    role: null,
    questions: [],
    index: 0,
    answers: [],
    startedAt: 0,
    questionStartedAt: 0,
    answerTimes: [],
    result: null,
    submissionSaved: false,
    admin: { session: null, submissions: [], loading: false }
  };

  const app = document.querySelector("#app");
  const brandTemplate = document.querySelector("#brand-template");
  const toast = document.querySelector("#toast");
  let supabaseClient = null;

  function brand() { return brandTemplate.innerHTML; }
  function escapeHTML(value) { return String(value ?? "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]); }
  function roleMeta() { return ROLES[state.role] || ROLES.general; }
  function hydrate(text) {
    const role = roleMeta();
    return text.replaceAll("{{material}}", role.material).replaceAll("{{output}}", role.output).replaceAll("{{audience}}", role.audience);
  }
  function scrollTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
  function showToast(message) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2400); }
  function uuid() { return crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
  function canUseBackend() {
    return Boolean(CONFIG.enableBackend && CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase);
  }
  function db() {
    if (!canUseBackend()) return null;
    if (!supabaseClient) supabaseClient = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
    return supabaseClient;
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function prepareQuestions() {
    state.questions = QUESTIONS.map((q, questionIndex) => ({
      ...q,
      originalIndex: questionIndex,
      options: shuffle(q.options).map((option, optionIndex) => ({ ...option, optionIndex }))
    }));
  }

  function coreHTML(compact = false) {
    return `<div class="energy-core ${compact ? "compact" : ""}" aria-label="五维AI能力能量核">
      <span class="ring ring-3"></span><span class="ring ring-2"></span><span class="ring ring-1"></span>
      <span class="core-center"></span>
      ${compact ? "" : `<span class="dimension-pill p1">任务定义</span><span class="dimension-pill p2">指令协作</span><span class="dimension-pill p3">实战工作流</span><span class="dimension-pill p4">判断核验</span><span class="dimension-pill p5">安全责任</span>`}
    </div>`;
  }

  function renderHome() {
    state.view = "home";
    app.innerHTML = `${brand()}<section class="hero">
      <div>
        <span class="eyebrow">FORGE AI LEVEL SCAN</span>
        <h1><span class="gradient-text">你是在使用AI，</span><br>还是已经开始指挥AI？</h1>
        <p class="lead">由 ${ORG} 发起。15个真实工作情境，测出你的AI能力段位，解锁专属身份、能力徽章和下一步升级建议。</p>
        <div class="cta-row"><button class="primary-btn" data-action="profile">开始测评，看看我是哪路AI玩家 →</button></div>
        <div class="trust-row"><span>约3分钟</span><span>适合多职业</span><span>不考编程</span><span>${canUseBackend() ? "结果进入训练营数据看板" : "当前为本地体验模式"}</span></div>
      </div>
      <div class="core-stage">${coreHTML()}<div class="badge-teasers">${LEVELS.map(l => `<span class="badge-dot">L${l.level}</span>`).join("")}</div></div>
    </section>`;
  }

  function renderProfile() {
    state.view = "profile";
    app.innerHTML = `${brand()}<section class="profile-wrap">
      <div class="section-head">
        <span class="eyebrow">00 · CHECK IN</span>
        <h1>先留下你的训练营身份</h1>
        <p>用于生成个人结果和后台复盘。别担心，我们不是查户口，只是怕优秀找不到主人。</p>
      </div>
      <form class="profile-card" data-form="profile">
        <label>姓名 / 昵称 <input name="name" required maxlength="32" value="${escapeHTML(state.participant.name)}" placeholder="例如：王小锤" /></label>
        <label>手机号 / 微信 / 邮箱 <input name="contact" required maxlength="64" value="${escapeHTML(state.participant.contact)}" placeholder="用于课后联系或结果归档" /></label>
        <label>公司 / 团队 <input name="company" maxlength="64" value="${escapeHTML(state.participant.company)}" placeholder="可选" /></label>
        <label>岗位 / 职业 <input name="jobTitle" maxlength="64" value="${escapeHTML(state.participant.jobTitle)}" placeholder="例如：销售经理、培训师、运营、老板" /></label>
        <div class="form-note">${canUseBackend() ? "提交后，完整测评数据会进入 Forge 私有看板。" : "当前后台未配置，数据只会保存在本机浏览器，部署前需配置 Supabase。"}</div>
        <button class="primary-btn" type="submit">进入工作场景选择 →</button>
      </form>
    </section>`;
  }

  function renderRoles() {
    state.view = "roles";
    app.innerHTML = `${brand()}<section class="section-wrap">
      <div class="section-head"><span class="eyebrow">01 · WORK SCENE</span><h1>你通常在哪种战场工作？</h1><p>场景只用于替换题目语境，评分标准保持一致，确保跨职业可比较。</p></div>
      <div class="role-grid">${Object.entries(ROLES).map(([key, role]) => `<button class="role-card ${state.role === key ? "selected" : ""}" data-role="${key}"><span class="role-icon">${role.icon}</span><b>${role.name}</b><small>${role.desc}</small></button>`).join("")}</div>
      <div class="sticky-action"><button class="primary-btn" data-action="instructions" ${state.role ? "" : "disabled"}>进入我的工作场景 →</button></div>
    </section>`;
  }

  function renderInstructions() {
    state.view = "instructions";
    app.innerHTML = `${brand()}<section class="milestone">${coreHTML(true)}
      <span class="eyebrow">SCAN READY</span><h1>请选择真实的你</h1>
      <p>这里没有“最体面”的答案。请选择你在真实工作中最可能采取的行动。答题越像本人，徽章越有参考价值。</p>
      <div class="cta-row center"><button class="primary-btn" data-action="start">我准备好了</button><button class="secondary-btn" data-action="choose-role">更换场景</button></div>
    </section>`;
  }

  function renderQuestion() {
    state.view = "quiz";
    state.questionStartedAt = performance.now();
    const q = state.questions[state.index];
    const chosen = state.answers[state.index];
    const progress = Math.round((state.index / state.questions.length) * 100);
    app.innerHTML = `${brand()}<section class="quiz-shell">
      <div class="quiz-meta"><span>${roleMeta().name}</span><span>AI能量 ${progress}%</span></div>
      <div class="energy-progress"><span style="width:${progress}%"></span></div>
      <article class="question-card">
        <span class="question-tag" style="color:${DIMENSIONS[q.dimension].color}">${q.type} · ${DIMENSIONS[q.dimension].label}</span>
        <h2>${escapeHTML(hydrate(q.title))}</h2>
        <div class="option-list">${q.options.map((option, idx) => `<button class="option ${chosen === idx ? "selected" : ""}" data-answer="${idx}"><span class="option-key">${String.fromCharCode(65 + idx)}</span><span>${escapeHTML(hydrate(option.text))}</span></button>`).join("")}</div>
      </article>
      <div class="quiz-controls"><button class="text-btn" data-action="prev" ${state.index === 0 ? "disabled" : ""}>← 上一题</button><span class="text-btn">${state.index + 1} / ${state.questions.length}</span></div>
    </section>`;
  }

  function answerQuestion(optionIndex) {
    const now = performance.now();
    state.answers[state.index] = optionIndex;
    state.answerTimes[state.index] = Math.max(0, Math.round(now - state.questionStartedAt));
    document.querySelectorAll(".option").forEach((el, i) => el.classList.toggle("selected", i === optionIndex));
    setTimeout(() => {
      if (state.index === 4 || state.index === 9) {
        const first = state.index === 4;
        state.index += 1;
        renderMilestone(first);
      } else if (state.index < state.questions.length - 1) {
        state.index += 1;
        renderQuestion(); scrollTop();
      } else {
        renderScan();
      }
    }, 220);
  }

  function renderMilestone(first) {
    state.view = "milestone";
    app.innerHTML = `${brand()}<section class="milestone">${coreHTML(true)}
      <span class="eyebrow">${first ? "ENERGY CONNECTED" : "WORKFLOW MAPPED"}</span>
      <h1>${first ? "指令能量已接入" : "工作流扫描完成"}</h1>
      <p>${first ? "你开始展现与AI协作的方式。下一阶段将测试任务判断与工作流能力。" : "正在检测你的判断力与安全护栏，专属身份即将解锁。"}</p>
      <div class="cta-row center"><button class="primary-btn" data-action="continue">继续扫描 →</button></div>
    </section>`;
  }

  function calculateResult(questions = state.questions, answers = state.answers, answerTimes = state.answerTimes) {
    const totals = Object.fromEntries(Object.keys(DIMENSIONS).map(k => [k, 0]));
    const counts = Object.fromEntries(Object.keys(DIMENSIONS).map(k => [k, 0]));
    questions.forEach((q, i) => {
      const chosen = q.options[answers[i]];
      totals[q.dimension] += chosen ? chosen.score : 0;
      counts[q.dimension] += 1;
    });
    const scores = Object.fromEntries(Object.keys(DIMENSIONS).map(k => [k, Math.round((totals[k] / (counts[k] * 4)) * 100)]));
    const overall = Math.round(Object.entries(DIMENSIONS).reduce((sum, [key, d]) => sum + scores[key] * d.weight, 0));
    let level = overall >= 82 ? 5 : overall >= 67 ? 4 : overall >= 52 ? 3 : overall >= 36 ? 2 : overall >= 20 ? 1 : 0;
    const q13 = questions[12]?.options[answers[12]]?.score ?? 0;
    const q15 = questions[14]?.options[answers[14]]?.score ?? 0;
    if (level >= 5 && (Math.min(...Object.values(scores)) < 70 || q13 < 3 || q15 < 3)) level = 4;
    if (level >= 4 && (scores.workflow < 60 || scores.verification < 60 || scores.safety < 60)) level = 3;
    if (level >= 3 && scores.verification < 40) level = 2;
    const privacyScores = questions.filter(q => q.consistency === "privacy").map((q, i) => ({ q, absolute: questions.indexOf(q) })).map(({ q, absolute }) => q.options[answers[absolute]]?.score ?? 0);
    const privacyGap = privacyScores.length === 2 ? Math.abs(privacyScores[0] - privacyScores[1]) : 0;
    const times = [...answerTimes].filter(Boolean).sort((a, b) => a - b);
    const medianTime = times[Math.floor(times.length / 2)] || 0;
    const confidence = privacyGap <= 1 && medianTime >= 1500 ? "较高" : privacyGap <= 2 && medianTime >= 800 ? "中等" : "参考";
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return { scores, overall, level, confidence, strongest: sorted[0][0], weakest: sorted[sorted.length - 1][0] };
  }

  function renderScan() {
    state.view = "scan";
    app.innerHTML = `${brand()}<section class="scan-page">${coreHTML(true)}<div class="scan-line"></div><h1>正在生成能力地图</h1><p class="lead centered">汇总五维能量 · 校验关键能力门槛 · 匹配专属身份</p></section>`;
    setTimeout(async () => {
      state.result = calculateResult();
      renderResult();
      await saveSubmission();
    }, 1200);
  }

  function badgeSVG(level) {
    const meta = LEVELS[level];
    const nodes = Array.from({ length: level + 1 }, (_, i) => {
      const angle = (Math.PI * 2 * i / Math.max(level + 1, 3)) - Math.PI / 2;
      const x = 150 + Math.cos(angle) * 88, y = 150 + Math.sin(angle) * 88;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${level >= 4 ? 7 : 5}" fill="${meta.color}" opacity="${0.48 + i * 0.08}"/><line x1="150" y1="150" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${meta.color}" opacity=".22"/>`;
    }).join("");
    return `<svg class="badge-svg" viewBox="0 0 300 300" role="img" aria-label="L${level} ${meta.name}徽章">
      <defs><radialGradient id="g${level}"><stop offset="0" stop-color="#fff"/><stop offset=".22" stop-color="${meta.color}"/><stop offset="1" stop-color="#17243a"/></radialGradient><filter id="glow${level}"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M150 18 262 83v134L150 282 38 217V83Z" fill="rgba(7,17,31,.72)" stroke="${meta.color}" stroke-width="3"/>
      <path d="M150 34 248 91v118l-98 57-98-57V91Z" fill="none" stroke="${meta.color}" opacity=".27"/>
      <circle cx="150" cy="150" r="${58 + level * 5}" fill="none" stroke="${meta.color}" opacity=".35" stroke-dasharray="8 8"/>
      ${nodes}
      <rect x="111" y="111" width="78" height="78" rx="24" transform="rotate(45 150 150)" fill="url(#g${level})" filter="url(#glow${level})"/>
      <text x="150" y="160" text-anchor="middle" fill="#fff" font-size="28" font-weight="900">L${level}</text>
      <text x="150" y="249" text-anchor="middle" fill="${meta.color}" font-size="11" font-weight="800" letter-spacing="2">FORGE AI</text>
    </svg>`;
  }

  function renderResult() {
    state.view = "result";
    const r = state.result, meta = LEVELS[r.level], strong = DIMENSIONS[r.strongest], weak = DIMENSIONS[r.weakest];
    const next = LEVELS[Math.min(5, r.level + 1)];
    app.innerHTML = `${brand()}<section class="result-wrap">
      <div class="result-hero">
        <div class="badge-display">${badgeSVG(r.level)}</div>
        <div><span class="level-kicker">L${r.level} · ${meta.maturity}</span><h1>${meta.name}</h1><p class="result-quote">${meta.quote}</p>
          <div class="metric-row"><span class="metric">AI实战成熟度 <b>${r.overall}</b></span><span class="metric">结果可信度 <b>${r.confidence}</b></span><span class="metric">职业场景 <b>${roleMeta().name}</b></span></div>
          <div class="cta-row"><button class="primary-btn" data-action="scroll-map">查看能力地图</button><button class="secondary-btn" data-action="share">分享我的身份</button></div>
        </div>
      </div>
      <div class="result-grid" id="ability-map">
        <article class="result-card"><h2>五维能力地图</h2><p>结果根据情境决策、微型挑战与真实行为综合计算。高分不能抵消安全和核验短板。</p>
          <div class="dimension-bars">${Object.entries(DIMENSIONS).map(([key, d]) => `<div class="dimension-row"><span>${d.label}</span><div class="bar"><span style="width:${r.scores[key]}%;background:${d.color}"></span></div><b>${r.scores[key]}</b></div>`).join("")}</div>
          <div class="insight">你的优势是“${strong.short}”，当前最值得补强的是“${weak.short}”。${r.level >= 4 ? "高阶能力来自稳定流程与审慎判断，而不只是更会提问。" : "先补齐最短板，通常比继续收藏更多工具更有效。"}</div>
        </article>
        <article class="result-card"><h2>${r.level === 5 ? "保持领先" : `向 L${next.level}「${next.name}」跃迁`}</h2><p>${r.level === 5 ? "下一步是把个人能力转化为可复制的组织能力。" : "完成下面三个动作，建立更稳定的AI实战能力。"}</p>
          <ul class="action-list">${ACTIONS[r.weakest].map((a, i) => `<li><span class="action-num">${i + 1}</span><span>${a}</span></li>`).join("")}</ul>
        </article>
      </div>
      <div class="result-actions"><button class="secondary-btn" data-action="restart">重新测一次</button><button class="secondary-btn" data-action="about">查看测评依据</button></div>
    </section>`;
    scrollTop();
  }

  function renderAbout() {
    state.view = "about";
    app.innerHTML = `${brand()}<article class="method-card"><span class="eyebrow">METHODOLOGY</span><h1>测评依据与边界</h1>
      <p>AI LEVEL 通过15个通用工作情境评估任务定义、指令协作、实战工作流、判断核验和安全责任。题目避免绑定具体软件或职业术语，以提高跨职业适用性。</p>
      <h2>评分方式</h2><ul><li>每道题根据行为成熟度计0到4分。</li><li>综合分采用五维加权，同时设置核验、安全和真实应用门槛。</li><li>高总分不能抵消关键能力短板。</li><li>结果可信度参考回答一致性与完成节奏。</li></ul>
      <h2>使用边界</h2><p>该工具适合培训前测、课堂互动和学习路径建议。在完成大样本信效度验证前，应称为“基于AI素养框架设计的能力定位测试”，不用于招聘淘汰、绩效评定或高风险职业认证。</p>
      <div class="cta-row"><button class="primary-btn" data-action="home">返回测评首页</button></div></article>`;
  }

  function buildSubmission() {
    return {
      id: uuid(),
      created_at: new Date().toISOString(),
      organization: ORG,
      participant: { ...state.participant },
      role_key: state.role,
      role_name: roleMeta().name,
      result: state.result,
      started_at: state.startedAt ? new Date(state.startedAt).toISOString() : null,
      duration_ms: Date.now() - state.startedAt,
      answers: state.questions.map((q, i) => {
        const chosen = q.options[state.answers[i]];
        return {
          number: i + 1,
          dimension: q.dimension,
          dimension_label: DIMENSIONS[q.dimension].label,
          question: hydrate(q.title),
          selected: chosen ? hydrate(chosen.text) : "",
          score: chosen?.score ?? 0,
          answer_time_ms: state.answerTimes[i] || 0
        };
      }),
      user_agent: navigator.userAgent
    };
  }

  async function saveSubmission() {
    if (state.submissionSaved || !state.result) return;
    const payload = buildSubmission();
    state.submissionSaved = true;
    const client = db();
    if (client) {
      const { error } = await client.from("ai_level_submissions").insert(payload);
      if (error) {
        console.warn(error);
        saveLocal(payload);
        showToast("后台保存失败，已临时保存在本机");
      } else {
        showToast("结果已进入 Forge 训练营看板");
      }
    } else {
      saveLocal(payload);
    }
  }

  function saveLocal(payload) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    list.unshift(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
  }
  function readLocal() { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }

  async function renderAdmin() {
    state.view = "admin";
    const client = db();
    if (!client) {
      state.admin.submissions = readLocal();
      renderAdminBoard("本地体验模式：只显示当前浏览器保存的数据。要看到所有扫码学员，请配置 Supabase。");
      return;
    }
    const { data: { session } } = await client.auth.getSession();
    state.admin.session = session;
    if (!session) { renderAdminLogin(); return; }
    const email = session.user.email;
    if (!CONFIG.adminEmails?.includes(email)) {
      app.innerHTML = `${brand()}<section class="admin-wrap"><div class="admin-card"><h1>没有看板权限</h1><p>${escapeHTML(email)} 已登录，但不在管理员白名单中。</p><button class="secondary-btn" data-action="admin-logout">退出登录</button></div></section>`;
      return;
    }
    await loadAdminData();
    subscribeAdmin();
  }

  function renderAdminLogin() {
    app.innerHTML = `${brand()}<section class="admin-wrap">
      <form class="admin-card" data-form="admin-login">
        <span class="eyebrow">FORGE DASHBOARD</span><h1>实时测试数据看板</h1>
        <p>输入管理员邮箱，系统会发送登录链接。只有配置在白名单里的邮箱才能看到完整数据。</p>
        <label>管理员邮箱 <input name="email" type="email" required placeholder="you@example.com" /></label>
        <button class="primary-btn" type="submit">发送登录链接</button>
      </form>
    </section>`;
  }

  async function loadAdminData() {
    const client = db();
    const { data, error } = await client.from("ai_level_submissions").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) {
      renderAdminBoard(`读取失败：${error.message}`);
      return;
    }
    state.admin.submissions = data || [];
    renderAdminBoard();
  }

  function subscribeAdmin() {
    const client = db();
    client.channel("ai-level-dashboard").on("postgres_changes", { event: "INSERT", schema: "public", table: "ai_level_submissions" }, payload => {
      state.admin.submissions = [payload.new, ...state.admin.submissions].slice(0, 500);
      renderAdminBoard("收到新的测评数据");
    }).subscribe();
  }

  function summarize(list) {
    const total = list.length;
    const avg = total ? Math.round(list.reduce((s, x) => s + (x.result?.overall || 0), 0) / total) : 0;
    const levelCounts = LEVELS.map(l => list.filter(x => x.result?.level === l.level).length);
    const latest = list[0];
    const dimensionAvg = Object.fromEntries(Object.keys(DIMENSIONS).map(key => [key, total ? Math.round(list.reduce((s, x) => s + (x.result?.scores?.[key] || 0), 0) / total) : 0]));
    return { total, avg, levelCounts, latest, dimensionAvg };
  }

  function renderAdminBoard(message = "") {
    const list = state.admin.submissions || [];
    const s = summarize(list);
    app.innerHTML = `${brand()}<section class="admin-wrap">
      <div class="admin-head"><div><span class="eyebrow">REALTIME DASHBOARD</span><h1>Forge AI测评看板</h1><p>${message || "实时汇总学员登录、答题明细、段位分布与五维平均分。"}</p></div><button class="secondary-btn" data-action="admin-refresh">刷新</button></div>
      <div class="dashboard-grid">
        <div class="stat-card"><small>总提交</small><b>${s.total}</b></div>
        <div class="stat-card"><small>平均成熟度</small><b>${s.avg}</b></div>
        <div class="stat-card"><small>最新提交</small><b>${s.latest ? escapeHTML(s.latest.participant?.name || "匿名") : "—"}</b></div>
      </div>
      <div class="admin-panels">
        <article class="admin-card"><h2>段位分布</h2>${LEVELS.map((l, i) => `<div class="dimension-row"><span>L${l.level}</span><div class="bar"><span style="width:${s.total ? s.levelCounts[i] / s.total * 100 : 0}%;background:${l.color}"></span></div><b>${s.levelCounts[i]}</b></div>`).join("")}</article>
        <article class="admin-card"><h2>五维平均</h2>${Object.entries(DIMENSIONS).map(([key, d]) => `<div class="dimension-row"><span>${d.label}</span><div class="bar"><span style="width:${s.dimensionAvg[key]}%;background:${d.color}"></span></div><b>${s.dimensionAvg[key]}</b></div>`).join("")}</article>
      </div>
      <article class="admin-card"><h2>完整提交数据</h2><div class="submission-list">${list.map(item => renderSubmissionItem(item)).join("") || `<p class="muted">暂无数据。</p>`}</div></article>
    </section>`;
  }

  function renderSubmissionItem(item) {
    const result = item.result || {};
    const p = item.participant || {};
    return `<details class="submission-item">
      <summary><span><b>${escapeHTML(p.name || "匿名")}</b><small>${escapeHTML(p.contact || "")} · ${escapeHTML(item.role_name || "")} · ${new Date(item.created_at).toLocaleString("zh-CN")}</small></span><strong>L${result.level ?? "-"} · ${result.overall ?? "-"}</strong></summary>
      <div class="submission-meta"><span>公司：${escapeHTML(p.company || "—")}</span><span>岗位：${escapeHTML(p.jobTitle || "—")}</span><span>用时：${Math.round((item.duration_ms || 0) / 1000)}秒</span></div>
      <ol class="answer-detail">${(item.answers || []).map(a => `<li><b>${escapeHTML(a.dimension_label)}</b><p>${escapeHTML(a.question)}</p><em>选择：${escapeHTML(a.selected)}（${a.score}分，用时${Math.round((a.answer_time_ms || 0) / 1000)}秒）</em></li>`).join("")}</ol>
    </details>`;
  }

  async function shareResult() {
    const r = state.result, meta = LEVELS[r.level];
    const text = `我的AI身份是 L${r.level}「${meta.name}」，AI实战成熟度 ${r.overall}。你在AI世界已经进化到第几层？`;
    try {
      if (navigator.share) await navigator.share({ title: `AI LEVEL｜${ORG}`, text, url: location.href.split("?")[0] });
      else { await navigator.clipboard.writeText(`${text}\n${location.href.split("?")[0]}`); showToast("结果文案和链接已复制"); }
    } catch (error) { if (error.name !== "AbortError") showToast("分享未完成，请稍后重试"); }
  }

  function startQuiz() {
    state.index = 0;
    state.answers = [];
    state.answerTimes = [];
    state.result = null;
    state.submissionSaved = false;
    state.startedAt = Date.now();
    prepareQuestions();
    renderQuestion();
  }

  app.addEventListener("submit", async event => {
    const form = event.target.closest("form");
    if (!form) return;
    event.preventDefault();
    if (form.dataset.form === "profile") {
      const data = Object.fromEntries(new FormData(form).entries());
      state.participant = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v).trim()]));
      renderRoles();
    }
    if (form.dataset.form === "admin-login") {
      const email = new FormData(form).get("email");
      const client = db();
      if (!client) return showToast("后台未配置");
      const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname + "?admin=1" } });
      showToast(error ? `发送失败：${error.message}` : "登录链接已发送，请查看邮箱");
    }
  });

  app.addEventListener("click", async event => {
    const answer = event.target.closest("[data-answer]");
    if (answer) { answerQuestion(Number(answer.dataset.answer)); return; }
    const roleButton = event.target.closest("[data-role]");
    if (roleButton) { state.role = roleButton.dataset.role; renderRoles(); return; }
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "home") renderHome();
    if (action === "about") renderAbout();
    if (action === "profile") renderProfile();
    if (action === "admin") { history.replaceState(null, "", "?admin=1"); await renderAdmin(); }
    if (action === "choose-role") renderRoles();
    if (action === "instructions" && state.role) renderInstructions();
    if (action === "start") startQuiz();
    if (action === "continue") { renderQuestion(); scrollTop(); }
    if (action === "prev" && state.index > 0) { state.index -= 1; renderQuestion(); }
    if (action === "scroll-map") document.querySelector("#ability-map")?.scrollIntoView({ behavior: "smooth" });
    if (action === "share") shareResult();
    if (action === "restart") renderProfile();
    if (action === "admin-refresh") await renderAdmin();
    if (action === "admin-logout") { await db()?.auth.signOut(); await renderAdmin(); }
  });

  if (location.search.includes("debug=1")) {
    const testQuestions = QUESTIONS.map((q, i) => ({ ...q, originalIndex: i, options: q.options.map((o, optionIndex) => ({ ...o, optionIndex })) }));
    Object.defineProperty(window, "__AI_LEVEL_TEST__", {
      value: {
        questionCount: QUESTIONS.length,
        dimensionCounts: QUESTIONS.reduce((acc, q) => ({ ...acc, [q.dimension]: (acc[q.dimension] || 0) + 1 }), {}),
        score(answers, answerTimes = Array(QUESTIONS.length).fill(2500)) { return calculateResult(testQuestions, answers, answerTimes); },
        bestAnswers: testQuestions.map(q => q.options.reduce((best, item, i, all) => item.score > all[best].score ? i : best, 0)),
        worstAnswers: testQuestions.map(q => q.options.reduce((worst, item, i, all) => item.score < all[worst].score ? i : worst, 0))
      },
      enumerable: false
    });
  }

  if (location.search.includes("admin=1")) renderAdmin();
  else renderHome();
})();
