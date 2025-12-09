-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create a new policy that requires authentication to view profiles
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT TO authenticated
  USING (true);