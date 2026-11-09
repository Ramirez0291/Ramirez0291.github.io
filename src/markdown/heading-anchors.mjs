// @ts-check
import GithubSlugger from 'github-slugger';

/**
 * Turns the `##` / `###` prefix in front of each section heading into a link to
 * that heading, so readers can copy a link to any section.
 *
 * Astro assigns heading ids after user plugins run, and reads the heading's text
 * for the table of contents. So the id is set here first with the same slugger
 * (Astro keeps an existing id), and the link has no text of its own: the prefix
 * is drawn by CSS, keeping both the id and the table-of-contents text clean.
 */
/** @type {import('satteri').HastPluginEntry} */
export const headingAnchorsPlugin = () => {
  const slugger = new GithubSlugger();
  return {
    name: 'heading-anchors',
    element: {
      // Every level goes through the slugger so duplicate-title suffixes (-1, -2)
      // come out exactly as Astro would number them.
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      visit(node, ctx) {
        const existing = node.properties?.id;
        const id = typeof existing === 'string' ? existing : slugger.slug(ctx.textContent(node));
        if (typeof existing !== 'string') ctx.setProperty(node, 'id', id);
        if (node.tagName !== 'h2' && node.tagName !== 'h3') return;
        ctx.prependChild(node, {
          type: 'element',
          tagName: 'a',
          properties: { className: ['heading-anchor'], href: `#${id}`, ariaHidden: 'true', tabIndex: -1 },
          children: [],
        });
      },
    },
  };
};
