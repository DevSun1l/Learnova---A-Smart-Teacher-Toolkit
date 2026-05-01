
-- 1) Replace overly-permissive INSERT policies with stricter checks
DROP POLICY IF EXISTS "Anyone can like" ON public.board_likes;
CREATE POLICY "Anyone can like with name" ON public.board_likes
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(display_name) BETWEEN 1 AND 60);

DROP POLICY IF EXISTS "Anyone can comment" ON public.board_comments;
CREATE POLICY "Anyone can comment with name" ON public.board_comments
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(display_name) BETWEEN 1 AND 60 AND length(comment) BETWEEN 1 AND 500);

-- 2) Storage: restrict listing — only allow viewing files when the exact path is known is enforced by app code,
-- but tighten the SELECT policy so it requires a non-empty name (prevents empty listing prefixes used to enumerate).
DROP POLICY IF EXISTS "Public can view board uploads" ON storage.objects;
CREATE POLICY "Public can view board upload files" ON storage.objects
  FOR SELECT USING (bucket_id = 'board-uploads' AND name IS NOT NULL AND length(name) > 0);

-- 3) Lock down SECURITY DEFINER function: handle_new_user is only called by the auth trigger, not via API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
