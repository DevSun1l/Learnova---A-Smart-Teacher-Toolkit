DELETE FROM public.board_likes existing
USING public.board_likes duplicate
WHERE existing.post_id = duplicate.post_id
  AND lower(btrim(existing.display_name)) = lower(btrim(duplicate.display_name))
  AND (existing.created_at, existing.id) > (duplicate.created_at, duplicate.id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_board_likes_one_per_student_per_post
  ON public.board_likes (post_id, lower(btrim(display_name)));

CREATE POLICY "Anyone can remove own named like" ON public.board_likes
  FOR DELETE TO anon, authenticated
  USING (length(display_name) BETWEEN 1 AND 60);
