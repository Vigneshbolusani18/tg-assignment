// backend/src/repositories/chat.repo.js
import pool from "../db.js";
import { randomUUID } from "node:crypto";

export async function ensureChatSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // add conversation_id if missing
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='messages' AND column_name='conversation_id'
      ) THEN
        ALTER TABLE messages ADD COLUMN conversation_id TEXT;
      END IF;
    END $$;
  `);

  // make NOT NULL + FK (safe if already applied)
  await pool.query(`
    DO $$
    BEGIN
      BEGIN
        ALTER TABLE messages ALTER COLUMN conversation_id SET NOT NULL;
      EXCEPTION WHEN others THEN NULL;
      END;
      BEGIN
        ALTER TABLE messages
        ADD CONSTRAINT messages_conversation_fk
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
      EXCEPTION WHEN others THEN NULL;
      END;
    END $$;
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_conversations_user_last ON conversations (user_id, last_message_at DESC)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_convo_created ON messages (conversation_id, created_at ASC)`);
}

export const ChatRepo = {
  async listConversations(userId) {
    const { rows } = await pool.query(
      `SELECT id, title, last_message_at AS "lastMessageAt"
         FROM conversations
        WHERE user_id = $1
        ORDER BY last_message_at DESC`,
      [userId]
    );
    return rows;
  },

  async createConversation(userId, title = "New Chat") {
    const id = `c_${randomUUID()}`;
    const { rows } = await pool.query(
      `INSERT INTO conversations (id, user_id, title, last_message_at)
       VALUES ($1,$2,$3,NOW())
       RETURNING id, title, last_message_at AS "lastMessageAt"`,
      [id, userId, title]
    );
    return rows[0];
  },

  async ensureOwned(convoId, userId) {
    const { rows } = await pool.query(
      `SELECT 1 FROM conversations WHERE id=$1 AND user_id=$2`,
      [convoId, userId]
    );
    return rows.length > 0;
  },

  async listMessages(convoId) {
    const { rows } = await pool.query(
      `SELECT id, role, content AS text, created_at
         FROM messages
        WHERE conversation_id=$1
        ORDER BY created_at ASC`,
      [convoId]
    );
    return rows;
  },

  async addMessage(convoId, userId, role, text) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `INSERT INTO messages (conversation_id, user_id, role, content, created_at)
         VALUES ($1,$2,$3,$4,NOW())
         RETURNING id, role, content AS text, created_at`,
        [convoId, userId, role, text]
      );
      await client.query(
        `UPDATE conversations SET last_message_at=NOW() WHERE id=$1`,
        [convoId]
      );
      await client.query("COMMIT");
      return rows[0];
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async maybeRenameToSnippet(convoId, userId, userText) {
    const { rows } = await pool.query(
      `SELECT title FROM conversations WHERE id=$1 AND user_id=$2`,
      [convoId, userId]
    );
    if (!rows.length) return;
    const current = rows[0].title;
    if (current && current !== "New Chat" && current !== "Welcome chat") return;

    const snippet = userText.replace(/\s+/g, " ").slice(0, 40).trim();
    await pool.query(
      `UPDATE conversations SET title=$1 WHERE id=$2 AND user_id=$3`,
      [snippet || "New Chat", convoId, userId]
    );
  },
};
