/**
 * Host half of dsh-web-tune.
 *
 * This bundle exists to carry cordis.patch.yml: it overrides two rows that other
 * bundles own (the free-search engine pool and the web seam providers). It
 * registers no service, no tool, and no UI, so the plugin body is empty.
 *
 * The file is not optional. A bundle whose manifest declares no resolvable entry
 * fails the installed-package check with "declared entry artifact missing", and
 * the whole patch layer is dropped on the next boot — which is what happened to
 * v0.2.1.
 */
export const name = 'dsh-web-tune'

export function apply() {}
