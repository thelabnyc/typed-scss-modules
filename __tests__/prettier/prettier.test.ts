import {jest} from "@jest/globals";
import path from "node:path";
import prettier from "prettier";
import { applyPrettier } from "../../lib/prettier/index.ts";
import { classNamesToTypeDefinitions } from "../../lib/typescript/index.ts";

import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, "test.d.ts");
const input =
  "export type Styles = {'myClass': string;'yourClass': string;}; export type Classes = keyof Styles; declare const styles: Styles; export default styles;";

describe("applyPrettier", () => {
  it("should locate and apply prettier.format", async () => {
    const output = await applyPrettier(file, input);

    expect(await prettier.format(input, { parser: "typescript" })).toMatch(output);
  });

  it("should match snapshot", async () => {
    const typeDefinition = await classNamesToTypeDefinitions({
      banner: "",
      classNames: ["nestedAnother", "nestedClass", "someStyles"],
      file,
      exportType: "default",
    });

    if (!typeDefinition) {
      throw new Error("failed to collect typeDefinition");
    }

    const output = await applyPrettier(file, typeDefinition);

    expect(output).toMatchSnapshot();
  });
});

