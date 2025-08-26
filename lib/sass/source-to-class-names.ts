import postcss from "postcss";
import PostcssModulesPlugin from "postcss-modules";

/**
 * Converts a CSS source string to a list of exports (class names, keyframes, etc.)
 */
export const sourceToClassNames = async (
    source: { toString(): string },
    file: string,
) => {
    let result: Record<string, string> = {};
    await postcss([
        {
            postcssPlugin: "custom-strip-composes",
            Declaration(decl, _helper) {
                if (decl.prop == "composes") {
                    decl.remove();
                }
            },
        },
        PostcssModulesPlugin({
            getJSON: (_, json) => {
                result = json;
            },
        }),
    ]).process(source, { from: file });
    return Object.keys(result);
};
