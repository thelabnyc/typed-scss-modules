type AliasImporter = (url: string) => string | null;

export interface Aliases {
  [index: string]: string;
}

interface AliasImporterOptions {
  aliases?: Aliases;
  aliasPrefixes?: Aliases;
}

/**
 * Create a base SASS importer to resolve aliases for imports.
 */
export const createAliasImporter = ({
  aliases = {},
  aliasPrefixes = {},
}: AliasImporterOptions): AliasImporter => {
  return (url) => {
    if (aliases[url] !== undefined) {
      return aliases[url];
    }

    const prefixMatch = Object.keys(aliasPrefixes).find((prefix) =>
      url.startsWith(prefix)
    );

    if (prefixMatch) {
      return aliasPrefixes[prefixMatch] + url.substr(prefixMatch.length);
    }

    return null;
  };
};

/**
 * Simply construct a clear array of custom SASS importers from an ambiguous input.
 */
export const constructImporters = <I>(importer: I | I[] | undefined): I[] => {
  if (importer === undefined) {
    return [];
  }

  if (!Array.isArray(importer)) {
    return [importer];
  }

  return importer;
};
