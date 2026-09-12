"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function DeepDiveOpen() {
  useEffect(() => {
    track("deep_dive_open");
  }, []);
  return null;
}
