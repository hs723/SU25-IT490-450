CREATE TABLE leaderboards (
    leaderboard_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NULL,
    leaderboard_type ENUM('overall', 'category', 'daily', 'weekly', 'monthly') NOT NULL,
    score INT NOT NULL DEFAULT 0,
    games_played INT NOT NULL DEFAULT 0,
    average_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    win_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    longest_streak INT NOT NULL DEFAULT 0,
    total_correct_answers INT NOT NULL DEFAULT 0,
    total_questions_answered INT NOT NULL DEFAULT 0,
    rank_position INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_leaderboard (user_id, category_id, leaderboard_type)
);