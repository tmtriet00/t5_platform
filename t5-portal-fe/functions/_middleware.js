export async function onRequest(context) {
    // Get the country code from the request
    const country = context.request.cf.country;

    // Allow only Vietnam (VN)
    if (country === 'VN') {
        return context.next();
    }

    // Block everyone else
    return new Response("Sorry, this application is only available in Vietnam.", {
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
    });
}