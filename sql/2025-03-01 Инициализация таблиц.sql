CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица roles
CREATE TABLE roles (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    level INTEGER DEFAULT 0,
    createat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    editat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Таблица projectroles
CREATE TABLE projectroles (
    primarykey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    level INT NOT NULL DEFAULT 0,
    createat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    editat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица accounts
CREATE TABLE accounts (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    isemailverified BOOLEAN DEFAULT FALSE,
    password TEXT NOT NULL,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    role UUID REFERENCES roles(primarykey),
    createat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    editat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    avatarurl TEXT,
    status VARCHAR(255),
    creator UUID REFERENCES roles(primarykey)
);

-- Индексы для accounts
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_login ON accounts(login);

-- Таблица projects
CREATE TABLE projects (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    startdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createby UUID NOT NULL REFERENCES accounts(primarykey),
    status VARCHAR(255),
    logourl TEXT
);

-- Таблица projectmembers
CREATE TABLE projectmembers (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projectid UUID NOT NULL REFERENCES projects(primarykey) ON DELETE CASCADE,
    accountid UUID NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE,
    roleid UUID NOT NULL REFERENCES projectroles(primarykey),
    assignedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assignedbyid UUID REFERENCES accounts(primarykey),
    UNIQUE(projectid, accountid)
);

-- Таблица teams
CREATE TABLE teams (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project UUID NOT NULL REFERENCES projects(primarykey),
    createat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createby UUID REFERENCES accounts(primarykey)
);

-- Таблица teammembers
CREATE TABLE teammembers (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team UUID NOT NULL REFERENCES teams(primarykey) ON DELETE CASCADE,
    accountid UUID NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL,
    joinedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Уникальный индекс для teammembers
CREATE UNIQUE INDEX idx_teammembers_team_account ON teammembers(team, accountid);

-- Таблица milestones
CREATE TABLE milestones (
  primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Planned',
  assignee_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_milestones_project
    FOREIGN KEY (project_id)
    REFERENCES projects(primarykey)
    ON DELETE CASCADE,
  CONSTRAINT fk_milestones_assignee
    FOREIGN KEY (assignee_id)
    REFERENCES accounts(primarykey)
    ON DELETE SET NULL
);

CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_date ON milestones(date);

-- Таблица tasks
CREATE TABLE tasks (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(255) NOT NULL,
    color VARCHAR(255),
    projectid UUID NOT NULL REFERENCES projects(primarykey) ON DELETE CASCADE,
    createdby UUID NOT NULL REFERENCES accounts(primarykey),
    assignedto UUID REFERENCES accounts(primarykey),
    status VARCHAR(255) NOT NULL,
    priority VARCHAR(255),
    startdate TIMESTAMP,
    enddate TIMESTAMP,
    duedate TIMESTAMP,
    stage VARCHAR(255),
    createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    milestoneid UUID REFERENCES milestones(primarykey)
);

CREATE INDEX idx_tasks_project_status ON tasks(projectid, status);
CREATE INDEX idx_tasks_assignedto ON tasks(assignedto);

-- Таблица tags
CREATE TABLE tags (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL
);

-- Таблица tasktags
CREATE TABLE tasktags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(primarykey) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(primarykey) ON DELETE CASCADE,
    UNIQUE(task_id, tag_id)
);

-- Таблица taskcomments
CREATE TABLE taskcomments (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taskid UUID NOT NULL REFERENCES tasks(primarykey) ON DELETE CASCADE,
    accountid UUID NOT NULL REFERENCES accounts(primarykey),
    comment TEXT NOT NULL,
    createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Таблица files
CREATE TABLE files (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES accounts(primarykey),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Таблица taskattachments
CREATE TABLE taskattachments (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taskid UUID NOT NULL REFERENCES tasks(primarykey) ON DELETE CASCADE,
    fileid UUID NOT NULL REFERENCES files(primarykey),
    uploadedby UUID NOT NULL REFERENCES accounts(primarykey),
    uploadedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Таблица commentattachments
CREATE TABLE commentattachments (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commentid UUID NOT NULL REFERENCES taskcomments(primarykey) ON DELETE CASCADE,
    fileid UUID NOT NULL REFERENCES files(primarykey),
    uploadedby UUID NOT NULL REFERENCES accounts(primarykey),
    uploadedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Таблица usersettings
CREATE TABLE usersettings (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accountid UUID UNIQUE NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE,
    theme VARCHAR(255),
    language VARCHAR(255),
    isnotifications BOOLEAN NOT NULL DEFAULT TRUE
);

-- Таблица chat
CREATE TABLE chat (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    photo TEXT,
    account UUID NOT NULL REFERENCES accounts(primarykey),
    isprivate BOOLEAN DEFAULT FALSE
);

-- Таблица chat_members
CREATE TABLE chat_members (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat UUID NOT NULL REFERENCES chat(primarykey) ON DELETE CASCADE,
    account UUID NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE,
    UNIQUE(chat, account)
);

-- Таблица chat_messages
CREATE TABLE chat_messages (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat UUID NOT NULL REFERENCES chat(primarykey) ON DELETE CASCADE,
    account UUID NOT NULL REFERENCES accounts(primarykey),
    content TEXT NOT NULL,
    isedited BOOLEAN NOT NULL DEFAULT FALSE,
    createat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Таблица chat_attachments
CREATE TABLE chat_attachments (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message UUID NOT NULL REFERENCES chat_messages(primarykey) ON DELETE CASCADE,
    fileid UUID UNIQUE NOT NULL REFERENCES files(primarykey),
    filename VARCHAR(255) NOT NULL,
    filesize INTEGER NOT NULL,
    filetype VARCHAR(255) NOT NULL,
    uploadedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Таблица read_message
CREATE TABLE read_message (
    message UUID NOT NULL REFERENCES chat_messages(primarykey) ON DELETE CASCADE,
    account UUID NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE,
    isread BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (message, account)
);

-- Таблица calendar
CREATE TABLE calendar (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    start TIMESTAMP,
    end TIMESTAMP,
    type VARCHAR(255) NOT NULL,
    color VARCHAR(255),
    description TEXT,
    duedate TIMESTAMP,
    priority VARCHAR(255),
    accountid UUID NOT NULL REFERENCES accounts(primarykey)
);

-- Таблица attendeescalendar
CREATE TABLE attendeescalendar (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendarid UUID NOT NULL REFERENCES calendar(primarykey) ON DELETE CASCADE,
    accountid UUID NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE
);

-- Таблица file_hierarchy
CREATE TABLE file_hierarchy (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type "FileType" NOT NULL DEFAULT 'FILE',
    s3_key TEXT NOT NULL,
    parent_id UUID REFERENCES file_hierarchy(primarykey),
    file_id UUID REFERENCES files(primarykey),
    owner_id UUID NOT NULL REFERENCES accounts(primarykey),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_file_hierarchy_parent ON file_hierarchy(parent_id);
CREATE INDEX idx_file_hierarchy_s3_key ON file_hierarchy(s3_key);
CREATE INDEX idx_file_hierarchy_owner ON file_hierarchy(owner_id);


-- 1) Создаём тип для прав шаринга
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'share_permission') THEN
     CREATE TYPE share_permission AS ENUM ('VIEW', 'COMMENT', 'EDIT');
   END IF;
END$$;

-- 2) Создаём таблицу file_shares
CREATE TABLE IF NOT EXISTS file_shares (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_hierarchy_id UUID NOT NULL REFERENCES file_hierarchy(primarykey) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE,
    permission VARCHAR(50) NOT NULL DEFAULT 'VIEW',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Уникальное ограничение: один и тот же файл одному юзеру не дублируется
  CONSTRAINT uniq_file_share UNIQUE (file_hierarchy_id, account_id),

  -- Внешние ключи
  CONSTRAINT fk_file_hierarchy
    FOREIGN KEY (file_hierarchy_id)
    REFERENCES file_hierarchy (primarykey)
    ON DELETE CASCADE,

  CONSTRAINT fk_account
    FOREIGN KEY (account_id)
    REFERENCES accounts (primarykey)
    ON DELETE CASCADE
);

-- 3) Добавляем индексы для ускорения поиска
CREATE INDEX IF NOT EXISTS idx_file_shares_account
  ON file_shares (account_id);

CREATE INDEX IF NOT EXISTS idx_file_shares_file
  ON file_shares (file_hierarchy_id);

-- Таблица applogs
CREATE TABLE applogs (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    priority INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    machinename VARCHAR(255) NOT NULL,
    appdomainname TEXT NOT NULL,
    processid TEXT NOT NULL,
    message TEXT NOT NULL
);