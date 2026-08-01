DROP POLICY IF EXISTS "automation runs are public" ON public.automation_runs;

CREATE POLICY "automation runs viewable by authenticated users"
ON public.automation_runs
FOR SELECT
TO authenticated
USING (true);

REVOKE ALL ON public.automation_runs FROM anon;
GRANT SELECT ON public.automation_runs TO authenticated;
GRANT ALL ON public.automation_runs TO service_role;