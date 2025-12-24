const fs = require('fs');
const path = require('path');

// Автоматически находим корень проекта по schema-engine-windows.exe
function findProjectRoot(startDir) {
  let current = startDir;
  while (current !== path.parse(current).root) {
    if (fs.existsSync(path.join(current, 'schema-engine-windows.exe'))) {
      return current;
    }
    current = path.dirname(current);
  }
  return null;
}

const projectRoot = findProjectRoot(__dirname);
if (!projectRoot) {
  console.error('❌ Project root not found! Make sure schema-engine-windows.exe is in root.');
  process.exit(1);
}

console.log(`🏠 Project root: ${projectRoot}`);
console.log(`📁 Current dir: ${process.cwd()}`);

// Копируем движки
const engines = [
  { 
    source: path.join(projectRoot, 'schema-engine-windows.exe'),
    targets: [
      'node_modules/@prisma/engines/schema-engine-windows.exe',
      'node_modules/prisma/schema-engine-windows.exe'
    ]
  }
];

engines.forEach(({ source, targets }) => {
  if (!fs.existsSync(source)) {
    console.log(`⚠️  Missing: ${path.basename(source)}`);
    return;
  }

  targets.forEach(target => {
    const targetPath = path.join(process.cwd(), target);
    const targetDir = path.dirname(targetPath);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    try {
      fs.copyFileSync(source, targetPath);
      console.log(`✓ ${path.basename(source)} → ${target}`);
    } catch (err) {
      console.log(`✗ ${path.basename(source)} to ${target}: ${err.message}`);
    }
  });
});

console.log('✅ Schema engine copied successfully!');