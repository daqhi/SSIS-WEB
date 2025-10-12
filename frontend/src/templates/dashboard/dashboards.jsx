import '/src/static/css/dashboard.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns, faBook, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import Navbar from '/src/templates/components/navbar.jsx'

function Dashboard() {
    return (
        <div>
            <Navbar />
            <div className='main-ctn'>
                
                <div className='header-ctn'>
                    <h1>Welcome to your dashboard, User!</h1>
                    <h3>Are you ready to register new students? </h3>
                </div>
                <hr />
                <div className='lower-ctn'>
                    <div className='analytics-and-reg-ctn'>
                        <div className='analytics-ctn'>
                            <h1>ANALYTICS</h1>
                            <div className='dashboard-btns'>
                                <button>
                                    <div className='inner-btn'>
                                        <FontAwesomeIcon icon={faBuildingColumns} size='2xl' className='btn-icon'/>
                                        <div>
                                            <h1>Total college</h1>
                                            <p>15</p>
                                        </div>
                                    </div>
                                </button>
                                <button>program</button>
                                <button>student</button>
                            </div>
                        </div>
                        <div className='reg-ctn'>
                            <h1>DIRECTORIES AND FORMS</h1>
                            <div className='dashboard-btns'>
                                <button>college</button>
                                <button>program</button>
                                <button>student</button>
                            </div>
                        </div>
                    </div>
                    <div className='recents-ctn'>
                        <div>
                            recents...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;