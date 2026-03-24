import "server-only";

import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  name: "ln1",
  level: process.env.LOG_LEVEL ?? "info",
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
      }
    : {}),
});
