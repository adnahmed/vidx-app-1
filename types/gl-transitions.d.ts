declare module 'gl-transitions' {
    interface TransitionObject {
        name: string,
        author: string,
        license: string,
        glsl: string,
        defaultParams: { [key: string]: mixed },
        paramsTypes: { [key: string]: string },
        createdAt: string,
        updatedAt: string,
    }
    const GLTransitions: TransitionObject[];

    export default GLTransitions;
}