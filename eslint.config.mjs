import path from "node:path";
import { fileURLToPath } from "node:url";

import { getTSConfig } from "@thelabnyc/standards/eslint.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default getTSConfig({
    parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: {
            allowDefaultProject: [".commitlintrc.ts", "eslint.config.mjs"],
        },
    },
    configs: [
        {
            ignores: [
                "dist/**/*",
                "prettier.config.js",
                "__tests__/configs/js-default-export/typed-scss-modules.config.js",
                "__tests__/configs/js-module-exports/typed-scss-modules.config.cjs",
                "__tests__/configs/js-named-export/typed-scss-modules.config.js",
                "__tests__/dummy-styles/typed-scss-modules.config.js",
                "examples/config-file/typed-scss-modules.config.js",
                "examples/output-folder/typed-scss-modules.config.js",
            ],
        },
    ],
});
