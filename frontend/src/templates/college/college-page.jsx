import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMagnifyingGlass, faSort, faPenToSquare, faTrash, faSquareCaretRight } from "@fortawesome/free-solid-svg-icons";
import "../../static/css/pages.css";


const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function CollegePage() {
    const navigate = useNavigate();
    const [refreshKey, setRefreshKey] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const toggleForm = () => {
        setShowForm(!showForm)
    }



    return (
        <div className='directory-content'>
            <div className="directory-wrapper">
                <div className="breadcrumb-container">
                    <nav className="breadcrumb">
                        <span className="breadcrumb-item">
                            <button onClick={() => navigate("/dashboard")}>Home</button>
                        </span>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-item active">
                            <button>College Directory</button></span>
                        <span className="breadcrumb-line"></span>
                        <button onClick={toggleForm}>
                            Add College <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </nav>
                </div>

                <CollegeDirectory refreshKey={refreshKey} />
            </div>

            <div className={`form-wrapper ${showForm ? "open" : ""}`}>
                <CollegeForm onCollegeAdded={() => setRefreshKey((prev) => prev + 1)} />
            </div>
        </div>
    );
}       


function CollegeForm() {
    const [collegeName, setCollegeName] = useState("")
    const [collegeCode, setCollegeCode] = useState("")

    // handler to add college
    async function addCollege(e) {
        e.preventDefault()

        if (!collegeName || !collegeCode) {
            console.error("All fields required!")
            return
        }

        console.log("Sending to backend:", {
            collegecode: collegeCode,
            collegeName: collegeName,
        });

        try {
            const res = await fetch(`${API}/api/add_college`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    collegecode: collegeCode,
                    collegename: collegeName,
                }),
            });

            if (!res.ok) {
                console.error ("register failed:", data);
                return;
            }

            alert("College added successfully!")
            setCollegeCode("")
            setCollegeName("")
        } catch (err) {
            console.error("Error submitting form:", err);
        }
    }


    return (
        <div className='area-main-form'>
            <h1 className='form-header'>College Form</h1>
            <hr />
            <div className='form'>
                <form onSubmit={addCollege}>
                    <label>College Code: </label> <br />
                    <input
                        type="text"
                        value={collegeCode}
                        onChange={(e) => setCollegeCode(e.target.value)}
                        placeholder='e.g. CCS'
                        required
                    /> <br />
                    <label>College Name: </label> <br />
                    <input
                        type="text"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        placeholder='e.g. College of Computer Studies'
                        required
                    /> <br />
                    <div className='add-button-container'>
                        <button 
                            type="submit" 
                            className='add-college'>
                                <FontAwesomeIcon icon={faPlus}
                        /> Add College </button>
                    </div>
                </form>
            </div>
        </div>
    )
}


function CollegeDirectory({ refreshKey }) {
    const [colleges, setColleges] = useState([])

    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 10;
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentColleges = colleges.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(colleges.length / rowsPerPage);


    useEffect(() => {
        fetch ("http://127.0.0.1:5000/api/college_list")
            .then((res) => res.json())
            .then((data) => setColleges(data))
            .catch((err) => console.error(err))
    }, [refreshKey])

    return (
        <div className='area-main-directory'>
            <h1 className='directory-header'>College Directory (FIX: dapat pagination)</h1>

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
                        <option value="">College Code</option>
                        <option>College Name</option>
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
                                    College Name <FontAwesomeIcon icon={faSort} size='xs' color='#999'/> 
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
                        {colleges.map((s) => (
                            <tr key={s.collegecode}>
                            <td>{s.collegecode}</td>
                            <td>{s.collegename}</td>
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

