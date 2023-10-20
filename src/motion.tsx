import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { Easing } from "./easing";

const motionElements = new Set<HTMLElement>();

function flipAnimation(update) {
  // FIRST
  const beforeSnapshots = new Map(
    Array.from(motionElements).map((motionItem) => [
      motionItem,
      motionItem.getBoundingClientRect(),
    ]),
  );

  update();

  const pendingAnimations = Array.from(motionElements).map((element) => {
    const beforeCoords = beforeSnapshots.get(element);
    if (!beforeCoords) return;

    // LAST
    const afterCoords = element.getBoundingClientRect();

    // INVERT
    const verticalDiff = beforeCoords.y - afterCoords.y;
    const horizontalDiff = beforeCoords.x - afterCoords.x;

    const start = {
      translate: `${horizontalDiff}px ${verticalDiff}px`,
    };

    const end = {
      translate: "0 0",
    };

    return () => {
      // PLAY
      element.animate([start, end], {
        duration: 400,
        easing: Easing.Spring,
      });
    };
  });

  pendingAnimations.forEach((animation) => animation?.());
}

// todo swap out depending on support
const withAnimation =
  "startViewTransition" in document
    ? (callback) => document.startViewTransition(callback)
    : flipAnimation;

export function useAnimatedState<State>(initial: State) {
  const [state, setState] = useState(initial);

  const handleUpdate: typeof setState = useCallback((update) => {
    withAnimation(() => {
      flushSync(() => {
        setState(update);
      });
    });
  }, []);

  return [state, handleUpdate] as const;
}

export function MotionItem({
  id,
  children,
}: PropsWithChildren<{ id: string }>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    motionElements.add(ref.current);

    return () => {
      if (ref.current) {
        motionElements.delete(ref.current);
      }
    };
  }, []);

  const safeId = id.replace(/[^a-zA-Z]/g, "");

  return (
    <div ref={ref} style={{ viewTransitionName: safeId }}>
      {children}
    </div>
  );
}
