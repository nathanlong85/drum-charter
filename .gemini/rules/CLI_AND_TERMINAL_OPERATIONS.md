## 🛠️ CLI & TERMINAL OPERATIONS
In order to minimize repeated failed CLI commands (which wastes time and resources):
- **Source of Truth**: Always check `.gemini/CLI_REFERENCE.md` before running ANY non-trivial CLI command.
- **Update Reference**: If running a command fails due to a syntax error or incorrect usage, you **must** update the reference.
  - **Be Accurate**: Research official docs first, then add the verified command to the reference BEFORE executing it.
  - **Be Thorough**: Include all information needed to run the command error-free in the future.
- **Dry Run**: For high-risk commands (migrations, history rewrites), print the command and wait for explicit approval on that exact string.
- **Suppress Noise**: Proactively suppress redundant environment warnings (e.g., unset `NO_COLOR`).
