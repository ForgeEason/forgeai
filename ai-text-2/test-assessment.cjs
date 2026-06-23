const fs = require("fs");
const vm = require("vm");

function element() {
  return {
    innerHTML: "",
    textContent: "",
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
}

const app = element();
const template = element();
template.innerHTML = "<header></header>";
const toast = element();
const document = {
  querySelector(selector) {
    if (selector === "#app") return app;
    if (selector === "#brand-template") return template;
    if (selector === "#toast") return toast;
    return element();
  },
  querySelectorAll() { return []; }
};

const sandbox = {
  document,
  window: {
    FORGE_AI_CONFIG: { enableBackend: false },
    scrollTo() {}
  },
  navigator: { userAgent: "node-test" },
  location: { href: "http://localhost/?debug=1", search: "?debug=1", origin: "http://localhost", pathname: "/" },
  history: { replaceState() {} },
  performance: { now: () => 3000 },
  crypto: { randomUUID: () => "test-id" },
  localStorage: { getItem() { return null; }, setItem() {} },
  setTimeout(fn) { return 0; },
  clearTimeout() {},
  console
};
sandbox.window.window = sandbox.window;
sandbox.window.crypto = sandbox.crypto;

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("app.js", "utf8"), sandbox, { filename: "app.js" });

const test = sandbox.window.__AI_LEVEL_TEST__;
if (!test) throw new Error("测试接口未加载");
if (test.questionCount !== 15) throw new Error(`题量异常: ${test.questionCount}`);
for (const dimension of ["framing", "prompting", "workflow", "verification", "safety"]) {
  if (test.dimensionCounts[dimension] !== 3) throw new Error(`${dimension} 题量应为3，实际为${test.dimensionCounts[dimension]}`);
}

const high = test.score(test.bestAnswers);
const low = test.score(test.worstAnswers);
const mixed = test.score(test.bestAnswers.map((best, i) => i % 2 ? best : test.worstAnswers[i]));
const bestLetters = test.bestAnswers.map(i => "ABCD"[i]).join("");

if (high.level !== 5 || high.overall !== 100) throw new Error(`高分路径异常: ${JSON.stringify(high)}`);
if (low.level !== 0 || low.overall > 10) throw new Error(`低分路径异常: ${JSON.stringify(low)}`);
if (mixed.level < 1 || mixed.level > 4) throw new Error(`中间路径异常: ${JSON.stringify(mixed)}`);
if (/^D+$/.test(bestLetters)) throw new Error("最高分答案仍然固定为D");

console.log(JSON.stringify({ questionCount: test.questionCount, dimensionCounts: test.dimensionCounts, bestLetters, high, low, mixed }, null, 2));
