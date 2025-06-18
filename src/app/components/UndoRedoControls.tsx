'use client';

import { useDispatch, useSelector } from 'react-redux';
import { undo, redo } from '../redux/slices/layoutSlice';
import { RootState } from '../redux/store';
import styles from '../styles/DragDrop.module.css';

interface UndoRedoControlsProps {
  onUserInteraction?: () => void;
}

const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({ onUserInteraction }) => {
  const dispatch = useDispatch();
  const canUndo = useSelector((state: RootState) => state.layout.past.length > 0);
  const canRedo = useSelector((state: RootState) => state.layout.future.length > 0);

  const handleUndo = () => {
    dispatch(undo());
    if (onUserInteraction) {
      onUserInteraction();
    }
  };

  const handleRedo = () => {
    dispatch(redo());
    if (onUserInteraction) {
      onUserInteraction();
    }
  };

  return (
    <div className={styles.controls}>
      <button onClick={handleUndo} disabled={!canUndo}>
        ↩️ Undo
      </button>
      <button onClick={handleRedo} disabled={!canRedo}>
        ↪️ Redo
      </button>
    </div>
  );
};

export default UndoRedoControls;
