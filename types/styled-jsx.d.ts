// styled-jsx.d.ts
import * as React from 'react';

declare module 'react' {
    // Extend the existing StyleHTMLAttributes interface
    interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
        jsx?: boolean;
        global?: boolean;
    }
}