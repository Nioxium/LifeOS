import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis();
    let frameId = 0;

    const onFrame = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(onFrame);
    };

    frameId = requestAnimationFrame(onFrame);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return null;
}
