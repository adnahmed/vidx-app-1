// allow side-effect imports like: import './index.css'
declare module '*.css';

// If you also use CSS Modules or other preprocessors, add:
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module '*.scss';
declare module '*.sass';
declare module '*.less';
