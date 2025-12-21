import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSliders, faSort, faPenToSquare, faTrash, faArrowLeft, faArrowRight, } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import supabase from "../../lib/supabaseClient";
import { getCurrentUser, getCurrentUserId } from "../../lib/auth";
import Lottie from 'lottie-react';
import MeteorShower from '../../static/images/Falling Meteor.json';
import Modal, { ConfirmModal } from "../components/modal";
import "../../static/css/pages.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CollegePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [editingCollege, setEditingCollege] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    const toggleForm = () => {
        // When toggling via the button, always go back to "add" mode
        setEditingCollege(null);
        setShowForm((prev) => !prev);
    };

    const showToastMessage = (message) => {
        setToastMessage(message);
        setShowToast(true);
    };

    // Open form if user navigated with state (from navbar)
    useEffect(() => {
        if (location.state?.openForm) {
            setShowForm(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    return (
        <div >
            <Navbar />
            <div className="flex flex-row min-h-screen w-full">
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
                            <button className="open-form-button text-[#fca31c]" onClick={toggleForm}>
                                {showForm ? 'Close College Form' : 'Open College Form'}
                            </button>
                        </nav>
                    </div>

                    <CollegeDirectory
                        refreshKey={refreshKey}
                        onEditCollege={(college) => {
                            setEditingCollege(college);
                            setShowForm(true);
                        }}
                        onShowToast={showToastMessage}
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
                        onShowToast={showToastMessage}
                        editingCollege={editingCollege}
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
    );
}



// ===================== COLLEGE FORM ===================== //

function CollegeForm({ onCollegeAdded, onCollegeUpdated, onShowToast, editingCollege }) {
    const [collegeName, setCollegeName] = useState("");
    const [collegeCode, setCollegeCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showAddConfirm, setShowAddConfirm] = useState(false);
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);

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
            collegecode: collegeCode.trim(),
            collegename: collegeName.trim(),
        };

        const userid = getCurrentUserId();
        if (!userid) {
            alert("You must be logged in to perform this action.");
            return;
        }

        payload.userid = userid;
        
        // Defer actual DB operation to confirmation modal
        setPendingPayload(payload);
        if (editingCollege) {
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
                .from('colleges')
                .insert([pendingPayload]);

            if (error) {
                alert(error.message || "Failed to add college");
                console.error("Supabase insert error:", error);
                return;
            }

            onShowToast?.("College added successfully!");
            onCollegeAdded?.();

            // Clear form
            setCollegeCode("");
            setCollegeName("");
        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Something went wrong. Check console.");
        } finally {
            setIsLoading(false);
            setPendingPayload(null);
            setShowAddConfirm(false);
        }
    }

    async function handleConfirmUpdate() {
        if (!pendingPayload || !editingCollege) {
            setShowUpdateConfirm(false);
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('colleges')
                .update({
                    collegecode: pendingPayload.collegecode,
                    collegename: pendingPayload.collegename,
                })
                .eq("collegecode", editingCollege.collegecode)
                .eq('userid', pendingPayload.userid);

            if (error) {
                alert(error.message || "Failed to update college");
                throw new Error(error.message);
            }

            onShowToast?.("College updated successfully!");
            onCollegeUpdated?.();

            // Clear form
            setCollegeCode("");
            setCollegeName("");
        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Something went wrong. Check console.");
        } finally {
            setIsLoading(false);
            setPendingPayload(null);
            setShowUpdateConfirm(false);
        }
    }


    return (
        <div className="border-l-2 h-full flex flex-col">
            <Lottie
                animationData={MeteorShower}
                loop
                autoplay
                className="absolute pointer-events-none -mt-21 opacity-50"
            />
            <div className="font-bold text-4xl bg-[#18181b] text-white p-6 py-10 text-center"> 
                College Form
                <p className="text-sm dont-thin italic">Add new college</p> 
            </div>
            
            <div className="bg-white p-7 flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <label className="font-semibold text-base mb-3">College Information:</label>

                    <div className="flex flex-row">
                        <label className="text-[13px] w-1/3">College Code:</label>
                        <input
                            type="text"
                            value={collegeCode}
                            onChange={(e) => setCollegeCode(e.target.value)}
                            placeholder="e.g. CCS"
                            required
                            className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
                        />
                    </div>

                    <div className="flex flex-row">
                        <label className="text-[13px] w-1/3">College Name:</label>
                        <input
                            type="text"
                            value={collegeName}
                            onChange={(e) => setCollegeName(e.target.value)}
                            placeholder="e.g. College of Computer Studies"
                            required
                            className="bg-white border-1 border-gray-300 h-8 w-full p-1 mb-3 text-sm"
                        />
                    </div>

                    <div className="add-button-container">
                        <button type="submit" className="add-college">
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
                    message={`Are you sure you want to add this college?`}
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
                    message={`Are you sure you want to update this college's information?`}
                    confirmText="Update"
                    cancelText="Cancel"
                />
            )}
        </div>
    );
}



// ===================== COLLEGE DIRECTORY ===================== //

function CollegeDirectory({ refreshKey, onEditCollege, onShowToast }) {
    const [colleges, setColleges] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [searchKeyword, setSearchKeyword] = useState('');
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [searchField, setSearchField] = useState('all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [collegeToDelete, setCollegeToDelete] = useState(null);
    // const [activeFilters, setActiveFilters] = useState(() => createEmptyFilters());
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentColleges = Array.isArray(colleges) ? colleges.slice(indexOfFirst, indexOfLast) : [];

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
                    .eq('userid', userid)
                    .order('created_on', { ascending: false });

                if (error) {
                    console.error('Error fetching colleges:', error);
                    return;
                }

                setColleges(sortByCreatedOnDesc(data));
            } catch (err) {
                console.error('Unexpected error:', err);
            }
        };

        loadColleges();
    }, [refreshKey]);

    function openDeleteModal(collegeCode) {
        setCollegeToDelete(collegeCode);
        setDeleteModalOpen(true);
    }

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
                onShowToast?.("College deleted successfully!");
                setColleges((prev) => prev.filter((c) => c.collegecode !== collegeCode));
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
                .eq("userid", userid)
                .order('created_on', { ascending: false });
            
            if (error) {
                console.error("Error fetching colleges:", error);
                return;
            }
            setColleges(sortByCreatedOnDesc(data));
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
                .or(`collegecode.ilike.%${keyword}%,collegename.ilike.%${keyword}%`)
                .order('created_on', { ascending: false });

            if (error) {
                console.error("Error searching programs:", error);
                return;
            }

            setColleges(sortByCreatedOnDesc(data));
        } catch (err) {
            console.error("Error searching colleges:", err);
        }
    }



    return (
        <div className="area-main-directory">
            <h1 className="font-bold text-4xl mt-8">College Directory</h1>
            <div className="flex flex-row items-center mt-5 mb-4 bg-white gap-2">
                <div className='flex flex-row text-sm h-8'>
                    <div className='border-[1px] border-gray-400 p-2 flex items-center gap-2 bg-white w-62'>
                        <FontAwesomeIcon icon={faMagnifyingGlass}/>
                        <input className='w-full focus:outline-none h-4 text-[13px] border-none' type='text' placeholder='Type in a keyword or name...' onChange={(e)=>handleSearch(e.target.value)} />
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
                        <option value='firstname'>First Name</option>
                    </select>
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
                                            onClick={() => openDeleteModal(c.collegecode)}
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
            
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setCollegeToDelete(null);
                }}
                onConfirm={() => {
                    if (collegeToDelete) {
                        handleDelete(collegeToDelete);
                    }
                    setDeleteModalOpen(false);
                    setCollegeToDelete(null);
                }}
                title="Confirm Delete"
                message={`Are you sure you want to delete college ${collegeToDelete}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
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
    );
}
