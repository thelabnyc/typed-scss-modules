import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { camelCase, kebabCase, snakeCase } from "change-case";
import * as sass from "sass";

import {
    type Aliases,
    type SASSImporterOptions,
    customImporters,
} from "./importer.ts";
import { sourceToClassNames } from "./source-to-class-names.ts";

export { type Aliases };
export type ClassName = string;
interface Transformer {
    (className: ClassName): string;
}

const transformersMap = {
    camel: (className: ClassName) =>
        camelCase(className, { mergeAmbiguousCharacters: true }),
    dashes: (className: ClassName) =>
        /-/.test(className) ? camelCase(className) : className,
    kebab: (className: ClassName) => kebabCase(className),
    none: (className: ClassName) => className,
    param: (className: ClassName) => kebabCase(className),
    snake: (className: ClassName) => snakeCase(className),
} as const;

type NameFormatWithTransformer = keyof typeof transformersMap;
const NAME_FORMATS_WITH_TRANSFORMER = Object.keys(
    transformersMap,
) as NameFormatWithTransformer[];

export const NAME_FORMATS = [...NAME_FORMATS_WITH_TRANSFORMER, "all"] as const;
export type NameFormat = (typeof NAME_FORMATS)[number];

export interface SASSOptions extends SASSImporterOptions {
    additionalData?: string;
    includePaths?: string[];
    nameFormat?: string | string[];
}

export const nameFormatDefault: NameFormatWithTransformer = "camel";

type CommonCompileOpts = Parameters<typeof sass.compileStringAsync>[1] &
    Parameters<typeof sass.compileAsync>[1];

export const fileToClassNames = async (
    file: string,
    {
        additionalData,
        includePaths = [],
        nameFormat: rawNameFormat,
        aliases = {},
        aliasPrefixes = {},
        importers,
    }: SASSOptions = {} as SASSOptions,
) => {
    const nameFormat = (
        typeof rawNameFormat === "string" ? [rawNameFormat] : rawNameFormat
    ) as NameFormat[];

    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
    const nameFormats: NameFormatWithTransformer[] = nameFormat
        ? nameFormat.includes("all")
            ? NAME_FORMATS_WITH_TRANSFORMER
            : (nameFormat as NameFormatWithTransformer[])
        : [nameFormatDefault];

    const fileContents = additionalData
        ? `${additionalData}\n${(await fs.readFile(file)).toString()}`
        : null;
    const compileOpts: CommonCompileOpts = {
        loadPaths: includePaths,
        importers: customImporters({ aliases, aliasPrefixes, importers }),
    };
    const result = await (fileContents
        ? sass.compileStringAsync(fileContents, {
              ...compileOpts,
              url: pathToFileURL(file),
          })
        : sass.compileAsync(file, compileOpts));

    const classNames = await sourceToClassNames(result.css, file);
    const transformers = nameFormats.map((item) => transformersMap[item]);
    const transformedClassNames = new Set<ClassName>([]);
    classNames.forEach((className: ClassName) => {
        transformers.forEach((transformer: Transformer) => {
            transformedClassNames.add(transformer(className));
        });
    });

    return Array.from(transformedClassNames).sort((a, b) => a.localeCompare(b));
};
