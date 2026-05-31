# 逃离期末周

一个可直接部署到 GitHub Pages 的心理班会答题闯关小游戏。每个选项都通过分值影响体力、心情和 GPA，没有绝对对错。

## 本地运行

```bash
npm run dev
```

默认监听 `0.0.0.0:5173`，适合本地端口转发。需要换端口时：

```bash
PORT=3000 npm run dev
```

Windows PowerShell：

```powershell
$env:PORT=3000; npm run dev
```

## 修改题目和分值

题目、选项、初始属性、总分权重和跟风折损都在 `src/questions.js` 中维护。

每个选项使用 `score` 指定结算分值：

```js
{
  name: "A. 选项名称",
  desc: "选项描述",
  score: { stamina: -1, mood: 2, gpa: 1 }
}
```

## GitHub Pages 部署

仓库包含 `.github/workflows/deploy.yml`。推送到 `main` 分支后，GitHub Actions 会把整个静态项目发布到 GitHub Pages。

第一次使用时，在仓库 Settings -> Pages 中把 Source 设置为 GitHub Actions。
