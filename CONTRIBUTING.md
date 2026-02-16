# 贡献指南

感谢你考虑为 AIMAGE 项目做出贡献！

## 行为准则

参与本项目即表示你同意遵守我们的行为准则：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 如何贡献

### 报告 Bug

如果你发现了 bug，请创建一个 issue 并包含以下信息：

1. **Bug 描述** - 清晰简洁地描述问题
2. **复现步骤** - 详细的复现步骤
3. **预期行为** - 你期望发生什么
4. **实际行为** - 实际发生了什么
5. **截图** - 如果适用，添加截图
6. **环境信息**
   - 操作系统
   - 浏览器版本
   - Node.js 版本

### 提出新功能

如果你有新功能的想法：

1. 先检查 issues 中是否已有类似建议
2. 创建一个 feature request issue
3. 清楚地描述功能和使用场景
4. 如果可能，提供设计草图或原型

### 提交代码

#### 开发流程

1. **Fork 仓库**

```bash
# 克隆你的 fork
git clone https://github.com/your-username/aimage.git
cd aimage
```

2. **创建分支**

```bash
# 从 main 分支创建新分支
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

3. **安装依赖**

```bash
cd frontend
pnpm install
```

4. **开发**

- 编写代码
- 遵循代码规范
- 添加必要的测试
- 更新文档

5. **测试**

```bash
# 运行测试
pnpm test

# 检查类型
pnpm type-check

# 检查代码规范
pnpm lint
```

6. **提交**

```bash
git add .
git commit -m "feat: add new feature"
```

提交信息格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具链相关
- `perf`: 性能优化

示例：

```
feat(auth): add social login support

- Add Google OAuth integration
- Add GitHub OAuth integration
- Update login page UI

Closes #123
```

7. **推送**

```bash
git push origin feature/your-feature-name
```

8. **创建 Pull Request**

- 访问 GitHub 仓库
- 点击 "New Pull Request"
- 选择你的分支
- 填写 PR 描述
- 等待审核

#### Pull Request 指南

**PR 标题**

使用清晰的标题，遵循提交信息格式：

```
feat: add user profile page
fix: resolve login redirect issue
docs: update installation guide
```

**PR 描述**

包含以下内容：

```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 变更说明
简要描述你的变更...

## 相关 Issue
Closes #123

## 测试
- [ ] 已添加单元测试
- [ ] 已添加集成测试
- [ ] 已手动测试

## 截图
如果有 UI 变更，请添加截图

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已更新相关文档
- [ ] 所有测试通过
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 警告
```

## 代码规范

### TypeScript

- 使用 TypeScript 严格模式
- 为所有函数添加类型注解
- 避免使用 `any` 类型
- 使用接口定义数据结构

```typescript
// ✅ 好的示例
interface User {
  id: string;
  email: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ 不好的示例
function getUser(id: any): any {
  // ...
}
```

### React

- 使用函数组件和 Hooks
- 组件名使用 PascalCase
- Props 接口以组件名 + Props 命名

```typescript
// ✅ 好的示例
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export default function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### 样式

- 使用 Tailwind CSS
- 避免内联样式（除非必要）
- 使用语义化的类名

```tsx
// ✅ 好的示例
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
</div>

// ❌ 不好的示例
<div style={{ display: 'flex', padding: '24px' }}>
  <h2 style={{ fontSize: '24px' }}>Title</h2>
</div>
```

### 命名规范

- 变量和函数：camelCase
- 组件和类：PascalCase
- 常量：UPPER_SNAKE_CASE
- 文件名：kebab-case 或 PascalCase（组件）

```typescript
// 变量和函数
const userName = 'John';
function getUserData()

// 组件
function UserProfile() {}

// 常量
const API_BASE_URL = 'https://api.example.com';

// 文件名
user-profile.tsx
UserProfile.tsx
```

## 项目结构

```
frontend/
├── app/              # Next.js 页面
├── components/       # 可复用组件
├── lib/             # 工具函数和配置
├── public/          # 静态资源
└── styles/          # 全局样式
```

## 开发工具

### 推荐的 VS Code 扩展

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### 配置

项目根目录的 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 测试

### 单元测试

```typescript
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders button with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### 集成测试

```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## 文档

- 为复杂的函数添加 JSDoc 注释
- 更新 README.md（如果需要）
- 添加或更新相关文档

```typescript
/**
 * 获取用户信息
 * @param userId - 用户 ID
 * @returns 用户对象
 * @throws {Error} 当用户不存在时抛出错误
 */
async function getUser(userId: string): Promise<User> {
  // ...
}
```

## 审核流程

1. **自动检查**
   - CI/CD 运行测试
   - 代码规范检查
   - 类型检查

2. **人工审核**
   - 至少一位维护者审核
   - 代码质量评估
   - 功能测试

3. **合并**
   - 所有检查通过
   - 审核通过
   - 解决所有评论

## 发布流程

维护者负责发布新版本：

1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建 Git tag
4. 发布到生产环境

## 获取帮助

如果你有任何问题：

1. 查看 [文档](./README.md)
2. 搜索现有的 [Issues](https://github.com/yourusername/aimage/issues)
3. 创建新的 Issue
4. 加入我们的社区讨论

## 许可证

通过贡献代码，你同意你的贡献将在 MIT 许可证下发布。

---

再次感谢你的贡献！🎉
