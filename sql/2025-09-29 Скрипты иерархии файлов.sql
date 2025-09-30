-- Создание enum типа для FileType
CREATE TYPE file_type AS ENUM ('FILE', 'FOLDER');

-- Создание enum типа для SharePermission
CREATE TYPE share_permission AS ENUM ('VIEW', 'COMMENT', 'EDIT');

-- Таблица file_hierarchy
CREATE TABLE file_hierarchy (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type file_type NOT NULL DEFAULT 'FILE',
    s3_key TEXT NOT NULL,
    parent_id UUID REFERENCES file_hierarchy(primarykey) ON DELETE SET NULL,
    file_id UUID REFERENCES files(primarykey) ON DELETE SET NULL,
    owner_id UUID NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Индексы для file_hierarchy
CREATE INDEX idx_file_hierarchy_parent_id ON file_hierarchy(parent_id);
CREATE INDEX idx_file_hierarchy_s3_key ON file_hierarchy(s3_key);
CREATE INDEX idx_file_hierarchy_owner_id ON file_hierarchy(owner_id);
CREATE INDEX idx_file_hierarchy_type ON file_hierarchy(type);
CREATE INDEX idx_file_hierarchy_is_deleted ON file_hierarchy(is_deleted);
CREATE INDEX idx_file_hierarchy_created_at ON file_hierarchy(created_at);

-- Таблица file_shares
CREATE TABLE file_shares (
    primarykey UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_hierarchy_id UUID NOT NULL REFERENCES file_hierarchy(primarykey) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(primarykey) ON DELETE CASCADE,
    permission share_permission NOT NULL DEFAULT 'VIEW',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Уникальный индекс для file_shares
CREATE UNIQUE INDEX uniq_file_share ON file_shares(file_hierarchy_id, account_id);

-- Индексы для file_shares
CREATE INDEX idx_file_share_account ON file_shares(account_id);
CREATE INDEX idx_file_share_file ON file_shares(file_hierarchy_id);
CREATE INDEX idx_file_share_permission ON file_shares(permission);

-- Ограничения для целостности данных
-- Файл должен иметь file_id, а папка - не должна
ALTER TABLE file_hierarchy ADD CONSTRAINT chk_file_hierarchy_file_id 
    CHECK (
        (type = 'FILE' AND file_id IS NOT NULL) OR 
        (type = 'FOLDER' AND file_id IS NULL)
    );

-- Уникальность s3_key в рамках одного владельца и родителя
CREATE UNIQUE INDEX idx_file_hierarchy_unique_path 
ON file_hierarchy (owner_id, parent_id, name) 
WHERE is_deleted = FALSE;

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_file_hierarchy_updated_at 
    BEFORE UPDATE ON file_hierarchy 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Функция для проверки циклических ссылок
CREATE OR REPLACE FUNCTION check_file_hierarchy_cycle()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        -- Проверяем, что новый родитель не является потомком текущей записи
        IF EXISTS (
            WITH RECURSIVE hierarchy AS (
                SELECT primarykey, parent_id
                FROM file_hierarchy
                WHERE primarykey = NEW.parent_id
                UNION ALL
                SELECT fh.primarykey, fh.parent_id
                FROM file_hierarchy fh
                JOIN hierarchy h ON fh.parent_id = h.primarykey
            )
            SELECT 1 FROM hierarchy WHERE primarykey = NEW.primarykey
        ) THEN
            RAISE EXCEPTION 'Cyclic reference detected in file hierarchy';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для проверки циклических ссылок
CREATE TRIGGER check_file_hierarchy_cycle_trigger
    BEFORE INSERT OR UPDATE ON file_hierarchy
    FOR EACH ROW
    EXECUTE FUNCTION check_file_hierarchy_cycle();

-- Представление для удобного получения иерархии файлов
CREATE VIEW file_hierarchy_view AS
SELECT 
    fh.primarykey,
    fh.name,
    fh.type,
    fh.s3_key,
    fh.parent_id,
    fh.file_id,
    fh.owner_id,
    a.login as owner_login,
    fh.created_at,
    fh.updated_at,
    fh.is_deleted,
    -- Полный путь
    (
        WITH RECURSIVE path_cte AS (
            SELECT primarykey, parent_id, name, 1 as level
            FROM file_hierarchy
            WHERE primarykey = fh.primarykey
            UNION ALL
            SELECT p.primarykey, p.parent_id, p.name, pc.level + 1
            FROM file_hierarchy p
            INNER JOIN path_cte pc ON p.primarykey = pc.parent_id
        )
        SELECT string_agg(name, '/' ORDER BY level DESC)
        FROM path_cte
    ) as full_path
FROM file_hierarchy fh
JOIN accounts a ON fh.owner_id = a.primarykey
WHERE fh.is_deleted = FALSE;

-- Функция для получения полного пути файла/папки
CREATE OR REPLACE FUNCTION get_file_full_path(file_id UUID)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    WITH RECURSIVE path_cte AS (
        SELECT primarykey, parent_id, name, 1 as level
        FROM file_hierarchy
        WHERE primarykey = file_id
        UNION ALL
        SELECT p.primarykey, p.parent_id, p.name, pc.level + 1
        FROM file_hierarchy p
        INNER JOIN path_cte pc ON p.primarykey = pc.parent_id
    )
    SELECT string_agg(name, '/' ORDER BY level DESC)
    INTO result
    FROM path_cte;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Функция для мягкого удаления файла/папки и всех потомков
CREATE OR REPLACE FUNCTION soft_delete_file_hierarchy(file_id UUID)
RETURNS VOID AS $$
BEGIN
    WITH RECURSIVE descendants AS (
        SELECT primarykey
        FROM file_hierarchy
        WHERE primarykey = file_id
        UNION ALL
        SELECT fh.primarykey
        FROM file_hierarchy fh
        JOIN descendants d ON fh.parent_id = d.primarykey
    )
    UPDATE file_hierarchy 
    SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE primarykey IN (SELECT primarykey FROM descendants);
END;
$$ LANGUAGE plpgsql;

-- Вставка тестовых данных (опционально)
-- INSERT INTO file_hierarchy (name, type, s3_key, owner_id) VALUES 
-- ('Root', 'FOLDER', 'root/', 'ваш-uuid-владельца');