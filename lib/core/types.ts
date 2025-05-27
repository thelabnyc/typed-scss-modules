import type { SASSOptions } from "../sass/index.ts";
import type { ExportType, LogLevel, QuoteType } from "../typescript/index.ts";

type CLIOnlyOptions = Extract<keyof SASSOptions, "importer">;

export interface CLIOptions extends Exclude<SASSOptions, CLIOnlyOptions> {
  banner: string;
  ignore: string[];
  ignoreInitial: boolean;
  exportType: ExportType;
  exportTypeName: string;
  exportTypeInterface: string;
  listDifferent: boolean;
  quoteType: QuoteType;
  updateStaleOnly: boolean;
  watch: boolean;
  logLevel: LogLevel;
  outputFolder: string | null;
  allowArbitraryExtensions: boolean;
}

export interface ConfigOptions extends CLIOptions, SASSOptions {}
