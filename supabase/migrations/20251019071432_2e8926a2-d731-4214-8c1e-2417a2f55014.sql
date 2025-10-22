-- Update the trigger to handle all roles that need employee records
CREATE OR REPLACE FUNCTION public.handle_employee_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles%ROWTYPE;
BEGIN
  -- Handle employee, manager, and intern roles - they all need employee records
  IF NEW.role IN ('employee', 'manager', 'intern') THEN
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
    ON CONFLICT DO NOTHING;
    
    -- If it's a manager, also create a default team
    IF NEW.role = 'manager' THEN
      -- First, check if employee exists to get the ID
      DECLARE
        v_employee_id UUID;
      BEGIN
        SELECT id INTO v_employee_id
        FROM public.employees
        WHERE user_id = NEW.user_id;
        
        IF v_employee_id IS NOT NULL THEN
          -- Create a default team for the manager
          INSERT INTO public.teams (
            name,
            team_leader_id,
            description
          )
          VALUES (
            v_profile.full_name || '''s Team',
            v_employee_id,
            'Team managed by ' || v_profile.full_name
          )
          ON CONFLICT DO NOTHING;
        END IF;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;