CREATE POLICY "Teachers manage own boards - update" ON public.class_boards
  FOR UPDATE USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);
