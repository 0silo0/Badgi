

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

drop table accounts;
drop table role;