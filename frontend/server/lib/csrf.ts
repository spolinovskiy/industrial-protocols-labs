import type { Request, Response, NextFunction } from "express";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (process.env.CSRF_DISABLED === "1") {
    return next();
  }

  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  const origin = req.get("Origin");
  const referer = req.get("Referer");
  const host = req.get("Host");

  if (!origin && !referer) {
    if (process.env.CSRF_ALLOW_MISSING === "1") {
      return next();
    }
    console.warn(`CSRF: Missing Origin and Referer headers for ${req.method} ${req.path}`);
    return res.status(403).json({ 
      error: "Forbidden",
      message: "CSRF validation failed: missing origin headers" 
    });
  }

  const allowedHosts = [
    host,
    process.env.REPLIT_DEV_DOMAIN,
    ...(process.env.REPLIT_DOMAINS?.split(",") || []),
  ].filter(Boolean);

  const allowedHostSet = new Set<string>();
  for (const entry of allowedHosts) {
    allowedHostSet.add(entry);
    const hostname = entry.split(":")[0];
    if (hostname) {
      allowedHostSet.add(hostname);
    }
  }

  let requestOrigin: string | null = null;
  let requestHostname: string | null = null;
  
  if (origin) {
    try {
      const parsedOrigin = new URL(origin);
      requestOrigin = parsedOrigin.host;
      requestHostname = parsedOrigin.hostname;
    } catch {
      requestOrigin = null;
    }
  }
  
  if (!requestOrigin && referer) {
    try {
      const parsedReferer = new URL(referer);
      requestOrigin = parsedReferer.host;
      requestHostname = parsedReferer.hostname;
    } catch {
      requestOrigin = null;
    }
  }

  const originAllowed =
    (requestOrigin && allowedHostSet.has(requestOrigin)) ||
    (requestHostname && allowedHostSet.has(requestHostname));

  if (!originAllowed) {
    console.warn(`CSRF: Invalid origin ${requestOrigin} not in allowed hosts`);
    return res.status(403).json({ 
      error: "Forbidden",
      message: "CSRF validation failed: invalid origin" 
    });
  }

  next();
}
