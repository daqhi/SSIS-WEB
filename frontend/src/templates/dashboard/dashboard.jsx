import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns, faChartLine, faBook, 
         faGraduationCap, faEllipsis, faFolderOpen,
         faClockRotateLeft, faPenClip, 
         faPen, faPlus} from "@fortawesome/free-solid-svg-icons";
import Navbar from '/src/templates/components/navbar.jsx'
import '../../static/css/dashboard.css'
import GradientText from '../components/shiny-text.jsx';
import { MoveRight } from "lucide-react";
import Footer from '../components/footer.jsx';
import supabase from "../../lib/supabaseClient.js";
import { getCurrentUserId, getCurrentUser } from "../../lib/auth.js";
import Reindeer from '../../static/images/reindeer.json';
import Lottie from 'lottie-react';
import Snowfall from 'react-snowfall';


export default function Dashboard() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ overall: { Colleges: '...', Programs: '...', Students: '...' } });
    const [username, setUsername] = useState("");

    useEffect(() => {
        // Fetch user data on component mount
        setUsername(getCurrentUser()?.username || "Guest");
    }, []);

    const cards = [
        { icon: faBuildingColumns, key: "Colleges", navigate: "/college-page", label: "Total Colleges", gradient:"from-[#18181b] to-[#1e2b38] to-[#293B4D]" },
        { icon: faBook, key: "Programs", navigate: "/program-page", label: "Total Programs", gradient: "from-[#18181b] to-[#1e2b38] to-[#293B4D]" },
        { icon: faGraduationCap, key: "Students", navigate: "/student-page", label: "Total Students", gradient: "from-[#18181b] to-[#1e2b38] to-[#293B4D]" }
    ];

    // Fetch counts from Supabase filtered by current user's userid
    useEffect(() => {
        const loadCounts = async () => {
            setLoading(true);
            try {
                const userid = getCurrentUserId();
                
                if (!userid) {
                    console.error('No userid found - user may not be logged in');
                    setLoading(false);
                    return;
                }

                console.log('Fetching counts for userid:', userid);

                // Query counts filtered by userid
                const collegesRes = await supabase
                    .from('colleges')
                    .select('*', { count: 'exact', head: true })
                    .eq('userid', userid);
                
                const programsRes = await supabase
                    .from('programs')
                    .select('*', { count: 'exact', head: true })
                    .eq('userid', userid);
                
                const studentsRes = await supabase
                    .from('students')
                    .select('*', { count: 'exact', head: true })
                    .eq('userid', userid);

                console.log('Colleges count:', collegesRes.count);
                console.log('Programs count:', programsRes.count);
                console.log('Students count:', studentsRes.count);

                setCounts({
                    overall: {
                        Colleges: collegesRes.count ?? 0,
                        Programs: programsRes.count ?? 0,
                        Students: studentsRes.count ?? 0,
                    }
                });
            } catch (err) {
                console.error('Supabase count error', err);
            } finally {
                setLoading(false);
            }
        };

        loadCounts();
    }, []);



    return (
        <div>
            <Navbar />
            <div className="mx-20 my-7">
                {/* HEADER */}
                <div className='bg-gradient-to-r from-[#18181b] via-[#18181b] to-[#1e2b38] flex flex-row mx-5 justify-between items-stretch relative'>
                    <Snowfall
                        color="#cdcdcd"
                        animationSpeed={3}
                        snowflakeCount={120}
                        style={{
                            filter: 'blur(4px)',
                            pointerEvents: 'none',
                        }}
                    />
                    <div className='leading-15 pl-8 py-10 flex flex-col justify-center w-3/4'>
                        <div>
                            <GradientText
                                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                                animationSpeed={3}
                                snowflakeCount={10}
                                showBorder={false}
                                >
                                Welcome to your dashboard, {username}!
                            </GradientText>
                        </div>
                        <div>
                            <h3 className="mx-3 mt-3 text-gray-200 pb-4 leading-none">Manage, track, and simplify your academic data in one place.  </h3>
                        </div>
                    </div>
                    <div className="mr-10 relative flex-1 flex items-end">
                        <Lottie
                            animationData={Reindeer}
                            loop
                            autoplay
                            className="w-48 h-48 absolute bottom-0 right-0"
                        />
                    </div>
                </div>

                <div>
                    <div className='lower-ctn'>
                        {/* analytics, directories & forms */}
                        <div className='flex flex-col gap-5 w-2/3'>
                            <div className='border-1 border-gray-400 px-6 pt-5 pb-4'>
                                <h1 className='text-base font-bold mb-5'>
                                    <FontAwesomeIcon icon={faChartLine} style={{paddingRight:"10px"}}/>
                                    Analytics
                                </h1>
                                <div className='flex flex-row flex-wrap gap-3 justify-between'>
                                    {cards.map(card => (
                                        <button
                                            key={card.key}
                                            className="group text-left flex-1"
                                            onClick={() => navigate(card.navigate, {
                                                state: {
                                                    defaultStatus: card.key === 'Total' ? 'all' : card.key
                                                }
                                            })}
                                        >
                                            <div className={`flex flex-col justify-between bg-gray-100 h-32 p-5
                                                            transition-all duration-300 ease-in-out
                                                            hover:bg-gradient-to-l ${card.gradient}
                                                            hover:text-white`}>
                                                <div className="flex flex-row items-center h-full gap-4">
                                                    {/* ICON — expands on hover */}
                                                    <div className="
                                                        w-8 h-8
                                                        transition-all duration-300
                                                        group-hover:w-12 group-hover:h-12
                                                        flex items-center justify-center
                                                    ">
                                                        <FontAwesomeIcon icon={card.icon} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
                                                    </div>
                                                    {/* DIVIDER */}
                                                    <div className="bg-gradient-to-t from-[#40ffaa] to-[#4079ff] h-20 w-[3px] transition-all duration-300 group-hover:h-[90%]" />
                                                    {/* RIGHT SIDE TEXT */}
                                                    <div className="flex flex-col flex-1 justify-between transition-all duration-300">
                                                        <p className="font-semibold text-base">{card.label}</p>
                                                        <p className="font-bold text-5xl pb-2">
                                                            {loading ? "..." : counts.overall[card.key]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col items-end mt-5">
                                    <button className='flex flex-row items-center gap-2 text-sm font-semibold text-[#FCA311] hover:underline' onClick={() => navigate('/analytics')}>
                                        View detailed analytics
                                        <MoveRight size={18} color={'#FCA311'} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>

                            {/* FORMS AND DIRECTORIES */}
                            <div className='border-1 border-gray-400 px-6 pt-5 pb-4 '>
                                <h1 className='text-base font-bold mb-5'>
                                    <FontAwesomeIcon icon={faFolderOpen} style={{paddingRight:"10px"}}/>
                                    Forms and Directories
                                </h1>
                                <div className='flex flex-row flex-wrap gap-3 justify-between'>
                                    {cards.map(card => (
                                        <button
                                            key={card.key}
                                            className="group text-left flex-1"
                                            onClick={() => navigate(card.navigate, {
                                                state: {
                                                    defaultStatus: card.key === 'Total' ? 'all' : card.key
                                                }
                                            })}
                                        >
                                            <div className={`flex flex-col justify-between bg-gray-100 h-32 p-5
                                                            transition-all duration-300 ease-in-out
                                                            hover:bg-gradient-to-l ${card.gradient}
                                                            hover:text-white`}>
                                                <div className="flex flex-row items-center h-full gap-4">
                                                    {/* ICON — expands on hover */}
                                                    <div className="
                                                        w-8 h-8
                                                        transition-all duration-300
                                                        group-hover:w-12 group-hover:h-12
                                                        flex items-center justify-center
                                                    ">
                                                        <FontAwesomeIcon icon={card.icon} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
                                                    </div>
                                                    {/* DIVIDER */}
                                                    <div className="bg-gradient-to-t from-[#40ffaa] to-[#4079ff] h-20 w-[3px] transition-all duration-300 group-hover:h-[90%]" />
                                                    {/* RIGHT SIDE TEXT */}
                                                    <div className="flex flex-col flex-1 justify-between transition-all duration-300">
                                                        <p className="">See All</p>
                                                        <p className="font-semibold text-2xl">{card.key}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col w-1/3 gap-5">
                            <QuickActionsCard />
                            <RecentActivity />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}


function RecentActivity() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecentActivities = async () => {
            setLoading(true);
            try {
                const userid = getCurrentUserId();
                
                if (!userid) {
                    console.error('No userid found - user may not be logged in');
                    setLoading(false);
                    return;
                }

                // Fetch recent students
                const { data: students, error: studentsError } = await supabase
                    .from('students')
                    .select('idnum, created_on')
                    .eq('userid', userid)
                    .order('created_on', { ascending: false })
                    .limit(5);

                // Fetch recent programs
                const { data: programs, error: programsError } = await supabase
                    .from('programs')
                    .select('programcode, programname, created_on')
                    .eq('userid', userid)
                    .order('created_on', { ascending: false })
                    .limit(5);

                // Fetch recent colleges
                const { data: colleges, error: collegesError } = await supabase
                    .from('colleges')
                    .select('collegecode, collegename, created_on')
                    .eq('userid', userid)
                    .order('created_on', { ascending: false })
                    .limit(5);

                if (studentsError || programsError || collegesError) {
                    console.error('Error fetching activities:', studentsError || programsError || collegesError);
                    setLoading(false);
                    return;
                }

                // Combine all activities
                const allActivities = [
                    ...(students || []).map(s => ({
                        type: 'student',
                        description: `Added student ${s.idnum}`,
                        date: s.created_on
                    })),
                    ...(programs || []).map(p => ({
                        type: 'program',
                        description: `Added program ${p.programcode}`,
                        date: p.created_on
                    })),
                    ...(colleges || []).map(c => ({
                        type: 'college',
                        description: `Added college ${c.collegecode}`,
                        date: c.created_on
                    }))
                ];

                // Sort by date and take top 5
                const sortedActivities = allActivities
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5);

                setActivities(sortedActivities);
            } catch (err) {
                console.error('Error loading recent activities:', err);
            } finally {
                setLoading(false);
            }
        };

        loadRecentActivities();
    }, []);

    // Format date to readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    return (
                <div className='mr-5 -mt-2'>
                    <table className="text-sm w-full border-[1px] border-gray-400 overflow-hidden mr-5">
                        <thead className="bg-[#18181b]">
                            <tr>
                                <th className="text-left px-4 py-3 w-2/3 font-semibold text-gray-200">
                                    Activity
                                </th>
                                <th className="text-left px-4 py-3 w-1/3 font-semibold text-gray-200">
                                    Date
                                </th>
                            </tr>
                        </thead>

                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="2" className="px-4 py-3 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : activities.length > 0 ? (
                            activities.map((activity, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{activity.description}</td>
                                    <td className="px-4 py-3">{formatDate(activity.date)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="px-4 py-3 text-center text-gray-500">
                                    No recent activities
                                </td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>
    )
}


function QuickActionsCard(){
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    // for handling navigation + close dropdown
    const handleNavigate = (path, options = {}) => {
        navigate(path, options);
        setOpenMenu(null);
    };
    return (
        <div className='border-1 border-gray-400 p-6 mr-5'>
            <div className="">
                <h1 className='text-base font-bold mb-5'>
                    Quick Actions
                </h1>
            </div>

            <div className="flex flex-row flex-wrap gap-2 justify-between">
                <button
                    className="flex-1 leading-none w-1/3 text-start font-semibold bg-gray-100 text-black h-15 text-sm hover:bg-[#18181b] hover:text-gray-100 py-2 px-4 flex flex-row items-center trasition-all duration-200 ease-in-out"
                    onClick={() => handleNavigate("/college-page", { state: { openForm: true } })}
                >
                    <FontAwesomeIcon icon={faPlus} style={{paddingRight:"10px", color:"#FCA311"}}/>
                    <p>Add college</p>
                </button>
                <button
                    className="flex-1 leading-none w-1/3 text-start font-semibold bg-gray-100 text-black h-15 text-sm hover:bg-[#18181b] hover:text-gray-100 py-2 px-4 w-full flex flex-row items-center trasition-all duration-200 ease-in-out"
                    onClick={() => handleNavigate("/program-page", { state: { openForm: true } })}
                >
                    <FontAwesomeIcon icon={faPlus} style={{paddingRight:"10px", color:"#FCA311"}}/>
                    Add program
                </button>
                <button
                    className="flex-1 leading-none w-1/3 text-start font-semibold bg-gray-100 text-black h-15 text-sm hover:bg-[#18181b] hover:text-gray-100 py-2 px-4 w-full flex flex-row items-center trasition-all duration-200 ease-in-out"
                    onClick={() => handleNavigate("/student-page", { state: { openForm: true } })}
                >
                    <FontAwesomeIcon icon={faPlus} style={{paddingRight:"10px", color:"#FCA311"}}/>
                    Add students
                </button>
            </div>
        </div>
    )
}