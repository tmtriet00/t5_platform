export async function onRequest(context) {
    const country = context.request.cf.country;

    if (country === 'SG') {
        return context.next();
    }

    return new Response("Sorry, this application is only available in Singapore.", {
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
    });
}