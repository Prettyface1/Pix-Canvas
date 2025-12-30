const { execSync } = require('child_process');

const repoPath = 'c:\\Users\\Dammy\\Desktop\\Blockchain\\Stacks\\PixelCanvas';

function run(cmd) {
    try {
        return execSync(cmd, { cwd: repoPath, encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
        console.warn(`Warning: ${cmd.substring(0, 40)}...`);
        return null;
    }
}

// Delete local branches (keeping main)
const branchesToDelete = [
    'feat/component-accordion-v3',
    'feat/component-activityfeed-v3',
    'feat/component-adminpanel-v3',
    'feat/component-alert-v3',
    'feat/component-avatar-v3',
    'feat/component-badge-v3',
    'feat/component-breadcrumb-v3',
    'feat/component-button-v3',
    'feat/component-card-v3',
    'feat/component-checkbox-v3',
    'feat/component-colorpicker-v3',
    'feat/component-dropdown-v3',
    'feat/component-emptystate-v3',
    'feat/component-filter-v3',
    'feat/component-footer-v3',
    'feat/component-grid-v3',
    'feat/component-header-v3',
    'feat/component-input-v3',
    'feat/component-instructions-v3',
    'feat/component-leaderboard-v3',
    'feat/component-modal-v3',
    'feat/component-notification-v3',
    'feat/component-pagination-v3',
    'feat/component-pixel-v3',
    'feat/component-progressbar-v3',
    'feat/final-about',
    'feat/final-accordion',
    'feat/final-activityfeed',
    'feat/final-adminpanel',
    'feat/final-alert',
    'feat/final-avatar',
    'feat/final-badge',
    'feat/final-breadcrumb',
    'feat/final-button',
    'feat/final-card',
    'feat/final-checkbox',
    'feat/final-colorpicker',
    'feat/final-dropdown',
    'feat/final-emptystate',
    'feat/final-filter',
    'feat/final-footer',
    'feat/final-grid',
    'feat/final-header',
    'feat/final-input',
    'feat/final-instructions',
    'feat/final-leaderboard',
    'feat/final-modal',
    'feat/final-notification',
    'feat/final-pagination',
    'feat/final-pixel'
];

async function deleteBranches() {
    run('git checkout main');

    console.log(`Deleting ${branchesToDelete.length} local branches...\n`);

    let deleted = 0;
    for (const branch of branchesToDelete) {
        console.log(`Deleting: ${branch}`);
        const result = run(`git branch -D ${branch}`);
        if (result) deleted++;
    }

    console.log(`\n✓ Deleted ${deleted} local branches`);

    // Also delete from remote
    console.log(`\nDeleting remote branches...`);
    for (const branch of branchesToDelete.slice(0, 30)) { // Delete first 30 from remote
        console.log(`Deleting remote: ${branch}`);
        run(`git push origin --delete ${branch}`);
    }

    console.log(`\n✓ Cleanup complete`);

    // Show remaining branches
    const remaining = run('git branch');
    console.log(`\nRemaining local branches:`);
    console.log(remaining);
}

deleteBranches();
