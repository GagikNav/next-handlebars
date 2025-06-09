import { create } from '../src';
import path from 'path';

describe('NextHandlebars', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  
  describe('create function', () => {
    it('should create a NextHandlebars instance', () => {
      const handlebars = create();
      expect(handlebars).toBeDefined();
      expect(typeof handlebars.render).toBe('function');
    });

    it('should create instance with custom config', () => {
      const handlebars = create({
        extname: '.hbs',
        defaultLayout: 'main',
        layoutsDir: path.join(fixturesDir, 'layouts'),
        partialsDir: path.join(fixturesDir, 'partials'),
      });
      
      expect(handlebars.extname).toBe('.hbs');
      expect(handlebars.defaultLayout).toBe('main');
    });
  });

  describe('template rendering', () => {
    let handlebars: any;

    beforeEach(() => {
      handlebars = create({
        layoutsDir: path.join(fixturesDir, 'layouts'),
        partialsDir: path.join(fixturesDir, 'partials'),
      });
    });

    it('should render simple template', async () => {
      const templatePath = path.join(fixturesDir, 'templates', 'simple.handlebars');
      const context = { title: 'Test Title', message: 'Hello World' };
      
      // Create test template
      require('fs').writeFileSync(templatePath, '<h1>{{title}}</h1><p>{{message}}</p>');
      
      const result = await handlebars.render(templatePath, context);
      expect(result).toContain('<h1>Test Title</h1>');
      expect(result).toContain('<p>Hello World</p>');
    });
  });

  describe('error handling', () => {
    it('should handle missing template gracefully', async () => {
      const handlebars = create();
      
      await expect(
        handlebars.render('non-existent-template.handlebars', {})
      ).rejects.toThrow();
    });
  });
});
