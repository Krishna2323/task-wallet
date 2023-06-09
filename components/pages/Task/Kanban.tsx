import { useAuthStore } from "@/utils/zustand/authStore/useAuthStore";
import { useRealmStore } from "@/utils/zustand/realm/useRealmStore";
import { ETaskStatuses } from "@/utils/zustand/taskStore/ITaskStore";
import {
  getNewPageTasks,
  getTasks,
  hanldeDragDrop,
  useTasksStore,
} from "@/utils/zustand/taskStore/useTaskStore";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { BsCircleHalf } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import * as TbIcons from "react-icons/tb";
import TaskCard from "./TaskCard";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { TaskFilters } from "@/pages/[realm]/tasks";
import { useInView } from "react-intersection-observer";
import { MdAdd, MdAddCircle } from "react-icons/md";
import autoAnimate from "@formkit/auto-animate";

const boards = [
  {
    heading: "Todo",
    enum: ETaskStatuses["todo"],
    icon: (
      <TbIcons.TbCircleDotted className="w-[22px] h-[22px] fill-[#adb5bd]" />
    ),
  },
  {
    heading: "In-Progess",
    enum: ETaskStatuses["in-progress"],
    icon: <BsCircleHalf className="w-[19px] h-[19px] fill-primary" />,
  },
  {
    heading: "Completed",
    enum: ETaskStatuses["completed"],
    icon: <FaCheckCircle className="w-[19px] h-[19px] fill-lime-500" />,
  },
];

const Kanban: React.FC<{
  filters?: TaskFilters;
  setNewTransactionModal: Dispatch<SetStateAction<boolean>>;
  setDefaultStatus: Dispatch<SetStateAction<ETaskStatuses>>;
}> = ({ filters, setNewTransactionModal, setDefaultStatus }) => {
  const taskStore = useTasksStore((s) => s);

  return (
    <div className="w-full h-full grow gap-[min(2vh,2vw)] overflow-hidden grid grid-cols-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 justify-between">
      <DragDropContext
        onDragEnd={(res) => hanldeDragDrop({ result: res, taskStore })}
      >
        {boards.map((board) => (
          <TasksColumn
            setNewTransactionModal={setNewTransactionModal}
            setDefaultStatus={setDefaultStatus}
            filters={filters}
            key={board.enum}
            {...board}
          />
        ))}
      </DragDropContext>
    </div>
  );
};

export default Kanban;

const TasksColumn: React.FC<{
  heading: string;
  enum: ETaskStatuses;
  icon: React.JSX.Element;
  filters?: TaskFilters;
  setNewTransactionModal: Dispatch<SetStateAction<boolean>>;
  setDefaultStatus: Dispatch<SetStateAction<ETaskStatuses>>;
}> = (props) => {
  const taskStore = useTasksStore((s) => s);

  const [ref, inView] = useInView({
    triggerOnce: true, // This option ensures the event triggers only once
  });
  const { user } = useAuthStore((s) => s);

  const { currentRealm } = useRealmStore((s) => s);

  const [isLoading, setIsLoading] = useState(false);

  const [newPageIsLoading, setNewPageIsLoading] = useState(false);

  useEffect(() => {
    let timeOut: NodeJS.Timeout;

    if (currentRealm && user && !isLoading) {
      timeOut = setTimeout(() => {
        getTasks({
          setIsLoading: setIsLoading,
          taskStore,
          userId: user.$id,
          realm: currentRealm.name,
          status: props.enum,
          filters: props.filters,
        });
      }, 500);
    }

    return () => {
      clearTimeout(timeOut);
    };
  }, [user, currentRealm, props.filters]);

  useEffect(() => {
    let timeOut: NodeJS.Timeout;

    if (
      currentRealm &&
      user &&
      !isLoading &&
      taskStore[props.enum]?.hasMore &&
      inView
    ) {
      timeOut = setTimeout(() => {
        getNewPageTasks({
          setIsLoading: setNewPageIsLoading,
          taskStore,
          userId: user.$id,
          realm: currentRealm.name,
          page: (taskStore[props.enum]?.page || 0) + 1,
          status: props.enum,
          filters: props.filters,
        });
      }, 0);
    }

    return () => {
      clearTimeout(timeOut);
    };
  }, [user, currentRealm, inView]);

  return (
    <Droppable droppableId={props.enum}>
      {(droppableProvided, droppableSnapshot) => (
        <div
          className="w-full h-full relative min-h-[75vh] max-[600px]:max-h-[30vh] grow shadow-shadow-form-input rounded-2xl overflow-auto pb-3"
          ref={droppableProvided.innerRef}
          {...droppableProvided.droppableProps}
        >
          <div className="w-full z-10 border-b border-border-primary mb-6 sticky top-0 left-0 bg-bg-primary shadow-shadow-form-input px-8 py-3 flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <span className="text-lg">{props.heading}</span>
              {props.icon}
            </div>
            <span className="bg-bg-primary-light px-3 rounded-xl">
              {taskStore[props.enum] && taskStore[props.enum]?.totalLength}
            </span>
          </div>
          <div className="flex flex-col gap-4 px-6 grow">
            {taskStore[props.enum] &&
              !isLoading &&
              taskStore[props.enum]?.tasks?.map((e, i) => {
                if (taskStore[props.enum]?.tasks?.length === i + 1) {
                  return <TaskCard task={e} key={e.$id} ref={ref} index={i} />;
                }
                return <TaskCard task={e} key={e.$id} index={i} />;
              })}
            {!isLoading && (
              <div
                onClick={() => {
                  props.setDefaultStatus(props.enum);
                  props.setNewTransactionModal(true);
                }}
                className="w-full cursor-pointer rounded-2xl flex justify-center items-center"
              >
                <span className="text-lg flex gap-3 items-center border-dashed border w-full justify-center border-border-primary py-2 px-6 rounded-2xl">
                  Create Task{" "}
                  <span className="">
                    <MdAdd />
                  </span>
                </span>
              </div>
            )}{" "}
          </div>
          {droppableProvided.placeholder}
          {isLoading && <TodoSkeleton />}
          {newPageIsLoading && <TodoSkeleton />}
        </div>
      )}
    </Droppable>
  );
};

const TodoSkeleton = () => {
  return (
    <div className="w-full h-fit flex flex-col gap-4 px-6 mt-4">
      <Skeleton
        className="w-full h-32 shadow-shadow-primary-xsm"
        baseColor="#212529"
        highlightColor="#202020"
      ></Skeleton>
      <Skeleton
        className="w-full h-24 shadow-shadow-primary-xsm"
        baseColor="#212529"
        highlightColor="#202020"
      ></Skeleton>
      <Skeleton
        className="w-full h-48 shadow-shadow-primary-xsm"
        baseColor="#212529"
        highlightColor="#202020"
      ></Skeleton>
    </div>
  );
};
