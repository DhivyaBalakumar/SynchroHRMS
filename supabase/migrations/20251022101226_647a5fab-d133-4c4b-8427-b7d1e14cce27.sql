-- Enable policies for employees to manage their own attendance
CREATE POLICY "Employees can view their own attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id = auth.uid()
    AND employees.id = attendance.employee_id
  )
);

CREATE POLICY "Employees can insert their own attendance"
ON public.attendance FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id = auth.uid()
    AND employees.id = attendance.employee_id
  )
);

CREATE POLICY "Employees can update their own attendance"
ON public.attendance FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id = auth.uid()
    AND employees.id = attendance.employee_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees
    WHERE employees.user_id = auth.uid()
    AND employees.id = attendance.employee_id
  )
);

-- Also add policy for managers to view team attendance
CREATE POLICY "Managers can view team attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager') OR
  public.has_role(auth.uid(), 'senior_manager')
);