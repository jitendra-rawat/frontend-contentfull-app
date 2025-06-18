import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ComponentConfig } from '../../lib/types';

interface LayoutState {
  past: ComponentConfig[][];
  current: ComponentConfig[];
  future: ComponentConfig[][];
}

const initialState: LayoutState = {
  past: [],
  current: [],
  future: [],
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setLayout: (state, action: PayloadAction<ComponentConfig[]>) => {
      state.past.push(state.current);
      state.current = action.payload;
      state.future = [];
    },
    removeComponent: (state, action: PayloadAction<string>) => {
      state.past.push(state.current);
      state.current = state.current.filter(component => component.id !== action.payload);
      state.future = [];
    },
    undo: (state) => {
      if (state.past.length === 0) return;
      state.future.push(state.current);
      state.current = state.past.pop()!;
    },
    redo: (state) => {
      if (state.future.length === 0) return;
      state.past.push(state.current);
      state.current = state.future.pop()!;
    },
  },
});

export const { setLayout, removeComponent, undo, redo } = layoutSlice.actions;
export default layoutSlice.reducer;
