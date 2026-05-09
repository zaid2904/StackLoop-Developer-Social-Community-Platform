import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";
// Get user from localStorage
const user = JSON.parse(localStorage.getItem("user"));


// ======================
// LOGIN USER
// ======================

export const loginUser = createAsyncThunk("auth/login", async (formData, thunkAPI) => {
  try {
    const response = await API.post("/auth/login", formData);
    return response.data;

  }
  catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Login Failed"
    );
  }

})

// ======================
// Register  USER
// ======================
export const RegisterUser = createAsyncThunk("/auth/register", async (formData, thunkAPI) => {
  try {
    const response = await API.post("/auth/register", formData);
    return response.data;
  }
  catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Login Failed"
    );
  }

})
const token = localStorage.getItem("token");


const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: user || null,
    loading: false,
    error: null,
    token: token || null
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
  extraReducers: (builder) => {
    builder
      // ================= LOGIN =================
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        // ✅ store token and user in localStorage
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        state.token = action.payload.token;

      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login Failed";
      })


      // ================= REGISTER =================
      .addCase(RegisterUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(RegisterUser.fulfilled, (state, action) => {
        state.loading = false;

        // choose what you want:
        state.user = action.payload; // auto login
        // OR state.user = null; // only register
      })

      .addCase(RegisterUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Register Failed";
      });


  },


})


export const { logout } = authSlice.actions;
export default authSlice.reducer;


