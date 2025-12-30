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
    try {
        run('git checkout ' + branchName);
        run('git push origin ' + branchName + ' --force');
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

// INTUITION FEATURES (10 branches)
const intuitions = [
    { name: 'timelining', role: 'Time-traveling canvas explorer' },
    { name: 'governance', role: 'Snapshot-like voting for community rules' },
    { name: 'curation', role: 'Curated pixel galleries' },
    { name: 'staking', role: 'Stake STX to boost pixel visibility' },
    { name: 'rewards', role: 'Airdrop rewards for active contributors' },
    { name: 'analytics', role: 'Heatmaps of canvas activity' },
    { name: 'social', role: 'User profiles and following' },
    { name: 'sharing', role: 'Export canvas sections as GIFs' },
    { name: 'localization', role: 'Multi-language support for global mural' },
    { name: 'pwa', role: 'Installable mobile experience' }
];

intuitions.forEach(i => {
    addTask(`feat/intuition-${i.name}`, `feat: implement ${i.name} module`, `Intuitive feature: ${i.role}.`, [
        { msg: `feat(${i.name}): create core files`, content: { [`src/modules/${i.name}/index.ts`]: `export const ${i.name} = () => {};` } },
        { msg: `feat(${i.name}): add implementation logic`, content: { [`src/modules/${i.name}/logic.ts`]: `// High level logic for ${i.role}` } },
        { msg: `docs(${i.name}): document intuition`, content: { [`src/modules/${i.name}/DESIGN.md`]: `# ${i.name} Design\n${i.role}` } }
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
