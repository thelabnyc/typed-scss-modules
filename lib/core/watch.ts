import path from "node:path";

import chokidar, { type FSWatcher } from "chokidar";
import { minimatch } from "minimatch";

import { alerts } from "./alerts.ts";
import { listFilesAndPerformSanityChecks } from "./list-files-and-perform-sanity-checks.ts";
import { removeSCSSTypeDefinitionFile } from "./remove-file.ts";
import type { ConfigOptions } from "./types.ts";
import { writeFile } from "./write-file.ts";

/**
 * Extract the base directory to watch from a glob pattern
 *
 * @param pattern the glob pattern
 * @returns the base directory to watch
 */
export const getBaseDirectory = (pattern: string): string => {
    // Find the first wildcard character
    const wildcardIndex = Math.min(
        pattern.indexOf("*") !== -1 ? pattern.indexOf("*") : Infinity,
        pattern.indexOf("?") !== -1 ? pattern.indexOf("?") : Infinity,
        pattern.indexOf("[") !== -1 ? pattern.indexOf("[") : Infinity,
        pattern.indexOf("{") !== -1 ? pattern.indexOf("{") : Infinity,
    );

    if (wildcardIndex === Infinity) {
        // No wildcards, just use the directory of the file
        return path.dirname(pattern);
    }

    // Split the path by directory separators
    const parts = pattern.split(path.sep);

    // Find which part contains the first wildcard
    let wildcardPartIndex = 0;
    let currentPosition = 0;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPosition += part.length;

        // Account for the slash in the position calculation
        if (i > 0) currentPosition += 1;

        if (currentPosition > wildcardIndex) {
            wildcardPartIndex = i;
            break;
        }
    }

    // Join all parts before the one with the wildcard
    const baseDir = parts.slice(0, wildcardPartIndex).join(path.sep);

    // If we have a meaningful directory, use it; otherwise use current directory
    return baseDir === "" ? "." : baseDir;
};

/**
 * Create a matcher function that can efficiently test if a file matches the pattern
 *
 * @param pattern the glob pattern
 * @param ignore patterns to ignore
 * @returns a function that tests if a file matches the pattern
 */
export const createMatcher = (
    pattern: string,
    ignore?: string | string[],
): ((filePath: string) => boolean) => {
    const ignorePatterns = ignore
        ? Array.isArray(ignore)
            ? ignore
            : [ignore]
        : [];
    return (filePath: string): boolean => {
        // Check if the file matches the pattern
        const matches = minimatch(filePath, pattern);
        // If it matches the main pattern, make sure it doesn't match any ignore patterns
        if (matches && ignorePatterns.length) {
            for (const ignorePattern of ignorePatterns) {
                if (minimatch(filePath, ignorePattern)) {
                    return false;
                }
            }
        }
        return matches;
    };
};

/**
 * Watch a file glob and generate the corresponding types.
 *
 * @param pattern the file pattern to watch for file changes or additions
 * @param options the CLI options
 */
export const watch = async (
    pattern: string,
    options: ConfigOptions,
): Promise<FSWatcher> => {
    await listFilesAndPerformSanityChecks(pattern, options);

    alerts.success("Watching files...");

    // Get the directory to watch - extract the base directory from the pattern
    const baseDir = getBaseDirectory(pattern);

    // Set up the watcher on the base directory instead of the glob pattern
    const watcher = chokidar.watch(baseDir, {
        ignoreInitial: options.ignoreInitial,
        ignored: options.ignore,
    });

    // Prepare a matcher function once, to be reused for all file events
    const matcher = createMatcher(pattern, options.ignore);

    watcher
        .on("change", (filePath) => {
            if (!matcher(filePath)) {
                return;
            }
            alerts.info(`[CHANGED] ${filePath}`);
            writeFile(filePath, options).catch((err) => {
                console.error(err);
            });
        })
        .on("add", (filePath) => {
            if (!matcher(filePath)) {
                return;
            }
            alerts.info(`[ADDED] ${filePath}`);
            writeFile(filePath, options).catch((err) => {
                console.error(err);
            });
        })
        .on("unlink", (filePath) => {
            if (!matcher(filePath)) {
                return;
            }
            alerts.info(`[REMOVED] ${filePath}`);
            removeSCSSTypeDefinitionFile(filePath, options).catch((err) => {
                console.error(err);
            });
        });

    return watcher;
};
