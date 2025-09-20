// backend/src/routes/meta.routes.js
import { Router } from "express";
import { authGuard } from "../middlewares/auth.middleware.js";
import { CreditsRepo } from "../repositories/credits.repo.js"; // ← NEW

const router = Router();

/* -------------------- Notifications (in-memory) -------------------- */
const notificationsByUser = new Map(); // userId -> [{id,title,body,createdAt,read}]
function ensureNotifs(userId) {
  if (!notificationsByUser.has(userId)) {
    const now = Date.now();
    notificationsByUser.set(userId, [
      {
        id: "n1",
        title: "Welcome!",
        body: "Thanks for signing up 🎉",
        createdAt: now - 1000 * 60 * 15,
        read: false,
      },
      {
        id: "n2",
        title: "Feature Update",
        body: "New conversation export is available.",
        createdAt: now - 1000 * 60 * 60 * 2,
        read: true,
      },
    ]);
  }
}

/* -------------------------- Credits (DB) --------------------------- */
// GET /credits  -> { count }
router.get("/credits", authGuard, async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const count = await CreditsRepo.get(userId); // ensures row w/ default 1250
    res.json({ count });
  } catch (e) {
    next(e);
  }
});

// (Optional) POST /credits/spend  { amount } -> { remaining }
router.post("/credits/spend", authGuard, async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const amount = Math.max(0, Number(req.body?.amount ?? 0));
    const remaining = await CreditsRepo.spend(userId, amount);
    res.json({ remaining });
  } catch (e) {
    next(e);
  }
});

/* ----------------------- Notifications API ------------------------ */
router.get("/notifications", authGuard, (req, res) => {
  const userId = String(req.user.id);
  ensureNotifs(userId);
  res.json(notificationsByUser.get(userId));
});

router.post("/notifications/read-all", authGuard, (req, res) => {
  const userId = String(req.user.id);
  ensureNotifs(userId);
  const list = notificationsByUser.get(userId).map((n) => ({ ...n, read: true }));
  notificationsByUser.set(userId, list);
  res.json({ ok: true });
});

export default router;
