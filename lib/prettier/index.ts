import prettier from "prettier";
import { alerts } from "../core/index.ts";


/**
 * Format input using prettier
 *
 * @param {file} file
 * @param {string} input
 */
export const applyPrettier = async (file: string, input: string) => {
  try {
    const config = await prettier.resolveConfig(file, {
      editorconfig: true,
    });
    // try to return formatted output
    return prettier.format(input, { ...config, parser: "typescript" });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    alerts.notice(`Tried using prettier, but failed with error: ${error}`);
  }

  // failed to format
  return input;
};
