-- Re-apply triggers with corrected generic updated_at block (idempotent)

-- 1) Auth: create profile, farm settings, default dashboard on new user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'on_auth_user_created' AND n.nspname = 'auth'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END$$;

-- 2) farm_settings: BEFORE UPDATE updated_at, AFTER INSERT create admin role and default dashboard
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_farm_settings_updated_at') THEN
    CREATE TRIGGER trg_farm_settings_updated_at
    BEFORE UPDATE ON public.farm_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_farm_settings_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_farm_settings_create_admin') THEN
    CREATE TRIGGER trg_farm_settings_create_admin
    AFTER INSERT ON public.farm_settings
    FOR EACH ROW EXECUTE FUNCTION public.create_default_farm_admin();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_farm_settings_create_default_dashboard') THEN
    CREATE TRIGGER trg_farm_settings_create_default_dashboard
    AFTER INSERT ON public.farm_settings
    FOR EACH ROW EXECUTE FUNCTION public.create_default_dashboard_for_user();
  END IF;
END$$;

-- 3) user_invitations: BEFORE UPDATE updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_invitations_updated_at') THEN
    CREATE TRIGGER trg_user_invitations_updated_at
    BEFORE UPDATE ON public.user_invitations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_user_invitations();
  END IF;
END$$;

-- 4) cages: log changes on INSERT/UPDATE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cages_log_changes') THEN
    CREATE TRIGGER trg_cages_log_changes
    AFTER INSERT OR UPDATE ON public.cages
    FOR EACH ROW EXECUTE FUNCTION public.log_cage_changes();
  END IF;
END$$;

-- 5) weekly_weighings: auto adjust feeding after new weighing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_weighings_auto_adjust_feeding') THEN
    CREATE TRIGGER trg_weighings_auto_adjust_feeding
    AFTER INSERT ON public.weekly_weighings
    FOR EACH ROW EXECUTE FUNCTION public.auto_adjust_feeding_after_weighing();
  END IF;
END$$;

-- 6) Keep nombre_poissons in sync after health or sales changes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_health_remaining_fish') THEN
    CREATE TRIGGER trg_health_remaining_fish
    AFTER INSERT OR UPDATE OR DELETE ON public.health_observations
    FOR EACH ROW EXECUTE FUNCTION public.update_remaining_fish();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sales_remaining_fish') THEN
    CREATE TRIGGER trg_sales_remaining_fish
    AFTER INSERT OR UPDATE OR DELETE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION public.update_remaining_fish();
  END IF;
END$$;

-- 7) Optimized cage metrics + smart alerts after domain changes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_metrics_after_feeding') THEN
    CREATE TRIGGER trg_metrics_after_feeding
    AFTER INSERT OR UPDATE OR DELETE ON public.feeding_sessions
    FOR EACH ROW EXECUTE FUNCTION public.optimized_cage_update_trigger();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_metrics_after_health') THEN
    CREATE TRIGGER trg_metrics_after_health
    AFTER INSERT OR UPDATE OR DELETE ON public.health_observations
    FOR EACH ROW EXECUTE FUNCTION public.optimized_cage_update_trigger();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_metrics_after_sales') THEN
    CREATE TRIGGER trg_metrics_after_sales
    AFTER INSERT OR UPDATE OR DELETE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION public.optimized_cage_update_trigger();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_metrics_after_costs') THEN
    CREATE TRIGGER trg_metrics_after_costs
    AFTER INSERT OR UPDATE OR DELETE ON public.cost_tracking
    FOR EACH ROW EXECUTE FUNCTION public.optimized_cage_update_trigger();
  END IF;
END$$;

-- 8) Generic BEFORE UPDATE updated_at triggers for all public.* tables having updated_at
DO $$
DECLARE
  rec RECORD;
  trig_name text;
BEGIN
  FOR rec IN SELECT table_schema, table_name
             FROM information_schema.columns
             WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    trig_name := 'trg_' || rec.table_name || '_updated_at';
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE t.tgname = trig_name AND n.nspname = rec.table_schema AND c.relname = rec.table_name
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON %I.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();',
        trig_name, rec.table_schema, rec.table_name
      );
    END IF;
  END LOOP;
END$$;
