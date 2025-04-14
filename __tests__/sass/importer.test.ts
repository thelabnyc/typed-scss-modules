import {
  constructImporters,
  createAliasImporter,
} from "../../lib/sass/importer";

describe("#createAliasImporter", () => {
  it("should create an importer to replace aliases and otherwise return null", () => {
    const aliasImporter = createAliasImporter({
      aliases: { input: "output", "~alias": "node_modules" },
      aliasPrefixes: {},
    });

    expect(aliasImporter("input")).toBe("output");
    expect(aliasImporter("~alias")).toBe("node_modules");
    expect(aliasImporter("output")).toBeNull();
    expect(aliasImporter("input-substring")).toBeNull();
    expect(aliasImporter("other")).toBeNull();
  });

  it("should create an importer to replace alias prefixes and otherwise return null", () => {
    const aliasImporter = createAliasImporter({
      aliases: {},
      aliasPrefixes: { "~": "node_modules/", abc: "def" },
    });

    expect(aliasImporter("abc-123")).toBe("def-123");
    expect(aliasImporter("~package")).toBe("node_modules/package");
    expect(aliasImporter("output~")).toBeNull();
    expect(aliasImporter("input-substring-abc")).toBeNull();
    expect(aliasImporter("other")).toBeNull();
  });

  it("should create an importer to replace both aliases and alias prefixes and otherwise return null", () => {
    const aliasImporter = createAliasImporter({
      aliases: { "~alias": "secret/path" },
      aliasPrefixes: { "~": "node_modules/" },
    });

    expect(aliasImporter("~package")).toBe("node_modules/package");
    expect(aliasImporter("~alias")).toBe("secret/path");
    expect(aliasImporter("other")).toBeNull();
  });
});

describe("#constructImporters", () => {
  beforeEach(() => {
    console.log = jest.fn(); // avoid console logs showing up
  });

  it("should return an empty array if passed undefined", () => {
    const importers = constructImporters(undefined);

    expect(importers).toEqual([]);
  });

  it("should return an array of a single importer if passed a function", () => {
    const importer = jest.fn();

    const importers = constructImporters(importer);

    expect(importers).toEqual([importer]);
  });

  it("should return multiple importers if passed an array", () => {
    const importer1 = jest.fn();
    const importer2 = jest.fn();
    const importer3 = jest.fn();

    const importers = constructImporters([importer1, importer2, importer3]);

    expect(importers).toEqual([importer1, importer2, importer3]);
  });
});
