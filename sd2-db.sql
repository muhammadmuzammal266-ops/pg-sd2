CREATE DATABASE IF NOT EXISTS `sd2-db`;
USE `sd2-db`;

DROP TABLE IF EXISTS feedback_messages;
DROP TABLE IF EXISTS saved_tips;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS tip_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS tips;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(150) NOT NULL,
    bio TEXT,
    profile_image VARCHAR(255) DEFAULT '/default-avatar.svg'
);

CREATE TABLE tips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    game_name VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    tip_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tip_id) REFERENCES tips(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tip_tags (
    tip_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (tip_id, tag_id),
    FOREIGN KEY (tip_id) REFERENCES tips(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE saved_tips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tip_id INT NOT NULL,
    UNIQUE KEY unique_saved_tip (user_id, tip_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tip_id) REFERENCES tips(id) ON DELETE CASCADE
);

CREATE TABLE feedback_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_type VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, password, bio, profile_image) VALUES
('muzammal','muz@example.com','123456','Gamer and developer who enjoys action and strategy games.','/default-avatar.svg'),
('ali','ali@example.com','123456','FPS player who likes testing aim and movement settings.','/default-avatar.svg'),
('sunaina','sunaina@example.com','123456','Strategy games lover and community-focused gamer.','/default-avatar.svg'),
('ahmed','ahmed@example.com','123456','Adventure gamer who loves exploring open worlds.','/default-avatar.svg');

INSERT INTO tips (title, game_name, content, user_id) VALUES
('Best Aim Settings','Call of Duty','Use lower sensitivity for better control, practice crosshair placement, and avoid over-correcting while aiming.',1),
('Fast Leveling','Minecraft','Mine efficiently, gather resources early, and keep your tools upgraded to progress faster.',2),
('Winning Strategy','Clash of Clans','Upgrade defenses first, protect your resources, and plan attacks around enemy weak points.',3),
('Cornering Tips','Forza Horizon','Brake before entering the corner and accelerate smoothly when exiting for faster lap times.',1),
('Survival Basics','Rust','Gather wood and stone early, build a small base quickly, and avoid carrying too much loot at once.',4),
('Football Positioning','FIFA','Stay patient in build-up play, use passing triangles, and avoid dragging defenders out of position.',2);

INSERT INTO comments (content, tip_id, user_id) VALUES
('Great tip! This really improved my gameplay.',1,2),
('Very helpful advice, thanks for sharing.',2,1),
('Nice strategy, I will try this in my next match.',3,2),
('This worked well for me in ranked mode.',1,3);

INSERT INTO tags (tag_name) VALUES
('Action'),
('Strategy'),
('Racing'),
('Survival'),
('Sports'),
('Adventure'),
('FPS'),
('Beginner'),
('Multiplayer');

INSERT INTO tip_tags (tip_id, tag_id) VALUES
(1,1),
(1,7),
(1,9),
(2,6),
(2,8),
(3,2),
(3,9),
(4,3),
(4,5),
(5,4),
(5,9),
(6,5);