// Prefix a public asset path with the deploy base path (e.g. "/Ai-Agent/studio"
// on GitHub Pages, "" in local dev). Keeps <img>/<video> src correct on both.
export const asset = (p: string): string =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${p}`;
