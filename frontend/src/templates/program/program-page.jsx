import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMagnifyingGlass, faSort, faPenToSquare, faTrash, faSquareCaretRight, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import '../../static/css/pages.css'
import Navbar from '../components/navbar';
import { getCurrentUserId } from '../../lib/auth';
import supabase from '../../lib/supabaseClient';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function ProgramPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [editingProgram, setEditingProgram] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showForm, setShowForm] = useState(false)
    const toggleForm = () => setShowForm(!showForm)

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
            <div className='directory-content'>
                <div className="directory-wrapper">
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
                            <button className="open-form-button" onClick={toggleForm}>
                                {showForm ? 'Close Student Form' : 'Open Student Form'}
                            </button>
                        </nav>
                    </div>
                    <ProgramDirectory 
                        refreshKey={refreshKey} 
                        onEditProgram={(program) => {
                            setEditingProgram(program);
                            setShowForm(true);
                        }}
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
                        editingProgram={editingProgram}
                    />
                </div>
            </div>
        </div>
    )
}



// ===================== PROGRAM FORM ===================== //

function ProgramForm({ onProgramAdded, onProgramUpdated, editingProgram}) {
    const [collegeCode, setCollegeCode] = useState("");
    const [programCode, setProgramCode] = useState("");
    const [programName, setProgramName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [colleges, setColleges] = useState([]);

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

        if (editingProgram) {
            const confirmed = window.confirm("Are you sure you want to update program details?")
            if (!confirmed) return; //cancel update
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

        try {
            let res;
            
            // ========================= UPDATE PROGRAM ========================= //

            if (editingProgram) {
                const { error } = await supabase
                    .from('programs')
                    .update({
                        collegecode: payload.collegecode,
                        programcode: payload.programcode,
                        programname: payload.programname,
                    })
                    .eq('programcode', editingProgram.programcode)
                    .eq('userid', userid);

                if (error) {
                    console.error("Error updating program:", error);
                    alert(error.message || "Failed to update program");
                    return;
                }

                alert("Program updated successfully!");
                onProgramUpdated?.();
            } else {

                // ========================= ADD NEW PROGRAM ========================= //
                const { error } = await supabase 
                    .from('programs')
                    .insert([payload]);

                    if(error) {
                        alert(error.message || "Failed to add program");
                        console.error("Error adding program:", error);
                        return;
                    }
                alert("Program added successfully!");
                onProgramAdded?.();
            }

            // clear form
            setCollegeCode("");
            setProgramName("");
            setProgramCode("");
        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Something went wrong. Check console for details.");
        }
    }




    return (
        <div className='bg-gray-100 form-container p-10 pb-55'>
            <h1 className='font-bold text-4xl mb-5 pt-10'>Program Form</h1>
            <hr />
            <div className='mt-5'>
                <form onSubmit={handleSubmit}>
                    <label className="font-semibold text-base">College: </label>
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

                    <label className="font-semibold text-base">Program Code: </label> <br />
                    <input
                        type="text"
                        value={programCode}
                        onChange={(e) => setProgramCode(e.target.value)}
                        placeholder='e.g. BSCS'
                        required
                        className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
                    /> <br />
                    
                    <label className="font-semibold text-base">Program Name: </label> <br />
                    <input
                        type="text"
                        value={programName}
                        onChange={(e) => setProgramName(e.target.value)}
                        placeholder='e.g. Bachelors of Science in Computer Science'
                        required
                        className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
                    /> <br />
                    <div className='add-button-container'>
                        <button type="submit" className='add-program' disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit'} 
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}




// ===================== PROGRAM DIRECTORY ===================== //

function ProgramDirectory( {refreshKey, onEditProgram }) {
    const [programs, setPrograms] = useState([])
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentPrograms = programs.slice(indexOfFirst, indexOfLast);

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
                    .eq("userid", userid);
                
                if (error) {
                    console.error("Error fetching programs:", error);
                    return;
                }
                setPrograms(data || []);
            } catch (error) {
                console.error("Error loading programs:", error);
            }
        };
        loadPrograms();

    }, [refreshKey])


    function toggleSortCollegeCode() {
        const sorted = [...programs].sort((a, b) => {
            const aCode = a.collegecode ? a.collegecode.toString() : '';
            const bCode = b.collegecode ? b.collegecode.toString() : '';
            return sortOrder === "asc" 
                ? aCode.localeCompare(bCode) 
                : bCode.localeCompare(aCode);
        });

        setPrograms(sorted);
        setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    }

    function toggleSortProgramCode() {
        const sorted = [...programs].sort((a, b) => {
            return sortOrder === "asc"
                ? a.programcode.localeCompare(b.programcode)
                : b.programcode.localeCompare(a.programcode);
        });

        setPrograms(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }

    function toggleSortProgramName() {
        const sorted = [...programs].sort((a, b) => {
            return sortOrder === "asc"
                ? a.programname.localeCompare(b.programname)
                : b.programname.localeCompare(a.programname);
        });

        setPrograms(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }

    //for deleteiing programs
    async function handleDelete(programCode) {
        if (!window.confirm(`Are you sure you want to delete ${programCode}?`)) return;

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
                alert("Program deleted successfully!");
                setPrograms(programs.filter((p) => p.programcode !== programCode));
            }
        } catch (err) {
            console.error("Error deleting program:", err);
            alert("An error occurred while deleting the program.");
        }
    }


    // for searching
    async function handleSearch(keyword) {
        if (!keyword.trim()) {
            // Reload all programs if search is empty
            const userid = getCurrentUserId();
            if (!userid) return;

            const { data, error } = await supabase
                .from("programs")
                .select("*")
                .eq("userid", userid);
            
            if (error) {
                console.error("Error fetching programs:", error);
                return;
            }
            setPrograms(data || []);
            return;
        }

        try {
            const userid = getCurrentUserId();
            if (!userid) return;

            // Search in Supabase using ilike for case-insensitive search
            const { data, error } = await supabase
                .from("programs")
                .select("*")
                .eq("userid", userid);

            if (error) {
                console.error("Error searching programs:", error);
                return;
            }

            //filter locally
            const filtered = (data || []).filter((program) => {
                const serachLower = keyword.toLowerCase();
                return (
                    (program.collegecode && program.collegecode.toLowerCase().includes(serachLower)) ||
                    (program.programcode && program.programcode.toLowerCase().includes(serachLower)) ||
                    (program.programname && program.programname.toLowerCase().includes(serachLower)) ||
                    (!program.collegecode && "none".includes(serachLower))
                )
            });

            setPrograms(filtered);
        } catch (err) {
            console.error("Error searching programs:", err);
        }
    }


    return (
        <div className='area-main-directory'>
            <div className='flex flex-row justify-between items-center mt-8 mb-10'>
                <h1 className="font-bold text-4xl">Program Directory</h1>
                <div className='text-sm w-72'>
                    <div className='border-1 border-gray-300 p-2 flex items-center gap-2 bg-white'>
                        <FontAwesomeIcon icon={faMagnifyingGlass}/>
                        <input className='w-full focus:outline-none w-full' type='text' placeholder='Type in a keyword or name...' onChange={(e)=>handleSearch(e.target.value)} />
                    </div>
                </div>
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
                                        
                                        <button className='delete' onClick={() => handleDelete(p.programcode)}> 
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
                            style={{ visibility: currentPage === 1 ? 'hidden' : 'visible' }}
                            className='font-semibold text-[#FCA311]'
                        >
                            <FontAwesomeIcon className='page-icon' icon={faArrowLeft} size="sm" color="#FCA311" /> 
                            Prev
                        </button>

                        <span className='font-semibold'>Page {currentPage} of {Math.ceil(programs.length / rowsPerPage)} </span>

                        <button 
                            onClick = {() => setCurrentPage(prev => prev < Math.ceil(programs.length/rowsPerPage) ? prev +1 : prev )} 
                            style={{ visibility: currentPage === Math.ceil(programs.length/rowsPerPage) ? 'hidden' : 'visible' }}
                            className='font-semibold text-[#FCA311]'
                        >
                            Next 
                            <FontAwesomeIcon className='page-icon' icon={faArrowRight} size="sm" color="#FCA311" /> 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}