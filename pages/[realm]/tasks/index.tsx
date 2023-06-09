import withAuth from "@/components/auth/withAuth";
import Kanban from "@/components/pages/Task/Kanban";
import NewTaskModal from "@/components/pages/Task/NewTaskModal";
import TaskPageHeader from "@/components/pages/Task/TaskPageHeader";
import { useAuthStore } from "@/utils/zustand/authStore/useAuthStore";
import { useRealmStore } from "@/utils/zustand/realm/useRealmStore";
import { ETaskStatuses } from "@/utils/zustand/taskStore/ITaskStore";
import {
  getTasks,
  useTasksStore,
} from "@/utils/zustand/taskStore/useTaskStore";
import React, { useEffect, useState } from "react";
import { IoIosAdd } from "react-icons/io";

export type TaskFilters = {
  keyword?: string;
  priority?: string;
};

const TasksPage = () => {
  const [newTransactionModal, setNewTransactionModal] = useState(false);

  const [defaultStatus, setDefaultStatus] = useState<ETaskStatuses>(
    "todo" as ETaskStatuses
  );

  const [filters, setFilters] = useState<TaskFilters | null>(null);

  return (
    <div className="p-[min(3vh,3vw)] py-[min(2vh,2vw)] h-full relative flex flex-col grow overflow-auto gap-[min(3vh,3vw)] max-[900px]:h-fit">
      <button
        onClick={() => setNewTransactionModal(true)}
        className="p-1 bg-gradient-to-b z-10 from-primary to-secondary justify-center flex items-center gap-2 fixed rounded-full right-[5rem] bottom-[5rem]"
      >
        <IoIosAdd className="w-8 h-8" />
      </button>
      <NewTaskModal
        setOpen={setNewTransactionModal}
        open={newTransactionModal}
        status={defaultStatus}
      />{" "}
      <TaskPageHeader filters={filters || undefined} setFilters={setFilters} />
      <Kanban
        setNewTransactionModal={setNewTransactionModal}
        filters={filters || undefined}
        setDefaultStatus={setDefaultStatus}
      />
    </div>
  );
};

export default withAuth(TasksPage);
