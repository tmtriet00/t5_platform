import { Authenticated, GitHubBanner, Refine, WelcomePage } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  useNotificationProvider,
  ThemedLayout,
  ThemedSider,
  AuthPage,
} from "@refinedev/antd";
import { CustomSider } from "./components/layout/sider";
import "@refinedev/antd/dist/reset.css";

import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { App as AntdApp } from "antd";
import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router";
import authProvider from "./authProvider";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { supabaseClient } from "./utility";
import { tenantDataProvider } from "./utility/tenant-data-provider";
import { TenantProvider } from "./contexts/tenant";
import { PostCreate, PostEdit, PostList } from "./page/posts";
import { ProjectCreate, ProjectEdit, ProjectList } from "./page/projects";
import { TaskCreate, TaskEdit, TaskList } from "./page/tasks";
import { TimeEntryCreate, TimeEntryEdit, TimeEntryList } from "./page/time-entries";
import { TaskEstimationCreate, TaskEstimationEdit, TaskEstimationList } from "./page/task_estimations";
import { EmergencyKitCreate, EmergencyKitEdit, EmergencyKitList } from "./page/emergency-tickets";
import Home from "./page/home";
import { NotionPage } from "./page/notion";
import { RemoteBrowser } from "./page/remote-browser";
import { KBarProviderWrapper } from "./components/kbar";
import { ProjectDetail } from "./page/projects/detail";
import { ProfilePage } from "./page/profile";
import { MfaVerifyPage } from "./page/mfa-verify";
import { NoteCreate, NoteEdit, NoteList } from "./page/notes";
import { DailyNotePage } from "./page/daily-notes";
import { WishListList } from "./page/wish-lists/list";
import { LedgerList } from "./page/ledgers/list";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { ModalProviderWrapper } from "./components/modals/modal-provider-wrapper";

import { AllEnterpriseModule as AgChartsAllEnterpriseModule, ModuleRegistry as AgChartsModuleRegistry } from 'ag-charts-enterprise';


import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
AgChartsModuleRegistry.registerModules([AgChartsAllEnterpriseModule]);

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { FinancialStatistic } from "page/financial-statistic";

dayjs.extend(utc);
dayjs.extend(timezone);
import { FinanceCheckinRecordList } from "./page/finance/checkin-records";
import { ConfigurationCreate, ConfigurationEdit, ConfigurationList } from "./page/configurations";
import { CycleCreate, CycleEdit, CycleList } from "./page/cycles";
import FileToVideoPage from "./page/file-to-video";




function App() {

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                notificationProvider={useNotificationProvider}
                dataProvider={tenantDataProvider(supabaseClient)}
                resources={[
                  {
                    name: "home",
                    list: "/home",
                  },
                  {
                    name: "financial-statistic",
                    list: "/financial-statistic",
                  },
                  {
                    name: "daily_notes",
                    list: "/daily-notes",
                  },
                  {
                    name: "ledgers",
                    list: "/ledgers",
                    meta: {
                      label: "Ledgers",
                    },
                  },
                  {
                    name: "wish_list_items",
                    list: "/wish-lists",
                    meta: {
                      label: "Wish Lists",
                    },
                  },
                  {
                    name: "projects",
                    list: "/projects",
                    create: "/projects/create",
                    edit: "/projects/edit/:id",
                    show: "/projects/:id",
                  },
                  {
                    name: "tasks",
                    list: "/tasks",
                    create: "/tasks/create",
                    edit: "/tasks/edit/:id",
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
                    name: "emergency_tickets",
                    list: "/emergency-tickets",
                    create: "/emergency-tickets/create",
                    edit: "/emergency-tickets/edit/:id",
                    meta: {
                      label: "Emergency Tickets",
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
                  {
                    name: "notes",
                    list: "/notes",
                    create: "/notes/create",
                    edit: "/notes/edit/:id",
                    meta: {
                      label: "Notes",
                    },
                  },
                  {
                    name: "wish_list_items",
                    list: "/wish-lists",
                    meta: {
                      label: "Wish Lists",
                    },
                  },
                  {
                    name: "ledgers",
                    list: "/ledgers",
                    meta: {
                      label: "Ledgers",
                    },
                  },
                  {
                    name: "finance_checkin_records",
                    list: "/finance-checkin-records",
                    meta: {
                      label: "Finance Checkin Records",
                    },
                  },
                  {
                    name: "configurations",
                    list: "/configurations",
                    create: "/configurations/create",
                    edit: "/configurations/edit/:id",
                    meta: {
                      label: "Configurations",
                    },
                  },
                  {
                    name: "cycles",
                    list: "/cycles",
                    create: "/cycles/create",
                    edit: "/cycles/edit/:id",
                    meta: {
                      label: "Cycles",
                    },
                  },
                  {
                    name: "file_to_video",
                    list: "/file-to-video",
                    meta: {
                      label: "File to Video",
                    },
                  },
                  {
                    name: "transactions",
                    meta: {
                      hide: true,
                    },
                  },
                  {
                    name: "tenants",
                    meta: {
                      hide: true,
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
                <TenantProvider>
                  <KBarProviderWrapper>
                    <ModalProviderWrapper>
                      <Routes>
                        <Route
                          element={
                            <Authenticated
                              key="authenticated-mfa"
                              fallback={<CatchAllNavigate to="/login" />}
                            >
                              <Outlet />
                            </Authenticated>
                          }
                        >
                          <Route path="/mfa-verify" element={<MfaVerifyPage />} />
                        </Route>
                        <Route
                          element={
                            <Authenticated
                              key="authenticated-inner"
                              fallback={<CatchAllNavigate to="/login" />}
                            >
                              <ThemedLayout Header={Header} Sider={CustomSider}>
                                <Outlet />
                              </ThemedLayout>
                            </Authenticated>
                          }
                        >
                          <Route index element={<Navigate to="/home" replace />} />
                          <Route path="/home" element={<Home />} />
                          <Route path="/financial-statistic" element={<FinancialStatistic />} />
                          <Route path="/daily-notes" element={<DailyNotePage />} />
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
                          <Route path="/emergency-tickets" element={<EmergencyKitList />} />
                          <Route path="/emergency-tickets/create" element={<EmergencyKitCreate />} />
                          <Route path="/emergency-tickets/edit/:id" element={<EmergencyKitEdit />} />
                          <Route path="/notion" element={<NotionPage />} />
                          <Route path="/remote-browser" element={<RemoteBrowser />} />
                          <Route path="/notes" element={<NoteList />} />
                          <Route path="/notes/create" element={<NoteCreate />} />
                          <Route path="/notes/edit/:id" element={<NoteEdit />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/wish-lists" element={<WishListList />} />
                          <Route path="/ledgers" element={<LedgerList />} />
                          <Route path="/finance-checkin-records" element={<FinanceCheckinRecordList />} />
                          <Route path="/configurations" element={<ConfigurationList />} />
                          <Route path="/configurations/create" element={<ConfigurationCreate />} />
                          <Route path="/configurations/edit/:id" element={<ConfigurationEdit />} />
                          <Route path="/cycles" element={<CycleList />} />
                          <Route path="/cycles/create" element={<CycleCreate />} />
                          <Route path="/cycles/edit/:id" element={<CycleEdit />} />
                          <Route path="/file-to-video" element={<FileToVideoPage />} />

                        </Route>
                        <Route
                          element={
                            <Authenticated
                              key="authenticated-outer"
                              fallback={<Outlet />}
                            >
                              <NavigateToResource />
                            </Authenticated>
                          }
                        >
                          <Route path="/login" element={<AuthPage type="login" />} />
                          <Route path="/register" element={<AuthPage type="register" />} />
                          <Route path="/forgot-password" element={<AuthPage type="forgotPassword" />} />
                          <Route path="/update-password" element={<AuthPage type="updatePassword" />} />
                        </Route>
                      </Routes>
                      <RefineKbar />
                      <UnsavedChangesNotifier />
                      <DocumentTitleHandler />
                    </ModalProviderWrapper>
                  </KBarProviderWrapper>
                </TenantProvider>
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
