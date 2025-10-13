import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMagnifyingGlass, faSort, faPenToSquare, faTrash, faSquareCaretRight, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import '../../static/css/pages.css'
import Navbar from "../components/navbar"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function StudentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [editingStudent, setEditingStudent] = useState(null);

    const [refreshKey, setRefreshKey] = useState(0)

    const [showForm, setShowForm] = useState(false)
    const toggleForm = () => setShowForm(!showForm)

    useEffect(() => {
        if (location.state?.openForm) {
            setShowForm(true)
            navigate(location.pathname, { replace: true, state: {}})
        }
    }, [location.state]);



    return (
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
                                <button className="breadcrumb-button" onClick={() => navigate("/student-page")}>Student Directory </button>
                            </span>
                            <span className="breadcrumb-line"></span>
                            <button className="open-form-button" onClick={toggleForm}>
                                Open Student Form
                            </button>
                        </nav>
                    </div>
                    <StudentDirectory 
                        refreshKey={refreshKey} 
                        onEditStudent={(student) => {
                            setEditingStudent(student);
                            setShowForm(true);
                        }}
                    />
                </div>

                <div className={`form-wrapper ${showForm ? "open" : ""}`}>
                        <StudentForm
                        onStudentAdded={() => setRefreshKey((prev) => prev + 1)}
                            onStudentUpdated={() => {
                                setRefreshKey((prev) => prev + 1);
                                setEditingStudent(null);
                                setShowForm(false);
                            }}
                        editingStudent={editingStudent}
                    />
                </div>
            </div>
        </div>
    )
}



function StudentForm({ onStudentAdded, onStudentUpdated, editingStudent}) {
    const [idNum, setIdNum] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [sex, setSex ] = useState("");
    const [yearLevel, setYearLevel ] = useState("");
    const [program, setProgram] = useState(""); //for drop down

    const [programs, setPrograms] = useState([])



    useEffect(() => {
        if (editingStudent) {
            setIdNum(editingStudent.idnum);
            setFirstName(editingStudent.firstname);
            setLastName(editingStudent.lastname);
            setSex(editingStudent.sex);
            setYearLevel(editingStudent.yearlevel);
            setProgram(editingStudent.programcode);
        } else {
            setIdNum("");
            setFirstName("");
            setLastName("");
            setSex("");
            setYearLevel("");
            setProgram("");
        }
    }, [editingStudent])

    useEffect(() => {
        fetch(`${API}/api/program_list`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched programs:", data);
                setPrograms(data);
            })
            .catch((err) => console.error("Error fetching programs:", err));
    }, []);


    //handler to add student
    async function handleSubmit(e) {
        e.preventDefault();

        if (
            !idNum || !firstName || !lastName ||
            !sex || !yearLevel || !program
        ) {
            alert("All fields are required!");
            return;
        }

        if (editingStudent) {
            const confirmed = window.confirm("Are you sure you want to update this student’s information?");
            if (!confirmed) return; // stop if user cancels
        }

        const payload = {
            idnum: idNum,
            firstname: firstName,
            lastname: lastName,
            sex: sex,
            yearlevel: yearLevel,
            programcode: program === "None" ? null : program,
        };

        try {
            let res;
            if (editingStudent) {
                res = await fetch(`${API}/api/students/${editingStudent.idnum}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch(`${API}/api/add_student`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Backend error:", errorText);
                throw new Error(errorText || "Request failed");
            }

            alert(editingStudent ? "Student updated successfully!" : "Student added successfully!");
            editingStudent ? onStudentUpdated?.() : onStudentAdded?.();

            // clear form
            setIdNum("");
            setFirstName("");
            setLastName("");
            setSex("");
            setYearLevel("");
            setProgram("");
        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Something went wrong. Check console for details.");
        }
    }




    return (
        <div className='area-main-form'>
            <h1 className='form-header'>Student Form</h1>
            <hr />
            <div className='form'>
                <form onSubmit={handleSubmit}>
                    <label>ID Number: </label> <br />
                    <input
                        type="text"
                        value={idNum}
                        onChange={(e) => setIdNum(e.target.value)}
                        placeholder='YYYY-NNNN'
                        required
                        disabled={!!editingStudent}
                    /> <br />
                    
                    <label>First Name: </label> <br />
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder='Enter first name'
                        required
                    /> <br />

                    <label>Last Name: </label> <br />
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder='Enter last name'
                        required
                    /> <br />

                    <label>Sex: </label> <br />
                    <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        required
                    >
                        <option value="">Select sex</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                    </select>

                    <label>Year Level: </label> <br />
                    <select
                        value={yearLevel}
                        onChange={(e) => setYearLevel(e.target.value)}
                        required
                    >
                        <option value="">Select year level</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value='3'>3</option>
                        <option value='4'>4</option>
                    </select>

                    <label>Program: </label>
                    <select 
                        value={program || "None"}
                        onChange={(e) => setProgram(e.target.value)}
                        required
                    >
                        <option value="">Select Program</option>
                        {programs.map((p) => (
                            <option key={p.programcode} value={p.programcode}>
                                {p.programcode}
                            </option>
                        ))}
                    </select>


                    <div className='add-button-container'>
                        <button type="submit" className='add-student'>
                            Submit 
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}






// ===================== PROGRAM DIRECTORY ===================== //

function StudentDirectory( {refreshKey, onEditStudent }) {
    const [students, setStudents] = useState([])
    const [sortOrder, setSortOrder] = useState("asc");


    //for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentStudents = students.slice(indexOfFirst, indexOfLast);

    //for loading students
    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/student_list")
            .then((res) => res.json())
            .then((data) => setStudents(data))
            .catch((err) => console.error(err))
    }, [refreshKey])


    function toggleSortIdNum() {
        const sorted = [...students].sort((a, b) => {
            return sortOrder === "asc"
                ? a.idnum.localeCompare(b.idnum)
                : b.idnum.localeCompare(a.idnum);
        });
        setStudents(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }

    function toggleSortFirstName() {
        const sorted = [...students].sort((a, b) => {
            return sortOrder === "asc"
                ? a.firstname.localeCompare(b.firstname)
                : b.firstname.localeCompare(a.firstname);
        });
        setStudents(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }

    function toggleSortLastName() {
        const sorted = [...students].sort((a, b) => {
            return sortOrder === "asc"
                ? a.lastname.localeCompare(b.lastname)
                : b.lastname.localeCompare(a.lastname);
        });
        setStudents(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }

    function toggleSortSex() {
        const sorted = [...students].sort((a, b) => {
            return sortOrder === "asc"
                ? a.sex.localeCompare(b.sex)
                : b.sex.localeCompare(a.sex);
        });
        setStudents(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }

    // //FIX: NAA PA TOGGLE ISSUE
    // function toggleSortYearLevel() {
    //     const sorted = [...students].sort((a, b) => {
    //         return sortOrder === "asc"
    //             ? a.yearlevel.localeCompare(b.yearlevel)
    //             : b.yearlevel.localeCompare(a.yearlevel);
    //     });
    //     setStudents(sorted);
    //     setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    // }

    function toggleSortProgram() {
        const sorted = [...students].sort((a, b) => {
            return sortOrder === "asc"
                ? a.programcode.localeCompare(b.programcode)
                : b.programcode.localeCompare(a.programcode);
        });
        setStudents(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }

    //for deleteiing students
    async function handleDelete(idNum) {
        if (!window.confirm(`Are you sure you want to delete ${idNum}?`)) return;

        try {
            const res = await fetch(`${API}/api/delete_student/${idNum}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("Student deleted successfully!");
                setStudents(students.filter((s) => s.idNum !== idNum));
            } else {
                alert("Failed to delete student.");
            }
        } catch (err) {
            console.error("Error deleting student:", err);
        }
    }

    // for searching
    async function handleSearch(keyword) {
        if (!keyword.trim()) {
            fetchStudents();
            return;
        }

        try {
            const res = await fetch(`${API}/api/search_student/${keyword}`);
            if (!res.ok) throw new Error("Search failed");

            const data = await res.json();
            setStudents(data);
        } catch (err) {
            console.error("Error searching students:", err);
        }
    }


    return (
        <div className='area-main-directory'>
            <h1 className='directory-header'>Student Directory</h1>

            <div className='functions'>
                <div className='function-search-item'>
                    <label>Search Area</label>
                    <div className='search-area'>
                        <FontAwesomeIcon icon={faMagnifyingGlass}/>
                        <input type='text' placeholder='Type in a keyword or name...' onChange={(e)=>handleSearch(e.target.value)} />
                    </div>
                </div>
            </div>


            <div>
                <div className="table">
                    <table>
                        <thead>
                        <tr>
                            <th>
                                <button className='sort-button' onClick={toggleSortIdNum}> 
                                    ID Num <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='sort-button' onClick={toggleSortFirstName}> 
                                    First Name <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='sort-button' onClick={toggleSortLastName}> 
                                    Last Name <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='sort-button' onClick={toggleSortSex}> 
                                    Sex <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='sort-button' > 
                                    Year Level <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='sort-button' onClick={toggleSortProgram}> 
                                    Program <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
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
                            {currentStudents.map((s) => (
                                <tr key={s.idnum}>
                                    <td>{s.idnum}</td>
                                    <td>{s.firstname}</td>
                                    <td>{s.lastname}</td>
                                    <td>{s.sex}</td>
                                    <td>{s.yearlevel}</td>
                                    <td>{s.programcode || "None"}</td>
                                    <td>
                                        <button className='edit' onClick={() => onEditStudent(s)} > 
                                            <FontAwesomeIcon icon={faPenToSquare} size='xs' color='#000000ff'/>
                                        </button>
                                        
                                        <button className='delete' onClick={() => handleDelete(s.idnum)}> 
                                            <FontAwesomeIcon icon={faTrash} size='xs' color='#FCA311'/> 
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination-controls">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1,1))} 
                            style={{ visibility: currentPage === 1 ? 'hidden' : 'visible' }}>
                            <FontAwesomeIcon className='page-icon' icon={faArrowLeft} size="sm" color="#FCA311" /> 
                            Prev
                        </button>

                        <span>Page {currentPage} of {Math.ceil(students.length / rowsPerPage)} </span>

                        <button 
                            onClick = {() => setCurrentPage(prev => prev < Math.ceil(students.length/rowsPerPage) ? prev +1 : prev )}
                            style={{ visibility: currentPage === Math.ceil(students.length/rowsPerPage) ? 'hidden' : 'visible' }} >
                            Next 
                            <FontAwesomeIcon className='page-icon' icon={faArrowRight} size="sm" color="#FCA311" /> 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}