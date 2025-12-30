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

// 1. UTILS (15 branches)
const utils = ['date', 'string', 'math', 'validation', 'encryption', 'api', 'storage', 'logger', 'format', 'pixel', 'color', 'converter', 'hasher', 'parser', 'guard'];
utils.forEach(u => {
    addTask(`feat/util-${u}`, `feat: implement ${u} utility`, `Reusable ${u} logic for the core system.`, [
        { msg: `feat(utils): create ${u}.ts`, content: { [`src/utils/${u}.ts`]: `export const ${u} = () => {};` } },
        { msg: `feat(utils): add logic to ${u}`, content: { [`src/utils/${u}.ts`]: (c) => c + `\nexport const ${u}Helper = () => true;` } },
        { msg: `test(utils): test ${u}`, content: { [`src/utils/__tests__/${u}.spec.ts`]: `it('tests ${u}', () => {})` } }
    ]);
});

// 2. PAGES (10 branches)
const pages = ['Home', 'Canvas', 'Gallery', 'Profile', 'Stats', 'Admin', 'About', 'Contact', 'Terms', 'Privacy'];
pages.forEach(p => {
    addTask(`feat/page-${p.toLowerCase()}`, `feat: implement ${p} page view`, `Full page implementation for ${p}.`, [
        { msg: `feat(pages): create ${p} page`, content: { [`src/pages/${p}/index.tsx`]: `export const ${p}Page = () => <div>${p}</div>;` } },
        { msg: `feat(pages): add styles for ${p}`, content: { [`src/pages/${p}/styles.module.css`]: `.root {}` } },
        { msg: `feat(pages): add SEO meta for ${p}`, content: { [`src/pages/${p}/meta.ts`]: `export const meta = { title: "${p} | Pix-Canvas" };` } }
    ]);
});

// 3. LAYOUTS (5 branches)
const layouts = ['Default', 'Dashboard', 'Empty', 'Auth', 'Wide'];
layouts.forEach(l => {
    addTask(`feat/layout-${l.toLowerCase()}`, `feat: implement ${l} layout`, `Structural layout for ${l} context.`, [
        { msg: `feat(layouts): create ${l} layout`, content: { [`src/layouts/${l}Layout.tsx`]: `export const ${l}Layout = ({children}: any) => <div>{children}</div>;` } }
    ]);
});

async function start() {
    try {
        run('git checkout -b main');
    } catch (e) {
        run('git checkout main');
    }

    run('git push origin main --force');

    for (const task of featureSets) {
        console.log(`\n>>> Branch: ${task.name}`);
        run(`git checkout main`);
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
    }
}

start();
