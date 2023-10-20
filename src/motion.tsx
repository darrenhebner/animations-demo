import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {Easing} from './easing'

export function useAnimatedState<State>(initial: State) {
  const withAnimation = useAnimation();
  const [state, setState] = useState(initial);

  const handleUpdate = useCallback((update) => {
    withAnimation(() => {
      setState(update)
    })
  }, [])

  return [state, handleUpdate] as const
}

interface MotionConfig {
  before(): DOMRect;
  after(beforeCoords: DOMRect): undefined | (() => void);
}

const motionItems = new Set<MotionConfig>();

export function useAnimation() {
  return useCallback((update: (...args: any[]) => any) => {
    const beforeSnapshots = new Map(
      Array.from(motionItems).map((motionItem) => [
        motionItem,
        motionItem.before(),
      ]),
    );
    
    flushSync(update);

    const pendingAnimations = Array.from(motionItems).map(motionItem => {
      const before = beforeSnapshots.get(motionItem);
      if (!before) return;
      return motionItem.after(before);
    })

    pendingAnimations.forEach(animation => animation?.());
  }, []);
}

export function MotionItem({ children }: PropsWithChildren<{}>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const performer: MotionConfig = {
      before() {
        return ref.current!.getBoundingClientRect();
      },
      after(beforeCoords) {
        if (!ref.current) return;

        const afterCoords = ref.current?.getBoundingClientRect();

        const verticalDiff = beforeCoords.y - afterCoords.y;
        const horizontalDiff = beforeCoords.x - afterCoords.x;
        console.log(verticalDiff, horizontalDiff)
        const start = {
          translate: `${horizontalDiff}px ${verticalDiff}px`
        }

        const end = {
          translate: "0 0"
        }


        return () => {
          ref.current?.animate([start, end], {
            duration: 400,
            easing: Easing.SpringSoft
          })
        }
      }
    }
    
    motionItems.add(performer);
    return () => {
      motionItems.delete(performer)
    }
  }, [])

  return <div ref={ref}>{children}</div>;
}
