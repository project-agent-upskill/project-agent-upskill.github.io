export {};

declare global {
  interface Document {
    readonly modelContext?: {
      registerTool(
        tool: {
          name: string;
          title?: string;
          description: string;
          inputSchema: object;
        execute(input: unknown): Record<string, unknown> | Promise<unknown>;
          annotations?: {
            readOnlyHint?: boolean;
            untrustedContentHint?: boolean;
          };
        },
        options?: { signal?: AbortSignal },
      ): void | Promise<void>;
    };
  }
}
