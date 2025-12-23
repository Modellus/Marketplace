Coding Standards
================

HTML Authoring
--------------
- When generating HTML, output it as a single quoted string with interpolation, formatted and indented so it reads like HTML (use a single start quote and a single end quote).
- Use double quotes (`"`) for strings instead of single quotes (`'`).

Control Flow and Formatting
---------------------------
- Do not insert empty lines inside functions.
- For single-statement loops or conditionals, omit braces; place the statement on the next indented line.

Naming
------
- Use full, descriptive variable names (no abbreviations such as "el"—use "element" instead).

Separation of Concerns
----------------------
- Separate logic from UI code. Place each self-contained logic unit into its own JavaScript class in a separate file; keep UI handling distinct from logic classes.
