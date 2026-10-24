# Vendored skills

Plain copies (no symlinks / plugins). Upstream bodies are unchanged except where noted.

| name | source (repo + path + commit SHA) | license | invocation | changes |
|---|---|---|---|---|
| frontend-design | anthropics/skills `skills/frontend-design/` @ dbd4588f9e1033efb41dad4bef2f7947c8993d44 | Apache-2.0 (LICENSE.txt kept in folder) | model | description trimmed to 2 sentences |
| verification-before-completion | obra/superpowers `skills/verification-before-completion/` @ 2ce8aa15d05bd57213e6f746f953aafb7ded7a8b | MIT (Jesse Vincent) | model | none (description already 1 sentence) |
| create-prd | phuryn/pm-skills `pm-execution/skills/create-prd/` @ 07b34f64ee828df08953f505b7f747aef85ae7c6 | MIT (Pawel Huryn) | user | `disable-model-invocation: true`; one-line Korean description |
| market-sizing | phuryn/pm-skills `pm-market-research/skills/market-sizing/` @ 07b34f64ee828df08953f505b7f747aef85ae7c6 | MIT (Pawel Huryn) | user | `disable-model-invocation: true`; one-line Korean description |
| validate-idea | emotixco/claude-skills-founder `skills/validate-idea/` @ a194aaa1919fffbb56b2dea27eaaeff0b3add2f3 | MIT (Emotix) | user | `disable-model-invocation: true`; Korean description; `${CLAUDE_PLUGIN_ROOT}/shared/conventions.md` -> `../_founder-shared/conventions.md`; `founder/` -> `docs/` (Reads/Saves-to paths, `allowed-tools: Edit(docs/**)`) |
| mvp-scope | emotixco/claude-skills-founder `skills/mvp-scope/` @ a194aaa1919fffbb56b2dea27eaaeff0b3add2f3 | MIT (Emotix) | user | same as validate-idea |
| pitch-deck | emotixco/claude-skills-founder `skills/pitch-deck/` @ a194aaa1919fffbb56b2dea27eaaeff0b3add2f3 | MIT (Emotix) | user | same as validate-idea |
| _founder-shared/conventions.md | emotixco/claude-skills-founder `shared/conventions.md` @ a194aaa1919fffbb56b2dea27eaaeff0b3add2f3 | MIT (Emotix) | n/a (shared by the 3 founder skills) | `founder/` -> `docs/`; "this plugin" -> names the 3 skills |
| grilling | mattpocock/skills (local plugin cache `mattpocock-skills/1.3.1/skills/productivity/grilling/`; no commit SHA available, plugin version 1.3.1) | MIT (Matt Pocock) | user | `disable-model-invocation: true`; one-line Korean description; appended "해커톤 모드" section (max 2 rounds, <=6 questions/round, recommended answer on every question, stop on "go") |

Notes
- The founder skills write their output to `docs/<skill-name>.md` and `docs/facts.md` (convention rewritten from `founder/`).
- `create-prd` still suggests `PRD-[product-name].md` as the output filename (upstream text, untouched).
