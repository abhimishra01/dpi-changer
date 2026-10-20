// Links that work both at the site root and under a base path (GitHub Pages: /dpi-changer/).
const raw = import.meta.env.BASE_URL;
const BASE = raw.endsWith('/') ? raw : `${raw}/`;

/** "/about/" or "about/" becomes "/dpi-changer/about/" under a base path, "/about/" at the root. */
export const withBase = (path: string) => BASE + path.replace(/^\//, '');

/** Remove the base path again, so canonical URLs always use the real domain. */
export const stripBase = (pathname: string) => (pathname.startsWith(BASE) ? `/${pathname.slice(BASE.length)}` : pathname);
