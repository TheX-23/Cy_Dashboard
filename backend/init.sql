-- SentinelX Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- These will be created by Alembic migrations, but we add them here for initial setup

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Logs table indexes
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_ip_address ON logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_endpoint ON logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_logs_status_code ON logs(status_code);

-- Detections table indexes
CREATE INDEX IF NOT EXISTS idx_detections_log_id ON detections(log_id);
CREATE INDEX IF NOT EXISTS idx_detections_threat_type ON detections(threat_type);
CREATE INDEX IF NOT EXISTS idx_detections_risk_score ON detections(risk_score);
CREATE INDEX IF NOT EXISTS idx_detections_source_ip ON detections(source_ip);
CREATE INDEX IF NOT EXISTS idx_detections_created_at ON detections(created_at);

-- Alerts table indexes
CREATE INDEX IF NOT EXISTS idx_alerts_detection_id ON alerts(detection_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_assigned_to ON alerts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_alerts_source_ip ON alerts(source_ip);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

-- Incidents table indexes
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX IF NOT EXISTS idx_incidents_created_by ON incidents(created_by);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);

-- Incident alerts junction table indexes
CREATE INDEX IF NOT EXISTS idx_incident_alerts_incident_id ON incident_alerts(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_alerts_alert_id ON incident_alerts(alert_id);

-- SOAR tables indexes
CREATE INDEX IF NOT EXISTS idx_soar_playbooks_trigger_type ON soar_playbooks(trigger_type);
CREATE INDEX IF NOT EXISTS idx_soar_playbooks_is_active ON soar_playbooks(is_active);
CREATE INDEX IF NOT EXISTS idx_soar_actions_playbook_id ON soar_actions(playbook_id);
CREATE INDEX IF NOT EXISTS idx_soar_actions_action_type ON soar_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_soar_execution_logs_playbook_id ON soar_execution_logs(playbook_id);
CREATE INDEX IF NOT EXISTS idx_soar_execution_logs_status ON soar_execution_logs(status);

-- Integrations table indexes
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_is_active ON integrations(is_active);

-- API keys table indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON api_keys(created_by);

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Threat intelligence table indexes
CREATE INDEX IF NOT EXISTS idx_threat_intel_source_ip ON threat_intel(source_ip);
CREATE INDEX IF NOT EXISTS idx_threat_intel_destination_ip ON threat_intel(destination_ip);
CREATE INDEX IF NOT EXISTS idx_threat_intel_domain ON threat_intel(domain);
CREATE INDEX IF NOT EXISTS idx_threat_intel_threat_type ON threat_intel(threat_type);
CREATE INDEX IF NOT EXISTS idx_threat_intel_severity ON threat_intel(severity);
CREATE INDEX IF NOT EXISTS idx_threat_intel_country_from ON threat_intel(country_from);
CREATE INDEX IF NOT EXISTS idx_threat_intel_country_to ON threat_intel(country_to);
CREATE INDEX IF NOT EXISTS idx_threat_intel_is_active ON threat_intel(is_active);
CREATE INDEX IF NOT EXISTS idx_threat_intel_created_at ON threat_intel(created_at);

-- Composite indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_threat_intel_source_ip_type ON threat_intel(source_ip, threat_type);
CREATE INDEX IF NOT EXISTS idx_threat_intel_domain_type ON threat_intel(domain, threat_type);
CREATE INDEX IF NOT EXISTS idx_threat_intel_severity_active ON threat_intel(severity, is_active);
CREATE INDEX IF NOT EXISTS idx_threat_intel_created_at ON threat_intel(created_at);

-- Create full-text search indexes for text fields
CREATE INDEX IF NOT EXISTS idx_logs_endpoint_gin ON logs USING gin(to_tsvector('english', endpoint));
CREATE INDEX IF NOT EXISTS idx_alerts_title_gin ON alerts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_alerts_description_gin ON alerts USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_incidents_title_gin ON incidents USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_incidents_description_gin ON incidents USING gin(to_tsvector('english', description));

-- Insert initial admin user (password: admin123)
INSERT INTO users (id, email, name, password_hash, role, is_active, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin@sentinelx.com',
    'System Administrator',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LF',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample threat intelligence data
INSERT INTO threat_intel (id, source_ip, threat_type, severity, confidence_score, source, description, is_active, created_at, updated_at)
VALUES 
    (uuid_generate_v4(), '192.168.1.100', 'malicious_ip', 'high', 85, 'internal_analysis', 'Known malicious internal IP', 'true', NOW(), NOW()),
    (uuid_generate_v4(), '10.0.0.50', 'malicious_ip', 'critical', 95, 'threat_feed', 'Known C2 server', 'true', NOW(), NOW()),
    (uuid_generate_v4(), '203.0.113.1', 'suspicious_ip', 'medium', 60, 'reputation', 'Suspicious activity detected', 'true', NOW(), NOW()),
    (uuid_generate_v4(), '198.51.100.1', 'botnet', 'high', 80, 'threat_intel', 'Known botnet node', 'true', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create sample SOAR playbook
INSERT INTO soar_playbooks (id, name, description, trigger_type, trigger_conditions, is_active, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'Block Malicious IP',
    'Automatically blocks malicious IP addresses when critical alerts are triggered',
    'alert',
    '{"severity": ["critical", "high"]}',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Get the playbook ID for actions
DO $$
DECLARE
    playbook_id UUID;
BEGIN
    SELECT id INTO playbook_id FROM soar_playbooks WHERE name = 'Block Malicious IP' LIMIT 1;
    
    IF playbook_id IS NOT NULL THEN
        INSERT INTO soar_actions (id, playbook_id, action_type, name, description, config, order_index, timeout_seconds, is_active, created_at, updated_at)
        VALUES 
            (uuid_generate_v4(), playbook_id, 'block_ip', 'Block IP Address', 'Blocks the malicious IP in firewall', '{"command": "iptables -A INPUT -s {source_ip} -j DROP"}', 1, 60, true, NOW(), NOW()),
            (uuid_generate_v4(), playbook_id, 'notify', 'Send Notification', 'Sends email notification to security team', '{"type": "email", "recipients": ["security@sentinelx.com"]}', 2, 30, true, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Create sample integration
INSERT INTO integrations (id, name, type, description, config, is_active, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'Slack Notifications',
    'slack',
    'Send alerts to Slack channel',
    '{"webhook_url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK", "channel": "#security-alerts"}',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Create sample API key
INSERT INTO api_keys (id, name, key, permissions, rate_limit, is_active, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'Development API Key',
    'sk-dev-1234567890abcdef',
    '["read:alerts", "read:incidents", "read:detections"]',
    1000,
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Create sample audit log
INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, timestamp)
SELECT 
    uuid_generate_v4(),
    id,
    'create',
    'user',
    id::text,
    '{"action": "initial_setup"}',
    '127.0.0.1',
    NOW()
FROM users WHERE email = 'admin@sentinelx.com'
ON CONFLICT DO NOTHING;

COMMIT;

-- Output setup completion message
DO $$
BEGIN
    RAISE NOTICE 'SentinelX database initialized successfully';
    RAISE NOTICE 'Default admin user: admin@sentinelx.com / admin123';
    RAISE NOTICE 'Remember to change the default password in production!';
END $$;
