import type { SASSOptions } from "../sass/index.ts";
import type { ExportType, LogLevel, QuoteType } from "../typescript/index.ts";

type SafeOmit<T, K extends keyof T> = Omit<T, K>;
type ConfigFileOnlyOptionKeys = "importers";

export interface CLIOptions
    extends SafeOmit<SASSOptions, ConfigFileOnlyOptionKeys> {
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
