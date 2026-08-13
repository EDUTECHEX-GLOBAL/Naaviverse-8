import React, { useState } from "react";
import "./tasks.scss";
import profile from "../../static/images/dashboard/profile.svg";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import uuid4 from "uuid4";
import KanbanBoard from "./KanbanBoard";

const Tasks = () => {
  const [selectedTab, setSelectedTab] = useState("By Client");

  const itemsFromBackend = [
    {
      id: uuid4(),
      content: "Task 1",
    },
    {
      id: uuid4(),
      content: "Task 2",
    },
    {
      id: uuid4(),
      content: "Task 3",
    },
    {
      id: uuid4(),
      content: "Task 4",
    },
  ];

  const columnsFromBackend = {
    [uuid4()]: {
      name: "To Do",
      items: itemsFromBackend,
    },
    [uuid4()]: {
      name: "In Progress",
      items: [],
    },
    [uuid4()]: {
      name: "Waiting On Client",
      items: [],
    },
    [uuid4()]: {
      name: "Completed",
      items: [],
    },
  };

  const [columns, setColumns] = useState(columnsFromBackend);

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="top-area">
        <div className="task-txt">Task Manager</div>
        <div className="tabs">
          <div
            className="each-tab"
            style={{
              fontWeight: selectedTab === "By Client" ? "600" : "500",
              color: selectedTab === "By Client" ? "#59A2DD" : "#1f304f",
              borderBottom:
                selectedTab === "By Client" ? "1px solid #59A2DD" : "",
            }}
            onClick={() => {
              setSelectedTab("By Client");
            }}
          >
            <p>By Client</p>
          </div>
          <div
            className="each-tab"
            style={{
              fontWeight: selectedTab === "By Service" ? "600" : "500",
              color: selectedTab === "By Service" ? "#59A2DD" : "#1f304f",
              borderBottom:
                selectedTab === "By Service" ? "1px solid #59A2DD" : "",
            }}
            onClick={() => {
              setSelectedTab("By Service");
            }}
          >
            <p>By Service</p>
          </div>
          <div
            className="each-tab"
            style={{
              fontWeight: selectedTab === "By Client & Service" ? "600" : "500",
              color:
                selectedTab === "By Client & Service" ? "#59A2DD" : "#1f304f",
              borderBottom:
                selectedTab === "By Client & Service"
                  ? "1px solid #59A2DD"
                  : "",
            }}
            onClick={() => {
              setSelectedTab("By Client & Service");
            }}
          >
            <p>By Client & Service</p>
          </div>
          <div
            className="each-tab"
            style={{
              fontWeight: selectedTab === "Other" ? "600" : "500",
              color: selectedTab === "Other" ? "#59A2DD" : "#1f304f",
              borderBottom: selectedTab === "Other" ? "1px solid #59A2DD" : "",
            }}
            onClick={() => {
              setSelectedTab("Other");
            }}
          >
            <p>Other</p>
          </div>
        </div>
      </div>
      <div className="middle-area">
        <div className="client-data-div">
          <div className="client-data">
            <img src={profile} alt="" />
            <div className="details">
              <div className="name-txt">Shorupan Pirakaspathy</div>
              <div className="mail-txt">shorupan@gmail.com</div>
            </div>
          </div>
          <div className="chng-btn">Change Client</div>
        </div>
      </div>
      <div className="bottom-area">
        {/* <DragDropContext onDropEnd={result => console.log(result)}>
            {Object.entries(columns).map(([id, column]) => {
              return (
                <Droppable droppableId={id}>
                </Droppable>
              )
            })}
        </DragDropContext> */}
        <KanbanBoard />
      </div>
    </div>
  );
};

export default Tasks;
