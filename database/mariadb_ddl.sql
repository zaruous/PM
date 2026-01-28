/* ==========================================================================
   PMO Suite - MariaDB DDL
   ========================================================================== */

-- 1. Projects Table
CREATE TABLE projects (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(50) NOT NULL UNIQUE,
    client          VARCHAR(100),
    type            VARCHAR(20) NOT NULL CHECK (type IN ('External', 'Internal', 'Other')),
    order_amount    DECIMAL(18, 2) DEFAULT 0,
    start_date      DATE,
    end_date        DATE,
    status          VARCHAR(20) DEFAULT 'Planning' CHECK (status IN ('Planning', 'Active', 'Completed', 'On Hold')),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Members Table
CREATE TABLE members (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    position        VARCHAR(50),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Member Skills Table
CREATE TABLE member_skills (
    member_id       VARCHAR(50) NOT NULL,
    skill_name      VARCHAR(50) NOT NULL,
    PRIMARY KEY (member_id, skill_name),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 4. Assignments Table
CREATE TABLE assignments (
    id              VARCHAR(50) PRIMARY KEY,
    project_id      VARCHAR(50) NOT NULL,
    member_id       VARCHAR(50) NOT NULL,
    role            VARCHAR(20),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    input_ratio     DECIMAL(3, 2) DEFAULT 1.0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
