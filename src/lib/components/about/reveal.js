/**
 * Fades an element in and raises it 16px the first time it scrolls into view,
 * a little later for each step down the list (`index`).
 *
 * Applied only once JS runs, so without it the content is simply visible.
 * Reduced motion is handled in CSS (.highlight-reveal in app.css forces the end
 * state with !important).
 */
export function reveal(node, index = 0) {
  node.style.opacity = "0";
  node.style.transform = "translateY(16px)";
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const delay = Math.min(index, 4) * 0.06;
      node.style.transition = `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}s`;
      node.style.opacity = "1";
      node.style.transform = "none";
    },
    { rootMargin: "-80px" },
  );
  io.observe(node);
  return { destroy: () => io.disconnect() };
}
