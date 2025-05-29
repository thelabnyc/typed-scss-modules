import { glob } from "glob";

import { alerts } from "./alerts.ts";
import type { ConfigOptions } from "./types.ts";

/**
 * Return the files matching the given pattern and alert the user if only 0 or 1
 * files matched.
 *
 * @param pattern the file pattern to generate type definitions for
 * @param options the CLI options
 */
export const listFilesAndPerformSanityChecks = async (
    pattern: string,
    options: ConfigOptions,
): Promise<string[]> => {
    // Find all the files that match the provided pattern.
    const files = await glob(pattern, { ignore: options.ignore });
    if (!files.length) {
        alerts.error("No files found.");
    }
    // This case still works as expected but it's easy to do on accident so
    // provide a (hopefully) helpful warning.
    if (files.length === 1) {
        alerts.warn(
            `Only 1 file found for ${pattern}. If using a glob pattern (eg: dir/**/*.scss) make sure to wrap in quotes (eg: "dir/**/*.scss").`,
        );
    }
    return files;
};
