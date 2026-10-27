# Product detail page standards

## Scope and reference

- These instructions apply to new product detail pages and specifically requested detail-page adjustments under `products/`. Category listing pages keep their established category layout.
- The user-confirmed reference for the product hero and main-image presentation is `products/gpn1-12kv-metal-clad-switchgear/index.html` (GPN1-12kV).
- Reuse the reference hero HTML structure, applicable CSS rules, and responsive breakpoints. Change the product content and image assets, rather than inventing per-product image sizing or positioning.
- Keep the current shared site navigation, footer, search and catalog-download behavior. Do not publish the deferred mobile redesign merely when adding a product.

## Main-image presentation

- Desktop hero columns: `minmax(0, 0.97fr) minmax(0, 1.03fr)`, with a `72px` gap and `align-items: start`.
- Use `.product-hero-media > .product-detail-gallery > .product-detail-media-frame > img` as in the reference.
- Desktop `.product-hero-media`: `display: grid`, `align-content: start`, `min-width: 0`, `margin-top: -52px`. Do not add per-product vertical centering or a `margin-top: 0` desktop override.
- The image frame is square (`aspect-ratio: 1 / 1`) with `30px` padding, centered contents, transparent background, and no border, rounded frame or shadow.
- Preserve the reference image's intrinsic sizing and the shared `img { display: block; max-width: 100%; }` behavior. Do not force `width: 100%; height: 100%` on a product's main image or introduce another image scale.
- Match the reference image element: change `src` and `alt`, preserve `draggable="false"`; `fetchpriority="high"` is acceptable. Do not add fixed image `width`/`height` presentation attributes that alter its size relative to the reference.
- The reference's `.product-detail-media img` rule is not the main-image selector in this DOM structure. Do not add a `.product-detail-media` wrapper or apply its `89%` rule to the hero image.
- At `max-width: 1100px`, use one hero column, a `40px` gap, and `margin-top: -20px` for the image region. At `max-width: 760px`, use `margin-top: 0` and frame `padding: 0`, following the reference.
- Product shapes and source-image white space may differ. Do not compensate with arbitrary page-specific scaling, cropping or offsets unless the user expressly requests a different treatment.

## Consistent detail-page structure

- Product detail pages start directly with the hero. Do not add a visible breadcrumb row above it; the user explicitly rejected this row on GP-NER-3.3kV.
- Keep the established model/name hierarchy, inquiry and catalog buttons, hero facts, overview, specifications and supporting sections.
- Use equal-width columns for paired overview/information cards, with the existing single-column breakpoint.
- Base every model-specific rating on its supplied catalog or confirmed information. Do not substitute general-series values for a specific model drawing.
- Product metadata, catalog links, category card links, search entries and sitemap URLs must agree with the actual model and page.

## Checks before completion

- Compare the new page's main-image DOM and effective CSS rules with the GPN1-12kV reference, including media-query overrides.
- Verify that no per-product frame padding, forced image dimensions, vertical centering, or competing scale rules override the standard.
- Preserve unrelated products and the reference page when making an individual adjustment.
