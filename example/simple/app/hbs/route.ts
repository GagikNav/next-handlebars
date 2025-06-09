import { NextResponse } from 'next/server'
import { fileURLToPath } from 'url'
import { create } from '../../../../src/'

import path from 'path'
import { listFoldersWithRouteTs, listFoldersInCurrentProject } from '../../../../src/next-handlebars'

export async function GET() {
  console.dir(await listFoldersWithRouteTs() ,{ depth: null })
  console.dir(await listFoldersInCurrentProject() ,{ depth: null })

  // Get current file's directory path
  const currentFilePath = fileURLToPath(import.meta.url)
  const currentDir = path.dirname(currentFilePath)
  // Navigate up from api/hello to the parent directory
  const sourceDir = path.join(currentDir, './views')
  //Users/gagik/projects/libraries/handlebars-with-nextjs/src/app/hbs/
  const hbs = create({
    extname: '.hbs',
    encoding: 'utf8',
    layoutsDir: path.join(sourceDir, './layouts'),
    partialsDir: path.join(sourceDir, './partials'),
    settings: {
      views: sourceDir, // Set the views directory
    },
  })
  const data = {
    title: 'Handlebars with Next.js',
    message:
      'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ullam incidunt inventore quaerat, quo dolor hic illum sed voluptas, ratione deleniti ducimus facilis maxime nobis quod, magnam esse nam! Doloremque iste maiores excepturi, nisi mollitia dignissimos sequi voluptates odit qui repellendus ipsa cum eius alias reprehenderit. Ipsam ad animi obcaecati aliquid!',
  }
  const finalHtml = await hbs.renderView(path.join(sourceDir, 'page.hbs'), data)
  return new NextResponse(finalHtml, {
    headers: { 'Content-Type': 'text/html' },
  })
}
