-- Allow public job applications (anonymous users can submit resumes)
DROP POLICY IF EXISTS "Anyone can submit job applications" ON resumes;
DROP POLICY IF EXISTS "Public can insert resumes" ON resumes;

CREATE POLICY "Public can submit job applications"
ON resumes
FOR INSERT
WITH CHECK (true);

-- Allow HR to view all resumes
DROP POLICY IF EXISTS "HR can view all resumes" ON resumes;

CREATE POLICY "HR can view all resumes"
ON resumes
FOR SELECT
USING (has_role(auth.uid(), 'hr'::app_role));

-- Allow HR to update resumes
DROP POLICY IF EXISTS "HR can update resumes" ON resumes;

CREATE POLICY "HR can update resumes"
ON resumes
FOR UPDATE
USING (has_role(auth.uid(), 'hr'::app_role));

-- Allow public to insert candidates
DROP POLICY IF EXISTS "Public can create candidates" ON candidates;

CREATE POLICY "Public can create candidates"
ON candidates
FOR INSERT
WITH CHECK (true);