// ============================================================
// ANNUAIRE TSA — Configuration API
// Plus de Supabase — les appels vont vers les fichiers PHP
// ============================================================

const API_BASE = '/api';

// Requête publique
async function apiFetch(endpoint, options = {}) {
    const res = await fetch(API_BASE + '/' + endpoint, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error('Erreur ' + res.status + ' : ' + err);
    }
    if (res.status === 204) return {};
    return res.json();
}

// Requête admin (avec token)
async function adminFetch(endpoint, options = {}) {
    const token = sessionStorage.getItem('admin_token');
    const res = await fetch(API_BASE + '/' + endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': token || ''
        },
        ...options
    });
    if (res.status === 401) {
        sessionStorage.removeItem('admin_token');
        window.location.href = '/admin/login.html';
        return;
    }
    if (!res.ok) {
        const err = await res.text();
        throw new Error('Erreur ' + res.status + ' : ' + err);
    }
    if (res.status === 204) return {};
    return res.json();
}
