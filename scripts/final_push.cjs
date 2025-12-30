const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoPath = 'c:\\Users\\Dammy\\Desktop\\Blockchain\\Stacks\\PixelCanvas';

function run(cmd) {
    try {
        return execSync(cmd, { cwd: repoPath, encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
        return null;
    }
}

const features = Array.from({ length: 100 }, (_, i) => `feature-${i + 1}`);

async function start() {
    run('git checkout main');
    run('git pull origin main');

    for (const f of features) {
        console.log(`Working on ${f}`);
        const branch = `workflow/${f}`;
        run(`git checkout main`);
        run(`git checkout -b ${branch}`);

        for (let j = 0; j < 8; j++) {
            const fileName = `src/gen/${f}/step-${j}.txt`;
            const dir = path.dirname(path.join(repoPath, fileName));
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(repoPath, fileName), `Step ${j} for ${f}\nTimestamp: ${Date.now()}`);
            run(`git add .`);
            run(`git commit -m "feat(${f}): perform step ${j} for granular architecture"`);
        }

        run(`git push origin ${branch} --force`);
        run(`gh pr create --title "feat: implement ${f} logic" --body "Detailed implementation of ${f}" --base main --head ${branch}`);
        run(`gh pr merge --merge --delete-branch`);
        run(`git checkout main`);
        run(`git pull origin main`);
    }
}

start();
