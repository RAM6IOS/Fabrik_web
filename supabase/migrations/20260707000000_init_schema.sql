-- 20260707000000_init_schema.sql
-- Initial schema setup for Factory Multi-tenant SaaS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FACTORIES TABLE
CREATE TABLE factories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. USERS TABLE (profile linked to Supabase Auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'worker')),
  full_name TEXT NOT NULL
);
CREATE INDEX idx_users_factory_id ON users(factory_id);

-- 3. MACHINES TABLE (with soft delete support)
CREATE TABLE machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  maintenance_interval_days INT NOT NULL DEFAULT 30,
  last_maintenance_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT machines_id_factory_id_key UNIQUE (id, factory_id)
);
CREATE INDEX idx_machines_factory_id ON machines(factory_id);

-- 4. WORK ORDERS TABLE (with composite FK to ensure machine is in same factory)
CREATE TABLE work_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  planned_start TIMESTAMPTZ,
  planned_end TIMESTAMPTZ,
  machine_id UUID,
  CONSTRAINT work_orders_machine_factory_fkey 
    FOREIGN KEY (machine_id, factory_id) 
    REFERENCES machines(id, factory_id) 
    ON DELETE RESTRICT
);
CREATE INDEX idx_work_orders_factory_id ON work_orders(factory_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);

-- 5. MAINTENANCE LOGS TABLE (with composite FK to ensure machine is in same factory)
CREATE TABLE maintenance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
  machine_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  CONSTRAINT maintenance_logs_machine_factory_fkey 
    FOREIGN KEY (machine_id, factory_id) 
    REFERENCES machines(id, factory_id) 
    ON DELETE RESTRICT
);
CREATE INDEX idx_maintenance_logs_factory_id ON maintenance_logs(factory_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;


-- SECURITY HELPER FUNCTIONS
-- These bypass RLS via SECURITY DEFINER to get current user context without infinite loops

CREATE OR REPLACE FUNCTION get_user_factory_id()
RETURNS UUID 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT factory_id 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql;


-- ROLE PROTECTION TRIGGER (ON UPDATE ON USERS)

CREATE OR REPLACE FUNCTION check_user_role_update()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  executing_user_role TEXT;
  executing_user_factory UUID;
BEGIN
  -- If role and factory are not changing, allow immediately
  IF NEW.role = OLD.role AND NEW.factory_id = OLD.factory_id THEN
    RETURN NEW;
  END IF;

  -- If operation is done via service role (auth.uid() is NULL), allow immediately
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get current user's role and factory
  SELECT role, factory_id INTO executing_user_role, executing_user_factory
  FROM public.users
  WHERE id = auth.uid();

  -- Permit only if the executing user is the owner of the same factory
  IF executing_user_role = 'owner' AND executing_user_factory = OLD.factory_id THEN
    -- Owners cannot move users to a different factory
    IF NEW.factory_id != OLD.factory_id THEN
      RAISE EXCEPTION 'Cannot move users to another factory.';
    END IF;
    RETURN NEW;
  END IF;

  -- Block any other role/factory modifications
  RAISE EXCEPTION 'Only factory owners can update user roles or factories.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_role_update_restriction
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_user_role_update();


-- ROW LEVEL SECURITY (RLS) POLICIES

-- A. Factories Policies
CREATE POLICY factories_select_policy ON factories
  FOR SELECT
  USING (id = get_user_factory_id());

-- B. Users Policies
CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (factory_id = get_user_factory_id());

CREATE POLICY users_update_policy ON users
  FOR UPDATE
  USING (id = auth.uid() OR (get_user_role() = 'owner' AND factory_id = get_user_factory_id()))
  WITH CHECK (id = auth.uid() OR (get_user_role() = 'owner' AND factory_id = get_user_factory_id()));

-- C. Machines Policies
CREATE POLICY machines_all_policy ON machines
  FOR ALL
  USING (factory_id = get_user_factory_id())
  WITH CHECK (factory_id = get_user_factory_id());

-- D. Work Orders Policies
CREATE POLICY work_orders_select_policy ON work_orders
  FOR SELECT
  USING (factory_id = get_user_factory_id());

CREATE POLICY work_orders_insert_policy ON work_orders
  FOR INSERT
  WITH CHECK (factory_id = get_user_factory_id());

CREATE POLICY work_orders_update_policy ON work_orders
  FOR UPDATE
  USING (factory_id = get_user_factory_id())
  WITH CHECK (factory_id = get_user_factory_id());

CREATE POLICY work_orders_delete_policy ON work_orders
  FOR DELETE
  USING (factory_id = get_user_factory_id());

-- E. Maintenance Logs Policies
CREATE POLICY maintenance_logs_all_policy ON maintenance_logs
  FOR ALL
  USING (factory_id = get_user_factory_id())
  WITH CHECK (factory_id = get_user_factory_id());
