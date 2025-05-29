import fs from "node:fs/promises";

import { getTypeDefinitionPath } from "../typescript/index.ts";
import { alerts } from "./alerts.ts";
import { fileExists } from "./file-exists.ts";
import type { ConfigOptions } from "./index.ts";

/**
 * Given a single file remove the file
 *
 * @param file any file to remove
 */

const removeFile = async (file: string): Promise<void> => {
    try {
        if (await fileExists(file)) {
            await fs.unlink(file);
            alerts.success(`[REMOVED] ${file}`);
        }
    } catch (error) {
        alerts.error(
            `An error occurred removing ${file}:\n${(error as Error).toString()}`,
        );
    }
};

/**
 * Given a single file remove the generated types if they exist
 *
 * @param file the SCSS file to generate types for
 */
export const removeSCSSTypeDefinitionFile = async (
    file: string,
    options: ConfigOptions,
): Promise<void> => {
    const path = getTypeDefinitionPath(file, options);
    await removeFile(path);
};
