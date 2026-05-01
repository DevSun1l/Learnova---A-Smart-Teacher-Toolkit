
-- =========== Helper: updated_at trigger ===========
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =========== Profiles ===========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  school TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Teachers can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email, school)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'school', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========== Students ===========
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  roll_number INT NOT NULL,
  name TEXT NOT NULL,
  points INT NOT NULL DEFAULT 0,
  badges TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_students_teacher ON public.students(teacher_id);

CREATE POLICY "Teachers manage own students - select" ON public.students
  FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers manage own students - insert" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers manage own students - update" ON public.students
  FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers manage own students - delete" ON public.students
  FOR DELETE USING (auth.uid() = teacher_id);

CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========== Behavior logs ===========
CREATE TABLE public.behavior_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  points_change INT NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.behavior_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_behavior_logs_teacher ON public.behavior_logs(teacher_id);

CREATE POLICY "Teachers view own behavior logs" ON public.behavior_logs
  FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers insert own behavior logs" ON public.behavior_logs
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- =========== Class boards ===========
CREATE TABLE public.class_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.class_boards ENABLE ROW LEVEL SECURITY;

-- Teachers can fully manage their own boards
CREATE POLICY "Teachers manage own boards - select" ON public.class_boards
  FOR SELECT USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers manage own boards - insert" ON public.class_boards
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers manage own boards - delete" ON public.class_boards
  FOR DELETE USING (auth.uid() = teacher_id);

-- Anyone (incl. anon) can look up a board by code
CREATE POLICY "Anyone can view boards" ON public.class_boards
  FOR SELECT TO anon, authenticated USING (true);

-- =========== Board posts ===========
CREATE TABLE public.board_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.class_boards(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  category TEXT NOT NULL DEFAULT 'activity',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_board_posts_board ON public.board_posts(board_id);

CREATE POLICY "Anyone can view board posts" ON public.board_posts
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Teachers create posts in own boards" ON public.board_posts
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers delete own posts" ON public.board_posts
  FOR DELETE USING (auth.uid() = teacher_id);

-- =========== Board likes ===========
CREATE TABLE public.board_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.board_posts(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.board_likes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_board_likes_post ON public.board_likes(post_id);

CREATE POLICY "Anyone can view likes" ON public.board_likes
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can like" ON public.board_likes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =========== Board comments ===========
CREATE TABLE public.board_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.board_posts(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.board_comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_board_comments_post ON public.board_comments(post_id);

CREATE POLICY "Anyone can view comments" ON public.board_comments
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can comment" ON public.board_comments
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =========== Storage bucket for board uploads ===========
INSERT INTO storage.buckets (id, name, public) VALUES ('board-uploads', 'board-uploads', true);

CREATE POLICY "Public can view board uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'board-uploads');
CREATE POLICY "Authenticated can upload board files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'board-uploads');
CREATE POLICY "Teachers can delete own board files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'board-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
