import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { endpoints, setAuthHeader, pickAccess } from "../../app/api";

export const bootstrap = createAsyncThunk("auth/bootstrap", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post(endpoints.refresh, {}); // cookie-based
    const token = pickAccess(data);
    if (!token) throw new Error("no token");
    setAuthHeader(token);
    const me = await api.get(endpoints.me);
    return { token, user: me.data };
  } catch {
    return rejectWithValue("No session");
  }
});

export const loginThunk = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post(endpoints.login, payload);
    const token = pickAccess(data);
    if (!token) throw new Error("no token");
    setAuthHeader(token);
    const me = await api.get(endpoints.me);
    return { token, user: me.data };
  } catch (e) {
    return rejectWithValue(e?.response?.data?.error || "Login failed");
  }
});

export const registerThunk = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post(endpoints.register, payload);
    const token = pickAccess(data);
    if (!token) throw new Error("no token");
    setAuthHeader(token);
    const me = await api.get(endpoints.me);
    return { token, user: me.data };
  } catch (e) {
    return rejectWithValue(e?.response?.data?.error || "Registration failed");
  }
});

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try { await api.post(endpoints.logout, {}); } catch {}
});

const slice = createSlice({
  name: "auth",
  initialState: { accessToken: null, user: null, loading: true, error: null },
  reducers: {
    setAccessToken: (s, a) => { s.accessToken = a.payload; setAuthHeader(a.payload); },
  },
  extraReducers: (b) => {
    b.addCase(bootstrap.pending,   (s)       => { s.loading = true; })
     .addCase(bootstrap.fulfilled, (s,a)     => { s.loading=false; s.accessToken=a.payload.token; s.user=a.payload.user; s.error=null; })
     .addCase(bootstrap.rejected,  (s)       => { s.loading=false; s.accessToken=null; s.user=null; })
     .addCase(loginThunk.fulfilled,(s,a)     => { s.accessToken=a.payload.token; s.user=a.payload.user; s.error=null; })
     .addCase(loginThunk.rejected, (s,a)     => { s.error=a.payload; })
     .addCase(registerThunk.fulfilled,(s,a)  => { s.accessToken=a.payload.token; s.user=a.payload.user; s.error=null; })
     .addCase(registerThunk.rejected,(s,a)   => { s.error=a.payload; })
     .addCase(logoutThunk.fulfilled,(s)      => { s.accessToken=null; s.user=null; setAuthHeader(null); });
  }
});
export const { setAccessToken } = slice.actions;
export default slice.reducer;
