import { useEffect, useState } from "react";

export interface Route {
  path: string;
  segments: string[];
  query: URLSearchParams;
}

function parse(): Route {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const [path, qs] = hash.split("?");
  return { path, segments: path.split("/").filter(Boolean), query: new URLSearchParams(qs ?? "") };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onChange = () => {
      setRoute(parse());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function navigate(to: string) {
  window.location.hash = to;
}

export function back(fallback = "/") {
  if (window.history.length > 1) window.history.back();
  else navigate(fallback);
}
