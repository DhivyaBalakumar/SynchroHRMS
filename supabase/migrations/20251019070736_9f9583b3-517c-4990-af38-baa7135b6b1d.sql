-- Function to auto-create employee record when user signs up with employee role
CREATE OR REPLACE FUNCTION public.handle_employee_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
BEGIN
  -- Only proceed if the role is 'employee'
  IF NEW.role = 'employee' THEN
    -- Get profile information
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Create employee record if it doesn't exist
    INSERT INTO public.employees (
      user_id,
      email,
      full_name,
      employee_id,
      status,
      hire_date
    )
    VALUES (
      NEW.user_id,
      v_profile.email,
      v_profile.full_name,
      'EMP' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0'),
      'active',
      CURRENT_DATE
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically create employee record when employee role is assigned
DROP TRIGGER IF EXISTS on_employee_role_assigned ON public.user_roles;
CREATE TRIGGER on_employee_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_employee_role_assignment();