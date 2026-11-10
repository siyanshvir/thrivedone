'use client';

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  type HTMLMotionProps,
  type SpringOptions,
} from 'framer-motion';
import { cn } from '@/lib/utils';

type CursorContextType = {
  cursorPos: { x: number; y: number };
  isActive: boolean;
  cursorText: string;
  cursorColor: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  cursorRef: React.RefObject<HTMLDivElement | null>;
};

const CursorContext = React.createContext<CursorContextType | undefined>(
  undefined,
);

const useCursor = (): CursorContextType => {
  const context = React.useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};

type CursorProviderProps = React.ComponentProps<'div'> & {
  children: React.ReactNode;
  defaultColor?: string;
};

function CursorProvider({ children, defaultColor = '#0080ff', className, ...props }: CursorProviderProps) {
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = React.useState(false);
  const [cursorText, setCursorText] = React.useState('');
  const [cursorColor, setCursorColor] = React.useState(defaultColor);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      
      // Check for data-cursor elements under the mouse
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (target) {
        // Walk up the DOM tree to find data-cursor attribute
        let element: HTMLElement | null = target;
        while (element) {
          if (element.hasAttribute('data-cursor')) {
            const text = element.getAttribute('data-cursor');
            const color = element.getAttribute('data-cursor-color') || defaultColor;
            if (text) {
              setCursorText(text);
              setCursorColor(color);
              setIsActive(true);
              document.body.style.cursor = 'none';
              return;
            }
          }
          element = element.parentElement;
        }
      }
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      const text = target.getAttribute('data-cursor');
      const color = target.getAttribute('data-cursor-color') || defaultColor;
      if (text) {
        setCursorText(text);
        setCursorColor(color);
        setIsActive(true);
        document.body.style.cursor = 'none';
      }
    };

    const handleMouseLeave = () => {
      setIsActive(false);
      document.body.style.cursor = 'default';
    };

    // Add global mouse move listener
    window.addEventListener('mousemove', handleMouseMove);

    // Add listeners to all elements with data-cursor
    const attachListeners = () => {
      const targets = document.querySelectorAll('[data-cursor]');
      targets.forEach((target) => {
        target.addEventListener('mouseenter', handleMouseEnter);
        target.addEventListener('mouseleave', handleMouseLeave);
      });
      return targets;
    };

    let targets = attachListeners();

    // Observe DOM changes to attach listeners to new elements
    const observer = new MutationObserver(() => {
      // Remove old listeners
      targets.forEach((target) => {
        target.removeEventListener('mouseenter', handleMouseEnter);
        target.removeEventListener('mouseleave', handleMouseLeave);
      });
      // Attach new listeners
      targets = attachListeners();
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['data-cursor', 'data-cursor-color'] 
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'default';
      targets.forEach((target) => {
        target.removeEventListener('mouseenter', handleMouseEnter);
        target.removeEventListener('mouseleave', handleMouseLeave);
      });
      observer.disconnect();
    };
  }, [defaultColor]);

  return (
    <CursorContext.Provider
      value={{ cursorPos, isActive, cursorText, cursorColor, containerRef, cursorRef }}
    >
      <div ref={containerRef} data-slot="cursor-provider" className={className} {...props}>
        {children}
      </div>
    </CursorContext.Provider>
  );
}

type CursorProps = HTMLMotionProps<'div'> & {
  children?: React.ReactNode;
};

function Cursor({ children, className, style, ...props }: CursorProps) {
  const { cursorPos, isActive, cursorRef } = useCursor();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  React.useEffect(() => {
    x.set(cursorPos.x);
    y.set(cursorPos.y);
  }, [cursorPos, x, y]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={cursorRef}
          data-slot="cursor"
          className={cn(
            'transform-[translate(-50%,-50%)] pointer-events-none z-[9999] fixed',
            className,
          )}
          style={{ top: y, left: x, ...style }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type Align =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'right'
  | 'center';

type CursorFollowProps = HTMLMotionProps<'div'> & {
  sideOffset?: number;
  align?: Align;
  transition?: SpringOptions;
  children?: React.ReactNode;
};

function CursorFollow({
  sideOffset = 15,
  align = 'bottom-right',
  children,
  className,
  style,
  transition = { stiffness: 500, damping: 50, bounce: 0 },
  ...props
}: CursorFollowProps) {
  const { cursorPos, isActive, cursorRef } = useCursor();
  const cursorFollowRef = React.useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, transition);
  const springY = useSpring(y, transition);

  const calculateOffset = React.useCallback(() => {
    const rect = cursorFollowRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;

    let newOffset;
    switch (align) {
      case 'center':
        newOffset = { x: width / 2, y: height / 2 };
        break;
      case 'top':
        newOffset = { x: width / 2, y: height + sideOffset };
        break;
      case 'top-left':
        newOffset = { x: width + sideOffset, y: height + sideOffset };
        break;
      case 'top-right':
        newOffset = { x: -sideOffset, y: height + sideOffset };
        break;
      case 'bottom':
        newOffset = { x: width / 2, y: -sideOffset };
        break;
      case 'bottom-left':
        newOffset = { x: width + sideOffset, y: -sideOffset };
        break;
      case 'bottom-right':
        newOffset = { x: -sideOffset, y: -sideOffset };
        break;
      case 'left':
        newOffset = { x: width + sideOffset, y: height / 2 };
        break;
      case 'right':
        newOffset = { x: -sideOffset, y: height / 2 };
        break;
      default:
        newOffset = { x: 0, y: 0 };
    }
    return newOffset;
  }, [align, sideOffset]);

  React.useEffect(() => {
    const offset = calculateOffset();
    const cursorRect = cursorRef.current?.getBoundingClientRect();
    const cursorWidth = cursorRect?.width ?? 20;
    const cursorHeight = cursorRect?.height ?? 20;

    x.set(cursorPos.x - offset.x + cursorWidth / 2);
    y.set(cursorPos.y - offset.y + cursorHeight / 2);
  }, [calculateOffset, cursorPos, cursorRef, x, y]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={cursorFollowRef}
          data-slot="cursor-follow"
          className={cn(
            'transform-[translate(-50%,-50%)] pointer-events-none z-[9998] fixed',
            className,
          )}
          style={{ top: springY, left: springX, ...style }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export {
  CursorProvider,
  Cursor,
  CursorFollow,
  useCursor,
  type CursorContextType,
  type CursorProviderProps,
  type CursorProps,
  type CursorFollowProps,
};
