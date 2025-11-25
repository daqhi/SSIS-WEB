import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSort, faPenToSquare, faTrash, faArrowLeft, faArrowRight, } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/navbar";
import supabase from "../../lib/supabaseClient";
import { getCurrentUser, getCurrentUserId } from "../../lib/auth";

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



// ===================== COLLEGE FORM ===================== //

function CollegeForm({ onCollegeAdded, onCollegeUpdated, editingCollege }) {
    const [collegeName, setCollegeName] = useState("");
    const [collegeCode, setCollegeCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);

        if (!collegeName || !collegeCode) {
            alert("All fields are required!");
            setIsLoading(false);
            return;
        }

        if (editingCollege) {
            const confirmed = window.confirm("Are you sure you want to update college details?");
            if (!confirmed) {
                setIsLoading(false);
                return;
            }
        }

        const payload = {
            collegecode: collegeCode.trim(),
            collegename: collegeName.trim(),
        };

        const userid = getCurrentUserId();
        if (!userid) {
            alert("You must be logged in to perform this action.");
            setIsLoading(false);
            return;
        }

        payload.userid = userid;

        try {
            let res;

            // ========================= UPDATE COLLEGE ========================= //
            if (editingCollege) {
                const { error } = await supabase
                    .from('colleges')
                    .update({
                        collegecode: payload.collegecode,
                        collegename: payload.collegename,
                    })
                    .eq("collegecode", editingCollege.collegecode)
                    .eq('userid', userid);

                if (error) {
                    alert(error.message || "Failed to update college");
                    setIsLoading(false);
                    throw new Error(error.message);
                }

                alert("College updated successfully!");
                onCollegeUpdated?.();

            } else {

            // ========================= ADD NEW COLLEGE ========================= //
            const { error } = await supabase 
                .from('colleges')
                .insert([payload]);

                if (error) {
                    alert(error.message || "Failed to add college");
                    console.error("Supabase insert error:", error);
                    setIsLoading(false);
                    throw new Error(error.message);
                }

                alert("College added successfully!");
                onCollegeAdded?.();
            }

            // Clear form
            setCollegeCode("");
            setCollegeName("");

        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Something went wrong. Check console.");
        }

        setIsLoading(false);
    }


    return (
        <div className="bg-gray-100 h-full p-10 shadow-md pb-68">
            <h1 className="font-bold text-4xl mb-5 mt-10"> College Form </h1>
            <hr />
            <div className="my-7">
                <form onSubmit={handleSubmit}>
                    <label className="font-semibold text-base">College Code:</label>
                    <br />
                    <input
                        type="text"
                        value={collegeCode}
                        onChange={(e) => setCollegeCode(e.target.value)}
                        placeholder="e.g. CCS"
                        required
                        className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
                    />
                    <br />

                    <label className="font-semibold text-base">College Name:</label>
                    <br />
                    <input
                        type="text"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        placeholder="e.g. College of Computer Studies"
                        required
                        className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
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



// ===================== COLLEGE DIRECTORY ===================== //

function CollegeDirectory({ refreshKey, onEditCollege }) {
    const [colleges, setColleges] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentColleges = Array.isArray(colleges) ? colleges.slice(indexOfFirst, indexOfLast) : [];

    // Load colleges
    useEffect(() => {
        const loadColleges = async () => {
            try {
                const userid = getCurrentUserId();
                
                if (!userid) {
                    console.error('No userid found - user may not be logged in');
                    return;
                }

                const { data, error } = await supabase
                    .from('colleges')
                    .select('*')
                    .eq('userid', userid);

                if (error) {
                    console.error('Error fetching colleges:', error);
                    return;
                }

                setColleges(data || []);
            } catch (err) {
                console.error('Unexpected error:', err);
            }
        };

        loadColleges();
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
            const userid = getCurrentUserId();

            if (!userid) {
                alert("You must be logged in to perform this action.");
                return;
            }

            const { error } = await supabase
                .from("colleges")
                .delete()
                .eq("collegecode", collegeCode)
                .eq('userid', userid);
            if (error) {
                alert("Failed to delete college.");
            } else {
                alert("College deleted successfully!");
                setColleges(colleges.filter((c) => c.collegecode !== collegeCode));
            }
        } catch (err) {
            console.error("Error deleting college:", err);
            alert("An error occurred while deleting the college.");
        }
    }


    // for searching
    async function handleSearch(keyword) {
        if (!keyword.trim()) {
            // Reload all programs if search is empty
            const userid = getCurrentUserId();
            if (!userid) return;

            const { data, error } = await supabase
                .from("colleges")
                .select("*")
                .eq("userid", userid);
            
            if (error) {
                console.error("Error fetching colleges:", error);
                return;
            }
            setColleges(data || []);
            return;
        }

        try {
            const userid = getCurrentUserId();
            if (!userid) return;

            // Search in Supabase using ilike for case-insensitive search
            const { data, error } = await supabase
                .from("colleges")
                .select("*")
                .eq("userid", userid)
                .or(`collegecode.ilike.%${keyword}%,collegename.ilike.%${keyword}%`);

            if (error) {
                console.error("Error searching programs:", error);
                return;
            }

            setColleges(data || []);
        } catch (err) {
            console.error("Error searching colleges:", err);
        }
    }



    return (
        <div className="area-main-directory">
            <div className='flex flex-row justify-between items-center mt-8 mb-10'>
                <h1 className="font-bold text-4xl">College Directory</h1>
                <div className='text-sm w-72'>
                    <div className='border-1 border-gray-300 p-2 flex items-center gap-2 bg-white'>
                        <FontAwesomeIcon icon={faMagnifyingGlass}/>
                        <input className='w-full focus:outline-none w-full' type='text' placeholder='Type in a keyword or name...' onChange={(e)=>handleSearch(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="w-full">
                <div className="w-full table">
                    <table className="text-sm">
                        <thead>
                            <tr className='border-b-2 border-gray-300'>
                                <th>
                                    <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1' onClick={toggleSortCollegeCode}>
                                        College Code{" "}
                                        <FontAwesomeIcon icon={faSort} size="xs" color="#999" />
                                    </button>
                                </th>
                                <th>
                                    <button className='flex text-black text-left px-4 pb-3 items-center justify-center gap-1' onClick={toggleSortCollegeName}>
                                        College Name{" "}
                                        <FontAwesomeIcon icon={faSort} size="xs" color="#999" />
                                    </button>
                                </th>
                                <th className="text-center">
                                    <button className="flex items-center justify-center gap-1 text-black px-4 pb-3 ml-2 w-full">
                                        Actions
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentColleges.length > 0 ? (
                                currentColleges.map((c) => (
                                <tr key={c.collegecode}>
                                    <td>{c.collegecode}</td>
                                    <td>{c.collegename}</td>
                                    <td className="text-center">
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: "center", padding: "10px" }}>No colleges found.</td>
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
                        <span>Page {currentPage} of {Math.ceil(colleges.length / rowsPerPage)} </span>
                        <button
                            onClick = {() => setCurrentPage(prev => prev < Math.ceil(colleges.length/rowsPerPage) ? prev +1 : prev )}
                            style={{ visibility: currentPage === Math.ceil(colleges.length/rowsPerPage) ? 'hidden' : 'visible' }}>
                            Next
                            <FontAwesomeIcon className='page-icon' icon={faArrowRight} size="sm" color="#FCA311" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
