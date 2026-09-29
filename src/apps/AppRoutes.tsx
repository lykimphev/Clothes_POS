import {Routes, Route, Navigate} from "react-router-dom";
import Mainlayout from "../layouts/Mainlayout";
import {HomePage} from "../pages/HomePage";

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<Mainlayout />}>
                <Route index element={<HomePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}
export default AppRoutes;