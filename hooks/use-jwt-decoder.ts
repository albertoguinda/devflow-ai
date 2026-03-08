"use client";

import { useState, useCallback } from "react";
import {
  processJwt,
  isJwtLike,
} from "@/lib/application/jwt-decoder";
import type {
  JwtParts,
  JwtValidation,
  JwtClaim,
  JwtResult,
} from "@/types/jwt-decoder";
import { useToolHistory } from "@/hooks/use-tool-history";

export function useJwtDecoder() {
  const [token, setToken] = useState("");
  const [parts, setParts] = useState<JwtParts | null>(null);
  const [validation, setValidation] = useState<JwtValidation | null>(null);
  const [claims, setClaims] = useState<JwtClaim[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const { addToHistory } = useToolHistory<JwtResult>("devflow-jwt-history", 20);

  const decode = useCallback(() => {
    if (!token.trim()) return;
    setIsDecoding(true);
    setError(null);

    try {
      const result = processJwt(token);
      setParts(result.parts);
      setValidation(result.validation);
      setClaims(result.claims);
      addToHistory(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to decode JWT";
      setError(message);
      setParts(null);
      setValidation(null);
      setClaims([]);
    } finally {
      setIsDecoding(false);
    }
  }, [token, addToHistory]);

  const handleTokenChange = useCallback((value: string) => {
    setToken(value);
    // Auto-decode if it looks like a JWT
    if (isJwtLike(value)) {
      try {
        const result = processJwt(value);
        setParts(result.parts);
        setValidation(result.validation);
        setClaims(result.claims);
        setError(null);
        addToHistory(result);
      } catch {
        // Don't show errors while typing — wait for explicit decode
      }
    }
  }, [addToHistory]);

  const reset = useCallback(() => {
    setToken("");
    setParts(null);
    setValidation(null);
    setClaims([]);
    setError(null);
  }, []);

  return {
    token,
    parts,
    validation,
    claims,
    error,
    isDecoding,
    setToken: handleTokenChange,
    decode,
    reset,
  };
}
