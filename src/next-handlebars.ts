/*
 * Copyright (c) 2015, Yahoo Inc. All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
/*
 * This file is a fork of express-handlebars
 * Some changes were made to make it work with Next.js as smooth as possible
 */

import Handlebars from 'handlebars/dist/handlebars.js';
import * as fs from "graceful-fs";
import * as path from "node:path";
import { promisify } from "node:util";
import { glob } from "glob";
import type {
	UnknownObject,
	HelperDelegateObject,
	ConfigOptions,
	Engine,
	TemplateSpecificationObject,
	TemplateDelegateObject,
	FsCache,
	PartialTemplateOptions,
	PartialsDirObject,
	RenderOptions,
	RenderViewOptions,
	RenderCallback,
	HandlebarsImport,
	CompiledCache,
	PrecompiledCache,
	RenameFunction,
} from "../types";

import { fileURLToPath } from 'node:url'
import { readdir } from 'fs/promises'
const readFile = promisify(fs.readFile);

// -----------------------------------------------------------------------------

const defaultConfig: ConfigOptions = {
  handlebars: Handlebars,
  extname: '.handlebars',
  encoding: 'utf8',
  layoutsDir: undefined, // Default layouts directory is relative to `express settings.view` + `layouts/`
  partialsDir: undefined, // Default partials directory is relative to `express settings.view` + `partials/`
  defaultLayout: 'main',
  helpers: undefined,
  compilerOptions: undefined,
  runtimeOptions: undefined,
};


/**
 * Finds the "app" folder in the project and returns a list of all subfolders
 * that contain a "route.tsx" file. It checks both the presence and absence of a "src" folder.
 *
 * @returns A promise that resolves to an array of subfolder names containing "route.tsx".
 */
export async function findAppSubfoldersWithRouteTsx(): Promise<string[]> {
  const appDirs = ['app', 'src/app']
  const result: string[] = []

  for (const appDir of appDirs) {
    const fullPath = path.resolve(appDir)
    if (fs.existsSync(fullPath)) {
      const entries = await fs.promises.readdir(fullPath, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const routeFile = path.join(fullPath, entry.name, 'route.tsx')
          if (fs.existsSync(routeFile)) {
            result.push(entry.name)
          }
        }
      }
    }
  }

  return result
}
/**
 * A class that provides Handlebars template rendering capabilities with Next.js integration.
 *
 * NextHandlebars extends the functionality of Handlebars by providing:
 * - Template caching and precompilation
 * - Layout support
 * - Partial template management
 * - Express.js view engine compatibility
 * - Custom helper registration
 * - File system integration
 *
 * @example
 * ```typescript
 * const handlebars = new NextHandlebars({
 *   layoutsDir: 'views/layouts',
 *   partialsDir: 'views/partials',
 *   defaultLayout: 'main',
 *   helpers: {
 *     uppercase: (str) => str.toUpperCase()
 *   }
 * });
 *
 * // Render a template
 * const html = await handlebars.render('views/page.hbs', {
 *   title: 'Hello World'
 * });
 * ```
 *
 * @public
 * @class
 *
 * @property {ConfigOptions} config - Configuration options for the instance
 * @property {Engine} engine - Express view engine integration function
 * @property {BufferEncoding} encoding - Character encoding for template files
 * @property {string} layoutsDir - Directory path for layout templates
 * @property {string} extname - File extension for template files
 * @property {CompiledCache} compiled - Cache for compiled templates
 * @property {PrecompiledCache} precompiled - Cache for precompiled templates
 * @property {FsCache} _fsCache - Internal file system cache
 * @property {string | PartialsDirObject | (string | PartialsDirObject)[]} partialsDir - Directory configuration for partial templates
 * @property {CompileOptions} compilerOptions - Options for template compilation
 * @property {RuntimeOptions} runtimeOptions - Options for template runtime
 * @property {HelperDelegateObject} helpers - Registered helper functions
 * @property {string} defaultLayout - Default layout template name
 * @property {HandlebarsImport} handlebars - Handlebars instance
 */
export default class NextHandlebars {
  config: ConfigOptions
  engine: Engine
  encoding: BufferEncoding
  layoutsDir: string
  extname: string
  compiled: CompiledCache
  precompiled: PrecompiledCache
  _fsCache: FsCache
  partialsDir: string | PartialsDirObject | (string | PartialsDirObject)[]
  compilerOptions: CompileOptions
  runtimeOptions: RuntimeOptions
  helpers: HelperDelegateObject
  defaultLayout: string
  handlebars: HandlebarsImport

  constructor(config: ConfigOptions = {}) {
    // Config properties with defaults.
    Object.assign(this, defaultConfig, config)

    // save given config to override other settings.
    this.config = config

    // Express view engine integration point.
    this.engine = this.renderView.bind(this)

    // Normalize `extname`.
    if (this.extname.charAt(0) !== '.') {
      this.extname = '.' + this.extname
    }

    // Internal caches of compiled and precompiled templates.
    this.compiled = {}
    this.precompiled = {}

    // Private internal file system cache.
    this._fsCache = {}
  }

  // This method retrieves all partial templates.
  /**
   * Retrieves and processes Handlebars partial templates from specified directories.
   *
   * This method handles multiple partial template directories and configurations,
   * allowing for namespace organization and custom template naming.
   *
   * @param options - Optional configuration options for template processing
   * @param options.cache - Whether to cache the templates (if supported by the implementation)
   *
   * @returns A promise that resolves to an object containing all processed partial templates.
   * The object keys are the template names (potentially namespaced and renamed),
   * and the values are either template delegates or template specifications.
   *
   * @throws {Error} When a partials directory entry is invalid (neither a string path nor a valid configuration object)
   *
   * @example
   * ```typescript
   *    // Basic usage with directory path
   * const partials = await getPartials();
   *
   *    // With specific configuration
   * const partials = await getPartials({
   *   cache: true
   * });
   * ```
   */
  async getPartials(
    options: PartialTemplateOptions = {},
  ): Promise<TemplateSpecificationObject | TemplateDelegateObject> {
    // If no partials directory is defined, return an empty object.
    if (typeof this.partialsDir === 'undefined') {
      return {}
    }

    // Ensure partialsDir is an array for consistent processing.
    const partialsDirs = Array.isArray(this.partialsDir) ? this.partialsDir : [this.partialsDir]

    // Process each partials directory.
    /**
     * Processes an array of partials directories and returns an array of objects containing templates,
     * namespaces, and rename functions.
     *
     * @param partialsDirs - An array of partials directories which can be either strings representing
     * the directory paths or objects containing the directory path, templates, namespace, and rename function.
     * @param options - Options to be passed to the `getTemplates` method if templates are not provided directly.
     *
     * @returns A promise that resolves to an array of objects, each containing:
     * - `templates`: The compiled Handlebars templates or template specifications.
     * - `namespace`: An optional namespace for the templates.
     * - `rename`: An optional function to rename the templates.
     *
     * @throws Will throw an error if a partials directory entry is neither a string nor an object with a valid configuration.
     */
    const dirs = await Promise.all(
      partialsDirs.map(async (dir) => {
        let dirPath: string
        let dirTemplates: TemplateDelegateObject
        let dirNamespace: string
        let dirRename: RenameFunction

        // Handle different types of partialsDir entries.
        if (typeof dir === 'string') {
          dirPath = dir
        } else if (typeof dir === 'object') {
          dirTemplates = dir.templates
          dirNamespace = dir.namespace
          dirRename = dir.rename
          dirPath = dir.dir
        }

        // Ensure we have a path to templates or the templates themselves.
        if (!dirPath && !dirTemplates) {
          throw new Error('A partials dir must be a string or config object')
        }

        // Retrieve templates from the directory if not provided directly.
        const templates: HandlebarsTemplateDelegate | TemplateSpecification =
          dirTemplates || (await this.getTemplates(dirPath, options))

        return {
          templates: templates as HandlebarsTemplateDelegate | TemplateSpecification,
          namespace: dirNamespace,
          rename: dirRename,
        }
      }),
    )

    // Initialize an object to hold all partial templates.
    const partials: TemplateDelegateObject | TemplateSpecificationObject = {}

    // Process each directory's templates.
    for (const dir of dirs) {
      const { templates, namespace, rename } = dir
      const filePaths = Object.keys(templates)

      // Determine the function to get template names.
      const getTemplateNameFn =
        typeof rename === 'function' ? rename : this._getTemplateName.bind(this)

      // Map each file path to its corresponding template.
      for (const filePath of filePaths) {
        const partialName = getTemplateNameFn(filePath, namespace)
        partials[partialName] = templates[filePath]
      }
    }

    return partials
  }

  /**
   * Retrieves and compiles a Handlebars template from the specified file path.
   *
   * @param filePath - The path to the template file to load
   * @param options - Optional configuration for template loading and compilation
   * @param options.encoding - Character encoding to use when reading the template file
   * @param options.precompiled - Whether to precompile the template
   * @param options.cache - Whether to cache the compiled template
   *
   * @returns Promise that resolves to either a compiled Handlebars template function
   * or a precompiled template specification
   *
   * @throws Error if template file cannot be read or compiled
   *
   * @remarks
   * The method implements template caching to reduce file system I/O. Templates are cached
   * based on their full resolved file path. If there's an error loading/compiling the
   * template, it will be removed from the cache.
   */
  async getTemplate(
    filePath: string,
    options: PartialTemplateOptions = {},
  ): Promise<HandlebarsTemplateDelegate | TemplateSpecification> {
    filePath = path.resolve(filePath)

    const encoding = options.encoding || this.encoding
    const cache: PrecompiledCache | CompiledCache = options.precompiled
      ? this.precompiled
      : this.compiled
    const template: Promise<HandlebarsTemplateDelegate | TemplateSpecification> =
      options.cache && cache[filePath]

    if (template) {
      return template
    }

    // Optimistically cache template promise to reduce file system I/O, but
    // remove from cache if there was a problem.
    try {
      cache[filePath] = this._getFile(filePath, { cache: options.cache, encoding }).then(
        (file: string) => {
          const compileTemplate: (
            file: string,
            options: RuntimeOptions,
          ) => TemplateSpecification | HandlebarsTemplateDelegate = (
            options.precompiled ? this._precompileTemplate : this._compileTemplate
          ).bind(this)
          return compileTemplate(file, this.compilerOptions)
        },
      )
      return await cache[filePath]
    } catch (err) {
      delete cache[filePath]
      throw err
    }
  }

  /**
   * Retrieves and compiles Handlebars templates from a directory.
   *
   * @param dirPath - The path to the directory containing template files
   * @param options - Optional configuration for template compilation
   * @param options.cache - Whether to cache the compiled templates
   *
   * @returns Promise that resolves to either:
   *  - A compiled Handlebars template delegate function
   *  - A template specification object containing multiple templates
   *
   * @throws Error if directory cannot be read or templates cannot be compiled
   *
   * @example
   * ```typescript
   * const templates = await getTemplates('/path/to/templates', { cache: true });
   * ```
   */
  async getTemplates(
    dirPath: string, // Directory path to load templates from
    options: PartialTemplateOptions = {}, // Options for template loading
  ): Promise<HandlebarsTemplateDelegate | TemplateSpecification> {
    // Get cache setting from options
    const cache = options.cache

    // Get array of template file paths in the directory
    const filePaths = await this._getDir(dirPath, { cache })

    // Load and compile all templates in parallel
    const templates = await Promise.all(
      filePaths.map((filePath) => {
        // Join directory path with file path and get compiled template
        return this.getTemplate(path.join(dirPath, filePath), options)
      }),
    )

    // Create hash map of file paths to compiled templates
    const hash = {}
    for (let i = 0; i < filePaths.length; i++) {
      // Map each file path to its corresponding compiled template
      hash[filePaths[i]] = templates[i]
    }

    // Return map of all compiled templates
    return hash
  }

  /**
   * Renders a Handlebars template with the given context and options.
   *
   * @param filePath - Path to the template file to render
   * @param context - Data to pass to the template for rendering. Defaults to empty object.
   * @param options - Additional rendering options
   * @param options.encoding - Character encoding to use when reading template files
   * @param options.cache - Whether to cache template compilation results
   * @param options.partials - Object containing partial templates to register
   * @param options.helpers - Additional helper functions to register
   * @param options.data - Data to pass to helpers through the data channel
   * @param options.runtimeOptions - Additional runtime options passed to Handlebars
   *
   * @returns Promise that resolves to the rendered HTML string
   *
   * @example
   * ```ts
   * const html = await handlebars.render('templates/page.hbs', { title: 'Hello' });
   * ```
   */
  async render(
    filePath: string, // Path to the template file
    context: UnknownObject = {}, // Data context to render into template
    options: RenderOptions = {}, // Rendering configuration options
  ): Promise<string> {
    // Get character encoding, fallback to instance default
    const encoding = options.encoding || this.encoding

    // Load template and partials in parallel for better performance
    const [template, partials] = await Promise.all([
      // Get the main template, compile it and cache if enabled
      this.getTemplate(filePath, {
        cache: options.cache,
        encoding,
      }) as Promise<HandlebarsTemplateDelegate>,

      // Get partials either from options or from instance partials directory
      (options.partials ||
        this.getPartials({ cache: options.cache, encoding })) as Promise<TemplateDelegateObject>,
    ])

    // Merge instance-level and render-level helpers
    const helpers: HelperDelegateObject = { ...this.helpers, ...options.helpers }

    // Merge instance-level and render-level runtime options
    const runtimeOptions = { ...this.runtimeOptions, ...options.runtimeOptions }

    // Setup data channel for templates and helpers
    // Includes NextHandlebars metadata under @exphbs namespace
    const data = {
      ...options.data,
      exphbs: {
        ...options,
        filePath, // Current template path
        helpers, // Combined helpers
        partials, // All available partials
        runtimeOptions, // Runtime configuration
      },
    }

    // Render template with context and all configurations
    const html = this._renderTemplate(template, context, {
      ...runtimeOptions,
      data, // Data channel for @data references
      helpers, // Helper functions
      partials, // Partial templates
    })

    return html
  }

  async renderView(viewPath: string): Promise<string>
  async renderView(viewPath: string, options: RenderViewOptions): Promise<string>
  async renderView(viewPath: string, callback: RenderCallback): Promise<null>
  async renderView(
    viewPath: string,
    options: RenderViewOptions,
    callback: RenderCallback,
  ): Promise<null>
  /**
   * Renders a view with the given options and callback.
   *
   * @param viewPath - The path to the view template file
   * @param options - Optional rendering options or callback function
   * @param callback - Optional callback function to handle the rendered result
   *
   * @returns Promise<string | null> - Returns a promise that resolves with the rendered HTML string,
   *                                  or null if a callback is provided
   *
   * @throws Will throw an error if template rendering fails
   *
   * The function supports both promise-based and callback-based usage:
   * - If no callback is provided, returns a promise
   * - If a callback is provided, calls the callback with (error, result)
   *
   * Rendering features:
   * - Supports layouts through options.layout or defaultLayout
   * - Merges instance and render-level helpers and partials
   * - Handles Express.js view settings if available
   * - Supports custom encoding
   * - Supports template caching
   *
   * @example
   * // Promise-based usage
   * const html = await renderView('path/to/template.hbs', { title: 'Page' });
   *
   * // Callback-based usage
   * renderView('path/to/template.hbs', { title: 'Page' }, (err, html) => {
   *   if (err) console.error(err);
   *   else console.log(html);
   * });
   */
  async renderView(
    viewPath: string, // Path to the view template
    options: RenderViewOptions | RenderCallback = {}, // Rendering options or callback
    callback: RenderCallback | null = null, // Optional callback function
  ): Promise<string | null> {
    // Handle case where options is actually the callback
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    // Cast options to UnknownObject for context data
    const context = options as UnknownObject

    // Setup promise-based handling if no callback provided
    let promise: Promise<string> | null = null
    if (!callback) {
      promise = new Promise((resolve, reject) => {
        callback = (err, value) => {
          if (err !== null) {
            reject(err)
          } else {
            resolve(value)
          }
        }
      })
    }

    // Handle Express.js view resolution
    // Express provides view settings which we use to locate templates
    let view: string
    const views = options.settings && options.settings.views
    const viewsPath = this._resolveViewsPath(views, viewPath)
    if (viewsPath) {
      // Calculate relative path for template name
      view = this._getTemplateName(path.relative(viewsPath, viewPath))
      // Set partials and layouts directories relative to views path
      this.partialsDir = this.config.partialsDir || path.join(viewsPath, 'partials/')
      this.layoutsDir = this.config.layoutsDir || path.join(viewsPath, 'layouts/')
    }

    // Get template encoding from options or use instance default
    const encoding = options.encoding || this.encoding

    // Merge helpers: instance-level helpers and render-specific helpers
    const helpers = { ...this.helpers, ...options.helpers }

    // Merge partials: Get all registered partials and combine with render-specific partials
    const partials: TemplateDelegateObject = {
      ...((await this.getPartials({ cache: options.cache, encoding })) as TemplateDelegateObject),
      ...(options.partials || {}),
    }

    // Prepare final rendering options object
    const renderOptions = {
      cache: options.cache,
      encoding,
      view,
      // Use provided layout or fall back to default layout
      layout: 'layout' in options ? options.layout : this.defaultLayout,
      data: options.data,
      helpers,
      partials,
      runtimeOptions: options.runtimeOptions,
    }

    try {
      // First render the main template
      let html = await this.render(viewPath, context, renderOptions)

      // Get layout path if layout is specified
      const layoutPath = this._resolveLayoutPath(renderOptions.layout)

      if (layoutPath) {
        // Render layout with main content in 'body' variable
        html = await this.render(
          layoutPath,
          { ...context, body: html }, // Pass rendered content as 'body' to layout
          { ...renderOptions, layout: undefined }, // Prevent layout recursion
        )
      }
      callback(null, html)
    } catch (err) {
      callback(err)
    }

    // Return promise if using promise-based API
    return promise
  }

  /**
   * Resets the internal file system cache for specified templates.
   *
   * @param filePathsOrFilter - Optional parameter that can be:
   *   - undefined: Clears entire cache
   *   - string: Single file path to remove from cache
   *   - string[]: Array of file paths to remove from cache
   *   - function: Filter function to select which paths to remove
   */
  resetCache(filePathsOrFilter?: string | string[] | ((template: string) => boolean)) {
    // Array to hold all file paths that need to be removed from cache
    let filePaths: string[] = []

    // If no parameter provided, get all cached file paths
    if (typeof filePathsOrFilter === 'undefined') {
      filePaths = Object.keys(this._fsCache)
    }
    // If single string path provided, create single-item array
    else if (typeof filePathsOrFilter === 'string') {
      filePaths = [filePathsOrFilter]
    }
    // If filter function provided, apply it to all cached paths
    else if (typeof filePathsOrFilter === 'function') {
      filePaths = Object.keys(this._fsCache).filter(filePathsOrFilter)
    }
    // If array of paths provided, use it directly
    else if (Array.isArray(filePathsOrFilter)) {
      filePaths = filePathsOrFilter
    }

    // Remove each specified path from the cache
    for (const filePath of filePaths) {
      delete this._fsCache[filePath]
    }
  }

  // -- Protected Hooks ----------------------------------------------------------

  /**
   * Compiles a Handlebars template string into a template function.
   *
   * @param template - Raw template string to compile
   * @param options - Runtime options for template compilation
   * @returns Compiled template function that can render the template with data
   */
  protected _compileTemplate(
    template: string, // The raw template string to compile
    options: RuntimeOptions = {}, // Optional runtime options for compilation
  ): HandlebarsTemplateDelegate {
    // Trim whitespace from template and compile using Handlebars
    // Returns a template function that can be called with context data
    return this.handlebars.compile(template.trim(), options)
  }

  /**
   * Precompiles a Handlebars template string into a template specification object.
   * This is useful for client-side rendering as it avoids runtime compilation.
   *
   * @param template - Raw template string to precompile
   * @param options - Runtime options for template precompilation
   * @returns Template specification object that can be used with Handlebars.template()
   */
  protected _precompileTemplate(
    template: string, // The raw template string to precompile
    options: RuntimeOptions = {}, // Optional runtime options for precompilation
  ): TemplateSpecification {
    // Trim whitespace and call Handlebars precompile
    // Returns a template specification object rather than a template function
    // The specification can be used later with Handlebars.template() to create a template function
    return this.handlebars.precompile(template.trim(), options)
  }

  /**
   * Renders a compiled Handlebars template with the provided context and runtime options.
   *
   * @param template - The compiled Handlebars template function to execute
   * @param context - Data object containing values to inject into the template
   * @param options - Runtime options to pass to the template render
   * @returns The rendered template string with whitespace trimmed
   */
  protected _renderTemplate(
    template: HandlebarsTemplateDelegate, // Compiled template function from Handlebars
    context: UnknownObject = {}, // Data context object to render into template
    options: RuntimeOptions = {}, // Runtime options like helpers, partials etc
  ): string {
    // Execute template function with context and options
    // Then trim any leading/trailing whitespace from result
    return template(context, options).trim()
  }

  // -- Private ------------------------------------------------------------------

  private async _getDir(dirPath: string, options: PartialTemplateOptions = {}): Promise<string[]> {
    dirPath = path.resolve(dirPath)

    const cache = this._fsCache
    let dir = options.cache && (cache[dirPath] as Promise<string[]>)

    if (dir) {
      return [...(await dir)]
    }

    const pattern = '**/*' + this.extname

    // Optimistically cache dir promise to reduce file system I/O, but remove
    // from cache if there was a problem.

    try {
      dir = cache[dirPath] = glob(pattern, {
        cwd: dirPath,
        follow: true,
        posix: true,
      })
      // @ts-expect-error FIXME: not sure how to throw error in glob for test coverage
      if (options._throwTestError) {
        throw new Error('test')
      }

      return [...(await dir)]
    } catch (err) {
      delete cache[dirPath]
      throw err
    }
  }

  private async _getFile(filePath: string, options: PartialTemplateOptions = {}): Promise<string> {
    filePath = path.resolve(filePath)

    const cache = this._fsCache
    const encoding = options.encoding || this.encoding
    const file = options.cache && (cache[filePath] as Promise<string>)

    if (file) {
      return file
    }

    // Optimistically cache file promise to reduce file system I/O, but remove
    // from cache if there was a problem.
    try {
      cache[filePath] = readFile(filePath, { encoding: encoding || 'utf8' })
      return (await cache[filePath]) as string
    } catch (err) {
      delete cache[filePath]
      throw err
    }
  }

  private _getTemplateName(filePath: string, namespace: string = null): string {
    let name = filePath

    if (name.endsWith(this.extname)) {
      name = name.substring(0, name.length - this.extname.length)
    }

    if (namespace) {
      name = namespace + '/' + name
    }

    return name
  }

  private _resolveViewsPath(views: string | string[], file: string): string | null {
    if (!Array.isArray(views)) {
      return views
    }

    let lastDir = path.resolve(file)
    let dir = path.dirname(lastDir)
    const absoluteViews = views.map((v) => path.resolve(v))

    // find the closest parent
    while (dir !== lastDir) {
      const index = absoluteViews.indexOf(dir)
      if (index >= 0) {
        return views[index]
      }
      lastDir = dir
      dir = path.dirname(lastDir)
    }

    // cannot resolve view
    return null
  }

  private _resolveLayoutPath(layoutPath: string): string | null {
    if (!layoutPath) {
      return null
    }

    if (!path.extname(layoutPath)) {
      layoutPath += this.extname
    }

    return path.resolve(this.layoutsDir || '', layoutPath)
  }
}

// Get current file's directory path
export const currentFilePath = fileURLToPath(import.meta.url)
export const currentDir = path.dirname(currentFilePath)
export const scriptFolder = __dirname
export const sourceDir = path.join(process.cwd(), 'app', '', 'hbs', 'views')

//! Continue here //
//! Continue here //
//! Continue here //
//! Continue here //
// trying to find templates and partials in project folder
export async function listFoldersInCurrentProject(): Promise<string[]> {
  const entries = await readdir(process.cwd(), { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((folder) => path.join(folder.name))
}

export async function listFoldersWithRouteTs(): Promise<string[]> {
  const srcDir = path.resolve('src/app')
  console.log('srcDir', srcDir);
  
  const entries = await fs.promises.readdir(srcDir, { withFileTypes: true })
  const result: string[] = []
console.log('entries', entries);

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const routeFile = path.join(srcDir, entry.name, 'route.ts')
      if (fs.existsSync(routeFile)) {
        result.push(entry.name)
      }
    }
  }

  return result
}
