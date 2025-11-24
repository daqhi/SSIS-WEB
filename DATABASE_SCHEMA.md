# Database Schema for Multi-User Support

## User Authentication Flow

### 1. **Users Table**
```sql
CREATE TABLE users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    useremail VARCHAR(100) UNIQUE NOT NULL,
    userpass VARCHAR(255) NOT NULL,
    created_on TIMESTAMP DEFAULT NOW()
);
```

### 2. **Sign Up Process**
- User creates account → record inserted into `users` table
- `userid` is auto-generated (SERIAL)
- Frontend stores: `userid`, `username`, `useremail` in localStorage

### 3. **Sign In Process**
- User enters username + password
- Backend queries: `SELECT userid, username, useremail FROM users WHERE username = ? AND userpass = ?`
- If found → store `userid` as the "token" in localStorage
- **This `userid` is used to link all user data**

---

## Linking Data to Users

### **Colleges Table** (with userid)
```sql
CREATE TABLE colleges (
    college_id SERIAL PRIMARY KEY,
    college_code VARCHAR(20) NOT NULL,
    college_name VARCHAR(100) NOT NULL,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    created_on TIMESTAMP DEFAULT NOW()
);
```

**Creating a College:**
```javascript
import { getCurrentUserId } from '/src/lib/auth.js';

async function createCollege(collegeCode, collegeName) {
    const userid = getCurrentUserId();
    
    const { data, error } = await supabase
        .from('colleges')
        .insert([{
            college_code: collegeCode,
            college_name: collegeName,
            userid: userid  // Link to current user
        }])
        .select();
    
    return { data, error };
}
```

**Fetching User's Colleges:**
```javascript
async function getUserColleges() {
    const userid = getCurrentUserId();
    
    const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('userid', userid);  // Only get this user's colleges
    
    return { data, error };
}
```

---

### **Programs Table** (with userid)
```sql
CREATE TABLE programs (
    program_id SERIAL PRIMARY KEY,
    program_code VARCHAR(20) NOT NULL,
    program_name VARCHAR(100) NOT NULL,
    college_id INTEGER REFERENCES colleges(college_id) ON DELETE CASCADE,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    created_on TIMESTAMP DEFAULT NOW()
);
```

**Creating a Program:**
```javascript
import { getCurrentUserId } from '/src/lib/auth.js';

async function createProgram(programCode, programName, collegeId) {
    const userid = getCurrentUserId();
    
    const { data, error } = await supabase
        .from('programs')
        .insert([{
            program_code: programCode,
            program_name: programName,
            college_id: collegeId,
            userid: userid  // Link to current user
        }])
        .select();
    
    return { data, error };
}
```

---

### **Students Table** (with userid)
```sql
CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    year_level INTEGER,
    gender VARCHAR(10),
    program_id INTEGER REFERENCES programs(program_id) ON DELETE SET NULL,
    userid INTEGER REFERENCES users(userid) ON DELETE CASCADE,
    created_on TIMESTAMP DEFAULT NOW()
);
```

**Creating a Student:**
```javascript
import { getCurrentUserId } from '/src/lib/auth.js';

async function createStudent(studentId, firstName, lastName, yearLevel, gender, programId) {
    const userid = getCurrentUserId();
    
    const { data, error } = await supabase
        .from('students')
        .insert([{
            student_id: studentId,
            first_name: firstName,
            last_name: lastName,
            year_level: yearLevel,
            gender: gender,
            program_id: programId,
            userid: userid  // Link to current user
        }])
        .select();
    
    return { data, error };
}
```

---

## SQL Migration Scripts

### Add userid column to existing tables:

```sql
-- Add userid column to colleges
ALTER TABLE colleges 
ADD COLUMN userid INTEGER REFERENCES users(userid) ON DELETE CASCADE;

-- Add userid column to programs
ALTER TABLE programs 
ADD COLUMN userid INTEGER REFERENCES users(userid) ON DELETE CASCADE;

-- Add userid column to students
ALTER TABLE students 
ADD COLUMN userid INTEGER REFERENCES users(userid) ON DELETE CASCADE;

-- Optional: Create indexes for faster queries
CREATE INDEX idx_colleges_userid ON colleges(userid);
CREATE INDEX idx_programs_userid ON programs(userid);
CREATE INDEX idx_students_userid ON students(userid);
```

---

## Usage in Components

### Example: College Page Component

```javascript
import { useEffect, useState } from 'react';
import supabase from '/src/lib/supabaseClient';
import { getCurrentUserId } from '/src/lib/auth';

function CollegePage() {
    const [colleges, setColleges] = useState([]);
    const userid = getCurrentUserId();

    useEffect(() => {
        fetchColleges();
    }, []);

    async function fetchColleges() {
        const { data, error } = await supabase
            .from('colleges')
            .select('*')
            .eq('userid', userid)  // Only get current user's colleges
            .order('created_on', { ascending: false });

        if (error) {
            console.error('Error fetching colleges:', error);
        } else {
            setColleges(data);
        }
    }

    async function addCollege(collegeCode, collegeName) {
        const { data, error } = await supabase
            .from('colleges')
            .insert([{
                college_code: collegeCode,
                college_name: collegeName,
                userid: userid  // Important: Link to current user
            }])
            .select();

        if (!error) {
            fetchColleges();  // Refresh list
        }
    }

    // ... rest of component
}
```

---

## Key Points

1. **Always include userid** when creating colleges, programs, or students
2. **Always filter by userid** when fetching data
3. **Use the auth utility functions** to get the current userid
4. **Protect routes** - check if user is logged in before allowing access
5. **Cascade deletes** - when a user is deleted, all their data is automatically deleted

## Security Notes

- The userid is stored in localStorage (client-side)
- For production, consider using JWT tokens or session-based auth
- Always validate userid on the backend
- Implement Row Level Security (RLS) in Supabase for additional security
