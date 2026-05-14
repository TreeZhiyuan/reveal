# Reveal Modernization Notes

This template has been moved from a jQuery plugin stack to a lighter Bootstrap 5 friendly setup while preserving the original one-page structure.

## What changed

- Upgraded local Bootstrap assets from `v4.0.0` to `v5.3.8`.
- Replaced the custom cloned mobile menu with the native Bootstrap 5 navbar collapse.
- Removed runtime dependencies on jQuery, WOW, Owl Carousel, Magnific Popup, Sticky, and the legacy contact form script.
- Rebuilt scroll behavior, section activation, reveal-on-scroll, simple carousels, portfolio lightbox, and contact form handling in `js/main.js`.
- Updated the contact form to use native validation plus `fetch`.

## Current front-end architecture

- `index.html`
  - Keeps the original marketing sections and content order.
  - Uses Bootstrap 5 navbar and modal markup.
  - Uses `data-carousel` and `data-endpoint` hooks for behavior.
- `css/style.css`
  - Preserves the original brand colors and block styling.
  - Replaces plugin-specific CSS with framework-agnostic component styles.
- `js/main.js`
  - Contains all client behavior in vanilla JavaScript.
  - Safe next extraction targets are:
    - navigation and scroll state
    - carousel behavior
    - portfolio lightbox
    - contact form logic

## How to connect the form

Set a real endpoint on the form:

```html
<form class="contactForm" data-endpoint="/api/contact">
```

The current script submits `FormData` with `fetch` and accepts either:

- a JSON response like `{ "message": "Thanks, we will reply soon." }`
- a plain text response

Non-2xx responses should return a readable error message.

## Recommended next step to React or Vue

Use a staged migration instead of a rewrite-from-scratch branch.

1. Create a modern app shell with Vite.
2. Convert each page section into a presentational component without changing content order.
3. Move carousel, lightbox, and form logic into isolated components or composables/hooks.
4. Replace hard-coded content with JSON, CMS data, or API-backed content models.
5. Add linting, formatting, and deployment automation after the UI is stable.

## Good component boundaries

- `TopBar`
- `SiteHeader`
- `HeroCarousel`
- `AboutSection`
- `ServicesSection`
- `ClientsCarousel`
- `PortfolioGrid`
- `TestimonialsCarousel`
- `CallToAction`
- `TeamSection`
- `ContactSection`
- `SiteFooter`
