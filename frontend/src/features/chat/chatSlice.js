import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { endpoints } from "../../app/api";

export const loadConversations = createAsyncThunk("chat/loadConversations", async ()=> {
  const { data } = await api.get(endpoints.conversations);
  return data; // [{id,title,lastMessageAt}]
});

export const loadMessages = createAsyncThunk("chat/loadMessages", async (conversationId)=> {
  const { data } = await api.get(endpoints.messages(conversationId));
  return { conversationId, messages: data }; // [{id,role,text,created_at}]
});

export const sendMessage = createAsyncThunk("chat/sendMessage", async ({conversationId, text})=> {
  const { data } = await api.post(endpoints.send(conversationId), { text });
  // expect { userMessage, assistantMessage }
  return { conversationId, userMessage: data.userMessage, assistantMessage: data.assistantMessage };
});

const slice = createSlice({
  name: "chat",
  initialState: { conversations: [], currentId: null, messages: {}, loading:false },
  reducers: {
    setCurrent: (s,a)=>{ s.currentId = a.payload; },
  },
  extraReducers: (b)=>{
    b.addCase(loadConversations.fulfilled, (s,a)=>{ s.conversations = a.payload; if(!s.currentId && a.payload[0]) s.currentId=a.payload[0].id; })
     .addCase(loadMessages.fulfilled, (s,a)=>{ s.messages[a.payload.conversationId] = a.payload.messages; })
     .addCase(sendMessage.fulfilled, (s,a)=> {
        const list = s.messages[a.payload.conversationId] || [];
        s.messages[a.payload.conversationId] = [...list, a.payload.userMessage, a.payload.assistantMessage];
     });
  }
});
export const { setCurrent } = slice.actions;
export default slice.reducer;
