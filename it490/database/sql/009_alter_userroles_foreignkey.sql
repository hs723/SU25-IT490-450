ALTER TABLE userroles DROP FOREIGN KEY userroles_ibfk_2;
ALTER TABLE userroles CHANGE role_id role_id INT;
ALTER TABLE userroles ADD FOREIGN KEY (role_id) REFERENCES roles(role_id);