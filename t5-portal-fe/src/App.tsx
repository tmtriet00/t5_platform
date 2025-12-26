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
import Home from "./page/home";
import { KBarProviderWrapper } from "./components/kbar";

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
                      <Route path="/projects/edit/:id" element={<ProjectEdit />} />
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
