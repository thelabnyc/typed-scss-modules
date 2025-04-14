import {
  camelCase,
  camelCaseTransformMerge,
  paramCase,
  snakeCase,
} from "change-case";
import fs from "fs";
import glob from "glob";
import nodeSass from "node-sass";
import path from "path";
import sass from "sass";
import { pathToFileURL } from "url";
import { Aliases, constructImporters, createAliasImporter } from "./importer";
import { sourceToClassNames } from "./source-to-class-names";

export { Aliases };
export type ClassName = string;
interface Transformer {
  (className: ClassName): string;
}

const transformersMap = {
  camel: (className: ClassName) =>
    camelCase(className, { transform: camelCaseTransformMerge }),
  dashes: (className: ClassName) =>
    /-/.test(className) ? camelCase(className) : className,
  kebab: (className: ClassName) => transformersMap.param(className),
  none: (className: ClassName) => className,
  param: (className: ClassName) => paramCase(className),
  snake: (className: ClassName) => snakeCase(className),
} as const;

type NameFormatWithTransformer = keyof typeof transformersMap;
const NAME_FORMATS_WITH_TRANSFORMER = Object.keys(
  transformersMap
) as NameFormatWithTransformer[];

export const NAME_FORMATS = [...NAME_FORMATS_WITH_TRANSFORMER, "all"] as const;
export type NameFormat = (typeof NAME_FORMATS)[number];

type UnArray<T> = Extract<T, unknown[]>[number];

export type SASSOptions = (
  | {
      implementation?: "node-sass";
      nodeSassImporter?: nodeSass.SyncOptions["importer"];
    }
  | {
      implementation: "sass";
      sassImporter?:
        | UnArray<sass.Options<"sync">["importers"]>
        | sass.Options<"sync">["importers"];
    }
) & {
  aliases?: Aliases;
  aliasPrefixes?: Aliases;
  additionalData?: string;
  includePaths?: string[];
  nameFormat?: string | string[];
};
export const nameFormatDefault: NameFormatWithTransformer = "camel";

export const fileToClassNames = async (
  file: string,
  {
    additionalData,
    includePaths = [],
    nameFormat: rawNameFormat,
    aliases,
    aliasPrefixes,
    ...restOptions
  }: SASSOptions = {}
) => {
  const nameFormat = (
    typeof rawNameFormat === "string" ? [rawNameFormat] : rawNameFormat
  ) as NameFormat[];

  const nameFormats: NameFormatWithTransformer[] = nameFormat
    ? nameFormat.includes("all")
      ? NAME_FORMATS_WITH_TRANSFORMER
      : (nameFormat as NameFormatWithTransformer[])
    : [nameFormatDefault];

  const { css } = (() => {
    const data = fs.readFileSync(file).toString();
    const addedData = additionalData ? `${additionalData}\n${data}` : data;

    const aliasImporter = createAliasImporter({
      aliases,
      aliasPrefixes,
    });

    const prependRoot = (
      includePath: string,
      pathname: string,
      defaultRootType: "absolute" | "relative"
    ): string => {
      const rootType = (() => {
        // if `includePath` exists, prepend just a project root path to the mixed path of `includePath` and `pathname`
        if (includePath !== "") {
          return "absolute";
        }

        // like `/src/styles/variables.scss`
        if (pathname.startsWith("/")) {
          return "absolute";
        }

        // like `./variables.scss` or `../variables.scss`
        if (pathname.startsWith(".")) {
          return "relative";
        }

        // like `src/styles/variables.scss` or `variables.scss`
        return defaultRootType;
      })();

      const rootSeedMapping = {
        absolute: "node_modules",
        relative: file,
      };

      return path.join(
        path.dirname(pathToFileURL(rootSeedMapping[rootType]).pathname),
        includePath,
        pathname
      );
    };

    if (restOptions.implementation === "sass") {
      return sass.compileString(addedData, {
        loadPaths: includePaths,
        importers: [
          ...["", ...includePaths].flatMap((includePath) => {
            return [
              {
                findFileUrl: (url: string) => {
                  const aliasedUrl = aliasImporter(url);

                  return new URL(
                    aliasedUrl !== null
                      ? prependRoot(includePath, aliasedUrl, "relative")
                      : prependRoot(includePath, url, "absolute"),
                    "file:"
                  );
                },
              },
              /**
               * A `sass` dedicated importer that returns just a relative URL for a given path.
               * This is for relative paths starting with `./` like `@import "./relative-path.scss";`.
               *
               * `sass` passes such paths to `findFileUrl()` as like `relative-path.scss` not `./relative-path.scss`,
               * because `sass`, as opposed to `node-sass`, removes leading `./`s from the paths.
               *
               * This deletion sometimes misleads the relative paths starting with `./` as absolute.
               * This importer catches these misjudges.
               */
              {
                findFileUrl: (url: string) => {
                  return new URL(
                    prependRoot(includePath, url, "relative"),
                    "file:"
                  );
                },
              },
            ];
          }),
          ...constructImporters(restOptions.sassImporter),
        ],
      });
    } else {
      // NOTE: This scanning logic is just a workaround, implemented to consolidate multiple default importers into a single one.
      const findValidUrl = (targetUrls: string[]): string | undefined => {
        return targetUrls
          .flatMap((targetUrl) => {
            return ["", "_"].map((prefix) => {
              return path.join(
                path.dirname(targetUrl),
                `${prefix}${path.basename(targetUrl)}`
              );
            });
          })
          .find((targetUrl) => {
            const hasExt = path.extname(targetUrl) !== "";

            if (hasExt) {
              return fs.existsSync(targetUrl);
            } else {
              return glob.sync(`${targetUrl}.*`, { nodir: true }).length > 0;
            }
          });
      };

      return nodeSass.renderSync({
        file,
        data: addedData,
        includePaths,
        importer: [
          (url) => {
            const aliasedUrl = aliasImporter(url);

            const foundUrl = findValidUrl([
              ...["", ...includePaths].map((includePath) => {
                return aliasedUrl !== null
                  ? prependRoot(includePath, aliasedUrl, "relative")
                  : prependRoot(includePath, url, "absolute");
              }),
            ]);

            if (foundUrl === undefined) {
              return null;
            }

            return {
              file: foundUrl,
            };
          },
          ...constructImporters(restOptions.nodeSassImporter),
        ],
      });
    }
  })();

  const classNames = await sourceToClassNames(css, file);
  const transformers = nameFormats.map((item) => transformersMap[item]);
  const transformedClassNames = new Set<ClassName>([]);
  classNames.forEach((className: ClassName) => {
    transformers.forEach((transformer: Transformer) => {
      transformedClassNames.add(transformer(className));
    });
  });

  return Array.from(transformedClassNames).sort((a, b) => a.localeCompare(b));
};
