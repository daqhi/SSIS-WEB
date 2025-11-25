CREATE TABLE users (
    userid      SERIAL PRIMARY KEY,
    username    VARCHAR(50) NOT NULL UNIQUE,
    useremail   VARCHAR(100) NOT NULL UNIQUE,
    userpass    VARCHAR(200) NOT NULL,
    created_on  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE colleges (
    collegecode VARCHAR(50) PRIMARY KEY,
    collegename VARCHAR(200) NOT NULL UNIQUE,
    created_on  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    userid      INT,
    FOREIGN KEY (userid) REFERENCES users(userid) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

CREATE TABLE programs (
    programcode VARCHAR(50) PRIMARY KEY,
    programname VARCHAR(200) NOT NULL UNIQUE,
    collegecode VARCHAR(50),
    created_on  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collegecode) REFERENCES colleges(collegecode) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

CREATE TABLE students (
    idnum       VARCHAR(9) PRIMARY KEY,
    firstname   VARCHAR(100) NOT NULL,
    lastname    VARCHAR(100) NOT NULL,
    sex         VARCHAR(10) NOT NULL CHECK (sex IN ('Male','Female','Other')),
    yearlevel   INT NOT NULL,
    programcode VARCHAR(50),
    created_on  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (programcode) REFERENCES programs(programcode) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);
