function decodePayload(token) {
    try {
        const payload = token.split(".")[1];
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function getAuth() {
    const token = localStorage.getItem("token");
    if(!token) return { token: null, role: null, email: null };

    const payload = decodePayload(token);
    return {
        token,
        role: payload?.role || null,
        email: payload?.sub || null,
        userId: payload?.userId || null,
    };
}

export function logout() {
    localStorage.removeItem("token");
}