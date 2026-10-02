import { useEffect, useState } from "react";
import { STANDALONE } from "./env.ts";

export interface Route {
  path: string;
  segments: string[];
  query: URLSearchParams;
}

function parse(hash: string): Route {
  const [path, qs] = (hash.replace(/^#/, "") || "/").split("?");
  return { path, segments: path.split("/").filter(Boolean), query: new URLSearchParams(qs ?? "") };
}

// Sunucusuz sürümde (Artifact çerçevesi) adres çubuğuna dokunmadan bellek içi geçmiş kullanılır.
const memory: string[] = ["/"];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const current = () => (STANDALONE ? memory[memory.length - 1] : window.location.hash);

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(current()));
  useEffect(() => {
    const onChange = () => {
      setRoute(parse(current()));
      window.scrollTo({ top: 0 });
    };
    if (STANDALONE) {
      listeners.add(onChange);
      return () => void listeners.delete(onChange);
    }
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function navigate(to: string) {
  if (STANDALONE) {
    if (memory[memory.length - 1] !== to) memory.push(to);
    if (memory.length > 50) memory.splice(1, memory.length - 50);
    emit();
    return;
  }
  window.location.hash = to;
}

export function back(fallback = "/") {
  if (STANDALONE) {
    if (memory.length > 1) memory.pop();
    else memory[0] = fallback;
    emit();
    return;
  }
  if (window.history.length > 1) window.history.back();
  else navigate(fallback);
}
