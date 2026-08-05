import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LocaleProvider } from "@/providers/LocaleProvider";
import { DensityProvider } from "@/providers/DensityProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { ProjectDataProvider } from "@/providers/ProjectDataProvider";
import { AppRoutes } from "@/routes/AppRoutes";
import "./App.css";

/**
 * Provider nesting mirrors source's `App()` (REHUB WORK V8.html, last
 * line: `<ThemeProvider><LocaleProvider><DensityProvider><ToastProvider>
 * <Dashboard /></ToastProvider></DensityProvider></LocaleProvider>
 * </ThemeProvider>`), extended with providers source didn't have:
 * `AuthProvider` (single-role auth stub, per tech.pdf) sits right after
 * `DensityProvider` and before `ToastProvider` -- toasts/routes may
 * eventually need to read the current user, so auth resolves before
 * anything that could consume it. `ProjectDataProvider` (this pass's new
 * project/projectDataById state, replacing what used to be `Dashboard`
 * local state) sits just inside `BrowserRouter` since only routed pages
 * consume it, not the shell chrome providers above it.
 */
function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <DensityProvider>
          <AuthProvider>
            <ToastProvider>
              <BrowserRouter>
                <ProjectDataProvider>
                  <AppRoutes />
                </ProjectDataProvider>
              </BrowserRouter>
            </ToastProvider>
          </AuthProvider>
        </DensityProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

export default App;
