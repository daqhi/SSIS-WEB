import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMagnifyingGlass, faSort, faPenToSquare, faTrash, faSquareCaretRight, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import '../../static/css/pages.css'
import Navbar from '../components/navbar';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function ProgramPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [editingProgram, setEditingProgram] = useState(null);

    const [refreshKey, setRefreshKey] = useState(0)

    const [showForm, setShowForm] = useState(false)
    const toggleForm = () => setShowForm(!showForm)

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
                                Open Program Form
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
    const [colleges, setColleges] = useState([]);

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

    useEffect(() => {
        fetch(`${API}/api/college_list`)
            .then((res) => res.json())
            .then((data) => setColleges(data))
            .catch((err) => console.error("Error fetching colleges:", err));
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
            collegecode: collegeCode,
            programcode: programCode,
            programname: programName,
        };

        try {
            let res;

            if (editingProgram) {
                // Update existing programs
                res = await fetch(`${API}/api/programs/${editingProgram.programcode}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("Failed to update program");
                alert("Program updated successfully!");
                onProgramUpdated?.();
            } else {
                // Add new college
                res = await fetch(`${API}/api/add_program`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("Failed to add program");
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
        <div className='area-main-form'>
            <h1 className='form-header'>Program Form</h1>
            <hr />
            <div className='form'>
                <form onSubmit={handleSubmit}>
                    <label>College: </label>
                    <select 
                        value={collegeCode}
                        onChange={(e) => setCollegeCode(e.target.value)}
                        required
                    >
                        <option value="null">Select College Code</option>
                        {colleges.map((c) => (
                            <option key={c.collegecode}>
                                {c.collegecode}
                            </option>
                        ))}
                    </select>

                    <label>Program Code: </label> <br />
                    <input
                        type="text"
                        value={programCode}
                        onChange={(e) => setProgramCode(e.target.value)}
                        placeholder='e.g. BSCS'
                        required
                    /> <br />
                    
                    <label>Program Name: </label> <br />
                    <input
                        type="text"
                        value={programName}
                        onChange={(e) => setProgramName(e.target.value)}
                        placeholder='e.g. Bachelors of Science in Computer Science'
                        required
                    /> <br />
                    <div className='add-button-container'>
                        <button type="submit" className='add-program'>
                            Submit 
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
        fetch("http://127.0.0.1:5000/api/program_list")
            .then((res) => res.json())
            .then((data) => setPrograms(data))
            .catch((err) => console.error(err))
    }, [refreshKey])


    function toggleSortCollegeCode() {
        const sorted = [...programs].sort((a, b) => {
            return sortOrder === "asc"
                ? a.collegecode.localeCompare(b.collegecode)
                : b.collegecode.localeCompare(a.collegecode);
        });

        setPrograms(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
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
            const res = await fetch(`${API}/api/delete_program/${programCode}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("Program deleted successfully!");
                setPrograms(programs.filter((p) => p.programcode !== programCode));
            } else {
                alert("Failed to delete program.");
            }
        } catch (err) {
            console.error("Error deleting program:", err);
        }
    }


    // for searching
    async function handleSearch(keyword) {
        if (!keyword.trim()) {
            fetchPrograms();
            return;
        }

        try {
            const res = await fetch(`${API}/api/search_program/${keyword}`);
            if (!res.ok) throw new Error("Search failed");

            const data = await res.json();
            setPrograms(data);
        } catch (err) {
            console.error("Error searching programs:", err);
        }
    }


    return (
        <div className='area-main-directory'>
            <h1 className='directory-header'>Program Directory</h1>

            <div className='functions'>
                <div className='function-search-item'>
                    <label>Search Area</label>
                    <div className='search-area'>
                        <FontAwesomeIcon icon={faMagnifyingGlass}/>
                        <input type='text' placeholder='Type in a keyword or name...' onChange={(e)=>handleSearch(e.target.value)}/>
                    </div>
                </div>
            </div>


            <div>
                <div className="table">
                    <table>
                        <thead>
                        <tr>
                            <th>
                                <button className='sort-button' onClick={toggleSortCollegeCode}> 
                                    College Code <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='sort-button' onClick={toggleSortProgramCode}> 
                                    Program Code <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='sort-button' onClick={toggleSortProgramName}> 
                                    Program Name <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='sort-button'> 
                                    Actions <FontAwesomeIcon icon={faSort} size='xs' color='#f5f5f500'/> 
                                </button>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                            {programs.length > 0 ? (
                                programs.map((p) => (
                                <tr key={p.programCode}>
                                    <td>{p.collegecode || "None"}</td>
                                    <td>{p.programcode}</td>
                                    <td>{p.programname}</td>
                                    <td>
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

                    <div className="pagination-controls">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1,1))} 
                            style={{ visibility: currentPage === 1 ? 'hidden' : 'visible' }}>
                            <FontAwesomeIcon className='page-icon' icon={faArrowLeft} size="sm" color="#FCA311" /> 
                            Prev
                        </button>

                        <span>Page {currentPage} of {Math.ceil(programs.length / rowsPerPage)} </span>

                        <button 
                            onClick = {() => setCurrentPage(prev => prev < Math.ceil(programs.length/rowsPerPage) ? prev +1 : prev )} 
                            style={{ visibility: currentPage === Math.ceil(programs.length/rowsPerPage) ? 'hidden' : 'visible' }}>
                            Next 
                            <FontAwesomeIcon className='page-icon' icon={faArrowRight} size="sm" color="#FCA311" /> 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}