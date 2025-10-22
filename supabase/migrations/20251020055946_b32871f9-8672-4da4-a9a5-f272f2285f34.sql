-- Add INSERT policy for employees to create their own attendance records
CREATE POLICY "Employees can create their own attendance"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);

-- Add UPDATE policy for employees to update their own attendance (for sign out)
CREATE POLICY "Employees can update their own attendance"
ON public.attendance
FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees WHERE user_id = auth.uid()
  )
);