import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";

const motionItems = new Set<HTMLDivElement>();

function withFlip(update: () => void) {
  // First
  const beforeCoords = new Map(
    Array.from(motionItems).map((item) => [item, item.getBoundingClientRect()]),
  );

  update();

  const pendingAnimations = Array.from(motionItems).map((item) => {
    const before = beforeCoords.get(item);
    if (!before) return;

    // Last
    const after = item.getBoundingClientRect();

    // Invert
    const verticalDiff = before.y - after.y;
    const horizontalDiff = before.x - after.x;

    const start = {
      translate: `${horizontalDiff}px ${verticalDiff}px`,
    };

    const end = {
      translate: `0 0`,
    };

    return () => {
      item.animate([start, end], {
        duration: 250,
        easing: "ease-out",
      });
    };
  });

  // Play
  pendingAnimations.forEach((animation) => animation?.());
}

const withAnimation =
  "startViewTransition" in document
    ? // @ts-expect-error
      (update: () => void) => document.startViewTransition(update)
    : withFlip;

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

    motionItems.add(ref.current);
    return () => {
      if (ref.current) {
        motionItems.delete(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref} style={{ viewTransitionName: safeId(id) }}>
      {children}
    </div>
  );
}

function safeId(id: string) {
  return id.replace(/[^a-zA-Z]/g, "");
}
