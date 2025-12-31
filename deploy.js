import { execSync } from 'child_process';
import { existsSync, readdirSync, copyFileSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';

const distDir = './dist';
const branch = 'demo1';

if (!existsSync(distDir)) {
  console.error('❌ dist 目录不存在，请先运行 npm run build');
  process.exit(1);
}

console.log('📦 准备部署到 demo1 分支...');

try {
  // 检查当前分支
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  console.log(`📍 当前分支: ${currentBranch}`);

  // 切换到 demo1 分支（如果不存在则创建）
  try {
    execSync(`git checkout ${branch}`, { stdio: 'ignore' });
    console.log(`✅ 已切换到 ${branch} 分支`);
  } catch (e) {
    execSync(`git checkout -b ${branch}`, { stdio: 'ignore' });
    console.log(`✅ 已创建并切换到 ${branch} 分支`);
  }

  // 清空分支内容（除了 .git）
  const files = readdirSync('.');
  files.forEach(file => {
    if (file !== '.git' && file !== 'node_modules' && file !== '.gitignore') {
      try {
        execSync(`git rm -rf ${file}`, { stdio: 'ignore' });
      } catch (e) {
        // 忽略错误
      }
    }
  });

  // 复制 dist 目录的所有内容到根目录
  function copyRecursive(src, dest) {
    const entries = readdirSync(src);
    entries.forEach(entry => {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);
      const stat = statSync(srcPath);
      
      if (stat.isDirectory()) {
        if (!existsSync(destPath)) {
          mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    });
  }

  copyRecursive(distDir, '.');
  console.log('✅ 已复制构建文件到根目录');

  // 提交更改
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Deploy to GitHub Pages"', { stdio: 'inherit' });
  console.log('✅ 已提交更改');

  // 推送到远程
  execSync(`git push -u origin ${branch} --force`, { stdio: 'inherit' });
  console.log(`✅ 已推送到远程 ${branch} 分支`);

  console.log('\n🎉 部署完成！');
  console.log('📝 接下来请在 GitHub 仓库设置中：');
  console.log('   1. 进入 Settings → Pages');
  console.log('   2. Source 选择 "Deploy from a branch"');
  console.log('   3. Branch 选择 "demo1"');
  console.log('   4. Folder 选择 "/ (root)"');
  console.log('   5. 点击 Save');

} catch (error) {
  console.error('❌ 部署失败:', error.message);
  process.exit(1);
}

