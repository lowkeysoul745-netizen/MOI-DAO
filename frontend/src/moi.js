const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const STORAGE_KEY = "moi-dao-demo-state";

const defaultState = {
    network: {
        name: "MOI Demo Network",
        mode: "local-demo",
    },
    profile: {
        address: "moi:demo:0x91c2b4f8d7a6",
        displayName: "Demo Delegate",
        interactions: 4,
        votesCast: 2,
        proposalsCreated: 1,
        voteWeight: 3,
    },
    summary: {
        totalProposals: 3,
        totalYes: 33,
        totalNo: 9,
        voteWeight: 3,
        completedVotes: 2,
        interactions: 4,
    },
    proposals: [
        {
            id: 3,
            title: "Allocate budget for a public dashboard",
            yes: 8,
            no: 5,
            createdBy: "Analytics Circle",
            createdAt: "2026-04-01T11:45:00.000Z",
            voters: {},
        },
        {
            id: 2,
            title: "Open weekly contributor office hours",
            yes: 11,
            no: 1,
            createdBy: "Operations Guild",
            createdAt: "2026-03-30T14:30:00.000Z",
            voters: {},
        },
        {
            id: 1,
            title: "Launch a community grant pilot",
            yes: 14,
            no: 3,
            createdBy: "Treasury Council",
            createdAt: "2026-03-29T09:15:00.000Z",
            voters: {},
        },
    ],
    activity: [
        {
            id: 1,
            type: "vote",
            message: 'Demo Delegate voted Yes on "Open weekly contributor office hours"',
            createdAt: "2026-04-02T15:20:00.000Z",
        },
        {
            id: 2,
            type: "proposal",
            message: "A new proposal was created for the public dashboard budget",
            createdAt: "2026-04-02T10:05:00.000Z",
        },
        {
            id: 3,
            type: "profile",
            message: "Participant profile synced and vote weight recalculated",
            createdAt: "2026-04-02T09:10:00.000Z",
        },
    ],
    nextProposalId: 4,
    nextActivityId: 4,
};

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function loadLocalState() {
    if (typeof window === "undefined") {
        return clone(defaultState);
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return clone(defaultState);
        }

        return { ...clone(defaultState), ...JSON.parse(stored) };
    } catch {
        return clone(defaultState);
    }
}

function saveLocalState(state) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeState(state) {
    return {
        ...clone(defaultState),
        ...state,
        profile: {
            ...clone(defaultState.profile),
            ...(state.profile || {}),
        },
        summary: {
            ...clone(defaultState.summary),
            ...(state.summary || {}),
        },
        proposals: Array.isArray(state.proposals) ? state.proposals : clone(defaultState.proposals),
        activity: Array.isArray(state.activity) ? state.activity : clone(defaultState.activity),
    };
}

function getVoteWeight(profile) {
    return Math.min(5, 1 + Math.floor((profile.interactions || 0) / 2));
}

function createSummary(state) {
    const totals = state.proposals.reduce(
        (accumulator, proposal) => {
            accumulator.yes += proposal.yes;
            accumulator.no += proposal.no;
            return accumulator;
        },
        { yes: 0, no: 0 },
    );

    return {
        totalProposals: state.proposals.length,
        totalYes: totals.yes,
        totalNo: totals.no,
        voteWeight: getVoteWeight(state.profile),
        completedVotes: state.profile.votesCast,
        interactions: state.profile.interactions,
    };
}

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

async function withApiFallback(operation) {
    try {
        return await operation();
    } catch {
        return null;
    }
}

function buildStateWithMeta(state) {
    const normalized = normalizeState(state);
    const profile = {
        ...normalized.profile,
        voteWeight: getVoteWeight(normalized.profile),
    };
    const summary = createSummary(normalized);

    return {
        ...normalized,
        profile,
        summary,
    };
}

function updateLocalProposalState(currentState, title) {
    const nextState = normalizeState(currentState);
    const proposal = {
        id: nextState.nextProposalId || 1,
        title,
        yes: 0,
        no: 0,
        createdBy: nextState.profile.displayName,
        createdAt: new Date().toISOString(),
        voters: {},
    };

    nextState.nextProposalId = proposal.id + 1;
    nextState.profile.proposalsCreated += 1;
    nextState.profile.interactions += 1;
    nextState.proposals = [proposal, ...nextState.proposals];
    nextState.activity = [
        {
            id: nextState.nextActivityId || 1,
            type: "proposal",
            message: `Proposal #${proposal.id} created: ${proposal.title}`,
            createdAt: new Date().toISOString(),
        },
        ...(nextState.activity || []),
    ].slice(0, 10);
    nextState.nextActivityId = (nextState.nextActivityId || 1) + 1;

    return buildStateWithMeta(nextState);
}

function updateLocalVoteState(currentState, proposalId, voteYes) {
    const nextState = normalizeState(currentState);
    const proposal = nextState.proposals.find((item) => item.id === proposalId);

    if (!proposal) {
        throw new Error("Proposal not found.");
    }

    const voterKey = nextState.profile.address;
    if (proposal.voters?.[voterKey]) {
        throw new Error("You already voted on this proposal.");
    }

    const weight = getVoteWeight(nextState.profile);
    proposal.voters = proposal.voters || {};
    proposal.voters[voterKey] = voteYes ? "yes" : "no";
    if (voteYes) {
        proposal.yes += weight;
    } else {
        proposal.no += weight;
    }

    nextState.profile.votesCast += 1;
    nextState.profile.interactions += 1;
    nextState.activity = [
        {
            id: nextState.nextActivityId || 1,
            type: "vote",
            message: `${nextState.profile.displayName} voted ${voteYes ? "Yes" : "No"} on #${proposal.id} with weight ${weight}`,
            createdAt: new Date().toISOString(),
        },
        ...(nextState.activity || []),
    ].slice(0, 10);
    nextState.nextActivityId = (nextState.nextActivityId || 1) + 1;

    return buildStateWithMeta(nextState);
}

export async function initWallet() {
    const remote = await withApiFallback(() => requestJson("/state"));
    const state = remote ? buildStateWithMeta(remote) : buildStateWithMeta(loadLocalState());
    saveLocalState(state);
    return state;
}

export async function fetchDemoState() {
    const remote = await withApiFallback(() => requestJson("/state"));
    const state = remote ? buildStateWithMeta(remote) : buildStateWithMeta(loadLocalState());
    saveLocalState(state);
    return state;
}

export async function createProposal(title) {
    const trimmedTitle = String(title || "").trim();
    if (!trimmedTitle) {
        throw new Error("Proposal title is required.");
    }

    const remote = await withApiFallback(() => requestJson("/proposals", {
        method: "POST",
        body: JSON.stringify({ title: trimmedTitle }),
    }));

    if (remote) {
        saveLocalState(remote);
        return remote;
    }

    const nextState = updateLocalProposalState(loadLocalState(), trimmedTitle);
    saveLocalState(nextState);
    return nextState;
}

export async function voteProposal(proposalId, voteYes) {
    const remote = await withApiFallback(() => requestJson(`/proposals/${proposalId}/vote`, {
        method: "POST",
        body: JSON.stringify({ voteYes }),
    }));

    if (remote) {
        saveLocalState(remote);
        return remote;
    }

    const nextState = updateLocalVoteState(loadLocalState(), proposalId, voteYes);
    saveLocalState(nextState);
    return nextState;
}

export async function resetDemoState() {
    const remote = await withApiFallback(() => requestJson("/reset", {
        method: "POST",
    }));

    if (remote) {
        saveLocalState(remote);
        return remote;
    }

    const state = buildStateWithMeta(defaultState);
    saveLocalState(state);
    return state;
}