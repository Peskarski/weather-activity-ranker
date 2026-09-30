import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../server/src/graphql/schema.graphql",
  documents: ["src/**/*.{ts,tsx}", "!src/shared/api/generated/**"],
  ignoreNoDocuments: true,
  generates: {
    "src/shared/api/generated/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: "string",
        enumsAsTypes: true,
        useTypeImports: true,
      },
    },
  },
};

export default config;
