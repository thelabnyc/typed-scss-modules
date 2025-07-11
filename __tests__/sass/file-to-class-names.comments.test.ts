import path from "node:path";
import { fileToClassNames } from "../../lib/sass/index.ts";

const base = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../dummy-styles");

describe("fileToClassNames – SASS comments", () => {
  it("ignores // comments", async () => {
    const result = await fileToClassNames(`${base}/comments-single-line.scss`);
    expect(result).toEqual(["anotherClass", "commentedClass", "finalClass", "mixinUser", "thirdClass"]);
  });

  it("ignores /* */ comments", async () => {
    const result = await fileToClassNames(`${base}/comments-multi-line.scss`);
    expect(result).toEqual(["anotherClass", "commentedClass", "finalClass", "mixinUser", "thirdClass"]);
  });

  it("ignores comments in modules used through CSS modules composes", async () => {
    const result = await fileToClassNames(`${base}/composes-from-sass-comments.scss`);
    expect(result).toContain('composedClass');
  });
});
