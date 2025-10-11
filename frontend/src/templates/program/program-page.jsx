import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMagnifyingGlass, faSort, faPenToSquare, faTrash, faSquareCaretRight } from "@fortawesome/free-solid-svg-icons";
import '../../static/css/pages.css'

const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function ProgramPage() {
    const [refreshKey, setRefreshKey] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const toggleForm = () => {
        setShowForm(!showForm)
    }


    return(
        <div className='directory-content'>
            <div className="directory-wrapper">
                <div className="breadcrumb-container">
                    <nav className="breadcrumb">
                        <span className="breadcrumb-item">Home</span>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-item active">Program Directory</span>
                        <span className="breadcrumb-line"></span>
                        <button onClick={toggleForm}>
                            Add Program <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </nav>
                </div>

                <ProgramDirectory refreshKey={refreshKey} />
            </div>

            <div className={`form-wrapper ${showForm ? "open" : ""}`}>
                <ProgramForm onProgramAdded={() => setRefreshKey((prev) => prev + 1)} />
            </div>
        </div>
    )
}



function ProgramForm() {
    const [collegeCode, setCollegeCode] = useState("")
    const [programCode, setProgramCode] = useState("")
    const [programName, setProgramName] = useState("")

    //handler to add program
    async function addProgram(e) {
        e.preventDefault();

        if (!collegeCode || !programCode || !programName) {
            console.error("All fields required!")
            return
        }

        console.log("Sending to backend:", {
            collegecode: collegeCode,
            programcode: programCode,
            programname: programName,
        })

        try {
            const res = await fetch(`${API}/api/add_program`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    collegecode: collegeCode,
                    programcode: programCode,
                    programname: programName,
                }),
            });

            if (!res.ok) {
                console.error ("Register failed:", data)
                return
            }

            alert ("Program Added successfully")
            setCollegeCode("")
            setProgramCode("")
            setProgramName("")
        } catch(err) {
            console.error("Error submitting form:", err)
        }
    }




    return (
        <div className='area-main-form'>
            <h1 className='form-header'>Program Form</h1>
            <hr />
            <div className='form'>
                <form onSubmit={addProgram}>
                    <label>College: </label>
                    <select>
                        <option>fix: dapat college codes mugawas</option>
                        <option>collegeCode1</option>
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
                        <button 
                            type="submit" 
                            className='add-program'>
                                <FontAwesomeIcon icon={faPlus}
                        /> Add Program </button>
                    </div>
                </form>
            </div>
        </div>
    )
}



function ProgramDirectory( {refreshKey }) {
    const [programs, setPrograms] = useState([])


    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/program_list")
            .then((res) => res.json())
            .then((data) => setColleges(data))
            .catch((err) => console.error(err))
    }, [refreshKey])


    return (
        <div className='area-main-directory'>
            <h1 className='directory-header'>Program Directory (FIX: dapat pagination)</h1>

            <div className='functions'>
                <div className='function-search-item'>
                    <label>Keywords</label>
                    <div className='search-area'>
                        <FontAwesomeIcon icon={faMagnifyingGlass}/>
                        <input type='text' placeholder='Type in a keyword or name...' />
                    </div>
                </div>

                <div className='function-item'>
                    <label>Filter</label>
                    <div className="custom-select">
                        <select>
                            <option value="">All</option>
                            <option value="">College</option>
                            <option>Program Code</option>
                            <option>Program Name</option>
                        </select>
                        <img src='/src/static/icons/arrow-down.png' className='dropdown-icon'/>
                    </div>
                </div>

                <div className="function-item">
                    <label>Sort by</label>
                    <div className="custom-select">
                        <select>
                        <option value="">All</option>
                        <option value="oten">oten</option>
                        </select>
                        <img src='/src/static/icons/arrow-down.png' className='dropdown-icon'/>
                    </div>
                </div>

                <div className='function-item'>
                    <label>    </label>
                    <button>Search</button>
                </div>
            </div>


            <div>
                <div className="table">
                    <table>
                        <thead>
                        <tr>
                            <th>
                                <button className='sort-button'> 
                                    College Code <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='sort-button'> 
                                    Program Code <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
                                </button>
                            </th>
                            <th>
                                <button className='sort-button'> 
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
                        {programs.map((p) => (
                            <tr key={p.programCode}>
                                <td>{p.collegeCode}</td>
                                <td>{p.programCode}</td>
                                <td>{p.programName}</td>
                                <td>
                                    <button className='edit'> <FontAwesomeIcon icon={faPenToSquare} size='xs' color='#000000ff'/> </button>
                                    <button className='delete'> <FontAwesomeIcon icon={faTrash} size='xs' color='#FCA311'/> </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}