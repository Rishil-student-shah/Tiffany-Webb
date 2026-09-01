---
name: image-framing-rules
description: Dynamic Image Studio, Wide-Span Arch Dome & Changeable Frame System for Tiffany Webb CRM and Astro website
always_on: true
---

# Dynamic Image Studio & Changeable Frame System

## Universal Project Invariants

1. **Changeable Frame Styles**:
   Never hardcode image containers to a single rigid aspect ratio or shape. All image fields across the CRM and Astro frontend must support selectable and adaptable frame styles:
   - **Wide Cinema Arch (`shape-landscape-arch`)**: 16:9 expanded ratio with `border-radius: 260px 260px 16px 16px`, `max-width: 650px`, and gold border. Designed for full-width horizontal/speaking photos while keeping the half-circle dome on top.
   - **Expansive Arch (`shape-wide-arch`)**: 3:2 ratio with `border-radius: 240px 240px 16px 16px`, `max-width: 580px`, and gold border.
   - **Cathedral Arch (`shape-hero-arch`)**: 4:5 vertical ratio with `border-radius: 999px 999px 12px 12px` and gold border.
   - **Soft Editorial Arch (`shape-meet-arch`)**: 3.5:5 ratio with `border-radius: 140px 140px 14px 14px` and gold border.
   - **Modern Landscape (`shape-landscape`)**: 16:9 ratio with `border-radius: 14px` and gold border.
   - **Classic Portrait (`shape-portrait`)**: 3:4 ratio with `border-radius: 14px` and gold border.
   - **Luxury Square (`shape-square`)**: 1:1 ratio with `border-radius: 14px` and gold border.
   - **Adaptive (`shape-adaptive`)**: Natural container that respects the user's cropped aspect ratio without stretching.

2. **Responsive Container Auto-Expansion**:
   - When a wide arch or horizontal image style is selected, grid layouts in `Hero.astro` and other sections must smoothly expand their media container (up to `650px`) so wide images display in full resolution without edge drop or side cropping.

3. **CRM Image Studio & Cropper**:
   Every image field in `cms-page.ejs` and `cms-collection-edit.ejs` must:
   - Feature the interactive **Image Studio** powered by Cropper.js.
   - Provide real-time live preview in the section's selected frame shape with gold borders.
   - Synchronize with the selected Frame Style dropdown.
   - Deliver high-resolution PNG/JPEG cropped files directly via standard `multipart/form-data` uploads.

4. **Static File Serving Invariant**:
   - `server.js` must always serve uploaded assets statically via `app.use('/uploads', express.static(path.join(__dirname, '../tiffany-webb-astro/public/uploads')))` and bypass Astro SSR for `/uploads` requests.
   - Frontend components (`Hero.astro`, `MeetTiffany.astro`, etc.) must render images at `width: 100%; height: 100%; object-fit: cover;` without disproportionate CSS height or scale offsets.
