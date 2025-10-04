import createWebGLCompiler from 'gl-transition-utils/lib/createWebGLCompiler';
import transformSource, {
    TransitionObject,
} from 'gl-transition-utils/lib/transformSource';

export function defaultSampler2DParamsForType(types: Record<string, string>): Record<string, string> | undefined {
    let res: Record<string, string> | undefined;
    for (const key in types) {
        if (types[key] === 'sampler2D') {
            if (!res) res = {};
            res[key] = '/textures/luma/spiral-2.png';
        }
    }
    return res;
}

export function supplyDefaultSampler2DToTransition(
    transition: TransitionObject
): TransitionObject {
    const sampler2DParams = defaultSampler2DParamsForType(transition.paramsTypes);
    if (!sampler2DParams) return transition;
    return {
        ...transition,
        defaultParams: {
            ...transition.defaultParams,
            ...sampler2DParams,
        },
    };
}

const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
let gl: WebGLRenderingContext | null = null;
let browserWebGLCompiler: ReturnType<typeof createWebGLCompiler> | null = null;

if (canvas) {
    canvas.width = 512;
    canvas.height = 256;
    gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    browserWebGLCompiler = gl && createWebGLCompiler(gl);

    canvas.addEventListener('webglcontextlost', (event) => {
        console.error('WebGL context lost, reloading compiler');
        event.preventDefault();
        browserWebGLCompiler = null;
    });
    canvas.addEventListener('webglcontextrestored', () => {
        console.info('WebGL context lost, reloading compiler');
        if (gl) browserWebGLCompiler = createWebGLCompiler(gl);
    });
}

export default function transform(
    filename: string,
    glsl: string,
    extraErrorsForTransitionResult: (data: any) => any[] = () => []
) {
    const transitionRes = transformSource(filename, glsl);
    const compilationRes = browserWebGLCompiler
        ? browserWebGLCompiler(transitionRes.data)
        : {
            data: null,
            errors: [
                {
                    code: 'WebGL_init_fail',
                    type: 'error',
                    message: !gl
                        ? 'WebGL validation context could not be created!'
                        : 'WebGL validation context is lost!',
                },
            ],
        };

    const extraErrors = extraErrorsForTransitionResult(transitionRes);

    const priority = (e: any): number => {
        return typeof e.line === 'number' && e.line <= glsl.length ? e.line : glsl.length + 1;
    };

    return {
        data: {
            transition: supplyDefaultSampler2DToTransition(transitionRes.data),
            compilation: compilationRes.data,
        },
        errors: [...compilationRes.errors, ...transitionRes.errors, ...extraErrors].sort(
            (a, b) => priority(a) - priority(b)
        ),
    };
}
