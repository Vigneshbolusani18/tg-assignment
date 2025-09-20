import { configureStore } from "@reduxjs/toolkit";
import auth from "../features/auth/authSlice";
import ui from "../features/ui/uiSlice";
import chat from "../features/chat/chatSlice";

export const store = configureStore({
  reducer: { auth, ui, chat },
});
