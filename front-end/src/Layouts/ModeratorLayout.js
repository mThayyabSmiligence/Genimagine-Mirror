import { useEffect } from "react";
import { Outlet,  useNavigate} from "react-router-dom";

const ModeratorLayout = () => {
     const navigate= useNavigate()
    const userData = JSON.parse(localStorage.getItem("user_data"));
    // if (!userData || userData.role !== "moderator") {
    //     navigate("/unauthorized", { replace: true });
    // }
    useEffect(() => {
        if (!userData || userData.role!== "moderator") {
            navigate("/", {replace: true})
        }
    }, [])

    return (
        <div>
            <h2>Moderator Panel</h2>
            
            {/* <nav>
                <ul>
                    <li><a href="/moderator/dashboard">Dashboard</a></li>
                    <li><a href="/moderator/reports">Reports</a></li>
                </ul>
            </nav> */}
            <Outlet />
        </div>
    );
};

export default ModeratorLayout;
