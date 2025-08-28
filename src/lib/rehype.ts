import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { Root } from "hast";

type ImageBaseOpts = { imageBase?: string };

export const rehypeImageBase: Plugin<[ImageBaseOpts?], Root> = (opts) => {
  let base = opts?.imageBase?.trim();
  if (!base) return () => {};
  if (!base.endsWith("/")) base += "/";

  function resolveOne(url: string): string {
    const s = url.trim();
    if (/^(?:[a-z]+:)?\/\//i.test(s) || s.startsWith("data:")) return s;
    const rel = s.startsWith("/") ? s.slice(1) : s;
    try {
      return new URL(rel, base).toString();
    } catch {
      return s;
    }
  }

  return (tree) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName === "img" && typeof node.properties?.src === "string") {
        node.properties.src = resolveOne(node.properties.src);
      }
      if (typeof node.properties?.srcset === "string") {
        const parts = node.properties.srcset
          .split(",")
          .map((p: string) => p.trim())
          .filter(Boolean)
          .map((entry: string) => {
            const [u, d] = entry.split(/\s+/, 2);
            const abs = resolveOne(u);
            return d ? `${abs} ${d}` : abs;
          });
        node.properties.srcset = parts.join(", ");
      }
    });
  };
};
