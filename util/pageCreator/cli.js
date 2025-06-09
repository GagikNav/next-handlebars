#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Function to prompt the user for a folder name.
function promptFolderName() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question('Enter the folder name: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// File content for route.tsx (TypeScript code)
const routeTsxContent = `import { NextResponse } from 'next/server'
import { fileURLToPath } from 'url'
import { create, listFoldersInCurrentProject, listFoldersWithRouteTs } from '../../next-handlebars'
import path from 'path'

export async function GET() {
  console.log(await listFoldersWithRouteTs())

  // Determine the current file's directory path
  const currentFilePath = fileURLToPath(import.meta.url)
  const currentDir = path.dirname(currentFilePath)
  // Move from the current directory up to the "views" directory
  const sourceDir = path.join(currentDir, './views')
  
  const hbs = create({
    extname: '.hbs',
    encoding: 'utf8',
    layoutsDir: path.join(sourceDir, './layouts'),
    partialsDir: path.join(sourceDir, './partials'),
    settings: {
      views: sourceDir,
    },
  })
  
  const data = {
    title: 'Handlebars with Next.js',
    message:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam incidunt inventore quaerat, quo dolor hic illum sed voluptas, ratione deleniti ducimus facilis maxime nobis quod, magnam esse nam! Doloremque iste maiores excepturi, nisi mollitia dignissimos sequi voluptates odit qui repellendus ipsa cum eius alias reprehenderit. Ipsam ad animi obcaecati aliquid!',
  }
  
  const finalHtml = await hbs.renderView(path.join(sourceDir, 'page.hbs'), data)
  return new NextResponse(finalHtml, {
    headers: { 'Content-Type': 'text/html' },
  })
}
`;

// File content for views/layouts/main.hbs
const mainHbsContent = `<html lang='en'>
<head>
  <meta charset='UTF-8' />
  <meta name='viewport' content='width=device-width, initial-scale=1.0' />
  <meta http-equiv='X-UA-Compatible' content='ie=edge' />
  <link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.3.1/css/all.css' integrity='sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU' crossorigin='anonymous' />
  <script src='https://kit.fontawesome.com/d15fe57b82.js' crossorigin='anonymous'></script>
  <link rel='stylesheet' href='css/style.css' />
  <title>CodeGig</title>
</head>
<body>
  {{> header}} <!-- Inject Header Partial -->
  <main>
    {{{body}}} <!-- Inject dynamic content -->
  </main>
  {{> footer}} <!-- Inject Footer Partial -->
</body>
</html>
`;

// Placeholder content for page.hbs
const pageHbsContent = 'Page template for Handlebars rendering.';

// Main function to create structure
async function createProjectStructure() {
  const folderName = await promptFolderName();
  if (!folderName) {
    console.error('Error: Folder name cannot be empty.');
    process.exit(1);
  }
  
  const basePath = process.cwd();
  const projectDir = path.join(basePath, folderName);

  // Create the main folder.
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir);
    console.log(`Created folder: ${projectDir}`);
  } else {
    console.error(`Error: Folder "${folderName}" already exists.`);
    process.exit(1);
  }

  // Create route.tsx file in projectDir.
  const routeTsxPath = path.join(projectDir, 'route.tsx');
  fs.writeFileSync(routeTsxPath, routeTsxContent, 'utf8');
  console.log(`Created file: ${routeTsxPath}`);

  // Create the views folder and its subfolders.
  const viewsDir = path.join(projectDir, 'views');
  fs.mkdirSync(viewsDir);
  console.log(`Created folder: ${viewsDir}`);

  // Create page.hbs in the views folder.
  const pageHbsPath = path.join(viewsDir, 'page.hbs');
  fs.writeFileSync(pageHbsPath, pageHbsContent, 'utf8');
  console.log(`Created file: ${pageHbsPath}`);

  // Create layouts folder inside views.
  const layoutsDir = path.join(viewsDir, 'layouts');
  fs.mkdirSync(layoutsDir);
  console.log(`Created folder: ${layoutsDir}`);

  // Create main.hbs in the layouts folder.
  const mainHbsPath = path.join(layoutsDir, 'main.hbs');
  fs.writeFileSync(mainHbsPath, mainHbsContent, 'utf8');
  console.log(`Created file: ${mainHbsPath}`);

  // Create partials folder inside views.
  const partialsDir = path.join(viewsDir, 'partials');
  fs.mkdirSync(partialsDir);
  console.log(`Created folder: ${partialsDir}`);

  console.log('Project structure created successfully.');
}

// Execute the function.
createProjectStructure().catch((error) => {
  console.error('Error creating project structure:', error);
  process.exit(1);
});
