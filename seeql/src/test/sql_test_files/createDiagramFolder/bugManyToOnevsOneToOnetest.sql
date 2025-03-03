CREATE TABLE Users (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE Profiles (
    id INT PRIMARY KEY,
    user_id INT,  -- Foreign key but NOT UNIQUE
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);