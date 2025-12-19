import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getCurrentUserId } from "../../lib/auth";
import { uploadToCloudinary } from '../../lib/cloudinary';
import { set } from '@cloudinary/url-gen/actions/variable';
import { faPlus, faMagnifyingGlass, faSort, faPenToSquare, faTrash, faBars, faArrowLeft, faArrowRight, faUser, faSliders } from "@fortawesome/free-solid-svg-icons";
import { CalendarClock, PersonStanding, SquareUser, User, X } from 'lucide-react';
import '../../static/css/pages.css'
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import supabase from "../../lib/supabaseClient";
import Modal, { AlertModal, ConfirmModal } from '../components/modal';

const API = import.meta.env.VITE_API_URL || "http://localhost:5000"

const createEmptyFilters = () => ({
    sex: '',
    yearLevel: '',
    program: '',
    startDate: '',
    endDate: '',
});

export default function StudentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0)
    const [showForm, setShowForm] = useState(false)
    const [showStudentDetails, setShowStudentDetails] = useState(false)
    const [activeFilters, setActiveFilters] = useState(() => createEmptyFilters());

    const toggleForm = () => {
        setShowForm(!showForm)
        setShowStudentDetails(false)
        setEditingStudent(null)
    }

    useEffect(() => {
        if (location.state?.openForm) {
            setShowForm(true)
            navigate(location.pathname, { replace: true, state: {}})
        }
    }, [location.state]);



    return (
        <div>
            <Navbar />
            <div className='flex flex-row min-h-screen w-full'>
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
                            <button className="open-form-button text-[#fca311]" onClick={toggleForm}>
                                {showForm ? 'Close Student Form' : 'Open Student Form'}
                            </button>
                        </nav>
                    </div>
                    <StudentDirectory 
                        refreshKey={refreshKey} 
                        onEditStudent={(student) => {
                            setEditingStudent(student);
                            setShowForm(true);
                            setShowStudentDetails(false);
                        }}
                        onToggleStudentDetails={(student) => {
                            setShowForm(false);
                            // Check if clicking on the same student - if so, toggle off
                            if (selectedStudent?.idnum === student.idnum && showStudentDetails) {
                                setShowStudentDetails(false);
                                setSelectedStudent(null);
                            } else {
                                // Different student or details not showing - show details
                                setSelectedStudent(student);
                                setShowStudentDetails(true);
                            }
                        }}
                    />
                </div>

                <div className={`form-wrapper ${showForm || showStudentDetails ? "open" : ""}`}>
                    {showForm ? (
                        <StudentForm
                            onStudentAdded={() => setRefreshKey((prev) => prev + 1)}
                            onStudentUpdated={() => {
                                setRefreshKey((prev) => prev + 1);
                                setEditingStudent(null);
                                setShowForm(false);
                            }}
                            editingStudent={editingStudent}
                        />
                    ) : showStudentDetails ? (
                        <div className="h-screen w-full bg-gray-100 p-10 overflow-y-auto">
                            <div className='h-30 w-80 rounded-lg bg-gradient-to-tl from-[#18181b] via-[#1e2b38] to-[#293B4D]'/>
                            <img 
                                src={selectedStudent?.studentprofile || "src/static/images/default.jpg"} 
                                alt="Student" 
                                className="w-40 h-40 object-cover rounded-full border-8 border-gray-100 mx-auto -mt-20"
                                onError={(e) => {
                                    e.target.src = "src/static/images/default.jpg";
                                }}
                            />

                            <h1 className='text-center text-[#FCA311] font-black text-2xl leading-none mb-1 mt-3'>{selectedStudent?.firstname} {selectedStudent?.lastname}  </h1>
                            <h1 className='text-center text-md text-black leading-none'>{selectedStudent?.programcode}</h1>
                            <h1 className='text-center text-sm text-black mb-5 leading-none font-semibold'>{selectedStudent?.collegecode || "N/A"}</h1>
                            
                            <div className='bg-white p-6 border-[1px] border-gray-200 mb-4'>
                                <h1 className='flex flex-row mb-4 items-center font-bold text-base gap-2'>
                                    <SquareUser size={"20"} strokeWidth={'2'}/>
                                    Personal Details
                                </h1>
                                
                                <div className="flex flex-row text-sm gap-4">
                                    <div className='text-gray-600 w-1/3'>
                                        <h1>ID Number: </h1>
                                        <h1>First Name: </h1>
                                        <h1>Last Name: </h1>
                                        <h1>Sex: </h1>
                                        <h1>Year Level:</h1>
                                        <h1>College:</h1>
                                        <h1>Program:</h1>
                                    </div>
                                    {/* area to populate */}
                                    <div>
                                        <h1>{selectedStudent?.idnum || 'N/A'}</h1>
                                        <h1>{selectedStudent?.firstname || 'N/A'}</h1>
                                        <h1>{selectedStudent?.lastname || 'N/A'}</h1>
                                        <h1>{selectedStudent?.sex || 'N/A'}</h1>
                                        <h1>{selectedStudent?.yearlevel || 'N/A'}</h1>
                                        <h1>{selectedStudent?.collegecode || 'N/A'}</h1>
                                        <h1>{selectedStudent?.programcode || 'N/A'}</h1>
                                    </div>
                                </div>
                            </div>

                            <div className='bg-white p-6 border-[1px] border-gray-200'>
                                <h1 className='flex flex-row mb-2 font-semibold text-base gap-2 items-center'>
                                    <CalendarClock size={"20"} strokeWidth={'2'}/>
                                    History
                                </h1>
                                <div className="flex flex-row text-sm">
                                    <div>
                                        <h1>Added on {selectedStudent?.created_on ? new Date(selectedStudent.created_on).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            <Footer />
        </div>
    )
}



function StudentForm({ onStudentAdded, onStudentUpdated, editingStudent}) {
    const [photoFile, setPhotoFile] = useState(null);
    const [idNum, setIdNum] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [sex, setSex ] = useState("");
    const [yearLevel, setYearLevel ] = useState("");
    const [program, setProgram] = useState(""); 
    const [college, setCollege] = useState("");
    const [programs, setPrograms] = useState([])
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (editingStudent) {
            setIdNum(editingStudent.idnum);
            setFirstName(editingStudent.firstname);
            setLastName(editingStudent.lastname);
            setSex(editingStudent.sex);
            setYearLevel(editingStudent.yearlevel);
            setProgram(editingStudent.programcode);
            setCollege(editingStudent.collegecode || "");
        } else {
            setIdNum("");
            setFirstName("");
            setLastName("");
            setSex("");
            setYearLevel("");
            setProgram("");
            setCollege("");
        }
    }, [editingStudent])

    // for populating program dropdown
    useEffect(() => {
        const loadPrograms = async () => {
            try {
                const userid = getCurrentUserId();
                
                if (!userid) {
                    console.error('No userid found - user may not be logged in');
                    return;
                }

                const { data, error } = await supabase
                    .from('programs')
                    .select('*, collegecode')
                    .eq('userid', userid);

                if (error) {
                    console.error('Error fetching programs:', error);
                    return;
                }

                console.log("Fetched programs:", data);
                setPrograms(data || []);
            } catch (err) {
                console.error("Error fetching programs:", err);
            }
        };

        loadPrograms();
    }, []);

    // Auto-populate college when program changes
    useEffect(() => {
        if (program && program !== "None") {
            const selectedProgram = programs.find(p => p.programcode === program);
            if (selectedProgram) {
                setCollege(selectedProgram.collegecode || "");
            }
        } else {
            setCollege("");
        }
    }, [program, programs]);


    //handler to add student
    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        let studentprofile = null;

        if(photoFile) {
            try {
                studentprofile = await uploadToCloudinary(photoFile);
                console.log('Photo uploaded to Cloudinary:', studentprofile);
            } catch (error) {
                console.error('Error uploading photo:', error);
                alert('Failed to upload photo. Please try again.');
                return;
            }
        }

        if (!idNum.match(/^\d{4}-\d{4}$/)) {
            alert("ID Number must be in the format YYYY-NNNN.");
            setIsLoading(false);
            return;
        } else if (!idNum || !firstName || !lastName || !sex || !yearLevel || !program) {
            alert("All fields are required!");
            setIsLoading(false);
            return;
        } 

        if (editingStudent) {
            const confirmed = window.confirm("Are you sure you want to update this student's information?");
            if (!confirmed) {
                setIsLoading(false);
                return; // stop if user cancels
            }
        }

        const payload = {
            studentprofile: studentprofile,
            idnum: idNum,
            firstname: firstName,
            lastname: lastName,
            sex: sex,
            yearlevel: yearLevel,
            programcode: program === "None" ? null : program,
            collegecode: college || null,
        };

        const userid = getCurrentUserId();
        if (!userid) {
            alert('You must be logged in to add/edit students.');
            setIsLoading(false);
            return;
        }

        // Add userid to payload
        payload.userid = userid;

        try {
            if (editingStudent) {
                // Update existing student in Supabase
                const { error } = await supabase
                    .from('students')
                    .update({
                        studentprofile: photoFile,
                        firstname: firstName,
                        lastname: lastName,
                        sex: sex,
                        yearlevel: yearLevel,
                        programcode: program === "None" ? null : program,
                        collegecode: college || null
                    })
                    .eq('idnum', editingStudent.idnum)
                    .eq('userid', userid);

                if (error) {
                    console.error('Error updating student:', error);
                    throw new Error(error.message);
                }

                alert('Student updated successfully!');
                onStudentUpdated?.();
            } else {
                // Add new student to Supabase
                const { error } = await supabase
                    .from('students')
                    .insert([payload]);

                if (error) {
                    console.error('Error adding student:', error);
                    throw new Error(error.message);
                }

                alert('Student added successfully!');
                onStudentAdded?.();
            }

            // clear form
            setPhotoFile(null);
            setIdNum("");
            setFirstName("");
            setLastName("");
            setSex("");
            setYearLevel("");
            setProgram("");
            setCollege("");
        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Something went wrong: " + err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='border-l-2 h-full'>
            <div className='font-bold text-4xl bg-[#18181b] text-white p-6 py-10 text-center'>
                Student Form
                <p className='text-sm font-thin italic'>Add new student here</p>
            </div>
            
            <div className='bg-white p-7'>
                <form onSubmit={handleSubmit} className='flex flex-col'>
                    
                    {/* TO FIX */}
                    <div className='flex flex-col'>
                        <label className="font-semibold text-base mb-3">Upload Photo </label>
                        <input
                            type='file'
                            accept='image/*'
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                                    if (file.size > maxSize) {
                                        alert('File size exceeds 5MB. Please upload a smaller file.');
                                        e.target.value = ''; // for clearing the input
                                        setPhotoFile(null);
                                    } else {
                                        setPhotoFile(file);
                                    }
                                }
                            }}
                            disabled={!!editingStudent}
                            className="bg-white border-1 border-gray-300 w-full text-gray-500 p-1 mb-3 text-sm"
                        />
                    </div>
                    
                    <label className='font-bold mt-4 mb-3'>Identification Details</label>
                    <div className='flex flex-row'>
                        <label className="text-base text-[13px] w-1/3">ID Number: </label> <br />
                        <input
                            type="text"
                            value={idNum}
                            onChange={(e) => setIdNum(e.target.value)}
                            placeholder='YYYY-NNNN'
                            required
                            disabled={!!editingStudent}
                            className="bg-white border-1 border-gray-300 h-8 w-full p-2 mb-3 text-sm"
                        />
                    </div>
                    
                    <label className='font-bold mt-4 mb-3'>Personal Information</label>
                    <div className='flex flex-row'>
                        <label className="text-base text-[13px] w-1/3">First Name: </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder='Enter first name'
                            required
                            className="bg-white border-1 border-gray-300 h-8 w-full p-2 text-sm mb-2"
                        />
                    </div>

                    <div className='flex flex-row'>
                        <label className="text-base text-[13px] w-1/3">Last Name: </label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder='Enter last name'
                            required
                            className="bg-white border-1 border-gray-300 h-8 w-full p-2 text-sm mb-2"
                        />
                    </div>

                    <div className='flex flex-row w-full'>
                        <label className="text-base text-[13px] w-1/3">Sex: </label>
                        <select
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                            required
                            className="border-[1px] border-gray-300 bg-white w-full h-8 p-1 text-sm text-gray-500 mb-3"
                        >
                            <option value="">Select sex</option>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                        </select>
                    </div>


                    <label className='font-bold mt-4 mb-3'>Academic Information</label>
                    <div className="flex flex-row">
                        <label className="text-[13px] w-1/3 items-center">Year Level: </label>
                        <select
                            value={yearLevel}
                            onChange={(e) => setYearLevel(e.target.value)}
                            required
                            className="border-[1px] border-gray-300 bg-white w-full h-8 p-1 text-sm text-gray-500 pr-8 mb-2"
                        >
                            <option value="">Select year level</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value='3'>3</option>
                            <option value='4'>4</option>
                        </select>
                    </div>

                    <div className="flex flex-row">
                        <label className="text-[13px] w-1/3">Program: </label>
                        <select 
                            value={program || "None"}
                            onChange={(e) => setProgram(e.target.value)}
                            required
                            className="border-[1px] border-gray-300 bg-white w-full h-8 p-1 text-sm text-gray-500 pr-8"
                        >
                            <option value="">Select Program</option>
                            {programs.map((p) => (
                                <option key={p.programcode} value={p.programcode}>
                                    {p.programcode}
                                </option>
                            ))}
                        </select>
                    </div>


                    <div className='add-button-container'>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className='w-full bg-[#FCA311] h-10 text-white font-bold hover:bg-[#e5940e] disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}






// ===================== STUDENT DIRECTORY ===================== //

function StudentDirectory( {refreshKey, onEditStudent, onToggleStudentDetails }) {
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc");
    const [programs, setPrograms] = useState([]);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [activeFilters, setActiveFilters] = useState(() => createEmptyFilters());

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

    //for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(students.length / rowsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const indexOfLast = safeCurrentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentStudents = students.slice(indexOfFirst, indexOfLast);
    const hasResults = students.length > 0;

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    function openDeleteModal(idNum) {
        setStudentToDelete(idNum);
        setDeleteModalOpen(true);
    }

    //for loading students SUPABASE
    useEffect(() => {
        const loadStudents = async () => {
            try {
                const userid = getCurrentUserId();
                
                if (!userid) {
                    console.error('No userid found - user may not be logged in');
                    return;
                }

                const { data, error } = await supabase
                    .from('students')
                    .select('*, programs(collegecode)')
                    .eq('userid', userid)
                    .order('created_on', { ascending: false });

                if (error) {
                    console.error('Error fetching students:', error);
                    return;
                }

                // Map data to flatten the structure and ensure collegecode is set
                const studentsWithCollege = (data || []).map(student => ({
                    ...student,
                    collegecode: student.collegecode || student.programs?.collegecode || null
                }));

                const sortedStudents = sortByCreatedOnDesc(studentsWithCollege);

                setAllStudents(sortedStudents);
                setStudents(sortedStudents);
            } catch (err) {
                console.error('Unexpected error:', err);
            }
        };

        loadStudents();
    }, [refreshKey]);

    useEffect(() => {
        const normalizedSearch = searchKeyword.trim().toLowerCase();
        const start = activeFilters.startDate ? new Date(activeFilters.startDate) : null;
        if (start) {
            start.setHours(0, 0, 0, 0);
        }
        const end = activeFilters.endDate ? new Date(activeFilters.endDate) : null;
        if (end) {
            end.setHours(23, 59, 59, 999);
        }

        const filtered = allStudents.filter((student) => {
            let matchesSearch = true;
            if (normalizedSearch) {
                if (searchField === 'all') {
                    const textMatches = [
                        student.idnum,
                        student.firstname,
                        student.lastname,
                        student.sex,
                        student.programcode,
                        student.collegecode,
                        student.yearlevel,
                    ].some((value) => value && value.toString().toLowerCase().includes(normalizedSearch));

                    const matchesNoneProgram = !student.programcode && normalizedSearch.includes('none');
                    matchesSearch = textMatches || matchesNoneProgram;
                } else {
                    let fieldValue = '';
                    switch (searchField) {
                        case 'idnum':
                            fieldValue = student.idnum || '';
                            break;
                        case 'firstname':
                            fieldValue = student.firstname || '';
                            break;
                        case 'lastname':
                            fieldValue = student.lastname || '';
                            break;
                        case 'sex':
                            fieldValue = student.sex || '';
                            break;
                        case 'yearlevel':
                            fieldValue = student.yearlevel != null ? String(student.yearlevel) : '';
                            break;
                        case 'program':
                            fieldValue = student.programcode || '';
                            break;
                        default:
                            fieldValue = '';
                    }

                    if (searchField === 'program') {
                        matchesSearch = fieldValue.toLowerCase().includes(normalizedSearch) || (!fieldValue && normalizedSearch.includes('none'));
                    } else {
                        matchesSearch = fieldValue.toLowerCase().includes(normalizedSearch);
                    }
                }
            }

            const matchesSex = !activeFilters.sex || student.sex === activeFilters.sex;
            const matchesYearLevel = !activeFilters.yearLevel || String(student.yearlevel) === activeFilters.yearLevel;
            const matchesProgram = !activeFilters.program || (student.programcode || '') === activeFilters.program;

            let matchesTimeframe = true;
            if (start || end) {
                if (!student.created_on) {
                    matchesTimeframe = false;
                } else {
                    const created = new Date(student.created_on);
                    if (Number.isNaN(created.getTime())) {
                        matchesTimeframe = false;
                    } else {
                        matchesTimeframe = (!start || created >= start) && (!end || created <= end);
                    }
                }
            }

            return matchesSearch && matchesSex && matchesYearLevel && matchesProgram && matchesTimeframe;
        });

        setStudents(filtered);
        setCurrentPage(1);
    }, [allStudents, searchKeyword, searchField, activeFilters]);

    // Load programs for dropdown filter
    useEffect(() => {
        const loadPrograms = async () => {
            try {
                const userid = getCurrentUserId();
                
                if (!userid) {
                    console.error('No userid found - user may not be logged in');
                    return;
                }

                const { data, error } = await supabase
                    .from('programs')
                    .select('programcode')
                    .eq('userid', userid)
                    .order('programcode');

                if (error) {
                    console.error('Error fetching programs:', error);
                    return;
                }

                setPrograms(data || []);
            } catch (err) {
                console.error('Unexpected error:', err);
            }
        };

        loadPrograms();
    }, []);


    //for deleting students
    async function handleDelete(idNum) {
        if (!studentToDelete) return;

        try {
            const userid = getCurrentUserId();
            
            if (!userid) {
                console.error('No userid found - user may not be logged in');
                return;
            }

            // Delete from Supabase
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('idnum', idNum)
                .eq('userid', userid);

            if (error) {
                console.error('Error deleting student:', error);
                alert('Failed to delete student.');
                return;
            }

            alert('Student deleted successfully!');
            setAllStudents((prev) => prev.filter((s) => s.idnum !== idNum));
            setStudents((prev) => prev.filter((s) => s.idnum !== idNum));
        } catch (err) {
            console.error('Error deleting student:', err);
            alert('An error occurred while deleting.');
        }
    }

    // for searching
    function handleSearch(keyword) {
        setSearchKeyword(keyword);
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


    return (
        <div className='area-main-directory mb-10'>
            <h1 className="font-bold text-4xl mt-8">Student Directory</h1>
            <div className='flex flex-row items-center mt-5 mb-4 bg-white gap-2'>
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
                        <option value='idnum'>ID Number</option>
                        <option value='firstname'>First Name</option>
                        <option value='lastname'>Last Name</option>
                        <option value='sex'>Sex</option>
                        <option value='yearlevel'>Year Level</option>
                        <option value='program'>Program</option>
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
                            <th className="text-center">
                                <button className="flex items-center justify-center gap-1 text-black px-4 pb-3 w-full">
                                    Actions
                                </button>
                            </th>

                        </tr>
                        </thead>
                        <tbody>
                            {currentStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className='py-6 text-center text-sm text-gray-500'>No results</td>
                                </tr>
                            ) : (
                                currentStudents.map((s) => (
                                    <tr key={s.idnum}>
                                        <td>{s.idnum}</td>
                                        <td>{s.firstname}</td>
                                        <td>{s.lastname}</td>
                                        <td>{s.sex}</td>
                                        <td className='text-center'>{s.yearlevel}</td>
                                        <td>{s.programcode || "None"}</td>
                                        <td>
                                            <button className='edit' onClick={() => onEditStudent(s)} > 
                                                <FontAwesomeIcon icon={faPenToSquare} size='xs' color='#000000ff'/>
                                            </button>
                                            
                                            <button className='delete' onClick={() => openDeleteModal(s.idnum)}> 
                                                <FontAwesomeIcon icon={faTrash} size='xs' color='#FCA311'/> 
                                            </button>

                                            <button className='edit' onClick={() => onToggleStudentDetails(s)}>
                                                <FontAwesomeIcon icon={faUser} size='xs' color='#999999ff'/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="flex flex-row justify-between text-sm mx-4 my-3 items-center">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1,1))} 
                            style={{ visibility: !hasResults || safeCurrentPage === 1 ? 'hidden' : 'visible' }}
                            className='font-semibold text-[#FCA311]'
                        >
                            <FontAwesomeIcon className='page-icon' icon={faArrowLeft} size="sm" color="#FCA311" /> 
                            Prev
                        </button>

                        <span className='font-semibold'>Page {hasResults ? safeCurrentPage : 0} of {hasResults ? totalPages : 0} </span>

                        <button 
                            onClick = {() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))}
                            style={{ visibility: !hasResults || safeCurrentPage === totalPages ? 'hidden' : 'visible' }} 
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
                    setStudentToDelete(null);
                }}
                onConfirm={() => {
                    handleDelete(studentToDelete);
                    setDeleteModalOpen(false);
                    setStudentToDelete(null);
                }}
                title="Confirm Delete"
                message={`Are you sure you want to delete student ${studentToDelete}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}

function AdvancedSearch({ programs, filters, onApply, onClose }) {
    const [selectedSex, setSelectedSex] = useState(filters.sex || '');
    const [selectedYearLevel, setSelectedYearLevel] = useState(filters.yearLevel || '');
    const [selectedProgram, setSelectedProgram] = useState(filters.program || '');
    const [startDate, setStartDate] = useState(filters.startDate || '');
    const [endDate, setEndDate] = useState(filters.endDate || '');

    useEffect(() => {
        setSelectedSex(filters.sex || '');
        setSelectedYearLevel(filters.yearLevel || '');
        setSelectedProgram(filters.program || '');
        setStartDate(filters.startDate || '');
        setEndDate(filters.endDate || '');
    }, [filters]);

    const handleApply = () => {
        onApply?.({
            sex: selectedSex,
            yearLevel: selectedYearLevel,
            program: selectedProgram,
            startDate,
            endDate,
        });
    };

    const handleCancel = () => {
        const clearedFilters = createEmptyFilters();
        setSelectedSex('');
        setSelectedYearLevel('');
        setSelectedProgram('');
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
                            value={selectedSex}
                            onChange={(e) => setSelectedSex(e.target.value)}
                        >
                            <option value="">All Sexes</option>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                        </select>
                        <select 
                            className='w-1/3 bg-gray-100 px-1'
                            value={selectedYearLevel}
                            onChange={(e) => setSelectedYearLevel(e.target.value)}
                        >
                            <option value="">All Year Levels</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                        <select 
                            className='w-1/3 bg-gray-100 px-1'
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                        >
                            <option value="">All Programs</option>
                            {programs.map((p) => (
                                <option key={p.programcode} value={p.programcode}>
                                    {p.programcode}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='border border-gray-300 p-3 w-1/2'>
                    <p className='text-xs font-semibold mb-2'>Select Timeframe</p>
                    <div className='flex gap-2 h-6 text-xs items-center h-6'>
                        <p className='text-sm text-[#fca31c] font-bold'>Students Added: </p>
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
                    Close
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