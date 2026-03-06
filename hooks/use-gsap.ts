"use client";

import { useEffect, useRef } from "react";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// --- Hook: Fade in on mount ---
export function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (prefersReducedMotion()) {
      ref.current.style.opacity = "1";
      return;
    }

    let tween: { kill: () => void } | undefined;

    import("gsap").then(({ default: gsap }) => {
      if (!ref.current) return;
      tween = gsap.fromTo(
        ref.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          delay,
          ease: "power2.out",
        }
      );
    });
    return () => { tween?.kill(); };
  }, [delay]);

  return ref;
}

// --- Hook: Stagger children on mount ---
export function useStaggerIn(childSelector = ":scope > *", delay = 0) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Use children directly for "> *" selector, otherwise use querySelectorAll
    const elements =
      childSelector === ":scope > *" || childSelector === "> *"
        ? Array.from(ref.current.children)
        : ref.current.querySelectorAll(childSelector);

    if (elements.length === 0) return;

    if (prefersReducedMotion()) {
      Array.from(elements).forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
      });
      return;
    }

    let tween: { kill: () => void } | undefined;

    import("gsap").then(({ default: gsap }) => {
      if (!ref.current) return;
      tween = gsap.fromTo(
        elements,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          delay,
          ease: "power2.out",
        }
      );
    });
    return () => { tween?.kill(); };
  }, [childSelector, delay]);

  return ref;
}

// --- Hook: Scroll triggered animation ---
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (prefersReducedMotion()) {
      ref.current.style.opacity = "1";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            import("gsap").then(({ default: gsap }) => {
              gsap.fromTo(
                entry.target,
                { opacity: 0 },
                { opacity: 1, duration: 0.7, ease: "power2.out" }
              );
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return ref;
}

// --- Hook: Pulse animation (for badges, scores) ---
export function usePulse(trigger: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !trigger) return;

    if (prefersReducedMotion()) {
      return;
    }

    let tween: { kill: () => void } | undefined;

    import("gsap").then(({ default: gsap }) => {
      if (!ref.current) return;
      tween = gsap.fromTo(
        ref.current,
        { scale: 1 },
        {
          scale: 1.1,
          duration: 0.3,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
        }
      );
    });
    return () => { tween?.kill(); };
  }, [trigger]);

  return ref;
}

// --- Hook: Counter animation ---
export function useCounter(target: number, duration = 1.5) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (prefersReducedMotion()) {
      ref.current.textContent = Math.round(target).toLocaleString();
      return;
    }

    let tween: { kill: () => void } | undefined;

    import("gsap").then(({ default: gsap }) => {
      if (!ref.current) return;
      const obj = { value: 0 };
      tween = gsap.to(obj, {
        value: target,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.round(obj.value).toLocaleString();
          }
        },
      });
    });
    return () => { tween?.kill(); };
  }, [target, duration]);

  return ref;
}
