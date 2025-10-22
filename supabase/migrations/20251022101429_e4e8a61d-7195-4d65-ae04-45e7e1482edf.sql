-- Update handle_new_user to also create employee record for employee role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- Insert user role from metadata
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'role')::app_role
    )
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  END IF;
  
  -- Create employee record if role is employee
  IF NEW.raw_user_meta_data->>'role' = 'employee' THEN
    INSERT INTO public.employees (
      user_id,
      full_name,
      email,
      phone,
      position,
      hire_date,
      employee_id,
      employment_status
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      'Employee',
      CURRENT_DATE,
      'EMP' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS'),
      'active'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;