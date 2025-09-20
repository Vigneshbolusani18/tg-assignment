// backend/src/routes/messages.routes.js
import { Router } from "express";
import { authGuard } from "../middlewares/auth.middleware.js";
import { ChatRepo, ensureChatSchema } from "../repositories/chat.repo.js";
import { geminiReply } from "../services/gemini.service.js";
import { CreditsRepo } from "../repositories/credits.repo.js";

const router = Router();
ensureChatSchema().catch(console.error);

async function ensureSeed(userId) {
  const list = await ChatRepo.listConversations(userId);
  if (list.length === 0) {
    const conv = await ChatRepo.createConversation(userId, "Welcome chat");
    await ChatRepo.addMessage(conv.id, userId, "assistant", "Hi! Ask me anything.");
  }
}

// GET /messages/conversations
router.get("/conversations", authGuard, async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    await ensureSeed(userId);
    const convos = await ChatRepo.listConversations(userId);
    res.json(convos);
  } catch (e) { next(e); }
});

// POST /messages/new
router.post("/new", authGuard, async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    await ensureSeed(userId);
    const title = req.body?.title || "New Chat";
    const conv = await ChatRepo.createConversation(userId, title);
    res.status(201).json(conv);
  } catch (e) { next(e); }
});

// GET /messages/:id
router.get("/:id", authGuard, async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const convoId = req.params.id;
    const ok = await ChatRepo.ensureOwned(convoId, userId);
    if (!ok) return res.status(404).json({ error: "Conversation not found" });
    const msgs = await ChatRepo.listMessages(convoId);
    res.json(msgs);
  } catch (e) { next(e); }
});

// POST /messages/:id  { text }
router.post("/:id", authGuard, async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const convoId = req.params.id;
    const text = (req.body?.text || "").trim();
    if (!text) return res.status(400).json({ error: "text required" });

    const ok = await ChatRepo.ensureOwned(convoId, userId);
    if (!ok) return res.status(404).json({ error: "Conversation not found" });

    // 1) store user message
    const userMessage = await ChatRepo.addMessage(convoId, userId, "user", text);

    // 2) ask Gemini (fallback to echo)
    let reply = "";
    try {
      reply = await geminiReply(text);
      if (!reply) reply = "Sorry, I couldn’t generate a response.";
    } catch (err) {
      console.error("Gemini error:", err?.message || err);
      reply = `Echo: ${text}`;
    }

    // 3) store assistant message
    const assistantMessage = await ChatRepo.addMessage(convoId, userId, "assistant", reply);

    // 4) rename convo to first user text
    await ChatRepo.maybeRenameToSnippet(convoId, userId, text);

    // 5) spend 10 credits and return remaining
    const creditsLeft = await CreditsRepo.spend(userId, 10);

    res.json({ userMessage, assistantMessage, spent: 10, creditsLeft });
  } catch (e) { next(e); }
});

export default router;
