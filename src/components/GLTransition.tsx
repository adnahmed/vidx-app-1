import { Node, connectSize } from "gl-react";
import { forwardRef, useImperativeHandle, useRef } from "react";
type GLTransitionProps = {
  onConnectSizeComponentRef: (ref: any) => void;
  transition: {
    glsl: string;
    defaultParams?: Record<string, any>;
  };
  transitionParams?: Record<string, any>;
  progress: number;
  from: any;
  to: any;
  width?: number;
  height?: number;
};

const GLTransition = forwardRef(({
  transition,
  transitionParams,
  progress,
  from,
  to,
  width = 1,
  height = 1
}: GLTransitionProps, ref) => {
  const nodeRef = useRef<any>(null);

  const getUniformsWithProgress = (progress: number) => ({
    ...(transition.defaultParams || {}),
    ...(transitionParams || {}),
    progress,
    from,
    to,
    ratio: width / height
  });

  useImperativeHandle(
    ref,
    () => ({
      setProgress: (newProgress: number) => {
        nodeRef.current?.setDrawProps({
          uniforms: getUniformsWithProgress(newProgress),
        });
      },
    }),
    [transition, transitionParams, from, to, width, height]
  );
  return (
    <Node
      ref={nodeRef}
      shader={{
        frag: /* glsl */ `
          precision highp float;
          varying vec2 uv;
          uniform float progress, ratio;
          uniform sampler2D from, to;
          vec4 getFromColor(vec2 uv){return texture2D(from, uv);}
          vec4 getToColor(vec2 uv){return texture2D(to, uv);}
          ${transition.glsl}
          void main(){gl_FragColor=transition(uv);}
        `
      }}
      ignoreUnusedUniforms={["ratio"]}
      uniforms={getUniformsWithProgress(progress)}
    />
  );
});
GLTransition.displayName = "GLTransition";

export default connectSize(GLTransition);