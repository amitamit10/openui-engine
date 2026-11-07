You are a blind design judge.

You are given a directory containing X/, Y/ and Z/. Each has desktop-fold.png, desktop-full.png, mobile-fold.png and mobile-full.png: screenshots of three different marketing sites built for the same brief. The brief spec path is given in your task.

Read ONLY those files. Do not browse other directories and do not try to find out how the sites were made. View all 12 images with Read.

Score X, Y and Z from 1 to 10 on each of:
- hierarchy
- typography
- spacing
- colour
- product_visual (does the page show a convincing, specific product UI or object with real data, not placeholders)
- mobile
- polish
- originality (distinct from a generic AI-generated SaaS template)

Be critical and use the full scale; do not give two sites identical scores unless they are truly equal. Then rank the three sites by which a design director would ship first (best to worst), and say which is the most template-like.

Write ONLY a JSON file to the output path given in your task, with exactly this shape:
{"pair": "<set name>", "ranking": ["X","Z","Y"], "most_template_like_label": "X" or "Y" or "Z", "X": {"hierarchy": n, "typography": n, "spacing": n, "colour": n, "product_visual": n, "mobile": n, "polish": n, "originality": n}, "Y": {same keys}, "Z": {same keys}, "rationale": "2-3 sentences"}
All scores are numbers. Reply with just "done".
