import { Type } from "@sinclair/typebox";

export const uploadedFilesKeyQuerySchema = Type.Object({
  key: Type.String({ minLength: 1 }),
});

export const uploadedFilesIdParamsSchema = Type.Object({
  id: Type.Transform(Type.String())
    .Decode((v) => Number.parseInt(v, 10))
    .Encode((v) => String(v)),
});
