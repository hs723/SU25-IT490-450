ALTER TABLE userroles DROP FOREIGN KEY userroles_ibfk_1;
ALTER TABLE userroles DROP FOREIGN KEY userroles_ibfk_2;

ALTER TABLE userroles 
ADD FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE;