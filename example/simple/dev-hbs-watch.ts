import chokidar from 'chokidar';
import { join } from 'path';
import { existsSync, writeFileSync, readFileSync } from 'fs';

// Only run in development
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
  const watchPaths = [
    join(process.cwd(), 'app/hbs/views/**/*.hbs'),
    join(process.cwd(), 'templates/**/*.hbs'),
    join(process.cwd(), 'views/**/*.hbs'),
  ];

  // Files that can trigger hot reload when touched
  const triggerFiles = [
    join(process.cwd(), 'app/hbs/route.ts'),  // Your actual route file
    join(process.cwd(), 'app/route.ts'),
    join(process.cwd(), 'next.config.ts'),
  ];

  const availableTriggerFile = triggerFiles.find(file => existsSync(file));

  if (availableTriggerFile) {
    console.log('🔥 Setting up .hbs file watcher for hot reload');
    console.log('📄 Will trigger reload by touching:', availableTriggerFile);
    console.log('👀 Watching patterns:', watchPaths);

    // Initialize chokidar watcher
    const watcher = chokidar.watch(watchPaths, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on('change', (filePath) => {
      console.log(`📝 Handlebars file changed: ${filePath}`);
      
      try {
        // Read current content
        const content = readFileSync(availableTriggerFile, 'utf8');
        const timestamp = Date.now();
        
        // Remove any existing trigger comments
        const cleanContent = content.replace(/\n\/\/ HMR trigger \d+/g, '');
        
        // Add trigger comment to force a content change
        const triggerComment = `\n// HMR trigger ${timestamp}`;
        writeFileSync(availableTriggerFile, cleanContent + triggerComment);
        
        // Remove the trigger comment after a short delay to keep the file clean
        setTimeout(() => {
          try {
            const currentContent = readFileSync(availableTriggerFile, 'utf8');
            const finalContent = currentContent.replace(triggerComment, '');
            writeFileSync(availableTriggerFile, finalContent);
          } catch (error) {
            console.error('❌ Failed to clean trigger comment:', error);
          }
        }, 100);
        
        console.log('✅ Hot reload triggered for:', filePath);
      } catch (error) {
        console.error('❌ Failed to trigger hot reload:', error);
      }
    });

    watcher.on('add', (filePath) => {
      console.log(`➕ New Handlebars file added: ${filePath}`);
    });

    watcher.on('unlink', (filePath) => {
      console.log(`➖ Handlebars file removed: ${filePath}`);
    });

    watcher.on('error', (error) => {
      console.error('❌ File watcher error:', error);
    });

    console.log('✅ File watcher initialized successfully');
  } else {
    console.log('⚠️  No suitable trigger file found:', triggerFiles);
  }
}
