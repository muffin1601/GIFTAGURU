import { z } from "zod";

/**
 * A boolean read from a form field: true only for the exact string "true".
 *
 * Do not use `z.coerce.boolean()` for form data. It is `Boolean(value)`, so the
 * string "false" becomes true, and pairing it with `.default(true)` turns an
 * unticked checkbox (which submits nothing) into true as well.
 *
 * Works for both checkboxes (`value="true"`, absent when unticked) and hidden
 * toggle inputs (`value="true"` / `value="false"`).
 */
export const formBoolean = z.preprocess((value) => value === "true" || value === "on", z.boolean());
