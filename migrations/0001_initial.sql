CREATE TABLE households (
 id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
 pin_hash TEXT NOT NULL, settings TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE profiles (
 id TEXT PRIMARY KEY, household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
 name TEXT NOT NULL, avatar TEXT NOT NULL, state TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX profiles_household ON profiles(household_id);
CREATE TABLE sessions (
 token_hash TEXT PRIMARY KEY, household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL, adult_until INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
