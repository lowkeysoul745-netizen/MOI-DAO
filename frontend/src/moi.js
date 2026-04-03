const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function requestJson(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.error || "Request failed.");
    }

    return payload;
}

export async function initWallet() {
    return requestJson("/state");
}

export async function fetchDemoState() {
    return requestJson("/state");
}

export async function createProposal(title) {
    return requestJson("/proposals", {
        method: "POST",
        body: JSON.stringify({ title }),
    });
}

export async function voteProposal(proposalId, voteYes) {
    return requestJson(`/proposals/${proposalId}/vote`, {
        method: "POST",
        body: JSON.stringify({ voteYes }),
    });
}

export async function resetDemoState() {
    return requestJson("/reset", {
        method: "POST",
    });
}