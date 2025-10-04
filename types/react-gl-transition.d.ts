declare module 'react-gl-transition' {
    import { ComponentType, ReactNode } from 'react';

    interface TransitionShader {
        glsl: string;
        defaultParams?: Record<string, any>;
    }
    export interface GLTransitionProps {
        from: ReactNode;
        to: ReactNode;
        progress: number;
        transition: TransitionShader;
        transitionParams?: Record<string, any>;
        onConnectSizeComponentRef?: (ref: { setProgress: (p: number) => void }) => void;
        width?: number;
        height?: number;
    }

    const GLTransition: ComponentType<GLTransitionProps>;

    export default GLTransition;
}