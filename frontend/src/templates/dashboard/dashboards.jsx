import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns, faChartLine, faBook, 
         faGraduationCap, faEllipsis, faFolderOpen,
         faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import Navbar from '/src/templates/components/navbar.jsx'
import '../../static/css/dashboard.css'
import GradientText from '../components/shiny-text.jsx';

function Dashboard() {
    const navigate = useNavigate();



    return (
        <div>
            <Navbar />
            <div className='header-ctn'>
                <GradientText
                    colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                    animationSpeed={7}
                    showBorder={false}
                    className="custom-class"
                    >
                    Welcome to your dashboard, user!
                </GradientText>
                <h3>Manage, track, and simplify your academic data in one place.  </h3>
            </div>

            <div className='main-ctn'>
                <div className='lower-ctn'>
                    <div className='analytics-and-reg-ctn'>
                        <div className='analytics-ctn'>
                            <h1 className='card-header'>
                                <FontAwesomeIcon icon={faChartLine} style={{paddingRight:"10px"}}/>
                                Analytics
                            </h1>
                            <div className='dashboard-btns'>
                                <button className='sub-buttons'>
                                    <div className="notiglow"></div>
                                    <div className="notiborderglow"></div>

                                    <div className='inner-btn'>
                                        <div className='left-part-btn'>
                                            <FontAwesomeIcon icon={faBuildingColumns} size='xl' className='btn-icon'/>
                                            <h1 className="total">Total colleges</h1>
                                            <p className='number'>15</p>
                                        </div>

                                        <div className='right-part-btn'>
                                            <button className='more-icon'>
                                                <FontAwesomeIcon icon={faEllipsis} size='xs' color='white' />
                                            </button>
                                        </div>
                                    </div>
                                </button>

                                <button className='sub-buttons'>
                                    <div className="notiglow"></div>
                                    <div className="notiborderglow"></div>

                                    <div className='inner-btn'>
                                        <div className='left-part-btn'>
                                            <FontAwesomeIcon icon={faBook} size='xl' className='btn-icon'/>
                                            <h1 className="total">Total programs</h1>
                                            <p className='number'>15</p>
                                        </div>

                                        <div className='right-part-btn'>
                                            <button className='more-icon'>
                                                <FontAwesomeIcon icon={faEllipsis} size='xs' color='white' />
                                            </button>
                                        </div>
                                    </div>
                                </button>

                                <button className='sub-buttons'>
                                    <div className="notiglow"></div>
                                    <div className="notiborderglow"></div>

                                    <div className='inner-btn'>
                                        <div className='left-part-btn'>
                                            <FontAwesomeIcon icon={faGraduationCap} size='xl' className='btn-icon'/>
                                            <h1 className="total">Total students</h1>
                                            <p className='number'>15</p>
                                        </div>

                                        <div className='right-part-btn'>
                                            <button className='more-icon'>
                                                <FontAwesomeIcon icon={faEllipsis} size='xs' color='white' />
                                            </button>
                                        </div>
                                    </div>
                                </button>

                            </div>
                        </div>

                        <div className='analytics-ctn'>
                            <h1 className='card-header'>
                                <FontAwesomeIcon icon={faFolderOpen} style={{paddingRight:"10px"}}/>
                                Directories and Forms
                            </h1>
                            <div className='dashboard-btns'>
                                <button className='sub-buttons' onClick={() => navigate('/analytics')}>
                                    <div className="notiglow"></div>
                                    <div className="notiborderglow"></div>

                                    <div className='inner-btn'>
                                        <div className='left-part-btn'>
                                            <FontAwesomeIcon icon={faBuildingColumns} size='xl' className='btn-icon'/>
                                            <h1 className="total">Open college directory</h1>
                                        </div>
                                    </div>
                                </button>

                                <button className='sub-buttons'>
                                    <div className="notiglow"></div>
                                    <div className="notiborderglow"></div>

                                    <div className='inner-btn'>
                                        <div className='left-part-btn'>
                                            <FontAwesomeIcon icon={faBook} size='xl' className='btn-icon'/>
                                            <h1 className="total">Open program directory</h1>
                                        </div>
                                    </div>
                                </button>

                                <button className='sub-buttons'>
                                    <div className="notiglow"></div>
                                    <div className="notiborderglow"></div>

                                    <div className='inner-btn'>
                                        <div className='left-part-btn'>
                                            <FontAwesomeIcon icon={faGraduationCap} size='xl' className='btn-icon'/>
                                            <h1 className="total">Open student directory</h1>
                                        </div>
                                    </div>
                                </button>

                            </div>
                        </div>
                    </div>


                    <div className='recents-ctn'>
                        <div className="">
                            <h1 className='card-header'>
                                <FontAwesomeIcon icon={faClockRotateLeft} style={{paddingRight:"10px"}}/>
                                Recent Activity
                            </h1>
                            <p>to fix! display max 10</p>
                            <div>
                                <table>
                                    <tr>
                                        <p>Added new program</p>
                                        <p>last October 15, 2025, 05:10:00 AM</p>
                                    </tr>
                                    <tr>
                                        <p>Added new student</p>
                                        <p>last October 15, 2025, 05:19:00 AM</p>
                                    </tr>
                                    
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;