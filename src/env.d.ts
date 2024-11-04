/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly REVISION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}