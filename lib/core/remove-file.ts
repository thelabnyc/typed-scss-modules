import fs from "node:fs";

import { getTypeDefinitionPath } from "../typescript/index.ts";
import { alerts } from "./alerts.ts";
import type { ConfigOptions } from "./index.ts";

/**
 * Given a single file remove the file
 *
 * @param file any file to remove
 */

const removeFile = (file: string): void => {
    try {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            alerts.success(`[REMOVED] ${file}`);
        }
    } catch (error) {
        alerts.error(
            `An error occurred removing ${file}:\n${JSON.stringify(error)}`,
        );
    }
};

/**
 * Given a single file remove the generated types if they exist
 *
 * @param file the SCSS file to generate types for
 */
export const removeSCSSTypeDefinitionFile = (
    file: string,
    options: ConfigOptions,
): void => {
    const path = getTypeDefinitionPath(file, options);
    removeFile(path);
};
