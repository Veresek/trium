import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import { GuestOnly, RequireAuth } from "./auth/guards";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DataProvider } from "./data/DataProvider";
import { AppShell } from "./layouts/AppShell";
import { AccountPage } from "./pages/AccountPage";
import { CalendarPage } from "./pages/CalendarPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotesPage } from "./pages/NotesPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPage } from "./pages/ResetPage";
import { TasksPage } from "./pages/TasksPage";
import { VerifyPage } from "./pages/VerifyPage";

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route element={<DataProvider />}>
              <Route element={<AppShell />}>
                <Route index element={<HomePage />} />
                <Route element={<CalendarPage />} path="calendar" />
                <Route element={<TasksPage />} path="tasks" />
                <Route element={<NotesPage />} path="notes" />
                <Route element={<AccountPage />} path="account" />
              </Route>
            </Route>
          </Route>
          <Route element={<GuestOnly />}>
            <Route element={<LoginPage />} path="login" />
            <Route element={<RegisterPage />} path="register" />
            <Route element={<VerifyPage />} path="verify" />
            <Route element={<ResetPage />} path="reset" />
          </Route>
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}
