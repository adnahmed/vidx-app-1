// src/types/gl-transition-utils.d.ts

declare module 'gl-transition-utils/lib/createWebGLCompiler' {
    const createWebGLCompiler: any;
    export default createWebGLCompiler;
}

declare module 'gl-transition-utils/lib/transformSource' {
    export type UniformDefaultLiteralValue = string | number | boolean | null;
    export type UniformDefaultValue =
        | Array<UniformDefaultLiteralValue>
        | UniformDefaultLiteralValue;

    export type TransitionObject = {
        name: string,
        author: string,
        license: string,
        glsl: string,
        defaultParams: { [key: string]: mixed },
        paramsTypes: { [key: string]: string },
        createdAt: string,
        updatedAt: string,
    }

    export type TransformResult = {
        data: TransitionObject;
        errors: Array<{
            type: 'error' | 'warn';
            message: string;
            code: string;
            line?: number;
            column?: number;
            id?: string;
        }>;
    };

    export default function transformSource(
        filename: string,
        glsl: string
    ): TransformResult;
}
