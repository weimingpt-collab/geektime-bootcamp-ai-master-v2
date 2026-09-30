# MDX 代码块迁移指南

## 📋 状态总结

所有 MDX 文件现已导入 `ExampleCode` 组件，可以开始逐步迁移代码块。

### ✅ 已完成的文件

| 文件 | ExampleCode 已导入 | 已转换的示例 | 待转换代码块数 |
|------|-------------------|------------|-------------|
| `claude-code-architecture.mdx` | ✅ | 1个 | 0（无代码块）|
| `claude-code-setup.mdx` | ✅ | 0个 | ~12个 |
| `claude-code-intro.mdx` | ✅ | 0个 | ~68个 |
| `cursor-intro.mdx` | ✅ | 0个 | ~36个 |
| `cursor-rules-guide.mdx` | ✅ | 0个 | ~34个 |
| `notebooklm-guide.mdx` | ✅ | 0个 | 0（无代码块）|
| `speckit-intro.mdx` | ✅ | 4个 | ~82个 |

**总计**: ~232 个代码块需要评估和可能的转换

---

## 🎯 迁移策略

### 建议转换为 ExampleCode 的代码块：

✅ **应该转换的**：
- 完整的配置文件（>15行）
- 长的示例代码（>20行）
- 重要的架构代码示例
- 需要语法高亮的复杂代码

❌ **保持原样的**：
- 短命令行指令（<5行）
- 单行或几行的 JSON 片段
- 简短的对比代码
- 内联代码示例

---

## 📝 转换语法

### 原始 Markdown 代码块：

\`\`\`markdown
\`\`\`typescript
export interface Config {
  name: string;
  version: string;
  // ... more code
}
\`\`\`
\`\`\`

### 转换为 ExampleCode：

\`\`\`mdx
<ExampleCode
  title="配置文件示例 - config.ts"
  language="typescript"
  code={\`export interface Config {
  name: string;
  version: string;
  // ... more code
}\`}
  previewLines={5}
  client:load
/>
\`\`\`

**注意**：
1. 代码块中的反引号需要使用 `\\\`` 转义
2. `${}` 需要转义为 `\\${}`
3. 必须添加 `client:load` 指令

---

## 🛠️ 批量转换辅助脚本

由于手动转换工作量巨大，建议使用以下策略：

### 1. 识别长代码块

```bash
# 找出超过 20 行的代码块
awk '/^```/,/^```/ {
  if (/^```[a-z]/) { start=NR; lang=$0 }
  else if (/^```$/ && start) {
    lines = NR - start - 1
    if (lines > 20) print FILENAME":"start":"lines" lines - "lang
    start = 0
  }
}' *.mdx
```

### 2. 半自动转换

对于每个需要转换的长代码块：
1. 复制代码内容
2. 转义特殊字符（反引号、`${}`）
3. 使用 ExampleCode 模板包装
4. 测试渲染效果

---

## 📊 优先级建议

### 高优先级（建议立即转换）：
1. ✅ **speckit-intro.mdx** - 已转换 4 个核心示例
2. **cursor-rules-guide.mdx** - 包含大量配置示例
3. **claude-code-intro.mdx** - 重要的架构文档

### 中优先级（逐步转换）：
4. **cursor-intro.mdx** - 教程文档
5. **claude-code-setup.mdx** - 配置指南

### 低优先级（可选）：
6. 短代码块可以保持原样

---

## ✨ ExampleCode 组件特性回顾

- **默认折叠**：节省页面空间
- **预览前 5 行**：让用户快速了解内容
- **语法高亮**：Prism.js 支持多种语言
- **复制按钮**：方便用户复制代码
- **统一设计**：符合整站设计系统
- **可配置**：可调整预览行数、默认展开状态等

---

## 🚀 下一步行动

### 选项 A：手动逐步迁移
- 每周转换 1-2 个文件
- 重点关注最常访问的页面
- 保证质量，避免错误

### 选项 B：编写自动化脚本
- 开发 Node.js 脚本自动转换
- 处理转义和格式化
- 批量生成，人工审查

### 选项 C：混合策略（推荐）
1. **立即**：手动转换最重要的 10-15 个长代码块
2. **短期**：为常见模式开发小工具辅助转换
3. **长期**：逐步迁移剩余代码块

---

## 📄 示例转换

### 示例 1：长配置文件

**Before:**
\`\`\`markdown
\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    // ... 50+ lines
  }
}
\`\`\`
\`\`\`

**After:**
\`\`\`mdx
<ExampleCode
  title="TypeScript 配置 - tsconfig.json"
  language="json"
  code={\`{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    // ... 50+ lines
  }
}\`}
  client:load
/>
\`\`\`

### 示例 2：保持简短命令

**Keep as is:**
\`\`\`bash
npm install
npm run dev
\`\`\`

这种短命令不需要转换为 ExampleCode。

---

## 🔍 质量检查清单

转换后检查：
- [ ] 代码语法高亮正确
- [ ] 折叠/展开功能正常
- [ ] 预览显示合适的内容
- [ ] 复制按钮工作正常
- [ ] 没有转义错误（反引号、`${}`等）
- [ ] 移动端显示正常

---

## 📞 需要帮助？

如果在迁移过程中遇到问题：
1. 参考 `site/src/components/materials/README.md`
2. 查看已转换的示例（`speckit-intro.mdx`）
3. 测试小范围更改后再批量应用

---

**最后更新**: 2025-01-15
**维护者**: AI Training Camp Team
