import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMagnifyingGlass, faSort, faPenToSquare, faTrash, faArrowLeft, faArrowRight, } from "@fortawesome/free-solid-svg-icons";
import "../../static/css/pages.css";
import Navbar from "../components/navbar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CollegePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [editingCollege, setEditingCollege] = useState(null);

    const [refreshKey, setRefreshKey] = useState(0);

    const [showForm, setShowForm] = useState(false);
    const toggleForm = () => setShowForm(!showForm);

    // Open form if user navigated with state (from navbar)
    useEffect(() => {
        if (location.state?.openForm) {
            setShowForm(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    return (
        <div>
            <Navbar />
            <div className="directory-content">
                <div className="directory-wrapper">
                    <div className="breadcrumb-container">
                        <nav className="breadcrumb">
                            <span className="breadcrumb-item">
                                <button className="breadcrumb-button" onClick={() => navigate("/dashboard")}>Home </button>
                            </span>
                            <span className="breadcrumb-separator">›</span>
                            <span className="breadcrumb-item active">
                                <button className="breadcrumb-button" onClick={() => navigate("/college-page")}>College Directory </button>
                            </span>
                            <span className="breadcrumb-line"></span>
                            <button className="open-form-button" onClick={toggleForm}>
                                Open College Form 
                            </button>
                        </nav>
                    </div>

                    <CollegeDirectory
                        refreshKey={refreshKey}
                        onEditCollege={(college) => {
                            setEditingCollege(college);
                            setShowForm(true);
                        }}
                    />
                </div>

                <div className={`form-wrapper ${showForm ? "open" : ""}`}>
                    <CollegeForm
                        onCollegeAdded={() => setRefreshKey((prev) => prev + 1)}
                            onCollegeUpdated={() => {
                                setRefreshKey((prev) => prev + 1);
                                setEditingCollege(null);
                                setShowForm(false);
                            }}
                        editingCollege={editingCollege}
                    />
                </div>
            </div>
        </div>
    );
}

// COLLEGE FORM (Add or Edit)
function CollegeForm({ onCollegeAdded, onCollegeUpdated, editingCollege }) {
    const [collegeName, setCollegeName] = useState("");
    const [collegeCode, setCollegeCode] = useState("");

    // Populate form fields if editing
    useEffect(() => {
        if (editingCollege) {
            setCollegeCode(editingCollege.collegecode);
            setCollegeName(editingCollege.collegename);
        } else {
            setCollegeCode("");
            setCollegeName("");
        }
    }, [editingCollege]);

    // Add or Update handler
    async function handleSubmit(e) {
        e.preventDefault();

        if (!collegeName || !collegeCode) {
            alert("All fields are required!");
            return;
        }

        const payload = {
            collegecode: collegeCode,
            collegename: collegeName,
        };

        try {
            let res;

            if (editingCollege) {
                // Update existing college
                res = await fetch(`${API}/api/colleges/${editingCollege.collegecode}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("Failed to update college");
                alert("College updated successfully!");
                onCollegeUpdated?.();
            } else {
                // Add new college
                res = await fetch(`${API}/api/add_college`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("Failed to add college");
                alert("College added successfully!");
                onCollegeAdded?.();
            }

            // Reset form
            setCollegeCode("");
            setCollegeName("");
        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Something went wrong. Check console for details.");
        }
    }

    return (
        <div className="area-main-form">
            <h1 className="form-header">
                College Form
            </h1>
            <hr />
            <div className="form">
                <form onSubmit={handleSubmit}>
                    <label>College Code:</label>
                    <br />
                    <input
                        type="text"
                        value={collegeCode}
                        onChange={(e) => setCollegeCode(e.target.value)}
                        placeholder="e.g. CCS"
                        required
                    />
                    <br />

                    <label>College Name:</label>
                    <br />
                    <input
                        type="text"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        placeholder="e.g. College of Computer Studies"
                        required
                    />
                    <br />

                    <div className="add-button-container">
                        <button type="submit" className="add-college">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// DIRECTORY
function CollegeDirectory({ refreshKey, onEditCollege }) {
    const [colleges, setColleges] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc");

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentColleges = colleges.slice(indexOfFirst, indexOfLast);

    // Load colleges
    useEffect(() => {
        fetch(`${API}/api/college_list`)
        .then((res) => res.json())
        .then((data) => setColleges(data))
        .catch((err) => console.error(err));
    }, [refreshKey]);

    function toggleSortCollegeCode() {
        const sorted = [...colleges].sort((a, b) => {
            return sortOrder === "asc"
                ? a.collegecode.localeCompare(b.collegecode)
                : b.collegecode.localeCompare(a.collegecode);
        });

        setColleges(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }

    function toggleSortCollegeName() {
        const sorted = [...colleges].sort((a, b) => {
            return sortOrder === "asc"
                ? a.collegename.localeCompare(b.collegename)
                : b.collegename.localeCompare(a.collegename);
        });

        setColleges(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }


    // Delete college
    async function handleDelete(collegeCode) {
        if (!window.confirm(`Are you sure you want to delete ${collegeCode}?`)) return;

        try {
            const res = await fetch(`${API}/api/delete_college/${collegeCode}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("College deleted successfully!");
                setColleges(colleges.filter((c) => c.collegecode !== collegeCode));
            } else {
                alert("Failed to delete college.");
            }
        } catch (err) {
            console.error("Error deleting college:", err);
        }
    }

    return (
        <div className="area-main-directory">
            <h1 className="directory-header">College Directory FIX: ahmm ang sort</h1>

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

            <div className="table">
                <table>
                    <thead>
                        <tr>
                        <th>
                            <button className="sort-button" onClick={toggleSortCollegeCode}>
                                College Code{" "}
                                <FontAwesomeIcon icon={faSort} size="xs" color="#999" />
                            </button>
                        </th>
                        <th>
                            <button className="sort-button" onClick={toggleSortCollegeName}>
                                College Name{" "}
                                <FontAwesomeIcon icon={faSort} size="xs" color="#999" />
                            </button>
                        </th>
                        <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentColleges.map((c) => (
                            <tr key={c.collegecode}>
                                <td>{c.collegecode}</td>
                                <td>{c.collegename}</td>
                                <td>
                                    <button className="edit" onClick={() => onEditCollege(c)} >
                                        <FontAwesomeIcon icon={faPenToSquare} size="xs" />
                                    </button>
                                    <button
                                        className="delete"
                                        onClick={() => handleDelete(c.collegecode)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} size="xs" color="#FCA311" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="pagination-controls">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1,1))} 
                        disabled={currentPage === 1}>
                        <FontAwesomeIcon className='page-icon' icon={faArrowLeft} size="sm" color="#FCA311" /> 
                        Prev
                    </button>

                    <span>Page {currentPage} of {Math.ceil(colleges.length / rowsPerPage)} </span>

                    <button 
                        onClick = {() => setCurrentPage(prev => prev < Math.ceil(colleges.length/rowsPerPage) ? prev +1 : prev )} 
                        disabled={currentPage === Math.ceil(colleges.length/rowsPerPage)}>
                        Next 
                        <FontAwesomeIcon className='page-icon' icon={faArrowRight} size="sm" color="#FCA311" /> 
                        
                    </button>
                </div>
            </div>
        </div>
    );
}
