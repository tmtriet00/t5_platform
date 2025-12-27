import { GitHubBanner, Refine, WelcomePage } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  useNotificationProvider,
  ThemedLayout,
  ThemedSider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { App as AntdApp } from "antd";
import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router";
import authProvider from "./authProvider";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { supabaseClient } from "./utility";
import { PostCreate, PostEdit, PostList } from "./page/posts";
import { ProjectCreate, ProjectEdit, ProjectList } from "./page/projects";
import { TaskCreate, TaskEdit, TaskList } from "./page/tasks";
import { TimeEntryCreate, TimeEntryEdit, TimeEntryList } from "./page/time-entries";
import { TaskEstimationCreate, TaskEstimationEdit, TaskEstimationList } from "./page/task_estimations";
import Home from "./page/home";
import { NotionPage } from "./page/notion";
import { RemoteBrowser } from "./page/remote-browser";
import { KBarProviderWrapper } from "./components/kbar";
import { ProjectDetail } from "./page/projects/detail";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

ModuleRegistry.registerModules([AllCommunityModule]);

function App() {

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <KBarProviderWrapper>
            <AntdApp>
              <DevtoolsProvider>
                <Refine
                  notificationProvider={useNotificationProvider}
                  dataProvider={dataProvider(supabaseClient)}
                  resources={[
                    {
                      name: "home",
                      list: "/home",
                    },
                    {
                      name: "posts",
                      list: "/posts",
                      create: "/posts/create",
                      edit: "/posts/edit/:id",
                    },
                    {
                      name: "tasks",
                      list: "/tasks",
                      create: "/tasks/create",
                      edit: "/tasks/edit/:id",
                    },
                    {
                      name: "projects",
                      list: "/projects",
                      create: "/projects/create",
                      edit: "/projects/edit/:id",
                      show: "/projects/:id",
                    },
                    {
                      name: "time_entries",
                      list: "/time-entries",
                      create: "/time-entries/create",
                      edit: "/time-entries/edit/:id",
                      meta: {
                        label: "Time Entries",
                      },
                    },
                    {
                      name: "task_estimations",
                      list: "/task-estimations",
                      create: "/task-estimations/create",
                      edit: "/task-estimations/edit/:id",
                      meta: {
                        label: "Task Estimations",
                      },
                    },
                    {
                      name: "notion",
                      list: "/notion",
                      meta: {
                        label: "Notion",
                      },
                    },
                    {
                      name: "remote_browser",
                      list: "/remote-browser",
                      meta: {
                        label: "Remote Browser",
                      },
                    },
                  ]}
                  liveProvider={liveProvider(supabaseClient)}
                  authProvider={authProvider}
                  routerProvider={routerProvider}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                  }}
                >
                  <Routes>
                    <Route
                      element={
                        <ThemedLayout Header={Header} Sider={ThemedSider}>
                          <Outlet />
                        </ThemedLayout>
                      }
                    >
                      <Route index element={<Navigate to="/home" replace />} />
                      <Route path="/home" element={<Home />} />
                      <Route path="/posts" element={<PostList />} />
                      <Route path="/posts/create" element={<PostCreate />} />
                      <Route path="/posts/edit/:id" element={<PostEdit />} />
                      <Route path="/tasks" element={<TaskList />} />
                      <Route path="/tasks/create" element={<TaskCreate />} />
                      <Route path="/tasks/edit/:id" element={<TaskEdit />} />
                      <Route path="/projects" element={<ProjectList />} />
                      <Route path="/projects/create" element={<ProjectCreate />} />
                      <Route path="/projects/:id" element={<ProjectDetail />} />
                      <Route path="/projects/edit/:id" element={<ProjectEdit />} />
                      <Route path="/time-entries" element={<TimeEntryList />} />
                      <Route path="/time-entries/create" element={<TimeEntryCreate />} />
                      <Route path="/time-entries/edit/:id" element={<TimeEntryEdit />} />
                      <Route path="/task-estimations" element={<TaskEstimationList />} />
                      <Route path="/task-estimations/create" element={<TaskEstimationCreate />} />
                      <Route path="/task-estimations/edit/:id" element={<TaskEstimationEdit />} />
                      <Route path="/notion" element={<NotionPage />} />
                      <Route path="/remote-browser" element={<RemoteBrowser />} />
                    </Route>
                  </Routes>
                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
                <DevtoolsPanel />
              </DevtoolsProvider>
            </AntdApp>
          </KBarProviderWrapper>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
