import NextHandlebars from "./next-handlebars";



import type {
  ConfigOptions,
} from "../types";

export { NextHandlebars };

export function create (config: ConfigOptions = {}): NextHandlebars {
  return new NextHandlebars(config);
}

export * from './place-holder-function'
