// Draws ```mermaid blocks as diagrams. The library is large, so it is only
// downloaded on pages that actually have a diagram; until then (or without
// JavaScript) readers see the diagram source as a plain code block.
const blocks = [...document.querySelectorAll<HTMLElement>('.prose pre > code.language-mermaid')];

if (blocks.length > 0) {
  const { default: mermaid } = await import('mermaid');
  const scheme = matchMedia('(prefers-color-scheme: dark)');

  const figures = blocks.map((code) => {
    const figure = document.createElement('figure');
    figure.className = 'mermaid-figure';
    figure.dataset.source = code.textContent ?? '';
    code.parentElement!.replaceWith(figure);
    return figure;
  });

  let run = 0;
  const draw = async () => {
    const current = ++run;
    // Take the colours from the site palette so diagrams match the terminal theme in both modes.
    const css = getComputedStyle(document.documentElement);
    const v = (name: string) => css.getPropertyValue(name).trim();
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      darkMode: scheme.matches,
      fontFamily: v('--sans'),
      themeVariables: {
        background: v('--bg'),
        primaryColor: v('--panel'),
        primaryTextColor: v('--fg'),
        primaryBorderColor: v('--amber'),
        secondaryColor: v('--panel'),
        tertiaryColor: v('--bg'),
        lineColor: v('--muted'),
        textColor: v('--fg'),
        edgeLabelBackground: v('--bg'),
        fontSize: '14px',
      },
    });
    for (const [i, figure] of figures.entries()) {
      try {
        const { svg } = await mermaid.render(`mermaid-${i}-${current}`, figure.dataset.source!);
        if (current !== run) return; // the colour scheme changed mid-draw; the newer run wins
        figure.innerHTML = svg;
      } catch (err) {
        console.error('Mermaid could not draw a diagram:', err);
        const pre = document.createElement('pre');
        pre.textContent = figure.dataset.source!;
        figure.replaceChildren(pre);
      }
    }
  };

  await draw();
  scheme.addEventListener('change', draw);
}
