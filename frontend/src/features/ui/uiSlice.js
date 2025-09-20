import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { endpoints } from "../../app/api";

export const fetchCredits = createAsyncThunk("ui/credits", async ()=> {
  const { data } = await api.get(endpoints.credits); // -> { credits: number }
  return data.credits ?? 0;
});

export const fetchNotifications = createAsyncThunk("ui/notifications", async ()=> {
  const { data } = await api.get(endpoints.notifications); // -> [{id,message,created_at}]
  return data;
});

const slice = createSlice({
  name: "ui",
  initialState: { notificationsOpen:false, notifications:[], credits:0 },
  reducers: {
    toggleNotifications: (s)=>{ s.notificationsOpen = !s.notificationsOpen; },
  },
  extraReducers: (b)=>{
    b.addCase(fetchCredits.fulfilled, (s,a)=>{ s.credits = a.payload; })
     .addCase(fetchNotifications.fulfilled, (s,a)=>{ s.notifications = a.payload; });
  }
});
export const { toggleNotifications } = slice.actions;
export default slice.reducer;
