# Omar's Portfolio Website

React + TypeScript + Vite portfolio with an AI chatbot powered by GitHub Models.

## AI Chatbot Setup

The chatbot uses the [GitHub Models](https://github.com/marketplace/models) API, which is included in your GitHub Copilot subscription (no separate OpenAI key needed).

> **⚠️ Security note**: `VITE_*` variables are embedded in the client-side bundle and are visible to anyone who inspects the page source. To limit exposure, use a **Fine-grained PAT with only the `Models: Read-only` permission** — it cannot access repositories or any other resource. For a production deployment that requires tighter security, proxy the request through a serverless function so the token stays server-side.

### Local development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Generate a GitHub **Fine-grained** Personal Access Token at <https://github.com/settings/tokens?type=beta>:
   - Under **Permissions → Account permissions**, set **Models** to **Read-only**
   - All other permissions can remain at *No access*
3. Paste the token into `.env`:
   ```
   VITE_GITHUB_TOKEN=ghp_your_token_here
   ```
4. Start the dev server:
   ```bash
   npm install
   npm run dev
   ```

> **Important**: Never commit the `.env` file. It is already excluded via `.gitignore`.

### Deployment

Set the `VITE_GITHUB_TOKEN` environment variable in your hosting provider's settings (e.g. GitHub Pages → Settings → Variables and Secrets, or Vercel / Netlify environment variables) using the same minimal-scope token described above.

---

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
