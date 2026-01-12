import type { Request, Response, NextFunction } from "express";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  const origin = req.get("Origin");
  const referer = req.get("Referer");
  const host = req.get("Host");
  
  if (!origin && !referer) {
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

  let requestOrigin: string | null = null;
  
  if (origin) {
    try {
      requestOrigin = new URL(origin).host;
    } catch {
      requestOrigin = null;
    }
  }
  
  if (!requestOrigin && referer) {
    try {
      requestOrigin = new URL(referer).host;
    } catch {
      requestOrigin = null;
    }
  }

  if (!requestOrigin || !allowedHosts.includes(requestOrigin)) {
    console.warn(`CSRF: Invalid origin ${requestOrigin} not in allowed hosts`);
    return res.status(403).json({ 
      error: "Forbidden",
      message: "CSRF validation failed: invalid origin" 
    });
  }

  next();
}
