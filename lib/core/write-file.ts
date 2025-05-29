import fs from "node:fs/promises";
import path from "node:path";

import { fileToClassNames } from "../sass/index.ts";
import {
    classNamesToTypeDefinitions,
    getTypeDefinitionPath,
} from "../typescript/index.ts";
import { alerts } from "./alerts.ts";
import { fileExists } from "./file-exists.ts";
import { removeSCSSTypeDefinitionFile } from "./remove-file.ts";
import type { CLIOptions } from "./types.ts";

/**
 * Given a single file generate the proper types.
 *
 * @param file the SCSS file to generate types for
 * @param options the CLI options
 */
export const writeFile = async (
    file: string,
    options: CLIOptions,
): Promise<void> => {
    try {
        const classNames = await fileToClassNames(file, options);
        const typeDefinition = await classNamesToTypeDefinitions({
            classNames,
            file,
            ...options,
        });

        const typesPath = getTypeDefinitionPath(file, options);
        const typesExist = await fileExists(typesPath);

        // Avoid outputting empty type definition files.
        // If the file exists and the type definition is now empty, remove the file.
        if (!typeDefinition) {
            if (typesExist) {
                await removeSCSSTypeDefinitionFile(file, options);
            } else {
                alerts.notice(`[NO GENERATED TYPES] ${file}`);
            }
            return;
        }

        // Avoid re-writing the file if it hasn't changed.
        // First by checking the file modification time, then
        // by comparing the file contents.
        if (options.updateStaleOnly && typesExist) {
            const fileModified = (await fs.stat(file)).mtime;
            const typeDefinitionModified = (await fs.stat(typesPath)).mtime;
            if (fileModified < typeDefinitionModified) {
                return;
            }

            const existingTypeDefinition = await fs.readFile(typesPath, "utf8");
            if (existingTypeDefinition === typeDefinition) {
                return;
            }
        }

        // Files can be written to arbitrary directories and need to
        // be nested to match the project structure so it's possible
        // there are multiple directories that need to be created.
        const dirname = path.dirname(typesPath);
        await fs.mkdir(dirname, { recursive: true });
        await fs.writeFile(typesPath, typeDefinition);
        alerts.success(`[GENERATED TYPES] ${typesPath}`);
    } catch (error) {
        alerts.error(
            `An error occurred generating type definitions for ${file}:\n${(error as Error).toString()}`,
        );
    }
};
