import { useRef, useState, useCallback } from "react";

export function useHover<T extends HTMLElement>() {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  return { ref, isHovered, onMouseEnter, onMouseLeave };
}