import { transitionsOrderByRandom } from "@/lib/transitions";
import type React from "react";
import AnimatedVignette from "./AnimatedVignette";
import { TrackVisibility } from "./TrackVisibility";
import VignetteFooter from "./VignetteFooter";

const videos = [1, 2, 3].map((i) => (
	<video key={i} autoPlay loop>
		<track kind="captions" />
		<source type="video/webm" src={`/videos/sintel/cut${i}.webm`} />
		<source type="video/mp4" src={`/videos/sintel/cut${i}.mp4`} />
	</video>
));

const VideoExample: React.FC<{ width: number }> = ({ width }) => {
	const visibleHeight = Math.round((width * 544) / 1280);

	return (
		<TrackVisibility>
			{(visible) => (
				<section className="full-width">
					<AnimatedVignette
						interaction
						paused={!visible}
						transitions={transitionsOrderByRandom}
						images={visible ? videos : [null]}
						width={width}
						height={visibleHeight}
						duration={3000}
						delay={500}
						keepRenderingDuringDelay
						Footer={VignetteFooter}
					/>
				</section>
			)}
		</TrackVisibility>
	);
};

export default VideoExample;
