// src/features/chat/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { endpoints } from "../../app/api";

/* ----------------------------- Thunks ----------------------------- */
export const loadConversations = createAsyncThunk(
  "chat/loadConversations",
  async () => {
    const { data } = await api.get(endpoints.conversations);
    return data; // [{id,title,lastMessageAt}]
  }
);

export const createConversation = createAsyncThunk(
  "chat/createConversation",
  async (payload = {}) => {
    const { data } = await api.post(endpoints.createConversation, payload);
    return data; // {id,title,lastMessageAt}
  }
);

export const loadMessages = createAsyncThunk(
  "chat/loadMessages",
  async (conversationId) => {
    const { data } = await api.get(endpoints.messages(conversationId));
    return { conversationId, messages: data }; // [{id,role,text,created_at}]
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ conversationId, text }) => {
    const { data } = await api.post(endpoints.send(conversationId), { text });
    // -> { userMessage:{id,role,text,created_at}, assistantMessage:{...} }
    return { conversationId, ...data };
  }
);

/* ----------------------------- Helpers ---------------------------- */
const snippetOf = (t = "", n = 90) => t.replace(/\s+/g, " ").trim().slice(0, n);

/* ------------------------------ Slice ----------------------------- */
const slice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],   // [{id,title,lastMessageAt, preview?}]
    currentId: null,
    messages: {},        // { [conversationId]: Message[] }
    loading: false,
    creating: false,
  },
  reducers: {
    setCurrent: (s, a) => { s.currentId = a.payload; },
  },
  extraReducers: (b) => {
    // load list
    b.addCase(loadConversations.pending, (s) => { s.loading = true; });
    b.addCase(loadConversations.fulfilled, (s, a) => {
      s.loading = false;
      s.conversations = a.payload || [];
      if (!s.currentId && s.conversations[0]) s.currentId = s.conversations[0].id;
    });
    b.addCase(loadConversations.rejected, (s) => { s.loading = false; });

    // create convo
    b.addCase(createConversation.pending, (s) => { s.creating = true; });
    b.addCase(createConversation.fulfilled, (s, a) => {
      s.creating = false;
      const convo = { ...a.payload, preview: "" };
      s.conversations = [convo, ...s.conversations.filter(c => c.id !== convo.id)];
      s.currentId = convo.id;
      if (!s.messages[convo.id]) s.messages[convo.id] = [];
    });
    b.addCase(createConversation.rejected, (s) => { s.creating = false; });

    // load messages (also compute preview from the latest assistant message)
    b.addCase(loadMessages.fulfilled, (s, a) => {
      const { conversationId, messages } = a.payload;
      s.messages[conversationId] = messages || [];

      const lastAssistant = [...(messages || [])].reverse().find(m => m.role === "assistant");
      const idx = s.conversations.findIndex(c => c.id === conversationId);
      if (idx !== -1 && lastAssistant) {
        s.conversations[idx] = {
          ...s.conversations[idx],
          preview: snippetOf(lastAssistant.text, 90),
          lastMessageAt: lastAssistant.created_at || s.conversations[idx].lastMessageAt,
        };
      }
    });

    // send message -> rename title to first user message & set preview from assistant reply
    b.addCase(sendMessage.fulfilled, (s, a) => {
      const { conversationId, userMessage, assistantMessage } = a.payload;

      // append
      const prev = s.messages[conversationId] || [];
      s.messages[conversationId] = [...prev, userMessage, assistantMessage];

      // update convo
      const idx = s.conversations.findIndex(c => c.id === conversationId);
      if (idx !== -1) {
        const cur = s.conversations[idx];
        const shouldRename =
          !cur.title || cur.title === "New Chat" || cur.title === "Welcome chat";

        const updated = {
          ...cur,
          title: shouldRename ? (snippetOf(userMessage?.text, 60) || cur.title) : cur.title,
          preview: snippetOf(assistantMessage?.text, 90) || cur.preview || "",
          lastMessageAt: assistantMessage?.created_at || userMessage?.created_at || Date.now(),
        };

        // move to top
        s.conversations.splice(idx, 1);
        s.conversations.unshift(updated);
      }
    });
  },
});

export const { setCurrent } = slice.actions;
export default slice.reducer;
