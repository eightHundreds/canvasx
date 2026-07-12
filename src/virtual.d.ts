declare module "virtual:canvas-entry" {
  import type { ComponentType } from "react";
  const Canvas: ComponentType;
  export const canvasId: string;
  export default Canvas;
}
