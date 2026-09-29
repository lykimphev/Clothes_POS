import { Outlet } from 'react-router-dom';

export default function Mainlayout() {
    return (
        <div className="pos-app-wrapper vh-100 overflow-hidden">
            <Outlet />
        </div>
    );
}
