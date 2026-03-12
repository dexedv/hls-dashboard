-- ============================================
-- HLS-DASHBOARD SYSTEM TABLES
-- Execute this SQL in Supabase SQL Editor
-- ============================================

-- ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, slug, description, is_system_role) VALUES
    ('Inhaber', 'owner', 'Vollzugriff auf alle Funktionen', true),
    ('Administrator', 'admin', 'Fast Vollzugriff', true),
    ('Manager', 'manager', 'Erweiterte Rechte', true),
    ('Mitarbeiter', 'employee', 'Standard Rechte', true),
    ('Gast', 'guest', 'Nur Leserechte', true)
ON CONFLICT (slug) DO NOTHING;

-- PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    key_permission VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    group_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert all permissions
INSERT INTO permissions (module, action, key_permission, description, group_name) VALUES
-- Dashboard
('dashboard', 'view', 'dashboard.view', 'Dashboard anzeigen', 'dashboard'),

-- CRM
('crm', 'view', 'crm.view', 'Kunden anzeigen', 'crm'),
('crm', 'create', 'crm.create', 'Kunden erstellen', 'crm'),
('crm', 'edit', 'crm.edit', 'Kunden bearbeiten', 'crm'),
('crm', 'delete', 'crm.delete', 'Kunden löschen', 'crm'),
('crm', 'export', 'crm.export', 'Kunden exportieren', 'crm'),

-- Leads
('leads', 'view', 'leads.view', 'Leads anzeigen', 'leads'),
('leads', 'create', 'leads.create', 'Leads erstellen', 'leads'),
('leads', 'edit', 'leads.edit', 'Leads bearbeiten', 'leads'),
('leads', 'delete', 'leads.delete', 'Leads löschen', 'leads'),
('leads', 'convert', 'leads.convert', 'Leads konvertieren', 'leads'),
('leads', 'export', 'leads.export', 'Leads exportieren', 'leads'),

-- Projects
('projects', 'view', 'projects.view', 'Projekte anzeigen', 'projects'),
('projects', 'create', 'projects.create', 'Projekte erstellen', 'projects'),
('projects', 'edit', 'projects.edit', 'Projekte bearbeiten', 'projects'),
('projects', 'delete', 'projects.delete', 'Projekte löschen', 'projects'),
('projects', 'assign', 'projects.assign', 'Projekte zuweisen', 'projects'),
('projects', 'export', 'projects.export', 'Projekte exportieren', 'projects'),

-- Tasks
('tasks', 'view', 'tasks.view', 'Aufgaben anzeigen', 'tasks'),
('tasks', 'create', 'tasks.create', 'Aufgaben erstellen', 'tasks'),
('tasks', 'edit', 'tasks.edit', 'Aufgaben bearbeiten', 'tasks'),
('tasks', 'delete', 'tasks.delete', 'Aufgaben löschen', 'tasks'),
('tasks', 'assign', 'tasks.assign', 'Aufgaben zuweisen', 'tasks'),
('tasks', 'complete', 'tasks.complete', 'Aufgaben abschließen', 'tasks'),

-- Calendar
('calendar', 'view', 'calendar.view', 'Kalender anzeigen', 'calendar'),
('calendar', 'create', 'calendar.create', 'Termine erstellen', 'calendar'),
('calendar', 'edit', 'calendar.edit', 'Termine bearbeiten', 'calendar'),
('calendar', 'delete', 'calendar.delete', 'Termine löschen', 'calendar'),

-- Finances
('finances', 'view', 'finances.view', 'Finanzen anzeigen', 'finances'),
('finances', 'create', 'finances.create', 'Finanzen erstellen', 'finances'),
('finances', 'edit', 'finances.edit', 'Finanzen bearbeiten', 'finances'),
('finances', 'delete', 'finances.delete', 'Finanzen löschen', 'finances'),
('finances', 'export', 'finances.export', 'Finanzen exportieren', 'finances'),

-- Invoices
('invoices', 'view', 'invoices.view', 'Rechnungen anzeigen', 'invoices'),
('invoices', 'create', 'invoices.create', 'Rechnungen erstellen', 'invoices'),
('invoices', 'edit', 'invoices.edit', 'Rechnungen bearbeiten', 'invoices'),
('invoices', 'delete', 'invoices.delete', 'Rechnungen löschen', 'invoices'),
('invoices', 'send', 'invoices.send', 'Rechnungen senden', 'invoices'),
('invoices', 'export', 'invoices.export', 'Rechnungen exportieren', 'invoices'),
('invoices', 'mark_paid', 'invoices.mark_paid', 'Als bezahlt markieren', 'invoices'),

-- Time Tracking
('time_tracking', 'view', 'time_tracking.view', 'Zeiterfassung anzeigen', 'time_tracking'),
('time_tracking', 'create', 'time_tracking.create', 'Zeiten erfassen', 'time_tracking'),
('time_tracking', 'edit', 'time_tracking.edit', 'Zeiten bearbeiten', 'time_tracking'),
('time_tracking', 'delete', 'time_tracking.delete', 'Zeiten löschen', 'time_tracking'),
('time_tracking', 'approve', 'time_tracking.approve', 'Zeiten genehmigen', 'time_tracking'),

-- Team
('team', 'view', 'team.view', 'Team anzeigen', 'team'),
('team', 'create', 'team.create', 'Mitarbeiter erstellen', 'team'),
('team', 'edit', 'team.edit', 'Mitarbeiter bearbeiten', 'team'),
('team', 'delete', 'team.delete', 'Mitarbeiter löschen', 'team'),
('team', 'assign_roles', 'team.assign_roles', 'Rollen zuweisen', 'team'),

-- Leave
('leave', 'view', 'leave.view', 'Urlaub anzeigen', 'leave'),
('leave', 'create', 'leave.create', 'Urlaub beantragen', 'leave'),
('leave', 'edit', 'leave.edit', 'Urlaub bearbeiten', 'leave'),
('leave', 'delete', 'leave.delete', 'Urlaub löschen', 'leave'),
('leave', 'approve', 'leave.approve', 'Urlaub genehmigen', 'leave'),

-- Notes
('notes', 'view', 'notes.view', 'Notizen anzeigen', 'notes'),
('notes', 'create', 'notes.create', 'Notizen erstellen', 'notes'),
('notes', 'edit', 'notes.edit', 'Notizen bearbeiten', 'notes'),
('notes', 'delete', 'notes.delete', 'Notizen löschen', 'notes'),

-- Inventory
('inventory', 'view', 'inventory.view', 'Inventar anzeigen', 'inventory'),
('inventory', 'create', 'inventory.create', 'Artikel erstellen', 'inventory'),
('inventory', 'edit', 'inventory.edit', 'Artikel bearbeiten', 'inventory'),
('inventory', 'delete', 'inventory.delete', 'Artikel löschen', 'inventory'),
('inventory', 'export', 'inventory.export', 'Inventar exportieren', 'inventory'),

-- WMS
('wms', 'view', 'wms.view', 'Warenwirtschaft anzeigen', 'wms'),
('wms', 'create', 'wms.create', 'Bewegungen erstellen', 'wms'),
('wms', 'edit', 'wms.edit', 'Bewegungen bearbeiten', 'wms'),
('wms', 'delete', 'wms.delete', 'Bewegungen löschen', 'wms'),
('wms', 'approve', 'wms.approve', 'Genehmigen', 'wms'),

-- Barcode
('barcode', 'view', 'barcode.view', 'Barcode anzeigen', 'barcode'),
('barcode', 'create', 'barcode.create', 'Barcode erstellen', 'barcode'),
('barcode', 'scan', 'barcode.scan', 'Scannen', 'barcode'),
('barcode', 'print', 'barcode.print', 'Drucken', 'barcode'),

-- Statistics
('statistics', 'view', 'statistics.view', 'Statistiken anzeigen', 'statistics'),
('statistics', 'export', 'statistics.export', 'Statistiken exportieren', 'statistics'),

-- Tickets
('tickets', 'view', 'tickets.view', 'Tickets anzeigen', 'tickets'),
('tickets', 'create', 'tickets.create', 'Tickets erstellen', 'tickets'),
('tickets', 'edit', 'tickets.edit', 'Tickets bearbeiten', 'tickets'),
('tickets', 'delete', 'tickets.delete', 'Tickets löschen', 'tickets'),
('tickets', 'assign', 'tickets.assign', 'Tickets zuweisen', 'tickets'),
('tickets', 'close', 'tickets.close', 'Tickets schließen', 'tickets'),

-- Email
('email', 'view', 'email.view', 'E-Mail anzeigen', 'email'),
('email', 'send', 'email.send', 'E-Mail senden', 'email'),
('email', 'reply', 'email.reply', 'Antworten', 'email'),
('email', 'delete', 'email.delete', 'E-Mail löschen', 'email'),
('email', 'link', 'email.link', 'Verknüpfen', 'email'),

-- Users
('users', 'view', 'users.view', 'Benutzer anzeigen', 'users'),
('users', 'create', 'users.create', 'Benutzer erstellen', 'users'),
('users', 'edit', 'users.edit', 'Benutzer bearbeiten', 'users'),
('users', 'delete', 'users.delete', 'Benutzer löschen', 'users'),
('users', 'invite', 'users.invite', 'Benutzer einladen', 'users'),
('users', 'deactivate', 'users.deactivate', 'Benutzer deaktivieren', 'users'),

-- Roles
('roles', 'view', 'roles.view', 'Rollen anzeigen', 'roles'),
('roles', 'create', 'roles.create', 'Rollen erstellen', 'roles'),
('roles', 'edit', 'roles.edit', 'Rollen bearbeiten', 'roles'),
('roles', 'delete', 'roles.delete', 'Rollen löschen', 'roles'),

-- Permissions
('permissions', 'view', 'permissions.view', 'Berechtigungen anzeigen', 'permissions'),
('permissions', 'manage', 'permissions.manage', 'Berechtigungen verwalten', 'permissions'),

-- Labels
('labels', 'view', 'labels.view', 'Labels anzeigen', 'labels'),
('labels', 'create', 'labels.create', 'Labels erstellen', 'labels'),
('labels', 'edit', 'labels.edit', 'Labels bearbeiten', 'labels'),
('labels', 'delete', 'labels.delete', 'Labels löschen', 'labels'),

-- Settings
('settings', 'view', 'settings.view', 'Einstellungen anzeigen', 'settings'),
('settings', 'edit', 'settings.edit', 'Einstellungen bearbeiten', 'settings'),

-- Integrations
('integrations', 'view', 'integrations.view', 'Integrationen anzeigen', 'integrations'),
('integrations', 'manage', 'integrations.manage', 'Integrationen verwalten', 'integrations'),

-- Audit Logs
('audit_logs', 'view', 'audit_logs.view', 'Audit-Logs anzeigen', 'audit_logs'),

-- System
('system', 'access', 'database.access', 'Datenbankzugriff', 'system')
ON CONFLICT (key_permission) DO NOTHING;

-- LABELS TABLE
CREATE TABLE IF NOT EXISTS labels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default labels
INSERT INTO labels (name, slug, description, color) VALUES
    ('Außendienst', 'aussendienst', 'Außendienst-Mitarbeiter', '#3b82f6'),
    ('Innendienst', 'innendienst', 'Innendienst-Mitarbeiter', '#10b981'),
    ('Produktion', 'produktion', 'Produktions-Mitarbeiter', '#f59e0b'),
    ('Support', 'support', 'Support-Mitarbeiter', '#8b5cf6'),
    ('Buchhaltung', 'buchhaltung', 'Buchhaltung-Mitarbeiter', '#ec4899'),
    ('Vertrieb', 'vertrieb', 'Vertriebs-Mitarbeiter', '#ef4444')
ON CONFLICT (slug) DO NOTHING;

-- AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- USER_LABELS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS user_labels (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    label_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, label_id)
);

-- ROLE_PERMISSIONS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
    allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Add user_id column to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'employee';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- DATA SEEDED SUCCESSFULLY
-- ============================================
