CREATE INDEX idx_userroles_active ON userroles(is_active);
CREATE INDEX idx_userroles_user ON userroles(user_id);