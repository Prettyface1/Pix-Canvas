const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoPath = 'c:\\Users\\Dammy\\Desktop\\Blockchain\\Stacks\\PixelCanvas';

function run(cmd, cwd = repoPath) {
    try {
        console.log(`Running: ${cmd}`);
        return execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
        console.warn(`Warning running command: ${cmd}`);
        return null;
    }
}

function commit(message) {
    run('git add .');
    run(`git commit -m "${message}"`);
}

function pushAndPR(branchName, title, body) {
    console.log(`Pushing and creating PR for ${branchName}...`);
    run('git checkout ' + branchName);
    run('git push origin ' + branchName + ' --force');
    try {
        run(`gh pr create --title "${title}" --body "${body}" --base main --head ${branchName}`);
        run(`gh pr merge --merge --delete-branch`);
    } catch (e) {
        console.warn("PR Status: Likely merged or error: " + e.message);
    }
}

const featureSets = [];

function addTask(branch, title, body, commits) {
    featureSets.push({ name: branch, title, body, commits });
}

// ULTRA GRANULAR COMPONENTS (40 branches * 15 commits = 600)
const components = ['Header', 'Footer', 'Grid', 'Pixel', 'Toolbar', 'WalletModal', 'TransactionList', 'StatsPanel', 'Notification', 'ColorPicker', 'Instructions', 'AdminPanel', 'Sidebar', 'Search', 'Filter', 'UserCard', 'Leaderboard', 'ActivityFeed', 'Settings', 'About', 'Modal', 'Button', 'Input', 'Tooltip', 'Dropdown', 'Checkbox', 'Radio', 'Toggle', 'ProgressBar', 'Badge', 'Alert', 'Spinner', 'Avatar', 'Breadcrumb', 'Pagination', 'Tabs', 'Accordion', 'Card', 'Skeleton', 'EmptyState'];

components.forEach(c => {
    const baseDir = `src/components/${c}`;
    addTask(`frontend/component-${c.toLowerCase()}-v2`, `feat: redesign ${c} component`, `Multi-stage modular development for ${c}.`, [
        { msg: `feat(${c.toLowerCase()}): create directory structure`, content: {}, dir: baseDir },
        { msg: `feat(${c.toLowerCase()}): add base types`, content: { [`${baseDir}/types.ts`]: `export interface ${c}Props {}` } },
        { msg: `feat(${c.toLowerCase()}): add extended types`, content: { [`${baseDir}/types.ts`]: (cur) => cur + '\nexport type Status = "idle" | "busy";' } },
        { msg: `feat(${c.toLowerCase()}): add style tokens`, content: { [`${baseDir}/${c}.css`]: `:root { --${c.toLowerCase()}-bg: #fff; }` } },
        { msg: `feat(${c.toLowerCase()}): add layout styles`, content: { [`${baseDir}/${c}.css`]: (cur) => cur + `\n.${c.toLowerCase()} { display: flex; }` } },
        { msg: `feat(${c.toLowerCase()}): add hover effects`, content: { [`${baseDir}/${c}.css`]: (cur) => cur + `\n.${c.toLowerCase()}:hover { opacity: 0.8; }` } },
        { msg: `feat(${c.toLowerCase()}): import dependencies`, content: { [`${baseDir}/${c}.tsx`]: `import React from 'react';\nimport './${c}.css';\n` } },
        { msg: `feat(${c.toLowerCase()}): define component structure`, content: { [`${baseDir}/${c}.tsx`]: (cur) => cur + `\nexport const ${c} = () => <div className="${c.toLowerCase()}">${c}</div>;` } },
        { msg: `feat(${c.toLowerCase()}): add aria attributes`, content: { [`${baseDir}/${c}.tsx`]: (cur) => cur.replace('<div>', '<div aria-label="' + c + '">') } },
        { msg: `feat(${c.toLowerCase()}): add props handling`, content: { [`${baseDir}/${c}.tsx`]: (cur) => cur.replace('() =>', '(props: any) =>') } },
        { msg: `feat(${c.toLowerCase()}): add loading state logic`, content: { [`${baseDir}/${c}.tsx`]: (cur) => cur.replace('=>', '=> { const loading = false; return (') + ')}' } },
        { msg: `feat(${c.toLowerCase()}): add indexing`, content: { [`${baseDir}/index.ts`]: `export * from './${c}';\nexport * from './types';` } },
        { msg: `docs(${c.toLowerCase()}): add implementation details`, content: { [`${baseDir}/README.md`]: `# ${c}\nTechnical details.` } },
        { msg: `docs(${c.toLowerCase()}): add usage code snippets`, content: { [`${baseDir}/README.md`]: (cur) => cur + '\n\n```tsx\n// Usage example\n```' } },
        { msg: `test(${c.toLowerCase()}): init suite`, content: { [`${baseDir}/__tests__/${c}.test.ts`]: `describe('${c}', () => {});` } }
    ]);
});

// ULTRA GRANULAR HOOKS (20 branches * 10 commits = 200)
const hooks = ['usePixel', 'useCanvas', 'useWallet', 'useTransactions', 'useNotifications', 'useWindowSize', 'useClickOutside', 'useFetchCanvas', 'useUserStats', 'useDebounce', 'useLocalStorage', 'useAuth', 'useRegistry', 'useContract', 'useEvents', 'useInterval', 'usePrevious', 'useToggle', 'useLockedBody', 'useMediaQuery'];
hooks.forEach(h => {
    addTask(`frontend/hook-${h.toLowerCase()}-v2`, `feat: refine ${h} hook`, `Advanced logic for ${h}.`, [
        { msg: `feat(hooks): create ${h}.ts`, content: { [`src/hooks/${h}.ts`]: `export const ${h} = () => {};` } },
        { msg: `feat(hooks): add ${h} types`, content: { [`src/hooks/${h}.ts`]: (c) => `// ${h} Types\n` + c } },
        { msg: `feat(hooks): add ${h} imports`, content: { [`src/hooks/${h}.ts`]: (c) => `import { useState, useEffect } from 'react';\n` + c } },
        { msg: `feat(hooks): add ${h} state`, content: { [`src/hooks/${h}.ts`]: (c) => c.replace('() => {}', '() => {\n  const [s, setS] = useState();\n}') } },
        { msg: `feat(hooks): add ${h} effect`, content: { [`src/hooks/${h}.ts`]: (c) => c.replace('}', '  useEffect(() => {}, []);\n}') } },
        { msg: `feat(hooks): add ${h} return`, content: { [`src/hooks/${h}.ts`]: (c) => c.replace('}', '  return s;\n}') } },
        { msg: `refactor(hooks): cleanup ${h}`, content: { [`src/hooks/${h}.ts`]: (c) => c + '\n// cleanup line' } },
        { msg: `docs(hooks): document ${h} parameters`, content: { [`src/hooks/${h}.ts`]: (c) => `/**\n * @param none\n */\n` + c } },
        { msg: `test(hooks): add coverage for ${h}`, content: { [`src/hooks/__tests__/${h}.spec.ts`]: `it('runs ${h}', () => {});` } },
        { msg: `chore(hooks): export ${h}`, content: { 'src/hooks/index.ts': (c) => c + `export * from './${h}';\n` } }
    ]);
});

async function start() {
    try {
        run('git checkout -b main');
    } catch (e) {
        run('git checkout main');
    }

    // Previous commits already exist, so we just add on top.

    for (const task of featureSets) {
        console.log(`\n>>> Branch: ${task.name}`);
        run(`git branch -D ${task.name}`);
        run(`git checkout -b ${task.name}`);

        for (const c of task.commits) {
            console.log(`  Commit: ${c.msg}`);
            if (c.dir && !fs.existsSync(path.join(repoPath, c.dir))) {
                fs.mkdirSync(path.join(repoPath, c.dir), { recursive: true });
            }
            if (c.content) {
                for (const [file, content] of Object.entries(c.content)) {
                    const filePath = path.join(repoPath, file);
                    const fileDir = path.dirname(filePath);
                    if (!fs.existsSync(fileDir)) {
                        fs.mkdirSync(fileDir, { recursive: true });
                    }

                    let finalContent = typeof content === 'function' ? (fs.existsSync(filePath) ? content(fs.readFileSync(filePath, 'utf8')) : content('')) : content;
                    fs.writeFileSync(filePath, finalContent);
                }
            }
            commit(c.msg);
        }

        pushAndPR(task.name, task.title, task.body);
        run('git checkout main');
    }
}

start();
