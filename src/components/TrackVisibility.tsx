import { useState } from "react";
import { Waypoint } from "react-waypoint";

const TrackVisibility: React.FC<{ children: (visible: boolean) => React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);

    return (
        <Waypoint onEnter={() => setVisible(true)} onLeave={() => setVisible(false)}>
            {children(visible)}
        </Waypoint>
    );
};

export { TrackVisibility };
