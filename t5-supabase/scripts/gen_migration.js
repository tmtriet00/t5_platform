const fs = require('fs');
const path = require('path');

// Helper to get arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const index = args.indexOf(name);
    if (index === -1 || index + 1 >= args.length) return null;
    return args[index + 1];
};

const name = getArg('--name');
const target = getArg('--target');

if (!name) {
    console.error('Error: --name is required');
    process.exit(1);
}

// Generate timestamp YYYYMMDDHHmmss
const now = new Date();
const timestamp = now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);

const migrationFileName = `${timestamp}_${name}.sql`;
const migrationPath = path.join(__dirname, '../supabase/migrations', migrationFileName);

let content = '';

if (target) {
    const targetPath = path.resolve(process.cwd(), target);
    if (fs.existsSync(targetPath)) {
        content = fs.readFileSync(targetPath, 'utf8');
        console.log(`Reading content from ${target}`);
    } else {
        console.error(`Error: Target file ${target} not found`);
        process.exit(1);
    }
} else {
    // If no target, just create an empty file/placeholder
    console.log('No target file specified. Creating empty migration.');
}

fs.writeFileSync(migrationPath, content);

console.log(`Migration created: ${migrationPath}`);
