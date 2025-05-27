import { alerts } from "./alerts.ts";
import { listFilesAndPerformSanityChecks } from "./list-files-and-perform-sanity-checks.ts";
import type { ConfigOptions } from "./types.ts";
import { writeFile } from "./write-file.ts";

/**
 * Given a file glob generate the corresponding types once.
 *
 * @param pattern the file pattern to generate type definitions for
 * @param options the CLI options
 */
export const generate = async (
  pattern: string,
  options: ConfigOptions
): Promise<void> => {
  const files = listFilesAndPerformSanityChecks(pattern, options);

  if (files.length === 0) {
    return;
  }

  alerts.success(
    `Found ${files.length} file${
      files.length === 1 ? `` : `s`
    }. Generating type definitions...`
  );

  // Wait for all the type definitions to be written.
  await Promise.all(files.map((file) => writeFile(file, options)));
};
