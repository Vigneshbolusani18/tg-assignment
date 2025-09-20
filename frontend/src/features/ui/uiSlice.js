import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { endpoints } from "../../app/api";

// ---- Thunks ----
export const fetchCredits = createAsyncThunk("ui/fetchCredits", async () => {
  // BE returns { count }
  const { data } = await api.get(endpoints.credits);
  return data?.count ?? 0;
});

export const fetchNotifications = createAsyncThunk(
  "ui/fetchNotifications",
  async () => {
    // BE returns [{ id, title, body, createdAt, read }]
    const { data } = await api.get(endpoints.notifications);
    return Array.isArray(data) ? data : [];
  }
);

export const markAllRead = createAsyncThunk("ui/markAllRead", async () => {
  await api.post(`${endpoints.notifications}/read-all`);
  return true;
});

// ---- Slice ----
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

// selector for unread count
export const selectUnreadCount = (state) =>
  state.ui.notifications?.filter((n) => !n.read).length ?? 0;

export default uiSlice.reducer;
