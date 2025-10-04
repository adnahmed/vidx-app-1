import GLTransition from "@/components/GLTransition";
import { Visitor } from "gl-react";
import { Surface } from "gl-react-dom";
import type React from "react";
import {
	forwardRef,
	type MouseEvent,
	type ReactNode,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import styles from "./Vignette.module.css";
export interface VignetteHandle {
		getProgress: () => number;
		setProgress: (value: number, forceRender?: boolean) => void;
	}

const defaultProgress = 0.3;

export interface VignetteProps {
		transition: any;
		transitionParams?: Record<string, any>;
		from: ReactNode;
		to: ReactNode;
		width?: number;
		height?: number;
		easing?: (x: number) => number;
		children?: React.ReactNode;
		Footer?: React.ComponentType<{ transition: any }>;
		onHoverIn?: () => void;
		onHoverOut?: () => boolean | void;
		interaction?: boolean;
		onDrawWithProgress?: (x: number) => void;
		preload?: any[];
	}

export interface VignetteState {
		hoverValue: number;
		hover: boolean;
		failing: Error | null;
	}

const hoverValueFromEvent = (e: MouseEvent): number => {
	const rect = (e.target as HTMLElement).getBoundingClientRect();
	return (e.clientX - rect.left) / rect.width;
};

class SurfaceVisitor extends Visitor {
	vignette: {
		setFailing: (error: Error | null) => void;
		getFailing: () => Error | null;
	};

	constructor(vignette: SurfaceVisitor["vignette"]) {
		super();
		this.vignette = vignette;
	}

	onSurfaceDrawEnd() {
		if (this.vignette.getFailing()) {
			this.vignette.setFailing(null);
		}
	}

	onSurfaceDrawError(error: Error) {
		if (!this.vignette.getFailing()) {
			this.vignette.setFailing(error);
		}
		return true;
	}
}

const Vignette = forwardRef<VignetteHandle, VignetteProps>(
	(
		{
			transition,
			transitionParams,
			from,
			to,
			width = 300,
			height = 200,
			easing,
			Footer,
			onHoverIn,
			onHoverOut,
			interaction = true,
			onDrawWithProgress,
			preload,
		},
		ref,
	) => {
		const [hoverValue, setHoverValue] = useState(0);
		const [hover, setHover] = useState(false);
		const [failing, setFailing] = useState<Error | null>(null);

		const cachedProgress = useRef(defaultProgress);
		const setProgressRef = useRef<((progress: number) => void) | null>(null);

		const getProgress = () => cachedProgress.current;

		const setProgress = (value: number, forceRendering = false) => {
			if (cachedProgress.current === value && !forceRendering) return;
			cachedProgress.current = value;
			if (setProgressRef.current && !failing) {
				const finalProgress = easing ? easing(value) : value;
				setProgressRef.current(finalProgress);
				onDrawWithProgress?.(value);
			}
		};

		useImperativeHandle(
			ref,
			() => ({
				getProgress,
				setProgress,
			}),
			[getProgress, setProgress],
		);

		const visitorRef = useRef(
			new SurfaceVisitor({
				setFailing,
				getFailing: () => failing,
			}),
		);

		useEffect(() => {
			onDrawWithProgress?.(getProgress());
		}, [onDrawWithProgress]);

		useEffect(() => {
			if (hover && onHoverOut) {
				setHover(false);
				onHoverOut();
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [interaction]);

		const handleMouseEnter = (e: MouseEvent) => {
			setHoverValue(hoverValueFromEvent(e));
			setHover(true);
			onHoverIn?.();
		};

		const handleMouseMove = (e: MouseEvent) => {
			const newValue = hoverValueFromEvent(e);
			const p = Math.max(0, Math.min(-0.1 + newValue / 0.8, 1));
			cachedProgress.current = p;
			setHoverValue(newValue);
		};

		const handleMouseLeave = () => {
			setHover(false);
			if (!onHoverOut || onHoverOut() !== false) {
				setProgress(defaultProgress);
			}
		};

		const handleConnectRef = (
			glt: { setProgress: (p: number) => void } | null,
		) => {
			setProgressRef.current = glt?.setProgress || null;
		};

		const handleContextLost = () => {
			console.warn("WebGL context lost!");
		};

		const handleContextRestored = () => {
			console.info("WebGL context restored!");
			// You may need to reinitialize resources or shaders here.
		};

		const progress = easing ? easing(getProgress()) : getProgress();
		return (
			<div
				role="img"
				className={[
					styles.vignette,
					hover ? styles.hover : "",
					failing ? styles.failing : "",
				].join(" ")}
				style={{ width, height }}
				onMouseMove={interaction ? handleMouseMove : undefined}
				onMouseEnter={interaction ? handleMouseEnter : undefined}
				onMouseLeave={interaction ? handleMouseLeave : undefined}
			>
				<Surface
					width={width}
					height={height}
					visitor={visitorRef.current}
					preload={preload}
					onContextLost={handleContextLost}
					onContextRestored={handleContextRestored}
				>
					<GLTransition
						onConnectSizeComponentRef={handleConnectRef}
						transition={transition}
						transitionParams={transitionParams}
						from={from}
						to={to}
						progress={progress}
					/>
				</Surface>

				{Footer && <Footer transition={transition} />}

				<div
					className={styles.cursor}
					style={{ left: `${(hoverValue * 100).toFixed(2)}%` }}
				/>

				{failing && (
					<div className={styles.failing}>
						<FaExclamationTriangle />
						<p>{failing.message}</p>
					</div>
				)}
			</div>
		);
	},
);
Vignette.displayName = "Vignette";
export default Vignette;
