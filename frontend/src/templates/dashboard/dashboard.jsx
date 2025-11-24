import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns, faChartLine, faBook, 
         faGraduationCap, faEllipsis, faFolderOpen,
         faClockRotateLeft, faSort } from "@fortawesome/free-solid-svg-icons";
import Navbar from '/src/templates/components/navbar.jsx'
import '../../static/css/dashboard.css'
import GradientText from '../components/shiny-text.jsx';
import { MoveRight } from "lucide-react";
import Footer from '../components/footer.jsx';
import supabase from "../../lib/supabaseClient.js";

function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ overall: { Colleges: '...', Programs: '...', Students: '...' } });

    const cards = [
        { icon: faBuildingColumns, key: "Colleges", navigate: "/college-page", label: "Total Colleges", gradient:"from-[#18181b] to-[#1e2b38] to-[#293B4D]" },
        { icon: faBook, key: "Programs", navigate: "/program-page", label: "Total Programs", gradient: "from-[#18181b] to-[#1e2b38] to-[#293B4D]" },
        { icon: faGraduationCap, key: "Students", navigate: "/student-page", label: "Total Students", gradient: "from-[#18181b] to-[#1e2b38] to-[#293B4D]" }
    ];

    // Fetch counts from backend API
    // useEffect(() => {
    //     const fetchCounts = async () => {
    //         try {
    //             setLoading(true);

    //             const collegeRes = await fetch('/api/college_count');
    //             const programRes = await fetch('/api/program_count');
    //             const studentRes = await fetch('/api/student_count');

    //             const collegeData = await collegeRes.json();
    //             const programData = await programRes.json();
    //             const studentData = await studentRes.json();

    //             setCounts({
    //                 overall: {
    //                     Colleges: collegeData.count,
    //                     Programs: programData.count,
    //                     Students: studentData.count,
    //                 },
    //             });

    //             setLoading(false);
    //         } catch (error) {
    //             console.error('Error fetching counts:', error);
    //             setLoading(false);
    //         }
    //     };
    //     fetchCounts();
    // }, []);

    // Fetch counts from Supabase (alternative method)
    useEffect(() => {
        const loadCounts = async () => {
        setLoading(true);
        try {
            const collegesRes = await supabase
            .from('colleges')
            .select('*', { count: 'exact', head: true });
            const programsRes = await supabase
            .from('programs')
            .select('*', { count: 'exact', head: true });
            const studentsRes = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true });

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
                <div className='p-8 bg-gradient-to-r from-[#18181b] via-[#18181b] to-[#1e2b38] flex flex-col mx-5'>
                    <div>
                        <GradientText
                            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                            animationSpeed={7}
                            showBorder={false}
                            >
                            Welcome to your dashboard, user!
                        </GradientText>
                    </div>
                    <div>
                        <h3 className="mx-3 text-gray-200 pb-4">Manage, track, and simplify your academic data in one place.  </h3>
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
                        <RecentActivity />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

function RecentActivity() {
    return (
        <div className='border-1 border-gray-400  w-1/3 p-6 mr-5'>
            <div className="">
                <h1 className='text-base font-bold mb-5'>
                    <FontAwesomeIcon icon={faClockRotateLeft} style={{paddingRight:"10px"}}/>
                    Recent Activity
                </h1>
                <p className="italic text-gray-500 ml-8 -mt-5 mb-5 text-sm">Data are static only</p>
                <div>
                    <table class="text-sm w-full border border-gray-100 overflow-hidden">
                        <thead class="bg-[#18181b]">
                            <tr>
                                <th class="text-left px-4 py-3 w-2/3 font-semibold text-gray-200">
                                    Activity
                                </th>
                                <th class="text-left px-4 py-3 w-1/3 font-semibold text-gray-200">
                                    Date
                                </th>
                            </tr>
                        </thead>

                    <tbody class="divide-y divide-gray-200">
                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-3">Added student 2025-2002</td>
                            <td class="px-4 py-3">Nov. 15, 2025</td>
                        </tr>

                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-3">Added student 2023-2022</td>
                            <td class="px-4 py-3">Nov. 14, 2025</td>
                        </tr>

                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-3">Added program BSIT</td>
                            <td class="px-4 py-3">Nov. 14, 2025</td>
                        </tr>

                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-3">Added student 2022-0427</td>
                            <td class="px-4 py-3">Nov. 13, 2025</td>
                        </tr>

                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-3">Added program BSECe</td>
                            <td class="px-4 py-3">Nov. 13, 2025</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-3">Added student 2025-2002</td>
                            <td class="px-4 py-3">Nov. 12, 2025</td>
                        </tr>

                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-3">Added college collegecode1</td>
                            <td class="px-4 py-3">Nov. 11, 2025</td>
                        </tr>
                    </tbody>
                    </table>

                </div>
            </div>
        </div>
    )
}

export default Dashboard;