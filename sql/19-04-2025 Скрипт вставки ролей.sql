DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'SYSTEM_ADMIN') THEN
        INSERT INTO roles (primarykey, name, level, createat, editat)
        VALUES (gen_random_uuid(), 'SYSTEM_ADMIN', 100, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'GUEST') THEN
        INSERT INTO roles (primarykey, name, level, createat, editat)
        VALUES (gen_random_uuid(), 'GUEST', 20, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'CLIENT') THEN
        INSERT INTO roles (primarykey, name, level, createat, editat)
        VALUES (gen_random_uuid(), 'CLIENT', 10, NOW(), NOW());
    END IF;
END $$;