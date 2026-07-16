import { defineConfig } from 'vite'

export default defineConfig({
  // Relative base so the built entry script/stylesheet resolve correctly
  // both on GitHub Pages (served under /Poop-Breakout/) and when dist/ is
  // served from a web server root, as the accessibility CI job's Pa11y/axe
  // scan does. An absolute base path here 404s the CSS and JS bundle when
  // dist/ is served at a different root, leaving the page unstyled and
  // producing false accessibility findings (e.g. a `target-size` violation
  // from unstyled native buttons rather than a real design defect).
  base: './',
})
