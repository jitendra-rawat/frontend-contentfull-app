'use client';

import { useDispatch } from 'react-redux';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { setLayout } from '../redux/slices/layoutSlice';
import { ComponentConfig } from '../lib/types';
import styles from '../styles/DragDrop.module.css';

interface ComponentPaletteProps {
  layout: ComponentConfig[];
  onUserInteraction?: () => void;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ layout, onUserInteraction }) => {
  const dispatch = useDispatch();

  const availableComponents: ComponentConfig[] = [
    { id: 'hero', type: 'HeroBlock', name: 'Hero Block' },
    { id: 'twoColumn', type: 'TwoColumnRow', name: 'Two Column Row' },
    { id: 'imageGrid', type: 'ImageGrid', name: '2x2 Image Grid' },
  ];

  const addComponent = (componentType: ComponentConfig['type']) => {
    const newComponent: ComponentConfig = {
      id: `${componentType}-${Date.now()}`,
      type: componentType,
      name: availableComponents.find(c => c.type === componentType)?.name || componentType,
    };
    
    const newLayout = [...layout, newComponent];
    dispatch(setLayout(newLayout));
    
    // Notify parent component about user interaction
    if (onUserInteraction) {
      onUserInteraction();
    }
  };

  return (
    <div className={styles.palette}>
      <h3>📦 Component Library</h3>
      <p className={styles.paletteInstructions}>
        Drag components to the layout area below, or click to add them instantly
      </p>
      <Droppable droppableId="palette" isDropDisabled={false}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={styles.paletteGrid}
          >
            {availableComponents.map((component, index) => (
              <Draggable
                key={component.id}
                draggableId={`palette-${component.id}`}
                index={index}
                isDragDisabled={false}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`${styles.paletteItem} ${snapshot.isDragging ? styles.dragging : ''}`}
                    onClick={() => addComponent(component.type)}
                    style={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.8 : 1,
                    }}
                  >
                    <div className={styles.paletteIcon}>
                      {component.type === 'HeroBlock' && <div className={styles.heroThumb}>Hero</div>}
                      {component.type === 'TwoColumnRow' && (
                        <div className={styles.twoColumnThumb}>
                          <div>Text</div>
                          <div>Image</div>
                        </div>
                      )}
                      {component.type === 'ImageGrid' && (
                        <div className={styles.gridThumb}>
                          <div>Img</div>
                          <div>Img</div>
                          <div>Img</div>
                          <div>Img</div>
                        </div>
                      )}
                    </div>
                    <span>{component.name}</span>
                    <div 
                      {...provided.dragHandleProps}
                      className={styles.dragHandle}
                    >
                      <span>⋮⋮</span>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default ComponentPalette; 