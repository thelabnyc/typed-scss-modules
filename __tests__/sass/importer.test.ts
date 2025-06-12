import { pathToFileURL } from "node:url";

import { jest } from "@jest/globals";
import { CanonicalizeContext, NodePackageImporter } from "sass";

import { AliasImporter, customImporters } from "../../lib/sass/importer.ts";

const context: CanonicalizeContext = {
    containingUrl: null,
    fromImport: false,
};

describe("#aliasImporter", () => {
    it("should create an importer to replace aliases and otherwise return null", () => {
        const importer = new AliasImporter({
            aliases: { "input": "output", "~alias": "node_modules" },
            aliasPrefixes: {},
        });

        expect(importer.findFileUrl("input", context)?.pathname).toEqual(
            pathToFileURL("output").pathname,
        );
        expect(importer.findFileUrl("~alias", context)?.pathname).toEqual(
            pathToFileURL("node_modules").pathname,
        );
        expect(importer.findFileUrl("output", context)).toBeNull();
        expect(importer.findFileUrl("input-substring", context)).toBeNull();
        expect(importer.findFileUrl("other", context)).toBeNull();
    });

    it("should create an importer to replace alias prefixes and otherwise return null", () => {
        const importer = new AliasImporter({
            aliases: {},
            aliasPrefixes: { "~": "node_modules/", "abc": "def" },
        });

        expect(importer.findFileUrl("abc-123", context)?.pathname).toEqual(
            pathToFileURL("def-123").pathname,
        );
        expect(importer.findFileUrl("~package", context)?.pathname).toEqual(
            pathToFileURL("node_modules/package").pathname,
        );
        expect(importer.findFileUrl("output~", context)).toBeNull();
        expect(importer.findFileUrl("input-substring-abc", context)).toBeNull();
        expect(importer.findFileUrl("other", context)).toBeNull();
    });

    it("should create an importer to resolve aliases using includePaths first", () => {
        const includePath1 = "__tests__/dummy-styles/include-path-1";
        const includePath2 = "__tests__/dummy-styles/include-path-2";

        const importer = new AliasImporter({
            aliases: {
                "~variables": "variables.scss",
                "~mixins": "mixins.scss",
            },
            aliasPrefixes: {},
            includePaths: [includePath1, includePath2],
        });

        expect(importer.findFileUrl("~variables", context)?.pathname).toEqual(
            pathToFileURL(`${includePath1}/variables.scss`).pathname,
        );
        expect(importer.findFileUrl("~mixins", context)?.pathname).toEqual(
            pathToFileURL(`${includePath2}/mixins.scss`).pathname,
        );

        expect(importer.findFileUrl("@nonexistent", context)).toBeNull();
    });
});

describe("#customImporters", () => {
    beforeEach(() => {
        console.log = jest.fn(); // avoid console logs showing up
    });

    it("should return only an alias importer by default", () => {
        const importers = customImporters({
            aliases: { "~alias": "secret/path" },
            aliasPrefixes: { "~": "node_modules/" },
        });

        expect(importers).toHaveLength(1);

        const [aliasImporter] = importers;

        if (!(aliasImporter instanceof AliasImporter)) {
            throw new Error(
                "Expected aliasImporter to be instance of AliasImporter",
            );
        }

        expect(
            aliasImporter.findFileUrl("~package", context)?.pathname,
        ).toEqual(pathToFileURL("node_modules/package").pathname);
        expect(aliasImporter.findFileUrl("~alias", context)?.pathname).toEqual(
            pathToFileURL("secret/path").pathname,
        );
        expect(aliasImporter.findFileUrl("other", context)).toBeNull();
    });

    it("should add additional importers if passed a function", () => {
        const importer = new NodePackageImporter();

        const importers = customImporters({
            aliases: {},
            aliasPrefixes: {},
            importers: [importer],
        });

        expect(importers).toHaveLength(2);
        expect(importers[1]).toEqual(importer);
    });

    it("should add multiple importers if passed an array", () => {
        const importer1 = new NodePackageImporter();
        const importer2 = new NodePackageImporter();
        const importer3 = new NodePackageImporter();

        const importers = customImporters({
            aliases: {},
            aliasPrefixes: {},
            importers: [importer1, importer2, importer3],
        });

        expect(importers).toHaveLength(4);
        expect(importers[1]).toEqual(importer1);
        expect(importers[2]).toEqual(importer2);
        expect(importers[3]).toEqual(importer3);
    });
});
