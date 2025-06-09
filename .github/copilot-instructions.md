This project is a TypeScript library that integrates Handlebars templating with Next.js, similar to how express-handlebars works with Express.

Always use TypeScript and prefer Next.js App Router over Pages Router unless specifically requested.

Use the `create` function from 'next-handlebars' to initialize Handlebars instances, not direct class instantiation.

Prefer async/await syntax for template rendering and handle errors gracefully with try/catch blocks.

When showing integration examples, demonstrate both Server Components and API Routes patterns for App Router.

Use `.hbs` as the default file extension for Handlebars templates unless specified otherwise.

Include proper TypeScript types when showing configuration examples, especially for ConfigOptions interface.

For performance optimization, recommend enabling caching in production environments and using precompilation when possible.

When explaining layouts and partials, emphasize the directory structure and naming conventions similar to express-handlebars.
// pages/api/render.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { create } from 'next-handlebars';

const handlebars = create({
  layoutsDir: './views/layouts',
  partialsDir: './views/partials',
  defaultLayout: 'main'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { template, data } = req.body;
    const html = await handlebars.render(template, data);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  }
}

// pages/index.tsx
import { GetServerSideProps } from 'next';
import { handlebars } from '../lib/handlebars';

export const getServerSideProps: GetServerSideProps = async () => {
  const html = await handlebars.render('home', { title: 'Welcome' });
  return { props: { html } };
};

export default function Home({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

## Configuration Options

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
  runtimeOptions?: Handlebars.RuntimeOptions; // Runtime options
}
```

## Best Practices

### 1. File Organization

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

### 2. Helper Functions

```typescript
const handlebars = create({
  helpers: {
    // Format date
    formatDate: (date: Date) => date.toLocaleDateString(),
    
    // Conditional helper
    ifEquals: function(arg1: any, arg2: any, options: any) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    
    // Loop with index
    eachWithIndex: function(array: any[], options: any) {
      let result = '';
      for (let i = 0; i < array.length; i++) {
        result += options.fn({ ...array[i], index: i });
      }
      return result;
    }
  }
});
```

### 3. Layout Structure

```handlebars
{{!-- layouts/main.hbs --}}
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
    {{#if scripts}}
        {{#each scripts}}
            <script src="{{this}}"></script>
        {{/each}}
    {{/if}}
</body>
</html>
```

### 4. Error Handling

```typescript
try {
  const html = await handlebars.render('template', data, {
    layout: 'main',
    helpers: customHelpers,
    cache: process.env.NODE_ENV === 'production'
  });
  return html;
} catch (error) {
  console.error('Template rendering error:', error);
  // Fallback to default template or error page
  return await handlebars.render('error', { 
    message: 'Template rendering failed' 
  });
}
```

## Performance Optimization

### 1. Caching Strategy

```typescript
const handlebars = create({
  // Enable caching in production
  compilerOptions: {
    cache: process.env.NODE_ENV === 'production'
  }
});

// Manual cache management
handlebars.resetCache(); // Clear all cache
handlebars.resetCache(['template1.hbs', 'template2.hbs']); // Clear specific templates
```

### 2. Precompilation (Recommended for Production)

```typescript
// Build-time precompilation
const precompiled = handlebars.precompile(templateString);

// Runtime usage
const template = handlebars.template(precompiled);
const html = template(data);
```

## Middleware Integration

### Next.js Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { create } from 'next-handlebars';

const handlebars = create({
  layoutsDir: './templates/layouts',
  partialsDir: './templates/partials'
});

export async function middleware(request: NextRequest) {
  // Custom template rendering logic
  if (request.nextUrl.pathname.startsWith('/api/template')) {
    // Handle template requests
  }
  
  return NextResponse.next();
}
```

## Testing

### Unit Tests

```typescript
import { create } from 'next-handlebars';

describe('NextHandlebars', () => {
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

  it('should apply layout correctly', async () => {
    const html = await handlebars.render('page', { title: 'Test' }, {
      layout: 'main'
    });
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Test</title>');
  });
});
```

## Migration from Express-Handlebars

### Key Differences

1. **Server Components**: Templates can be rendered in React Server Components
2. **API Routes**: Use Next.js API routes instead of Express routes
3. **File System**: Next.js file-based routing vs Express route definitions
4. **Caching**: Leverage Next.js built-in caching mechanisms

### Migration Steps

1. **Replace Express setup**:
   ```typescript
   // Before (Express)
   app.engine('hbs', exphbs.engine({ defaultLayout: 'main' }));
   app.set('view engine', 'hbs');
   
   // After (Next.js)
   const handlebars = create({ defaultLayout: 'main' });
   ```

2. **Update route handlers**:
   ```typescript
   // Before (Express)
   app.get('/', (req, res) => {
     res.render('home', { title: 'Home' });
   });
   
   // After (Next.js API Route)
   export default async function handler(req, res) {
     const html = await handlebars.render('home', { title: 'Home' });
     res.send(html);
   }
   ```

3. **Template compatibility**: Most Handlebars templates should work without changes

## Common Patterns

### 1. Dynamic Template Selection

```typescript
export default async function Page({ params }: { params: { template: string } }) {
  const templateName = params.template || 'default';
  const data = await fetchDataForTemplate(templateName);
  
  try {
    const html = await handlebars.render(templateName, data);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (error) {
    return <div>Template not found</div>;
  }
}
```

### 2. Internationalization

```typescript
const handlebars = create({
  helpers: {
    t: function(key: string, locale: string) {
      return translations[locale][key] || key;
    }
  }
});

// Usage in template
{{t "welcome.message" locale}}
```

### 3. SEO Integration

```typescript
// Extract metadata from rendered template
const html = await handlebars.render('page', data);
const $ = cheerio.load(html);
const metadata = {
  title: $('title').text(),
  description: $('meta[name="description"]').attr('content')
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: metadata.title,
    description: metadata.description
  };
}
```

## Debugging

### Development Mode

```typescript
const handlebars = create({
  // Enable detailed error messages
  compilerOptions: {
    strict: true,
    assumeObjects: false
  },
  // Log template compilation
  runtimeOptions: {
    debug: process.env.NODE_ENV === 'development'
  }
});
```

### Common Issues

1. **Template not found**: Check file paths and extensions
2. **Helper not defined**: Ensure helpers are registered before use
3. **Layout not applied**: Verify layout directory and default layout settings
4. **Partial not found**: Check partials directory configuration

## Resources

- [Handlebars.js Documentation](https://handlebarsjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)


## Contributing

When working on this project:
1. Follow TypeScript best practices
2. Maintain compatibility with both App Router and Pages Router
3. Add comprehensive tests for new features
4. Update documentation for breaking changes
5. Consider performance implications of new features
