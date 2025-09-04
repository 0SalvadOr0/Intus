export function sanitizeHtml(input: string): string {
  if (!input) return "";
  // Use DOMParser to safely parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${input}</div>`, "text/html");
  const container = doc.body.firstElementChild as HTMLElement | null;
  if (!container) return "";

  // Allowed tags and attributes
  const allowedTags = new Set([
    "P","BR","B","STRONG","I","EM","U","UL","OL","LI","A",
    "H1","H2","H3","H4","H5","H6","BLOCKQUOTE","DIV","SPAN"
  ]);
  const allowedAttrs: Record<string, Set<string>> = {
    A: new Set(["href","title","target","rel"]),
    DIV: new Set(["style"]),
    P: new Set(["style"]),
    SPAN: new Set(["style"]),
    H1: new Set(["style"]),
    H2: new Set(["style"]),
    H3: new Set(["style"]),
    H4: new Set(["style"]),
    H5: new Set(["style"]),
    H6: new Set(["style"]),
    BLOCKQUOTE: new Set(["style"]),
    UL: new Set([]),
    OL: new Set([]),
    LI: new Set([]),
    B: new Set([]),
    STRONG: new Set([]),
    I: new Set([]),
    EM: new Set([]),
    U: new Set([]),
    BR: new Set([])
  };

  const sanitizeNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) return node;
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const el = node as HTMLElement;
    const tag = el.tagName.toUpperCase();

    // Remove script/style and unknown tags by replacing with their children
    if (!allowedTags.has(tag)) {
      const frag = doc.createDocumentFragment();
      Array.from(el.childNodes).forEach((child) => {
        const clean = sanitizeNode(child);
        if (clean) frag.appendChild(clean);
      });
      return frag;
    }

    // Clone element and keep only allowed attributes
    const cleanEl = doc.createElement(tag);

    // Copy allowed attributes
    const allow = allowedAttrs[tag] || new Set<string>();
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) return; // strip event handlers
      if (!allow.has(attr.name)) return;
      if (name === "href") {
        const href = (attr.value || "").trim();
        if (/^javascript:/i.test(href)) return;
        cleanEl.setAttribute("href", href);
        cleanEl.setAttribute("rel", "noopener noreferrer");
      } else if (name === "style") {
        // Only allow text-align property
        const styles = attr.value.split(";").map(s => s.trim()).filter(Boolean);
        const kept: string[] = [];
        styles.forEach((s) => {
          const [prop, val] = s.split(":").map(x => x && x.trim());
          if (!prop || !val) return;
          if (prop.toLowerCase() === "text-align") {
            const v = val.toLowerCase();
            if (["left","right","center","justify","start","end","initial","inherit"].includes(v)) {
              kept.push(`text-align: ${v}`);
            }
          }
        });
        if (kept.length) cleanEl.setAttribute("style", kept.join("; "));
      } else {
        cleanEl.setAttribute(attr.name, attr.value);
      }
    });

    // Recursively sanitize and append children
    Array.from(el.childNodes).forEach((child) => {
      const clean = sanitizeNode(child);
      if (clean) cleanEl.appendChild(clean);
    });

    return cleanEl;
  };

  const resultFrag = doc.createDocumentFragment();
  Array.from(container.childNodes).forEach((n) => {
    const clean = sanitizeNode(n);
    if (clean) resultFrag.appendChild(clean);
  });

  const wrapper = doc.createElement("div");
  wrapper.appendChild(resultFrag);
  return wrapper.innerHTML;
}
