# Project Guidance

This is a static GitHub Pages site using plain HTML, CSS, and JavaScript.
Keep it usable without a build step. Preview over HTTP so local fonts and SVG
icons load correctly: `python3 -m http.server 4173 --bind 127.0.0.1`.

## Skill routing

When a request matches an available skill, load and follow that skill's
instructions. Route only to skills available in the current session. Answer
directly for quick questions or small scoped edits.

- Product ideas and brainstorming -> /office-hours
- Strategy and scope -> /plan-ceo-review
- Architecture -> /plan-eng-review
- Design systems and design planning -> /design-consultation or /plan-design-review
- Full review pipeline -> /autoplan
- Bugs and errors -> /investigate
- Website behavior and QA -> /qa or /qa-only
- Code review -> /review
- Visual polish -> /design-review
- Shipping and deployment -> /ship or /land-and-deploy
- Save progress -> /context-save
- Resume context -> /context-restore
- Executable specifications -> /spec
