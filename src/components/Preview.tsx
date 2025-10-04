import { transitionsOrderByRandom } from "@/lib/transitions";
import AnimatedVignette from "./AnimatedVignette";
import { TrackVisibility } from "./TrackVisibility";
import VignetteFooter from "./VignetteFooter";

const imageFiles = [
  "a1mV1egnQwOqxZZZvhVo_street.jpg",
  "barley.jpg",
  "bigbuckbunny_snapshot1.jpg",
  "hBd6EPoQT2C8VQYv65ys_White_Sands.jpg",
  "ic1dX3kBQjGNaPQb8Xel_1920x1280.jpg",
  "ikZyw45kT4m16vHkHe7u_9647713235_29ce0305d2_o.jpg",
  "lUUnN7VGSoWZ3noefeH7_Baker_Beach-12.jpg",
  "pHyYeNZMRFOIRpYeW7X3_manacloseup.jpg",
  "wdXqHcTwSTmLuKOGz92L_Landscape.jpg"
];

const images = imageFiles.map(file => `/images/1024x768/${file}`);

interface PreviewProps {
  width?: number;
  height?: number;
}

const Preview: React.FC<PreviewProps> = ({ width, height }) => {
  return (
    <TrackVisibility>
      {(visible: boolean) => (
        <div className="preview">
          <AnimatedVignette
            paused={!visible}
            transitions={transitionsOrderByRandom}
            images={images}
            width={width}
            height={height}
            duration={3000}
            delay={500}
            interaction={false}
            Footer={VignetteFooter}
          />
        </div>
      )}
    </TrackVisibility>
  );
};

export default Preview;