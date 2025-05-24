const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const FILES = {
  votingKeys: path.join(DATA_DIR, 'votingKeys.json'),
  candidates: path.join(DATA_DIR, 'candidates.json'),
  votes: path.join(DATA_DIR, 'votes.json'),
  sessions: path.join(DATA_DIR, 'sessions.json')
};

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
};

// Generic file operation
const readFile = async (filename) => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeFile = async (filename, data) => {
  await ensureDataDir();
  await fs.writeFile(filename, JSON.stringify(data, null, 2));
};

// Data access functions
const votingKeys = {
  getAll: () => readFile(FILES.votingKeys),
  save: (data) => writeFile(FILES.votingKeys, data),
  add: async (key) => {
    const keys = await votingKeys.getAll();
    const newKey = {
      _id: Date.now().toString(),
      key,
      used: false,
      usedAt: null,
      createdAt: new Date()
    };
    keys.push(newKey);
    await votingKeys.save(keys);
    return newKey;
  },
  findByKey: async (key) => {
    const keys = await votingKeys.getAll();
    return keys.find(k => k.key === key);
  },
  markAsUsed: async (key) => {
    const keys = await votingKeys.getAll();
    const keyObj = keys.find(k => k.key === key);
    if (keyObj) {
      keyObj.used = true;
      keyObj.usedAt = new Date();
      await votingKeys.save(keys);
    }
    return keyObj;
  },
  deleteAll: async () => {
    await votingKeys.save([]);
  }
};

const candidates = {
  getAll: () => readFile(FILES.candidates),
  save: (data) => writeFile(FILES.candidates, data),
  deleteAll: async () => {
    await candidates.save([]);
  },
  replaceAll: async (newCandidates) => {
    const candidatesData = newCandidates.map((candidate, index) => ({
      _id: Date.now().toString() + index,
      name: candidate.name,
      description: candidate.description || '',
      photo: candidate.photo || '',
      position: index + 1,
      votes: 0,
      createdAt: new Date()
    }));
    await candidates.save(candidatesData);
    return candidatesData;
  },
  incrementVote: async (candidateId) => {
    const candidatesList = await candidates.getAll();
    const candidate = candidatesList.find(c => c._id === candidateId);
    if (candidate) {
      candidate.votes += 1;
      await candidates.save(candidatesList);
    }
    return candidate;
  }
};

const votes = {
  getAll: () => readFile(FILES.votes),
  save: (data) => writeFile(FILES.votes, data),
  add: async (candidateId, keyHash) => {
    const votesList = await votes.getAll();
    const newVote = {
      _id: Date.now().toString(),
      candidateId,
      keyHash,
      timestamp: new Date()
    };
    votesList.push(newVote);
    await votes.save(votesList);
    return newVote;
  },
  findByKeyHash: async (keyHash) => {
    const votesList = await votes.getAll();
    return votesList.find(v => v.keyHash === keyHash);
  },
  deleteAll: async () => {
    await votes.save([]);
  }
};

const sessions = {
  getAll: () => readFile(FILES.sessions),
  save: (data) => writeFile(FILES.sessions, data),
  getActive: async () => {
    const sessionsList = await sessions.getAll();
    return sessionsList.find(s => s.isActive);
  },
  create: async () => {
    const sessionsList = await sessions.getAll();
    // Deactivate all existing sessions
    sessionsList.forEach(s => {
      s.isActive = false;
      s.endTime = new Date();
    });
    
    const newSession = {
      _id: Date.now().toString(),
      isActive: true,
      startTime: new Date(),
      endTime: null,
      totalVotes: 0,
      createdAt: new Date()
    };
    sessionsList.push(newSession);
    await sessions.save(sessionsList);
    return newSession;
  },
  stop: async () => {
    const sessionsList = await sessions.getAll();
    const activeSession = sessionsList.find(s => s.isActive);
    if (activeSession) {
      activeSession.isActive = false;
      activeSession.endTime = new Date();
      await sessions.save(sessionsList);
    }
    return activeSession;
  },
  deleteAll: async () => {
    await sessions.save([]);
  }
};

module.exports = {
  votingKeys,
  candidates,
  votes,
  sessions
};