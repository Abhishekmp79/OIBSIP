/**
 * API client — thin fetch wrapper.
 * Written WITHOUT optional chaining so copy-paste never breaks it.
 */
const ENV_URL = (
    import.meta.env &&
    import.meta.env.VITE_API_URL) || '';
const BASE = ENV_URL ? ENV_URL.replace(/\/$/, '') : '';

function getToken() {
    if (typeof window !== 'undefined' && window.location.pathname.indexOf('/admin') === 0) {
        return localStorage.getItem('sh_admin_token');
    }
    return localStorage.getItem('sh_token');
}

async function request(path, options) {
    const opts = options || {};
    const method = opts.method || 'GET';
    const body = opts.body;
    const auth = opts.auth !== false;

    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
    }

    const res = await fetch(BASE + path, {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.indexOf('application/json') !== -1 ? await res.json() : {};

    if (!res.ok) {
        const message = (data && data.message) || 'Request failed (' + res.status + ')';
        const err = new Error(message);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

export const api = {
    register: function(payload) {
        return request('/api/auth/register', { method: 'POST', body: payload });
    },
    verifyEmail: function(token) {
        return request('/api/auth/verify/' + token, { method: 'GET', auth: false });
    },
    login: function(payload) {
        return request('/api/auth/login', { method: 'POST', body: payload, auth: false });
    },
    me: function() {
        return request('/api/auth/me');
    },
    forgotPassword: function(email) {
        return request('/api/auth/forgot-password', { method: 'POST', body: { email: email }, auth: false });
    },
    resetPassword: function(token, password) {
        return request('/api/auth/reset-password/' + token, { method: 'POST', body: { password: password }, auth: false });
    },
    addAddress: function(payload) {
        return request('/api/auth/addresses', { method: 'POST', body: payload });
    },
    createRazorpayOrder: function(payload) {
        return request('/api/orders/razorpay/create-order', { method: 'POST', body: payload });
    },
    verifyPayment: function(payload) {
        return request('/api/orders/razorpay/verify', { method: 'POST', body: payload });
    },
    myOrders: function() {
        return request('/api/orders');
    },
    getOrder: function(id) {
        return request('/api/orders/' + id);
    },
    inventory: function() {
        return request('/api/inventory');
    },
    adminLogin: function(payload) {
        return request('/api/admin/login', { method: 'POST', body: payload, auth: false });
    },
    adminOrders: function(params) {
        const p = params || {};
        const qs = new URLSearchParams(p).toString();
        return request('/api/admin/orders' + (qs ? '?' + qs : ''));
    },
    adminOrderDetail: function(id) {
        return request('/api/admin/orders/' + id);
    },
    adminUpdateStatus: function(id, status) {
        return request('/api/admin/orders/' + id + '/status', { method: 'PATCH', body: { status: status } });
    },
    adminInventory: function() {
        return request('/api/admin/inventory');
    },
    adminUpdateInventory: function(id, payload) {
        return request('/api/admin/inventory/' + id, { method: 'PUT', body: payload });
    },
    adminStats: function() {
        return request('/api/admin/stats');
    },
};

export function setToken(token) {
    localStorage.setItem('sh_token', token);
}
export function clearToken() {
    localStorage.removeItem('sh_token');
}