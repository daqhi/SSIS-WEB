import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faSort, faPenToSquare, faTrash, faSliders, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { X } from "lucide-react";
import '../../static/css/pages.css'
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { getCurrentUserId } from '../../lib/auth';
import supabase from '../../lib/supabaseClient';
import Lottie from 'lottie-react';
import MeteorShower from '../../static/images/Falling Meteor.json';
import Modal, { ConfirmModal } from '../components/modal';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

const createEmptyFilters = () => ({
    collegeCode: '',
    startDate: '',
    endDate: '',
});

export default function ProgramPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [editingProgram, setEditingProgram] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showForm, setShowForm] = useState(false)
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const toggleForm = () => {
        // When toggling via the button, always go back to "add" mode
        setEditingProgram(null);
        setShowForm((prev) => !prev);
    }

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
    }

    // Open form if navigated with state
    useEffect(() => {
        if (location.state?.openForm) {
            setShowForm(true)
            navigate(location.pathname, { replace: true, state: {}})
        }
    }, [location.state]);


    return(
        <div>
            <Navbar />
            <div className='flex flex-row min-h-screen w-full'>
                <div className="directory-wrapper ">
                    <div className="breadcrumb-container">
                        <nav className="breadcrumb">
                            <span className="breadcrumb-item">
                                <button className="breadcrumb-button" onClick={() => navigate("/dashboard")}>Home </button>
                            </span>
                            <span className="breadcrumb-separator">›</span>
                            <span className="breadcrumb-item active">
                                <button className="breadcrumb-button" onClick={() => navigate("/college-page")}>Program Directory </button>
                            </span>
                            <span className="breadcrumb-line"></span>
                            <button className="open-form-button text-[#fca311]" onClick={toggleForm}>
                                {showForm ? 'Close Program Form' : 'Open Program Form'}
                            </button>
                        </nav>
                    </div>
                    <ProgramDirectory 
                        refreshKey={refreshKey} 
                        onEditProgram={(program) => {
                            setEditingProgram(program);
                            setShowForm(true);
                        }}
                        onShowToast={showToastMessage}
                    />
                </div>

                <div className={`form-wrapper ${showForm ? "open" : ""}`}>
                        <ProgramForm
                        onProgramAdded={() => setRefreshKey((prev) => prev + 1)}
                            onProgramUpdated={() => {
                                setRefreshKey((prev) => prev + 1);
                                setEditingProgram(null);
                                setShowForm(false);
                            }}
                            onShowToast={showToastMessage}
                        editingProgram={editingProgram}
                    />
                </div>
            </div>
            {showToast && (
                <Toast 
                    message={toastMessage} 
                    onClose={() => setShowToast(false)}
                />
            )}
            <Footer />
        </div>
    )
}



// ===================== PROGRAM FORM ===================== //

function ProgramForm({ onProgramAdded, onProgramUpdated, onShowToast, editingProgram}) {
    const [collegeCode, setCollegeCode] = useState("");
    const [programCode, setProgramCode] = useState("");
    const [programName, setProgramName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [colleges, setColleges] = useState([]);
    const [showAddConfirm, setShowAddConfirm] = useState(false);
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);

    // Populate form if editing
    useEffect(() => {
        if (editingProgram) {
            setCollegeCode(editingProgram.collegecode);
            setProgramCode(editingProgram.programcode);
            setProgramName(editingProgram.programname);
        } else {
            setCollegeCode("");
            setProgramCode("")
            setProgramName("")
        }
    }, [editingProgram])

    // fetch colleges for dropdown
    useEffect(() => {
        const loadColleges = async () => {
            try {
                const userid = getCurrentUserId();

                if (!userid) {
                    console.error('No userid found - user may not be logged in');
                    return;
                }

                const { data, error } = await supabase
                    .from("colleges")
                    .select("*")
                    .eq("userid", userid);

                if (error) {
                    console.error("Error fetching colleges:", error);
                    return;
                }

                console.log("Fetched colleges:", data);
                setColleges(data || []);
            } catch (error) {
                console.error("Unexpected error:", error);
            }
        };

        loadColleges();
    }, []);

    //handler to add program
    async function handleSubmit(e) {
        e.preventDefault();

        if (!collegeCode || !programCode || !programName) {
            alert("All fields are required!");
            return;
        }

        const payload = {
            collegecode: collegeCode.trim(),
            programcode: programCode.trim(),
            programname: programName.trim(),
        };

        const userid = getCurrentUserId();
        if (!userid) {
            alert("You must be logged in to perform this action.");
            return;
        }

        payload.userid = userid;
        
        // Defer actual DB operation to confirmation modal
        setPendingPayload(payload);
        if (editingProgram) {
            setShowUpdateConfirm(true);
        } else {
            setShowAddConfirm(true);
        }
    }

    async function handleConfirmAdd() {
        if (!pendingPayload) {
            setShowAddConfirm(false);
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('programs')
                .insert([pendingPayload]);

            if (error) {
                alert(error.message || "Failed to add program");
                console.error("Error adding program:", error);
                return;
            }

            onShowToast?.("Program added successfully!");
            onProgramAdded?.();

            // clear form
            setCollegeCode("");
            setProgramName("");
            setProgramCode("");
        } catch (err) {
            console.error("Error adding program:", err);
            alert("Something went wrong. Check console for details.");
        } finally {
            setIsLoading(false);
            setPendingPayload(null);
            setShowAddConfirm(false);
        }
    }

    async function handleConfirmUpdate() {
        if (!pendingPayload || !editingProgram) {
            setShowUpdateConfirm(false);
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('programs')
                .update({
                    collegecode: pendingPayload.collegecode,
                    programcode: pendingPayload.programcode,
                    programname: pendingPayload.programname,
                })
                .eq('programcode', editingProgram.programcode)
                .eq('userid', pendingPayload.userid);

            if (error) {
                console.error("Error updating program:", error);
                alert(error.message || "Failed to update program");
                return;
            }

            onShowToast?.("Program updated successfully!");
            onProgramUpdated?.();

            // clear form
            setCollegeCode("");
            setProgramName("");
            setProgramCode("");
        } catch (err) {
            console.error("Error updating program:", err);
            alert("Something went wrong. Check console for details.");
        } finally {
            setIsLoading(false);
            setPendingPayload(null);
            setShowUpdateConfirm(false);
        }
    }




    return (
        <div className='border-l-2 h-full'>
            <Lottie
                animationData={MeteorShower}
                loop
                autoplay
                className="absolute pointer-events-none -mt-21 opacity-50"
            />
            <div className='font-bold text-4xl bg-[#18181b] text-white p-6 py-10 text-center'>
                Program Form
                <p className='text-sm font-thin italic'>Add new program here</p>
            </div>
            
            <div className='bg-white p-7'>
                <form onSubmit={handleSubmit}>

                    <label className="font-semibold text-base">Program Information: </label>
                    <div className='flex flex-row mt-4'>
                        <label className="text-base text-[13px] w-1/3">College: </label>
                        <select
                            value={collegeCode}
                            onChange={(e) => setCollegeCode(e.target.value)}
                            required
                            className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
                        >
                            <option value="null">Select College Code</option>
                            {colleges.map((c) => (
                                <option key={c.collegecode}>
                                    {c.collegecode}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='flex flex-row'>
                        <label className="text-base text-[13px] w-1/3">Program Code: </label> <br />
                        <input
                            type="text"
                            value={programCode}
                            onChange={(e) => setProgramCode(e.target.value)}
                            placeholder='e.g. BSCS'
                            required
                            className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
                        />
                    </div>
                    
                    <div className='flex flex-row'>
                        <label className="text-base text-[13px] w-1/3">Program Name: </label> <br />
                        <input
                            type="text"
                            value={programName}
                            onChange={(e) => setProgramName(e.target.value)}
                            placeholder='e.g. Bachelors of Science in Computer Science'
                        required
                        className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
                    /> 
                    </div>


                    <div className='add-button-container'>
                        <button 
                            type="submit" 
                            className='w-full bg-[#FCA311] h-10 text-white font-bold hover:bg-[#e5940e] disabled:opacity-50 disabled:cursor-not-allowed'
                            disabled={isLoading}
                        >
                            {isLoading ? 'Submitting...' : 'Submit'} 
                        </button>
                    </div>
                </form>
            </div>

            {showAddConfirm && (
                <ConfirmModal
                    isOpen={showAddConfirm}
                    onClose={() => {
                        setShowAddConfirm(false);
                        setPendingPayload(null);
                    }}
                    onConfirm={handleConfirmAdd}
                    title="Confirm Add"
                    message={`Are you sure you want to add this program?`}
                    confirmText="Add"
                    cancelText="Cancel"
                />
            )}

            {showUpdateConfirm && (
                <ConfirmModal
                    isOpen={showUpdateConfirm}
                    onClose={() => {
                        setShowUpdateConfirm(false);
                        setPendingPayload(null);
                    }}
                    onConfirm={handleConfirmUpdate}
                    title="Confirm Update"
                    message={`Are you sure you want to update this program's information?`}
                    confirmText="Update"
                    cancelText="Cancel"
                />
            )}
        </div>
    )
}




// ===================== PROGRAM DIRECTORY ===================== //

function ProgramDirectory( {refreshKey, onEditProgram, onShowToast }) {
    const [programs, setPrograms] = useState([])
    const [searchField, setSearchField] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilters, setActiveFilters] = useState(() => createEmptyFilters());
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [programToDelete, setProgramToDelete] = useState(null);
    
    const rowsPerPage = 10;

    const getCreatedOnTime = (value) => {
        if (!value) {
            return 0;
        }

        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    };

    const sortByCreatedOnDesc = (list) => {
        return [...(list || [])].sort((a, b) => getCreatedOnTime(b?.created_on) - getCreatedOnTime(a?.created_on));
    };

    const filteredPrograms = useMemo(() => {
        let data = [...programs];

        if (searchTerm.trim()) {
            const query = searchTerm.trim().toLowerCase();
            data = data.filter((program) => {
                const college = program.collegecode?.toLowerCase() || '';
                const code = program.programcode?.toLowerCase() || '';
                const name = program.programname?.toLowerCase() || '';

                switch (searchField) {
                    case 'collegecode':
                        return college.includes(query);
                    case 'programcode':
                        return code.includes(query);
                    case 'programname':
                        return name.includes(query);
                    case 'all':
                    default:
                        return college.includes(query) || code.includes(query) || name.includes(query);
                }
            });
        }

        const resolveDate = (program) => {
            const rawValue = program?.created_on;
            if (!rawValue) {
                return null;
            }

            const parsed = new Date(rawValue);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        };

        if (activeFilters.startDate) {
            const start = new Date(activeFilters.startDate);
            start.setHours(0, 0, 0, 0);
            data = data.filter((program) => {
                const programDate = resolveDate(program);
                if (!programDate) {
                    return false;
                }
                return programDate >= start;
            });
        }

        if (activeFilters.endDate) {
            const end = new Date(activeFilters.endDate);
            end.setHours(23, 59, 59, 999);
            data = data.filter((program) => {
                const programDate = resolveDate(program);
                if (!programDate) {
                    return false;
                }
                return programDate <= end;
            });
        }

        if (activeFilters.collegeCode) {
            data = data.filter((program) => program.collegecode === activeFilters.collegeCode);
        }

        if (sortConfig.key) {
            const direction = sortConfig.direction === 'asc' ? 1 : -1;
            data.sort((a, b) => {
                const aVal = (a?.[sortConfig.key] ?? '').toString().toLowerCase();
                const bVal = (b?.[sortConfig.key] ?? '').toString().toLowerCase();
                return direction * aVal.localeCompare(bVal);
            });
        } else {
            data = sortByCreatedOnDesc(data);
        }

        return data;
    }, [programs, searchTerm, searchField, activeFilters, sortConfig]);

    const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / rowsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const indexOfLast = safePage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentPrograms = filteredPrograms.slice(indexOfFirst, indexOfLast);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, searchField, activeFilters]);

    //for loading programs
    useEffect(() => {
        const loadPrograms = async () => {
            try {
                const userid = getCurrentUserId();

                if (!userid) {
                    console.error('No userid found - user may not be logged in');
                    return;
                }

                const { data, error } = await supabase
                    .from("programs")
                    .select("*")
                    .eq("userid", userid)
                    .order('created_on', { ascending: false });
                
                if (error) {
                    console.error("Error fetching programs:", error);
                    return;
                }
                setPrograms(sortByCreatedOnDesc(data));
            } catch (error) {
                console.error("Error loading programs:", error);
            }
        };
        loadPrograms();

    }, [refreshKey])


    function openDeleteModal(programCode) {
        setProgramToDelete(programCode);
        setDeleteModalOpen(true);
    }


    function toggleSortCollegeCode() {
        setSortConfig((prev) => {
            const direction = prev.key === 'collegecode' && prev.direction === 'asc' ? 'desc' : 'asc';
            return { key: 'collegecode', direction };
        });
    }

    function toggleSortProgramCode() {
        setSortConfig((prev) => {
            const direction = prev.key === 'programcode' && prev.direction === 'asc' ? 'desc' : 'asc';
            return { key: 'programcode', direction };
        });
    }

    function toggleSortProgramName() {
        setSortConfig((prev) => {
            const direction = prev.key === 'programname' && prev.direction === 'asc' ? 'desc' : 'asc';
            return { key: 'programname', direction };
        });
    }

    //for deleting programs
    async function handleDelete(programCode) {
        try {
            const userid = getCurrentUserId();

            if (!userid) {
                console.error('No userid found - user may not be logged in');
                return;
            }

            const { error } = await supabase
                .from('programs')
                .delete()
                .eq('programcode', programCode)
                .eq('userid', userid);
            if (error) {
                console.error("Error deleting program:", error);
                return;
            } else {
                onShowToast?.("Program deleted successfully!");
                setPrograms((prev) => prev.filter((p) => p.programcode !== programCode));
            }
        } catch (err) {
            console.error("Error deleting program:", err);
            alert("An error occurred while deleting the program.");
        }
    }


    // for searching
    function handleSearch(keyword) {
        setSearchTerm(keyword);
    }

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
    };

    const handleCloseAdvancedSearch = (shouldReset = false) => {
        if (shouldReset) {
            setActiveFilters(createEmptyFilters());
        }
        setShowAdvancedSearch(false);
    };


    return (
        <div className='area-main-directory mb-10'>
            <h1 className="font-bold text-4xl mt-8">Program Directory</h1>
            <div className='flex flex-row items-center mt-5 mb-4 bg-white gap-2'>
                <div className='flex flex-row text-sm h-8'>
                    <div className='border-[1px] border-gray-400 p-2 flex items-center gap-2 bg-white w-62'>
                        <FontAwesomeIcon icon={faMagnifyingGlass}/>
                        <input
                            className='w-full focus:outline-none h-4 text-[13px] border-none'
                            type='text'
                            placeholder='Type in a keyword or name...'
                            value={searchTerm}
                            onChange={(e)=>handleSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className='flex gap-2'>
                    <select 
                        className='bg-gray-100 px-1 h-8 text-[13px]'
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                    >
                        <option value='all'>All Fields</option>
                        <option value='collegecode'>College Code</option>
                        <option value='programcode'>Program Code</option>
                        <option value='programname'>Program Name</option>
                    </select>
                </div>
                <button 
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className='bg-[#fca31c] h-8 text-[13px] text-white px-2 hover:bg-[#e89419] transition-colors'
                > 
                    <FontAwesomeIcon icon={faSliders} size='lg' color='white' className='mr-1 scale-80'/> 
                    Advanced Search
                </button>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showAdvancedSearch ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
                <AdvancedSearch 
                    programs={programs} 
                    filters={activeFilters}
                    onApply={handleApplyFilters}
                    onClose={handleCloseAdvancedSearch}
                />
            </div>


            <div className='w-full'>
                <div className="w-full table">
                    <table className='text-sm'>
                        <thead>
                        <tr className='border-b-2 border-gray-300'>
                            <th>
                                <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1' onClick={toggleSortCollegeCode}> 
                                    College Code <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1' onClick={toggleSortProgramCode}> 
                                    Program Code <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1' onClick={toggleSortProgramName}> 
                                    Program Name <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th className="text-center">
                                <button className="flex items-center justify-center gap-1 text-black px-4 pb-3 w-full">
                                    Actions
                                </button>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                            {currentPrograms.length > 0 ? (
                                currentPrograms.map((p) => (
                                <tr key={p.programCode}>
                                    <td>{p.collegecode || "None"}</td>
                                    <td>{p.programcode}</td>
                                    <td>{p.programname}</td>
                                    <td className='text-center'>
                                        <button className='edit' onClick={() => onEditProgram(p)} > 
                                            <FontAwesomeIcon icon={faPenToSquare} size='xs' color='#000000ff'/>
                                        </button>
                                        
                                        <button className='delete' onClick={() => openDeleteModal(p.programcode)}> 
                                            <FontAwesomeIcon icon={faTrash} size='xs' color='#FCA311'/> 
                                        </button>
                                    </td>
                                </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center", padding: "10px" }}>No programs found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="flex flex-row justify-between text-sm mx-4 my-3 items-center">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1,1))} 
                            style={{ visibility: safePage === 1 ? 'hidden' : 'visible' }}
                            className='font-semibold text-[#FCA311]'
                        >
                            <FontAwesomeIcon className='page-icon' icon={faArrowLeft} size="sm" color="#FCA311" /> 
                            Prev
                        </button>

                        <span className='font-semibold'>Page {safePage} of {totalPages} </span>

                        <button 
                            onClick = {() => setCurrentPage(prev => prev < totalPages ? prev + 1 : prev )} 
                            style={{ visibility: safePage === totalPages ? 'hidden' : 'visible' }}
                            className='font-semibold text-[#FCA311]'
                        >
                            Next 
                            <FontAwesomeIcon className='page-icon' icon={faArrowRight} size="sm" color="#FCA311" /> 
                        </button>
                    </div>
                </div>
            </div>
            
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setProgramToDelete(null);
                }}
                onConfirm={() => {
                    if (programToDelete) {
                        handleDelete(programToDelete);
                    }
                    setDeleteModalOpen(false);
                    setProgramToDelete(null);
                }}
                title="Confirm Delete"
                message={`Are you sure you want to delete program ${programToDelete}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}


function AdvancedSearch({ programs, filters, onApply, onClose }) {
    const [selectedCollegeCode, setSelectedCollegeCode] = useState(filters.collegeCode || '');
    const [startDate, setStartDate] = useState(filters.startDate || '');
    const [endDate, setEndDate] = useState(filters.endDate || '');

    useEffect(() => {
        setSelectedCollegeCode(filters.collegeCode || '');
        setStartDate(filters.startDate || '');
        setEndDate(filters.endDate || '');
    }, [filters]);

    const collegeCodes = useMemo(() => {
        const uniqueCodes = new Set();

        programs.forEach((program) => {
            const code = program?.collegecode?.trim();
            if (code) {
                uniqueCodes.add(code);
            }
        });

        return Array.from(uniqueCodes).sort((a, b) => a.localeCompare(b));
    }, [programs]);

    const handleApply = () => {
        onApply?.({
            collegeCode: selectedCollegeCode,
            startDate,
            endDate,
        });
    };

    const handleCancel = () => {
        const clearedFilters = createEmptyFilters();
        setSelectedCollegeCode('');
        setStartDate('');
        setEndDate('');
        onApply?.(clearedFilters);
        onClose?.(true);
    };

    return (
        <div className=''>
            <div className='flex flex-row gap-2'>
                <div className='border border-gray-300 w-1/2 p-3'>
                    <p className='text-xs font-semibold mb-2'>Select Fields</p>
                    <div className='flex gap-2 h-6 text-xs'>
                        <select 
                            className='w-1/3 bg-gray-100 px-1'
                            value={selectedCollegeCode}
                            onChange={(e) => setSelectedCollegeCode(e.target.value)}
                        >
                            <option value="">All College Codes</option>
                            {collegeCodes.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='border border-gray-300 p-3 w-1/2'>
                    <p className='text-xs font-semibold mb-2'>Select Timeframe</p>
                    <div className='flex gap-2 h-6 text-xs items-center h-6'>
                        <p className='text-sm text-[#fca31c] font-bold'>Program Added: </p>
                        <input 
                            type='date' 
                            className='bg-gray-100 h-6 px-2 w-1/3'
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        -
                        <input 
                            type='date' 
                            className='bg-gray-100 h-6 px-2 w-1/3'
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            
            <div className='flex justify-end mt-2 gap-2'>
                <button 
                    className='flex flex-row items-center gap-1 bg-gray-100 p-1 px-3 text-sm hover:bg-gray-200 transition-colors'
                    onClick={handleCancel}
                >
                    <X size={'15'} className='-mt-[1px]'/>
                    Clear
                </button>
                <button 
                    className='bg-[#fca31a] text-white p-1 text-sm px-3 hover:bg-[#e89419] transition-colors'
                    onClick={handleApply}
                >
                    Apply Filter
                </button>
            </div>
        </div>
    )
}


function Toast({ message, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-4 right-4 bg-[#18181b] text-white max-w-[300px] font-bold px-6 py-4 shadow toast-slide">
            {message}
        </div>
    )
}

