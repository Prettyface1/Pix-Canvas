const { execSync } = require('child_process');

const repoPath = 'c:\\Users\\Dammy\\Desktop\\Blockchain\\Stacks\\PixelCanvas';

function run(cmd) {
    try {
        return execSync(cmd, { cwd: repoPath, encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
        return null;
    }
}

async function deleteBranches() {
    run('git checkout main');

    // Get all local branches except main
    const allBranches = run('git branch');
    if (!allBranches) {
        console.log('No branches found');
        return;
    }

    const branches = allBranches
        .split('\n')
        .map(b => b.trim().replace('* ', ''))
        .filter(b => b && b !== 'main' && b !== '* main')
        .slice(0, 100); // Take first 100 branches

    console.log(`Found ${branches.length} branches to delete\n`);

    let deleted = 0;
    for (const branch of branches) {
        console.log(`Deleting local: ${branch}`);
        const result = run(`git branch -D ${branch}`);
        if (result) deleted++;
    }

    console.log(`\n✓ Deleted ${deleted} local branches`);

    // Delete from remote
    console.log(`\nDeleting from remote...`);
    let remoteDeleted = 0;
    for (const branch of branches.slice(0, 100)) {
        console.log(`Deleting remote: ${branch}`);
        const result = run(`git push origin --delete ${branch}`);
        if (result) remoteDeleted++;
    }

    console.log(`\n✓ Deleted ${remoteDeleted} remote branches`);
    console.log(`\n=== Cleanup Complete ===`);

    // Show remaining count
    const remaining = run('git branch');
    const remainingCount = remaining ? remaining.split('\n').filter(b => b.trim() && b.trim() !== '* main' && b.trim() !== 'main').length : 0;
    console.log(`Remaining local branches: ${remainingCount}`);
}

deleteBranches();
