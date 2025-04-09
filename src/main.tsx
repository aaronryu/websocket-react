import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TabletZeroLayout from "./layouts/TabletZeroLayout.tsx";
import TabletOneLayout from "./layouts/TabletOneLayout.tsx";
import ScreenOneLayout from "./layouts/ScreenOneLayout.tsx";
import ScreenTwoLayout from "./layouts/ScreenTwoLayout.tsx";
import Main from "./pages/Main.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/t0" element={<TabletZeroLayout />}>
          <Route path="main" element={<Main />} />
          <Route path="*" element={<Navigate to="/t0" replace />} />
        </Route>

        <Route path="/t1" element={<TabletOneLayout />}>
          <Route index element={<Main />} />
          <Route path="*" element={<Navigate to="/t1" replace />} />
        </Route>

        <Route path="/s1" element={<ScreenOneLayout />}>
          <Route index element={<Main />} />
          <Route path="*" element={<Navigate to="/s1" replace />} />
        </Route>

        <Route path="/s2" element={<ScreenTwoLayout />}>
          <Route index element={<Main />} />
          <Route path="*" element={<Navigate to="/s2" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
