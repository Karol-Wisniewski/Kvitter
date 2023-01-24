import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {},
    tweets: [],
    comments: [],
    tweetsCount: 0
  },
  reducers: {
    setUserDataReducer: (state, action) => {
      state.user = action.payload
    },
    setTweetsReducer: (state, action) => {
      state.tweets = action.payload
    },
    setCommentsReducer: (state, action) => {
      state.comments = action.payload
    },
    setTweetsCountReducer: (state, action) => {
      state.tweetsCount = action.payload
    },
  },
});

export const { setUserDataReducer, setTweetsReducer, setCommentsReducer, setTweetsCountReducer } = userSlice.actions;

export default userSlice.reducer;
