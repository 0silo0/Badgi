

-- Создание таблицы role
CREATE TABLE role (
    primarykey UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы accounts
CREATE TABLE accounts (
    primarykey UUID PRIMARY KEY,
    login VARCHAR(30) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    role UUID REFERENCES role(primarykey),
    createTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    editTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    avatarUrl TEXT,
    status VARCHAR(50),
    creator UUID REFERENCES role(primarykey)
);

CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_username ON accounts(username);

-- Таблица teams
CREATE TABLE teams (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    createAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createBy UUID NOT NULL REFERENCES accounts(primarykey)
);

-- Таблица team_members
CREATE TABLE teamMembers (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team UUID NOT NULL REFERENCES teams(primarykey) ON DELETE CASCADE,
    user UUID NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE,
    role VARCHAR NOT NULL,
    joinedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(team, user)
);

-- Таблица projects
CREATE TABLE projects (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    createAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createBy UUID NOT NULL REFERENCES accounts(primarykey),
    team UUID NOT NULL REFERENCES teams(primarykey) ON DELETE CASCADE,
    status VARCHAR
);

-- Таблица tasks
CREATE TABLE tasks (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description TEXT,
    projectId UUID NOT NULL REFERENCES projects(primarykey) ON DELETE CASCADE,
    createBy UUID NOT NULL REFERENCES accounts(primarykey),
    assignedTo UUID REFERENCES accounts(primarykey),
    status VARCHAR,
    priority VARCHAR,
    dueDate TIMESTAMP,
    createAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updateAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица task_comments
CREATE TABLE taskComments (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    taskId UUID NOT NULL REFERENCES tasks(primarykey) ON DELETE CASCADE,
    user UUID NOT NULL REFERENCES accounts(primarykey),
    comment TEXT NOT NULL,
    createAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updateAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица task_attachments
CREATE TABLE taskAttachments (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task UUID NOT NULL REFERENCES tasks(primarykey) ON DELETE CASCADE,
    file TEXT NOT NULL,
    uploadedBy UUID NOT NULL REFERENCES accounts(primarykey),
    uploadetAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица tags
CREATE TABLE tags (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    color VARCHAR NOT NULL
);

-- Таблица task_tags
CREATE TABLE taskTags (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task UUID NOT NULL REFERENCES tasks(primarykey) ON DELETE CASCADE,
    tag UUID NOT NULL REFERENCES tags(primarykey) ON DELETE CASCADE,
    UNIQUE(task, tag)
);

-- Таблица user_settings
CREATE TABLE userSettings (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user UUID NOT NULL UNIQUE REFERENCES accounts(primarykey) ON DELETE CASCADE,
    theme VARCHAR,
    language VARCHAR,
    isnotifications BOOLEAN NOT NULL DEFAULT TRUE
);

-- Таблица file
CREATE TABLE file (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value TEXT NOT NULL,
    type VARCHAR,
    creatAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updateAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица chat
CREATE TABLE chat (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description TEXT,
    photo TEXT,
    user UUID NOT NULL REFERENCES accounts(primarykey)
);

-- Таблица chat_members
CREATE TABLE chatMembers (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat UUID NOT NULL REFERENCES chat(primarykey) ON DELETE CASCADE,
    user UUID NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE,
    UNIQUE(chat, user)
);

-- Таблица chat_messages
CREATE TABLE chatMessages (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat UUID NOT NULL REFERENCES chat(primarykey) ON DELETE CASCADE,
    user UUID NOT NULL REFERENCES accounts(primarykey),
    content TEXT NOT NULL,
    isEdited BOOLEAN NOT NULL DEFAULT FALSE,
    createAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updateAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица read_message
CREATE TABLE readMessage (
    message UUID NOT NULL REFERENCES chatMessages(primarykey) ON DELETE CASCADE,
    user UUID NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE,
    isRead BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (message, user)
);

-- Таблица applogs
CREATE TABLE applogs (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    priority INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    machinename VARCHAR NOT NULL,
    appdomainname TEXT NOT NULL,
    processId TEXT NOT NULL,
    message TEXT NOT NULL
);

drop table accounts;
drop table role;