import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { endpoints } from "../../app/api";

/* ----------------------------- Thunks ----------------------------- */

// BE returns { count }
export const fetchCredits = createAsyncThunk("ui/fetchCredits", async () => {
  const { data } = await api.get(endpoints.credits);
  return data?.count ?? 0;
});

// BE returns [{ id, title, body, createdAt, read }]
export const fetchNotifications = createAsyncThunk(
  "ui/fetchNotifications",
  async () => {
    const { data } = await api.get(endpoints.notifications);
    return Array.isArray(data) ? data : [];
  }
);

export const markAllRead = createAsyncThunk("ui/markAllRead", async () => {
  await api.post(`${endpoints.notifications}/read-all`);
  return true;
});

/* ----------------------------- Slice ------------------------------ */

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    credits: 0,
    notificationsOpen: false,
    notifications: [],
    loadingNotifs: false,
  },
  reducers: {
    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen;
    },
    hideNotifications: (state) => {
      state.notificationsOpen = false;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchCredits.fulfilled, (s, a) => {
      s.credits = a.payload;
    })
      .addCase(fetchNotifications.pending, (s) => {
        s.loadingNotifs = true;
      })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.loadingNotifs = false;
        s.notifications = a.payload;
      })
      .addCase(fetchNotifications.rejected, (s) => {
        s.loadingNotifs = false;
      })
      .addCase(markAllRead.fulfilled, (s) => {
        s.notifications = s.notifications.map((n) => ({ ...n, read: true }));
      });
  },
});

export const { toggleNotifications, hideNotifications } = uiSlice.actions;

/* --------------------------- Selectors ---------------------------- */

/**
 * Show the unread badge immediately after login/registration by
 * falling back to `auth.user.notifications_unread` (returned by /auth/me)
 * until the notifications list has actually been fetched.
 */
export const selectUnreadCount = (state) => {
  const list = state.ui.notifications ?? [];
  // If the list is already loaded, compute from it
  if (list.length > 0) return list.filter((n) => !n.read).length;

  // Otherwise, use the value from /auth/me (set in authSlice user payload)
  return state.auth?.user?.notifications_unread ?? 0;
};

export default uiSlice.reducer;
