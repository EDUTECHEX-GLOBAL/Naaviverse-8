import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./kanban.scss";
import plus from "./plus.svg";

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([
    // { id: "1", content: "Task 1", status: "todo" },
    // { id: "2", content: "Task 2", status: "inProgress" },
    // { id: "3", content: "Task 3", status: "waitingOnClient" },
    // { id: "4", content: "Task 4", status: "done" },
  ]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newTasks = Array.from(tasks);

    const [removed] = newTasks.filter((task) => task.id === draggableId);
    removed.status = destination.droppableId;
    newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, removed);

    setTasks(newTasks);
  };

  const addNewCard = (status) => {
    const newCard = {
      id: Date.now().toString(),
      content: "",
      status,
    };

    setTasks((prevTasks) => [...prevTasks, newCard]);
  };

  const getColumnCount = (status) => {
    return tasks.filter((task) => task.status === status).length;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        <div className="board-column">
          <div className="heading-wrapper">
            <div className="column-heading">
              To Do ({getColumnCount("todo")})
            </div>
            <div onClick={() => addNewCard("todo")}>
              <img src={plus} alt="" />
            </div>
          </div>
          <Droppable droppableId="todo">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="borderDiv">
                {tasks.map((task, index) => {
                  if (task.status === "todo") {
                    return (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="card"
                          >
                            {task.content}
                          </div>
                        )}
                      </Draggable>
                    );
                  }
                  return null;
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div className="board-column">
          <div className="heading-wrapper">
            <div>In Progress ({getColumnCount("inProgress")})</div>
            <div onClick={() => addNewCard("inProgress")}>
              <img src={plus} alt="" />
            </div>
          </div>
          <Droppable droppableId="inProgress">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="borderDiv">
                {tasks.map((task, index) => {
                  if (task.status === "inProgress") {
                    return (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="card"
                          >
                            {task.content}
                          </div>
                        )}
                      </Draggable>
                    );
                  }
                  return null;
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div className="board-column">
          <div className="heading-wrapper">
            <div>Waiting On Client ({getColumnCount("waitingOnClient")})</div>
            <div onClick={() => addNewCard("waitingOnClient")}>
              <img src={plus} alt="" />
            </div>
          </div>
          <Droppable droppableId="waitingOnClient">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="borderDiv">
                {tasks.map((task, index) => {
                  if (task.status === "waitingOnClient") {
                    return (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="card"
                          >
                            {task.content}
                          </div>
                        )}
                      </Draggable>
                    );
                  }
                  return null;
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div className="board-column">
          <div className="heading-wrapper">
            <div>Completed ({getColumnCount("done")})</div>
            <div onClick={() => addNewCard("done")}>
              <img src={plus} alt="" />
            </div>
          </div>
          <Droppable droppableId="done">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="borderDiv">
                {tasks.map((task, index) => {
                  if (task.status === "done") {
                    return (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="card"
                          >
                            {task.content}
                          </div>
                        )}
                      </Draggable>
                    );
                  }
                  return null;
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
