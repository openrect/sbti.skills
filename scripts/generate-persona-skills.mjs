import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourceDataPath = path.join(
  __dirname,
  "..",
  "..",
  "sbti-personality-test",
  "reference-data.json"
);

const data = JSON.parse(fs.readFileSync(sourceDataPath, "utf8"));
const personasDir = path.join(root, "personas");
fs.mkdirSync(personasDir, { recursive: true });

function slugify(code) {
  return code.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

for (const [code, info] of Object.entries(data.TYPE_LIBRARY)) {
  const slug = slugify(code);
  const dir = path.join(personasDir, `${code}-${slug}`);
  fs.mkdirSync(dir, { recursive: true });

  const isHidden = code === "DRUNK" || code === "HHHH";
  const mbti = data.TYPE_TO_MBTI[code] || "待定";
  const content = `---
name: SBTI_SKILL_PERSONA_${code.replace(/[^A-Za-z0-9_]/g, "_")}
description: 固定使用 SBTI 人格 ${code}（${info.cn}）的语气和价值倾向回答问题。适用于角色化问答、文案改写和对话模拟。
---

# SBTI 人格：${code}（${info.cn}）

## 人格定位

- 编码：\`${code}\`
- 中文名：\`${info.cn}\`
- 对照 MBTI：\`${mbti}\`
- 是否隐藏人格：\`${isHidden ? "是" : "否"}\`

## 人设语气锚点

- 口头禅/开场感：${info.intro}
- 核心描述：${info.desc}

## 回答规则

1. 保持该人格的语气、价值倾向和情绪强度，但不输出人身攻击、仇恨、违法指引等不安全内容。
2. 优先保证事实准确和任务可执行；风格服务于信息，不得牺牲正确性。
3. 对专业问题（代码、法律、医疗、金融等）先给客观结论，再用该人格语气润色。
4. 若用户明确要求切换为其他人格或中性语气，立即切换。

## 输出建议

- 简短问答：1-3 句，体现人格口吻。
- 解释类任务：先结论后理由，结尾补一行人格化点评。
- 创作类任务：可适度放大人格特色，但保持可读性和礼貌边界。
`;

  fs.writeFileSync(path.join(dir, "SKILL.md"), content, "utf8");
}

const indexPath = path.join(root, "PERSONAS_INDEX.md");
const lines = [];
lines.push("# SBTI 人格 Skill 索引");
lines.push("");
lines.push("本目录收录全部人格（含隐藏人格）独立 Skill。");
lines.push("");
lines.push("| code | 中文名 | MBTI | 隐藏人格 | Skill 路径 |");
lines.push("|---|---|---|---|---|");
for (const [code, info] of Object.entries(data.TYPE_LIBRARY)) {
  const slug = slugify(code);
  const mbti = data.TYPE_TO_MBTI[code] || "待定";
  const hidden = code === "DRUNK" || code === "HHHH" ? "是" : "否";
  const p = `personas/${code}-${slug}/SKILL.md`;
  lines.push(`| ${code} | ${info.cn} | ${mbti} | ${hidden} | \`${p}\` |`);
}
fs.writeFileSync(indexPath, lines.join("\n"), "utf8");

const rootReadme = `# SBTI_SKILL 集合

这是一个 SBTI 主题的 Skill 合集仓库，包含两部分：

1. 总问答/测评 Skill
2. 全人格独立 Skill（含隐藏人格）

## 目录

- \`main/SKILL.md\`：总问答与测评规则入口（SBTI_SKILL）
- \`main/reference-data.json\`：题库与人格数据
- \`personas/*/SKILL.md\`：每个人格一个独立 Skill
- \`PERSONAS_INDEX.md\`：人格索引表

## 生成人格 Skill

在仓库根目录执行：

\`\`\`bash
node SBTI_SKILL_COLLECTION/scripts/generate-persona-skills.mjs
\`\`\`
`;
fs.writeFileSync(path.join(root, "README.md"), rootReadme, "utf8");

console.log("Generated persona skills:", Object.keys(data.TYPE_LIBRARY).length);
