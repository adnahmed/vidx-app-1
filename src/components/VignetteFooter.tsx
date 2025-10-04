"use client";

import React from "react";
import styles from "./VignetteFooter.module.css";

type VignetteFooterProps = {
    transition: {
        name: string;
        author?: string;
    };
};

const VignetteFooter: React.FC<VignetteFooterProps> = ({ transition }) => {
    const { name } = transition;
    return (
        <footer>
            <span className={styles.TransitionName}>
                <strong>{name}</strong>
            </span>

        </footer>
    );
};

export default VignetteFooter;