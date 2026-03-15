import { Type } from "@sinclair/typebox";

export const issueIdParamsSchema = Type.Object({
  issueId: Type.Number(),
});
