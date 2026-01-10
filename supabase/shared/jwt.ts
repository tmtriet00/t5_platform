import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
/**
 * Extracts the client IP address from the request headers
 * Checks x-forwarded-for first (standard for Supabase Edge Functions), then x-real-ip
 */
function getClientIP(req: Request): string | null {
    // Check x-forwarded-for header (may contain comma-separated list of IPs)
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // Take the first IP in the list (the original client IP)
        return forwardedFor.split(',')[0].trim();
    }

    // Fallback to x-real-ip header
    const realIP = req.headers.get('x-real-ip');
    if (realIP) {
        return realIP.trim();
    }

    return null;
}

/**
 * Checks if an IP address is allowed based on the ALLOWED_IPS environment variable
 * If ALLOWED_IPS is not set or empty, all IPs are allowed (backward compatible)
 */
function isIPAllowed(ip: string | null): boolean {
    const allowedIPs = Deno.env.get('ALLOWED_IPS');

    // If no IP restriction is configured, allow all IPs
    if (!allowedIPs || allowedIPs.trim() === '') {
        return true;
    }

    // If we couldn't extract an IP, block the request for security
    if (!ip) {
        return false;
    }

    // Parse the comma-separated list of allowed IPs
    const allowedList = allowedIPs.split(',').map(ip => ip.trim());

    // Check if the client IP is in the allowed list
    return allowedList.includes(ip);
}

// Validates authorization header and IP restrictions
export async function AuthMiddleware(
    req: Request,
    next: (req: Request) => Promise<Response>,
) {
    if (req.method === "OPTIONS") return await next(req);

    try {
        // Check IP restriction
        const clientIP = getClientIP(req);
        const edgeFunctionAuth = req.headers.get('x-edge-function-auth');

        if (!isIPAllowed(clientIP) && edgeFunctionAuth !== Deno.env.get('EDGE_FUNCTION_AUTH')) {
            console.warn("Blocked request from IP:", clientIP);
            console.warn("IP allow status: " + isIPAllowed(clientIP));
            console.warn("Edge function auth allow status: " + edgeFunctionAuth === Deno.env.get('EDGE_FUNCTION_AUTH'));

            return Response.json({
                error: "Access denied",
                message: "Your IP address is not authorized to access this resource"
            }, {
                status: 403,
            });
        }

        return await next(req)
    } catch (e) {
        return Response.json({
            msg: e?.toString(),
            error: e,
        }, {
            status: 401,
        });
    }
}