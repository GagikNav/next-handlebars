# next-handlebars

[![npm version](https://badge.fury.io/js/next-handlebars.svg)](https://badge.fury.io/js/next-handlebars)
[![CI](https://github.com/GagikNav/next-handlebars/actions/workflows/ci.yml/badge.svg)](https://github.com/GagikNav/next-handlebars/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/GagikNav/next-handlebars/branch/main/graph/badge.svg)](https://codecov.io/gh/GagikNav/next-handlebars)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Handlebars templating engine integration for Next.js, providing server-side template rendering with layouts, partials, and helpers support. Similar to `express-handlebars` but designed specifically for Next.js applications.

## 🚀 Features

- 🎯 **Next.js Optimized**: Built specifically for Next.js App Router and Pages Router
- 📱 **Server-Side Rendering**: Full SSR support with React Server Components
- 🎨 **Layouts & Partials**: Hierarchical template organization
- 🛠️ **Custom Helpers**: Extend Handlebars with custom functionality
- ⚡ **Performance**: Built-in caching and precompilation support
- 📝 **TypeScript**: Full TypeScript support with comprehensive types
- 🔧 **Flexible**: Compatible with both file-based and string templates

## 📦 Installation

```bash
npm install next-handlebars
# or
yarn add next-handlebars
# or
pnpm add next-handlebars
```

## 🏁 Quick Start

### Basic Usage

```typescript
import { create } from 'next-handlebars';

const handlebars = create({
  layoutsDir: './templates/layouts',
  partialsDir: './templates/partials',
  defaultLayout: 'main',
  extname: '.hbs'
});

// Render a template
const html = await handlebars.render('home', {
  title: 'Welcome',
  message: 'Hello World!'
});
```

### Next.js App Router (Server Components)

```typescript
// app/page.tsx
import { create } from 'next-handlebars';

const handlebars = create({
  layoutsDir: './templates/layouts',
  partialsDir: './templates/partials'
});

export default async function HomePage() {
  const html = await handlebars.render('home', {
    title: 'Home Page',
    users: [
      { name: 'John', email: 'john@example.com' },
      { name: 'Jane', email: 'jane@example.com' }
    ]
  });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### Next.js API Routes

```typescript
// app/api/render/route.ts
import { create } from 'next-handlebars';
import { NextRequest, NextResponse } from 'next/server';

const handlebars = create({
  layoutsDir: './templates/layouts',
  partialsDir: './templates/partials'
});

export async function POST(request: NextRequest) {
  const { template, data } = await request.json();
  
  try {
    const html = await handlebars.render(template, data);
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Template rendering failed' }, { status: 500 });
  }
}
```

## 📁 Directory Structure

```
your-nextjs-app/
├── templates/
│   ├── layouts/
│   │   ├── main.hbs
│   │   └── admin.hbs
│   ├── partials/
│   │   ├── header.hbs
│   │   ├── footer.hbs
│   │   └── navigation.hbs
│   └── pages/
│       ├── home.hbs
│       ├── about.hbs
│       └── contact.hbs
```

## ⚙️ Configuration

```typescript
interface ConfigOptions {
  handlebars?: HandlebarsImport;     // Custom Handlebars instance
  extname?: string;                  // Template file extension (.handlebars, .hbs)
  encoding?: BufferEncoding;         // File encoding (utf8)
  layoutsDir?: string;              // Layouts directory path
  partialsDir?: string|string[]|PartialsDirObject|PartialsDirObject[];
  defaultLayout?: string|false;      // Default layout template
  helpers?: UnknownObject;          // Custom helper functions
  compilerOptions?: CompileOptions; // Handlebars compiler options
  runtimeOptions?: RuntimeOptions;  // Runtime options
}
```

## 🎨 Template Examples

### Layout Template (`layouts/main.hbs`)

```handlebars
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    {{#if styles}}
        {{#each styles}}
            <link rel="stylesheet" href="{{this}}">
        {{/each}}
    {{/if}}
</head>
<body>
    {{> header}}
    <main>
        {{{body}}}
    </main>
    {{> footer}}
</body>
</html>
```

### Page Template (`pages/home.hbs`)

```handlebars
<div class="hero">
    <h1>{{title}}</h1>
    <p>{{description}}</p>
</div>

<section class="users">
    <h2>Users</h2>
    {{#each users}}
        <div class="user-card">
            <h3>{{name}}</h3>
            <p>{{email}}</p>
        </div>
    {{/each}}
</section>
```

## 🛠️ Custom Helpers

```typescript
const handlebars = create({
  helpers: {
    // Format date
    formatDate: (date: Date) => date.toLocaleDateString(),
    
    // Conditional helper
    ifEquals: function(arg1: any, arg2: any, options: any) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    
    // JSON stringify
    json: (context: any) => JSON.stringify(context, null, 2)
  }
});
```

## 🚀 Performance Optimization

### Caching

```typescript
const handlebars = create({
  // Enable caching in production
  compilerOptions: {
    cache: process.env.NODE_ENV === 'production'
  }
});

// Manual cache management
handlebars.resetCache(); // Clear all cache
handlebars.resetCache(['template1.hbs']); // Clear specific templates
```

### Precompilation

```typescript
// Build-time precompilation for better performance
const precompiled = handlebars.precompile(templateString);
const template = handlebars.template(precompiled);
const html = template(data);
```

## 🧪 Testing

```typescript
import { create } from 'next-handlebars';

describe('Template Rendering', () => {
  const handlebars = create({
    layoutsDir: './test/fixtures/layouts',
    partialsDir: './test/fixtures/partials'
  });

  it('should render template with data', async () => {
    const html = await handlebars.render('test-template', {
      title: 'Test Title',
      content: 'Test Content'
    });
    
    expect(html).toContain('Test Title');
    expect(html).toContain('Test Content');
  });
});
```

## 📋 API Reference

### `create(config?)`

Creates a new NextHandlebars instance.

**Parameters:**
- `config` (optional): Configuration options

**Returns:** NextHandlebars instance

### `handlebars.render(template, context, options?)`

Renders a template with the given context.

**Parameters:**
- `template`: Template file path or name
- `context`: Data object to pass to template
- `options` (optional): Render options

**Returns:** Promise<string> - Rendered HTML

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This project is based on the excellent work of the [express-handlebars](https://github.com/ericf/express-handlebars) project. We're grateful for their contributions to the open-source community.

## 📞 Support

- 📫 [Issues](https://github.com/GagikNav/next-handlebars/issues)
- 💬 [Discussions](https://github.com/GagikNav/next-handlebars/discussions)
- 📖 [Documentation](https://github.com/GagikNav/next-handlebars#readme)
