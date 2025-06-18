'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { setLayout, removeComponent } from '../redux/slices/layoutSlice';
import { RootState } from '../redux/store';
import ComponentPreview from './ComponentPreview';
import styles from '../styles/DragDrop.module.css';
import { ComponentConfig } from '../lib/types';

interface DragDropContainerProps {
  hasUserInteracted: boolean;
  onUserInteraction: () => void;
}

const DragDropContainer: React.FC<DragDropContainerProps> = ({ 
  hasUserInteracted, 
  onUserInteraction 
}) => {
  const dispatch = useDispatch();
  const layout = useSelector((state: RootState) => state.layout.current);
  const [components] = useState<ComponentConfig[]>([
    { id: 'hero', type: 'HeroBlock', name: 'Hero Block' },
    { id: 'twoColumn', type: 'TwoColumnRow', name: 'Two Column Row' },
    { id: 'imageGrid', type: 'ImageGrid', name: '2x2 Image Grid' },
  ]);

  // Add sample data in development mode only on initial load
  useEffect(() => {
    const isDevelopment = window.location.origin.includes('localhost');
    if (isDevelopment && layout.length === 0 && !hasUserInteracted) {
      const sampleLayout: ComponentConfig[] = [
        { id: 'hero-1', type: 'HeroBlock', name: 'Hero Block' },
        { id: 'two-col-1', type: 'TwoColumnRow', name: 'Two Column Row' },
        { id: 'grid-1', type: 'ImageGrid', name: '2x2 Image Grid' },
      ];
      dispatch(setLayout(sampleLayout));
    }
  }, [layout.length, dispatch, hasUserInteracted]);

  const handleDeleteComponent = useCallback((componentId: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      onUserInteraction();
      dispatch(removeComponent(componentId));
    }
  }, [dispatch, onUserInteraction]);

  return (
    <Droppable droppableId="layout" isDropDisabled={false}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={styles.droppable}
          data-dragging-over={snapshot.isDraggingOver}
          style={{
            backgroundColor: snapshot.isDraggingOver ? '#e6f3ff' : '#f7fafc',
            borderColor: snapshot.isDraggingOver ? '#667eea' : '#cbd5e0',
            transform: snapshot.isDraggingOver ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          {layout.length === 0 && (
            <div className={styles.emptyState}>
              <p>🎯 Drag components here from the palette above, or click to add them instantly</p>
            </div>
          )}
          {layout.map((item, index) => (
            <Draggable 
              key={item.id} 
              draggableId={item.id} 
              index={index}
              isDragDisabled={false}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={styles.draggable}
                  style={{
                    ...provided.draggableProps.style,
                    opacity: snapshot.isDragging ? 0.8 : 1,
                    transform: provided.draggableProps.style?.transform
                  }}
                >
                  <div className={styles.componentHeader}>
                    <span className={styles.componentName}>📄 {item.name}</span>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteComponent(item.id);
                      }}
                      title="Delete component"
                    >
                      ×
                    </button>
                  </div>
                  <ComponentPreview component={item} layout={layout} />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DragDropContainer;
