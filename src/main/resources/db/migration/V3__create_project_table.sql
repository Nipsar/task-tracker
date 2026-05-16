CREATE TABLE projects (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL,
    deadline TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL
)