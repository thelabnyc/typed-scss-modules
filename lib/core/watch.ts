import chokidar from "chokidar";
import { alerts } from "./alerts.ts";
import { listFilesAndPerformSanityChecks } from "./list-files-and-perform-sanity-checks.ts";
import { removeSCSSTypeDefinitionFile } from "./remove-file.ts";
import type { ConfigOptions } from "./types.ts";
import { writeFile } from "./write-file.ts";

/**
 * Watch a file glob and generate the corresponding types.
 *
 * @param pattern the file pattern to watch for file changes or additions
 * @param options the CLI options
 */
export const watch = (pattern: string, options: ConfigOptions): void => {
  listFilesAndPerformSanityChecks(pattern, options);

  alerts.success("Watching files...");

  chokidar
    .watch(pattern, {
      ignoreInitial: options.ignoreInitial,
      ignored: options.ignore,
    })
    .on("change", (path) => {
      alerts.info(`[CHANGED] ${path}`);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      writeFile(path, options);
    })
    .on("add", (path) => {
      alerts.info(`[ADDED] ${path}`);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      writeFile(path, options);
    })
    .on("unlink", (path) => {
      alerts.info(`[REMOVED] ${path}`);
      removeSCSSTypeDefinitionFile(path, options);
    });
};
