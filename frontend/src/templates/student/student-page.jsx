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
        <div className='bg-gray-100 form-container p-10 pb-5'>
            <h1 className='font-bold text-4xl mb-5 pt-10'>Student Form</h1>
            <hr />
            <div className='mt-5'>
                <form onSubmit={handleSubmit}>
                    <label className="font-semibold text-base">ID Number: </label> <br />
                    <input
                        type="text"
                        value={idNum}
                        onChange={(e) => setIdNum(e.target.value)}
                        placeholder='YYYY-NNNN'
                        required
                        disabled={!!editingStudent}
                        className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
                    /> <br />
                    
                    <label className="font-semibold text-base">First Name: </label> <br />
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder='Enter first name'
                        required
                        className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
                    /> <br />

                    <label className="font-semibold text-base">Last Name: </label> <br />
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder='Enter last name'
                        required
                        className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
                    /> <br />

                    <label className="font-semibold text-base">Sex: </label> <br />
                    <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        required
                    >
                        <option value="">Select sex</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                    </select>

                    <label className="font-semibold text-base">Year Level: </label> <br />
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

                    <label className="font-semibold text-base">Program: </label>
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
                        <button type="submit" className='bg-[#FCA311] w-full w-full h-10 text-white font-bold hover:bg-[#e5940e]'>
                            Submit 
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}






// ===================== STUDENT DIRECTORY ===================== //

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

    function toggleSortYearLevel() {
        const sorted = [...students].sort((a, b) => {
            return sortOrder === "asc"
                ? Number(a.yearlevel) - Number(b.yearlevel)
                : Number(b.yearlevel) - Number(a.yearlevel);
        });

        setStudents(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }

    function toggleSortProgram() {
        const sorted = [...students].sort((a, b) => {
            const aCode = a.programcode ? a.programcode.toString() : '';
            const bCode = b.programcode ? b.programcode.toString() : '';
            return sortOrder === "asc" 
                ? aCode.localeCompare(bCode) 
                : bCode.localeCompare(aCode);
        });

        setStudents(sorted);
        setSortOrder(prev => prev === "asc" ? "desc" : "asc");
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
            <div className='flex flex-row justify-between items-center mt-8 mb-10'>
                <h1 className="font-bold text-4xl">Student Directory</h1>
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
                                <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1' onClick={toggleSortIdNum}> 
                                    ID Num <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1' onClick={toggleSortFirstName}> 
                                    First Name <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1' onClick={toggleSortLastName}> 
                                    Last Name <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1' onClick={toggleSortSex}> 
                                    Sex <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1' onClick={toggleSortYearLevel} > 
                                    Year Level <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1' onClick={toggleSortProgram}> 
                                    Program <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1'> 
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

                    <div className="flex flex-row justify-between text-sm mx-4 my-3 items-center">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1,1))} 
                            style={{ visibility: currentPage === 1 ? 'hidden' : 'visible' }}
                            className='font-semibold text-[#FCA311]'
                        >
                            <FontAwesomeIcon className='page-icon' icon={faArrowLeft} size="sm" color="#FCA311" /> 
                            Prev
                        </button>

                        <span className='font-semibold'>Page {currentPage} of {Math.ceil(students.length / rowsPerPage)} </span>

                        <button 
                            onClick = {() => setCurrentPage(prev => prev < Math.ceil(students.length/rowsPerPage) ? prev +1 : prev )}
                            style={{ visibility: currentPage === Math.ceil(students.length/rowsPerPage) ? 'hidden' : 'visible' }} 
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