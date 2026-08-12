// Posters whose pixels are read back are inlined into the bundle as data URIs by esbuild
// (--loader:.jpg=dataurl). This keeps the canvas from being tainted by a foreign origin, so
// getImageData still works under file:// — without it the palette extraction would fail.
declare module '*.jpg' {
  const url: string;
  export default url;
}
