# Design Shelf source directory

Checked October 20, 2026. These are sources to inspect, not a claim that every feed was read or every item is recent. Project fit below is an editorial recommendation.

| Source | Pull for the shelf | Identity / channel evidence |
|---|---|---|
| [Meng To / DesignCode](https://designcode.io/) | Visual AI builds, interface prompts, Three.js walkthroughs. | [Public profile](https://sg.linkedin.com/in/mengto) names the site, X and Instagram; [DesignCode channel](https://www.youtube.com/@DesignCodeTeam) resolves. Individual posts/videos need checking. |
| [Janus Tiu](https://janustiu.com/) | UX explanations and relevant product/AI demos. | Her own site links Instagram, YouTube and LinkedIn. [Public LinkedIn](https://ca.linkedin.com/in/janustiu) corroborates identity. Exact Instagram/YouTube destinations were not recovered from the accessible pages; resolve through her site before ingesting. Homepage blog examples are from 2024. |
| [Felix Lee](https://felixlee.dev/) | Original product experiments and discovery leads. | Own-site footer links LinkedIn, Instagram and X. Trace curated work to the original maker; skip generic inspiration posts. |
| [Emil Kowalski](https://emilkowal.ski/) | UI behavior, purposeful motion, components and AI design workflows. | Own site links X, component projects and course previews. Paid material is excluded. |
| [Rauno Freiberg](https://rauno.me/) | Interaction craft and small interface details. | Own site links X and original craft work. Check dates per artifact; older work is evergreen. |
| [Paco Coursey](https://paco.me/) | Command menus, themes and implemented UI details. | Own site links X and code. Its YouTube playlists are music, so they are excluded from design sourcing. |
| [Mizko](https://www.mizko.net/) | UI/UX walkthroughs and relevant builds. | Own site links YouTube, LinkedIn, X and Instagram. Use public demonstrations, not paid course contents. |
| [Jesse Showalter](https://www.jesseshowalter.com/) | Prototyping, web design and complete build walkthroughs. | Own site links YouTube, Instagram and X. Prefer an inspectable result and a useful timestamp. |
| [Simon Willison](https://simonwillison.net/) | Original AI coding experiments, tools and games. | Dated author posts, code and live artifacts. Follow external link posts to the original author. |
| [Addy Osmani](https://addyosmani.com/) | AI coding methods and engineering tradeoffs. | Author site links writing, LinkedIn, X and talks. Use vendor documentation for product capabilities. |

## Publisher layer

Keep Codrops, Linear, Framer, Raycast, Figma and Apple. Add [Anthropic engineering](https://www.anthropic.com/engineering), [Cursor](https://cursor.com/blog), [Replit](https://replit.com/blog) and [OpenAI developers](https://developers.openai.com/) for original technical evidence. A publisher's demo or claim still needs checking for the current project.

## Collection rules

- Start with a small project-relevant set; at most eight sources and two items per creator per run.
- Credit the original maker. Deduplicate one artifact across social platforms.
- Prefer a live demo, original code, or a public walkthrough. Likes and follower counts are not evidence.
- Confirm each item's publication date. Profile verification and search crawl dates do not establish recency.
- Use accessible public posts and captions. A blocked feed is not covered; never invent an unseen video's contents.
- Keep source/date/preview evidence with each saved reference. Route undated finds to Archive.

Configuration: `config/update-guide.json`. The source directory is used by both Pip and the scheduled updater.
