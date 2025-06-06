import { pathToFileURL } from "node:url";

import type {
    CanonicalizeContext,
    FileImporter,
    Importer,
    Options,
} from "sass";

export type { Importer, FileImporter };

export type AnyImporter = Exclude<
    Options<"sync">["importers"] | Options<"async">["importers"],
    undefined
>[number];

export interface Aliases {
    [index: string]: string;
}

interface AliasImporterOptions {
    aliases: Aliases;
    aliasPrefixes: Aliases;
    includePaths?: string[];
}

export class AliasImporter implements FileImporter<"sync"> {
    public readonly opts: Readonly<AliasImporterOptions>;

    constructor(opts: AliasImporterOptions) {
        this.opts = opts;
    }

    public readonly findFileUrl = (
        url: string,
        ctx: CanonicalizeContext,
    ): URL | null => {
        if (url in this.opts.aliases) {
            const file = this.opts.aliases[url];

            // Try to resolve using includePaths first
            if (this.opts.includePaths && this.opts.includePaths.length > 0) {
                for (const includePath of this.opts.includePaths) {
                    const basePath = pathToFileURL(includePath + "/");
                    const resolvedUrl = new URL(file, basePath);
                    return resolvedUrl;
                }
            }

            // Fallback to resolve relative to the containing file's directory
            const basePath = ctx.containingUrl
                ? new URL("./", ctx.containingUrl)
                : pathToFileURL(process.cwd() + "/");
            const resolvedUrl = new URL(file, basePath);
            return resolvedUrl;
        }

        const prefixMatch = Object.keys(this.opts.aliasPrefixes).find(
            (prefix) => url.startsWith(prefix),
        );
        if (prefixMatch) {
            const basePath = ctx.containingUrl || pathToFileURL("node_modules");
            return new URL(
                this.opts.aliasPrefixes[prefixMatch] +
                    url.substr(prefixMatch.length),
                basePath,
            );
        }

        return null;
    };
}

export interface SASSImporterOptions {
    aliases?: Aliases;
    aliasPrefixes?: Aliases;
    importers?: AnyImporter[];
    includePaths?: string[];
}

/**
 * Construct custom SASS importers based on options.
 *
 *  - Given aliases and alias prefix options, add a custom alias importer.
 *  - Given custom SASS importer(s), append to the list of importers.
 */
export const customImporters = (opts: SASSImporterOptions): AnyImporter[] => {
    let importers: AnyImporter[] = [
        new AliasImporter({
            aliases: opts.aliases || {},
            aliasPrefixes: opts.aliasPrefixes || {},
            includePaths: opts.includePaths || [],
        }),
    ];

    if (opts.importers) {
        importers = importers.concat(opts.importers);
    }

    return importers;
};
