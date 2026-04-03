const http = require('http');
const path = require('path');
const { readFile, writeFile, mkdir } = require('fs/promises');

const PORT = Number(process.env.PORT || 8787);
const STATE_FILE = path.join(__dirname, 'state.json');

const DEMO_ADDRESS = 'moi:demo:0x91c2b4f8d7a6';
const NETWORK_NAME = 'MOI Demo Network';

const seedState = {
  network: {
    name: NETWORK_NAME,
    mode: 'local-demo',
  },
  profile: {
    address: DEMO_ADDRESS,
    displayName: 'Demo Delegate',
    interactions: 4,
    votesCast: 2,
    proposalsCreated: 1,
  },
  proposals: [
    {
      id: 1,
      title: 'Launch a community grant pilot',
      yes: 14,
      no: 3,
      createdBy: 'Treasury Council',
      createdAt: '2026-03-29T09:15:00.000Z',
      voters: {},
    },
    {
      id: 2,
      title: 'Open weekly contributor office hours',
      yes: 11,
      no: 1,
      createdBy: 'Operations Guild',
      createdAt: '2026-03-30T14:30:00.000Z',
      voters: {},
    },
    {
      id: 3,
      title: 'Allocate budget for a public dashboard',
      yes: 8,
      no: 5,
      createdBy: 'Analytics Circle',
      createdAt: '2026-04-01T11:45:00.000Z',
      voters: {},
    },
  ],
  activity: [
    {
      id: 1,
      type: 'vote',
      message: 'Demo Delegate voted Yes on "Open weekly contributor office hours"',
      createdAt: '2026-04-02T15:20:00.000Z',
    },
    {
      id: 2,
      type: 'proposal',
      message: 'A new proposal was created for the public dashboard budget',
      createdAt: '2026-04-02T10:05:00.000Z',
    },
    {
      id: 3,
      type: 'profile',
      message: 'Participant profile synced and vote weight recalculated',
      createdAt: '2026-04-02T09:10:00.000Z',
    },
  ],
  nextProposalId: 4,
  nextActivityId: 4,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Request body too large'));
        request.destroy();
      }
    });
    request.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

async function ensureStateDir() {
  await mkdir(__dirname, { recursive: true });
}

async function loadState() {
  try {
    const fileContents = await readFile(STATE_FILE, 'utf8');
    const parsed = JSON.parse(fileContents);
    return {
      ...clone(seedState),
      ...parsed,
      proposals: Array.isArray(parsed.proposals) ? parsed.proposals : clone(seedState.proposals),
      activity: Array.isArray(parsed.activity) ? parsed.activity : clone(seedState.activity),
    };
  } catch {
    return clone(seedState);
  }
}

async function saveState(state) {
  await ensureStateDir();
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

function getVoteWeight(profile) {
  return Math.min(5, 1 + Math.floor(profile.interactions / 2));
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

function buildResponse(state) {
  return {
    network: state.network,
    profile: {
      ...state.profile,
      voteWeight: getVoteWeight(state.profile),
    },
    summary: createSummary(state),
    proposals: [...state.proposals].sort((left, right) => right.id - left.id),
    activity: [...state.activity].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)).slice(0, 6),
    lastUpdated: new Date().toISOString(),
  };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(payload);
}

function addActivity(state, type, message) {
  state.activity.unshift({
    id: state.nextActivityId++,
    type,
    message,
    createdAt: new Date().toISOString(),
  });
  state.activity = state.activity.slice(0, 10);
}

function sanitizeTitle(title) {
  return String(title || '').trim().replace(/\s+/g, ' ').slice(0, 120);
}

async function handleApi(request, response, state) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const { pathname } = requestUrl;

  if (request.method === 'GET' && pathname === '/api/health') {
    sendJson(response, 200, { ok: true, name: NETWORK_NAME });
    return state;
  }

  if (request.method === 'GET' && pathname === '/api/state') {
    sendJson(response, 200, buildResponse(state));
    return state;
  }

  if (request.method === 'POST' && pathname === '/api/reset') {
    state = clone(seedState);
    await saveState(state);
    sendJson(response, 200, buildResponse(state));
    return state;
  }

  if (request.method === 'POST' && pathname === '/api/proposals') {
    const body = await parseJsonBody(request);
    const title = sanitizeTitle(body.title);

    if (!title) {
      sendJson(response, 400, { error: 'Proposal title is required.' });
      return state;
    }

    const proposal = {
      id: state.nextProposalId++,
      title,
      yes: 0,
      no: 0,
      createdBy: state.profile.displayName,
      createdAt: new Date().toISOString(),
      voters: {},
    };

    state.proposals.unshift(proposal);
    state.profile.proposalsCreated += 1;
    state.profile.interactions += 1;
    addActivity(state, 'proposal', `Proposal #${proposal.id} created: ${proposal.title}`);
    await saveState(state);
    sendJson(response, 201, { proposal, ...buildResponse(state) });
    return state;
  }

  const voteMatch = pathname.match(/^\/api\/proposals\/(\d+)\/vote$/);
  if (request.method === 'POST' && voteMatch) {
    const proposalId = Number(voteMatch[1]);
    const body = await parseJsonBody(request);
    const proposal = state.proposals.find((item) => item.id === proposalId);

    if (!proposal) {
      sendJson(response, 404, { error: 'Proposal not found.' });
      return state;
    }

    const voteKey = state.profile.address;
    if (proposal.voters[voteKey]) {
      sendJson(response, 409, { error: 'You already voted on this proposal.' });
      return state;
    }

    const voteYes = Boolean(body.voteYes);
    const weight = getVoteWeight(state.profile);
    proposal.voters[voteKey] = voteYes ? 'yes' : 'no';
    if (voteYes) {
      proposal.yes += weight;
    } else {
      proposal.no += weight;
    }

    state.profile.votesCast += 1;
    state.profile.interactions += 1;
    addActivity(
      state,
      'vote',
      `${state.profile.displayName} voted ${voteYes ? 'Yes' : 'No'} on #${proposal.id} with weight ${weight}`,
    );

    await saveState(state);
    sendJson(response, 200, { proposal, ...buildResponse(state) });
    return state;
  }

  sendJson(response, 404, { error: 'Not found.' });
  return state;
}

async function main() {
  let state = await loadState();

  const server = http.createServer(async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }

    try {
      if (request.url && request.url.startsWith('/api/')) {
        state = await handleApi(request, response, state);
        return;
      }

      sendText(response, 200, 'MOI DAO demo backend is running.');
    } catch (error) {
      console.error(error);
      sendJson(response, 500, { error: error.message || 'Internal server error.' });
    }
  });

  server.listen(PORT, () => {
    console.log(`MOI DAO demo backend listening on http://127.0.0.1:${PORT}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});