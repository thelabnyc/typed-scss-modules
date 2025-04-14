import { SASSOptions } from "../sass";
import { ExportType, LogLevel, QuoteType } from "../typescript";

type AllKeyOf<T> = T extends unknown ? keyof T : never;
type SafeOmit<T, K extends AllKeyOf<T>> = Omit<T, K>;

type ConfigFileOnlyOptionsKeys = "nodeSassImporter" | "sassImporter";
export interface CLIOptions
  extends SafeOmit<SASSOptions, ConfigFileOnlyOptionsKeys> {
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

export type ConfigOptions = CLIOptions & SASSOptions;
