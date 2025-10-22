-- Add policies for employees to view and manage their own employee records
CREATE POLICY "Employees can view their own employee record"
ON public.employees FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Employees can update their own employee record"
ON public.employees FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add policy for employees to view departments
CREATE POLICY "Employees can view departments"
ON public.departments FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'employee') OR
  public.has_role(auth.uid(), 'manager') OR
  public.has_role(auth.uid(), 'senior_manager')
);