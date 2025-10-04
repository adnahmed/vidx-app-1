import 'gl-react';
import React from 'react';

declare module 'gl-react' {
    export function connectSize<T extends React.ComponentType<any>>(GLComponent: T): T;
}