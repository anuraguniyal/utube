# Project Rules & Guidelines for UTUBE

## Mandatory Versioning Rule
**CRITICAL**: Every time any code, styling, layout, or feature change is made to this project:
1. **Increment the Version Badge**: Update the `#appVersionBadge` element in [`index.html`](file:///root/utube/index.html) (e.g., `v1.1` -> `v1.2` -> `v1.3` ...).
2. The version badge is located in the top-right header section (`.header-right`).
3. Keep the display clean and formatted as `vX.Y` (or `vX.Y.Z`).

## Architecture Constraints
- **Pure Client-Side Vanilla Webapp**: Zero Node.js, zero build scripts, zero bundlers or npm packages.
- All code resides in [`/root/utube/`](file:///root/utube/).
- Keep gesture controls split-screen: Left half for Reverse Rewind, Right half for Forward Boost.
