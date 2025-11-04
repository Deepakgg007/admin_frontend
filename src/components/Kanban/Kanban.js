import { useEffect, useState, } from 'react';
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

// kanban basic
export function KanbanBasic({containerClass, data, ...props}) {
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState({});
  
  useEffect(() => {
    // Mock an API call.
    buildAndSave(data);
  }, [data]);
  
  function buildAndSave(items) {
    const groups = {};
    
    for (let i = 0; i < Object.keys(items).length; ++i) {
      const currentGroup = items[i];
      groups[currentGroup.id] = i;
    }
    
    // Set the data.
    setItems(items);
    
    // Makes the groups searchable via their id.
    setGroups(groups);
  }
  
  return (
    <DragDropContext
      onDragEnd={(result) => {
        const { destination, source, type, } = result;

        if (!destination) {
          return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
          return;
        }
        
        if ('group' === type) {
          const sourceIndex = source.index;
          const targetIndex = destination.index;
          
          const workValue = items.slice();
          const [deletedItem, ] = workValue.splice(sourceIndex, 1);
          workValue.splice(targetIndex, 0, deletedItem);

          buildAndSave(workValue);
          
          return;
        }

        const sourceDroppableIndex = groups[source.droppableId];
        const targetDroppableIndex = groups[destination.droppableId];
        const sourceItems = items[sourceDroppableIndex].items.slice();
        const targetItems = source.droppableId !== destination.droppableId ? items[targetDroppableIndex].items.slice() : sourceItems;
        
        // Pull the item from the source.
        const [deletedItem, ] = sourceItems.splice(source.index, 1);
        targetItems.splice(destination.index, 0, deletedItem);
        
        const workValue = items.slice();
        workValue[sourceDroppableIndex] = {
          ...items[sourceDroppableIndex],
          items: sourceItems,
        };
        workValue[targetDroppableIndex] = {
          ...items[targetDroppableIndex],
          items: targetItems,
        };
        
        
        setItems(workValue);
      }}
    >
      <Droppable droppableId='ROOT' type='group'>
        {(provided) => (
          <div
            className={`kanban-container ${containerClass ? containerClass : ''}`}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {items.map((item, index) => (
              <DroppableList
                key={item.id}
                index={index}
                {...item}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

// kanban custom
export function KanbanCustom({containerClass, data, ...props}) {
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState({});
  
  useEffect(() => {
    // Mock an API call.
    buildAndSave(data);
  }, [data]);
  
  function buildAndSave(items) {
    const groups = {};
    for (let i = 0; i < Object.keys(items).length; ++i) {
      const currentGroup = items[i];
      groups[currentGroup.id] = i;
    }
    
    // Set the data.
    setItems(items);
    
    // Makes the groups searchable via their id.
    setGroups(groups);
  }
  
  return (
    <DragDropContext
      onDragEnd={(result) => {
        const { destination, source, type, } = result;

        if (!destination) {
          return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
          return;
        }
        
        if ('group' === type) {
          const sourceIndex = source.index;
          const targetIndex = destination.index;
          
          const workValue = items.slice();
          const [deletedItem, ] = workValue.splice(sourceIndex, 1);
          workValue.splice(targetIndex, 0, deletedItem);

          buildAndSave(workValue);
          
          return;
        }

        const sourceDroppableIndex = groups[source.droppableId];
        const targetDroppableIndex = groups[destination.droppableId];
        const sourceItems = items[sourceDroppableIndex].items.slice();
        const targetItems = source.droppableId !== destination.droppableId ? items[targetDroppableIndex].items.slice() : sourceItems;
        
        // Pull the item from the source.
        const [deletedItem, ] = sourceItems.splice(source.index, 1);
        targetItems.splice(destination.index, 0, deletedItem);
        
        const workValue = items.slice();
        workValue[sourceDroppableIndex] = {
          ...items[sourceDroppableIndex],
          items: sourceItems,
        };
        workValue[targetDroppableIndex] = {
          ...items[targetDroppableIndex],
          items: targetItems,
        };
        
        
        setItems(workValue);
      }}
    >
      <Droppable droppableId='ROOT' type='group'>
        {(provided) => (
          <div
            className={`kanban-container ${containerClass ? containerClass : ''}`}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {items.map((item, index) => (
              <DroppableList
                key={item.id}
                index={index}
                {...item}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

// kanban drop list
function DroppableList({ id, items, label, theme }) {
  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
         className="kanban-item-wrap"
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          <div  className={`kanban-board ${theme ? theme : ''}`}>
          <header className="kanban-board-header">
              <div className="kanban-title-board">
                <div className="kanban-title-content">
                  <h6 className="title">{label}</h6>
                  <span className="count">{items.length}</span>
                </div>
              </div>
            </header>
            <div className="kanban-drag">
                {items.map((item, index) => (
                  <Draggable 
                      draggableId={item.id}
                      index={index}
                      key={item.id}
                    >
                    {(provided) => (
                          <div
                            className="kanban-item"
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
                            {item.title && 
                              <div className="kanban-item-title">
                                <h6 className="title">{item.title}</h6>
                              </div>
                            }
                            {item.content &&
                              <div className="kanban-item-text">
                                <p>{item.content}</p>
                              </div>
                            }
                            
                        </div>
                    )}
                    </Draggable>
                ))}
                {provided.placeholder}
            </div>
          </div>
        </div>
      )}
    </Droppable>
  );
}
