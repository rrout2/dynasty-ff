/// <reference types="vite/client" />

// This file declares types for module imports in a Vite/TypeScript environment.
// It resolves the "Cannot find module '...'" errors for CSS and image files.

// 1. CSS Modules Declaration
// This tells TypeScript that any import from a file ending in .module.css
// will be an object with string keys and string values.
declare module '*.module.css' {
    const classes: {[key: string]: string};
    export default classes;
}

// 2. Image and Asset Declarations
// This tells TypeScript that any import from files with these extensions
// will be a string (the URL path to the asset).
declare module '*.png' {
    const src: string;
    export default src;
}

declare module '*.svg' {
    const src: string;
    export default src;
}

declare module '*.jpeg' {
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const src: string;
    export default src;
}
