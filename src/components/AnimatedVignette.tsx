import raf from "raf";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import Vignette, { VignetteHandle } from "./Vignette";
export interface AnimatedVignetteProps {
  paused?: boolean;
  transitions: any[];
  transitionsParams?: any[];
  easings?: ((x: number) => number)[];
  images: (string | React.ReactNode)[];
  delay: number;
  duration: number;
  keepRenderingDuringDelay?: boolean;
  // Pass-through props to Vignette:
  width?: number;
  height?: number;
  interaction?: boolean;
  Footer?: React.ComponentType<{ transition: any }>;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
}

export interface AnimatedVignetteState {
  i: number;
}

const AnimatedVignette: React.FC<AnimatedVignetteProps> = ({
  paused = false,
  delay = 0,
  duration = 5000,
  keepRenderingDuringDelay = false,
  transitions,
  transitionsParams,
  easings,
  images,
  ...rest
}) => {
  const [index, setIndex] = useState(0);

  const vignetteRef = useRef<VignetteHandle | null>(null);


  const rafId = useRef<number | null>(null);
  const hovered = useRef(false);
  const running = useRef(false);
  const lastT = useRef(0);
  const endReachedSince = useRef(0);

  const getShouldRun = () => {
    return !paused && !hovered.current && vignetteRef.current;
  };

  const loop = (t: number) => {
    rafId.current = raf(loop);
    const dt = Math.min(t - lastT.current, 100);
    lastT.current = t;

    const vignette = vignetteRef.current;
    if (!vignette) return;

    let progress = vignette.getProgress();
    progress += dt / duration;

    if (progress < 1) {
      vignette.setProgress(progress);
    } else if (endReachedSince.current < delay) {
      endReachedSince.current += dt;
      vignette.setProgress(1, keepRenderingDuringDelay);
    } else {
      setIndex((i) => i + 1);
      endReachedSince.current = 0;
      vignette.setProgress(0);
    }
  };

  const start = () => {
    running.current = true;
    if (rafId.current !== null) raf.cancel(rafId.current);
    rafId.current = raf((t) => {
      lastT.current = t;
      loop(t);
    });
  };

  const stop = () => {
    running.current = false;
    if (rafId.current !== null) {
      raf.cancel(rafId.current);
      rafId.current = null;
    }
  };

  const syncRunning = () => {
    const shouldRun = getShouldRun();
    if (shouldRun !== running.current) {
      if (shouldRun) start();
      else stop();
    }
  };

  const handleHoverIn = () => {
    hovered.current = true;
    syncRunning();
  };

  const handleHoverOut = () => {
    hovered.current = false;
    syncRunning();
    return false;
  };

  const handleRef = (v: VignetteHandle | null) => {
    vignetteRef.current = v;
    syncRunning();
  };

  useEffect(() => {
    syncRunning();
    return () => {
      stop();
    };
  }, [syncRunning, stop]);

  useEffect(() => {
    syncRunning();
  }, [paused]);

  const transition = useMemo(
    () => transitions[index % transitions.length],
    [index, transitions]
  );
  const transitionParam = transitionsParams
    ? transitionsParams[index % transitionsParams.length]
    : undefined;
  const fromImage = images[index % images.length];
  const toImage = images[(index + 1) % images.length];
  const easing = easings ? easings[index % easings.length] : undefined;

  return (
    <Vignette
      ref={handleRef}
      from={fromImage}
      to={toImage}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      transition={transition}
      transitionParams={transitionParam}
      easing={easing}
      {...rest}
    />
  );
};

export default AnimatedVignette;
