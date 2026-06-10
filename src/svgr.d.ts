// SVGR: `import Icon from "...svg"` resolves to a React component
// (configured via @svgr/webpack in next.config.ts).
declare module "*.svg" {
  import type { FC, SVGProps } from "react";
  const ReactComponent: FC<SVGProps<SVGSVGElement> & { title?: string }>;
  export default ReactComponent;
}
