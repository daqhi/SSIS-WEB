import '/src/static/css/dashboard.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns, faBook, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import Navbar from '../components/navbar';


function Dashboard() {
    return (
        <div>
            <Navbar />
            {/* MAIN CONTENT */}
            <div className="main-content">
                {/* NAVBAR */}
                {/* <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}

                <div className="content">
                    <h2>Welcome to the Dashboard!</h2>
                    <p>Insert blablablabalaaaaa.</p>
                    <hr />

                    <div className="horizontal-container">
                        <div className="college-analytics">
                            <div className="college-analytics-header">
                                <FontAwesomeIcon icon={faBuildingColumns} size='2xl'/>
                                <div>
                                    <h3>Total Colleges</h3>
                                    <p className="analytics-number">
                                        {/* {collegeCount !== null ? collegeCount : "Loading..."} */}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="college-analytics">
                            <div className="college-analytics-header">
                                <FontAwesomeIcon icon={faBook} size='2xl' />
                                <div>
                                    <h3>Total Programs</h3>
                                    <p className="analytics-number">
                                        {/* {programCount !== null ? programCount : "Loading..."} */}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="college-analytics">
                            <div className="college-analytics-header">
                                <FontAwesomeIcon icon={faGraduationCap} size='2xl' />
                                {/* <img
                                    src="/src/static/icons/student.png"
                                    alt="Students Icon"
                                    className="college-analytics-icon"
                                /> */}
                                <div>
                                    <h3>Total Students</h3>
                                    <p className="analytics-number">
                                        {/* {studentCount !== null ? studentCount : "Loading..."} */}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;