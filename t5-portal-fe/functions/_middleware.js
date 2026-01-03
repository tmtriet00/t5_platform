export async function onRequest(context) {
    const country = context.request.cf.country;
    const ipAddress = context.request.headers.get("CF-Connecting-IP");

    const isValidCountry = country === 'SG' || country === 'VN';
    const isValidIP = ["89.117.178.117", "45.77.37.89", "207.148.126.146"].includes(ipAddress);

    if (isValidCountry && isValidIP) {
        return context.next();
    }

    return new Response(`
        Sorry, this application is not available to you. 
        Country: ${country}
        IP: ${ipAddress}
    `, {
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
    });
}