
import { ContextMenu, Editor, Gantt, ILink, ITask, Willow } from "@svar-ui/react-gantt";
import { useCallback, useState, useEffect } from "react";
import { Button, Select, message } from "antd";
import { useList, useOne } from "@refinedev/core";
import { Project } from "../../interfaces/model/project";
import { extendTask } from "../../utility/gantt";
import "./willow-custom.css";
import { supabaseClient } from "../../utility/supabaseClient";

// Debounce helper to avoid too many requests
// eslint-disable-next-line
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export const GanttChart = () => {
    const [api, setApi] = useState<any>();
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [links, setLinks] = useState<ILink[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

    // Fetch list of projects for the selector
    const { query: projectListQuery } = useList<Project>({
        resource: "projects",
        sorters: [{ field: "id", order: "desc" }],
    });
    const { data: projectListData, isLoading: isProjectListLoading } = projectListQuery;

    const projectList = projectListData?.data || [];

    // Fetch selected project details
    const { query: projectQuery } = useOne<Project>({
        resource: "projects",
        id: selectedProjectId || "",
        queryOptions: {
            enabled: !!selectedProjectId,
        },
    });
    const { data: projectData, isLoading: isProjectLoading } = projectQuery;

    const project = projectData?.data;

    const scales = [
        { unit: 'month', step: 1, format: '%F %Y' },
        { unit: "day", step: 1, format: '%j-%D' },
    ];

    const init = useCallback((ganttApi: any) => {
        setApi(ganttApi);
    }, []);

    // Load data when project changes
    useEffect(() => {
        if (project && project.plan) {
            try {
                const planData = typeof project.plan === 'string' ? JSON.parse(project.plan) : project.plan;
                if (planData) {
                    setTasks(planData.tasks || []);
                    setLinks(planData.links || []);
                }
            } catch (e) {
                console.error("Failed to parse project plan", e);
                setTasks([]);
                setLinks([]);
            }
        } else {
            // New project or no plan
            setTasks([]);
            setLinks([]);
        }
    }, [project]);

    // Save logic
    const saveToProject = useCallback(async (currentTasks: ITask[], currentLinks: ILink[]) => {
        if (!selectedProjectId) return;

        console.log("Saving to project", selectedProjectId);
        const planData = {
            tasks: currentTasks,
            links: currentLinks
        };

        const { error } = await supabaseClient
            .from("projects")
            .update({ plan: planData })
            .eq("id", selectedProjectId)
            .select();

        if (error) {
            console.error("Error saving Gantt data:", error);
            message.error("Could not save Gantt data.");
        }
    }, [selectedProjectId]);


    // Watch for changes in the Gantt store
    useEffect(() => {
        if (api && selectedProjectId) {
            const interval = setInterval(() => {
                setTimeout(() => {
                    const store = api.getStores();

                    const t = store?.data?._values?._tasks;
                    const l = store?.data?._values?._links;

                    if (t || l) {
                        saveToProject(t, l);
                    }
                }, 500);
            }, 500); // Check every second

            return () => clearInterval(interval);
        }
    }, [api, selectedProjectId]);


    const correctGantData = () => {
        if (!api) return;
        const store = api.getStores();
        const currentTasks = store?.data?._values?._tasks;
        const currentLinks = store?.data?._values?._links;

        if (Array.isArray(currentTasks)) {
            const tasksCopy = JSON.parse(JSON.stringify(currentTasks));
            const newTasks = extendTask(tasksCopy);

            setTasks(newTasks);
            // Updating tasks triggers re-render of Gantt, good.
            if (currentLinks) {
                setLinks(JSON.parse(JSON.stringify(currentLinks)));
            }

            // Trigger save immediately after correction
            saveToProject(newTasks, currentLinks || []);
            message.success("Dates corrected and saved.");
        }
    }

    return (
        <div className="flex flex-col gap-2 h-full">
            <div className="flex gap-4 items-center p-2 bg-white rounded shadow-sm">
                <div className="font-bold">Project:</div>
                <Select
                    style={{ width: 300 }}
                    placeholder="Select a project"
                    loading={isProjectListLoading}
                    value={selectedProjectId}
                    onChange={(val) => setSelectedProjectId(val)}
                    options={projectList.map((p: Project) => ({ label: p.name, value: p.id }))}
                    showSearch
                    filterOption={(input, option) =>
                        String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                />

                {selectedProjectId && (
                    <Button onClick={correctGantData}>
                        Correct Gantt Data
                    </Button>
                )}
            </div>

            <div className="flex-1 border rounded hidden-overflow" style={{ minHeight: "600px" }}>
                {selectedProjectId ? (
                    isProjectLoading ? (
                        <div className="p-4">Loading Project Plan...</div>
                    ) : (
                        <Willow>
                            <ContextMenu api={api}>
                                <Gantt
                                    init={init}
                                    tasks={tasks}
                                    links={links}
                                    scales={scales}
                                />
                            </ContextMenu>
                            {api && <Editor api={api} />}
                        </Willow>
                    )
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        Please select a project to view its Gantt chart.
                    </div>
                )}
            </div>
        </div>
    );
};
