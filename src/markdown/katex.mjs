// @ts-check
import katex from 'katex';

/**
 * Renders $…$ and $$…$$ to HTML with KaTeX at build time, so readers download
 * no JavaScript for math. It also sets `hasMath` in the post's frontmatter,
 * which lets the page ship the KaTeX stylesheet and fonts only when needed.
 *
 * A broken formula fails the build with its source and file, instead of
 * quietly showing red text on the live site.
 */
/** @type {import('satteri').MdastPluginDefinition} */
export const katexPlugin = {
  name: 'katex',
  paragraph(node, ctx) {
    if (isStandalone(node, ctx)) render(node, node.children[0].value, ctx, true);
  },
  math(node, ctx) {
    render(node, node.value, ctx, true);
  },
  inlineMath(node, ctx) {
    // Already rendered as a block by the paragraph visitor above.
    if (isStandalone(ctx.parent(node), ctx)) return;
    render(node, node.value, ctx, false);
  },
};

/**
 * `$$ E = mc^2 $$` on a line of its own parses as inline math inside a paragraph
 * (CommonMark math only treats $$ as a block when the fences sit on separate lines),
 * but it is written as a standalone formula, so it is shown as one.
 * @param {any} node
 * @param {any} ctx
 */
function isStandalone(node, ctx) {
  if (node?.type !== 'paragraph' || node.children.length !== 1) return false;
  const [only] = node.children;
  if (only.type !== 'inlineMath') return false;
  const tex = only.value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^[ \\t]*\\$\\$[ \\t]*${tex}[ \\t]*\\$\\$[ \\t]*$`, 'm').test(ctx.source);
}

/**
 * Replaces `node` with the rendered formula.
 * @param {any} node
 * @param {string} tex
 * @param {any} ctx
 * @param {boolean} displayMode
 */
function render(node, tex, ctx, displayMode) {
  let html;
  try {
    html = katex.renderToString(tex, {
      displayMode,
      throwOnError: true,
      // CJK text inside \text{} is expected in these posts; don't warn about it.
      strict: false,
    });
  } catch (err) {
    const where = ctx.fileURL ? ` in ${ctx.fileURL.pathname}` : '';
    throw new Error(`KaTeX could not render \`${tex}\`${where}: ${/** @type {Error} */ (err).message}`);
  }
  // Wide display formulas scroll on their own instead of widening the page on phones.
  if (displayMode) html = `<div class="math-display">${html}</div>`;
  ctx.replaceNode(node, { type: 'html', value: html });
  if (ctx.data.astro) ctx.data.astro.frontmatter.hasMath = true;
}
