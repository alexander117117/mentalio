-- ============================================================
-- Mentalio — Supabase Schema
-- Запусти этот файл в Supabase Dashboard → SQL Editor
-- ============================================================

-- Profiles (linked to auth.users)
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  name        text not null,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Communities ──────────────────────────────────────────
create table public.communities (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  avatar_url    text,
  banner_url    text,
  is_private    boolean default false,
  created_by    uuid references public.profiles(id) on delete cascade not null,
  members_count int default 0,
  created_at    timestamptz default now()
);
alter table public.communities enable row level security;
create policy "Communities viewable by everyone" on public.communities for select using (true);
create policy "Authenticated users can create communities" on public.communities for insert with check (auth.uid() = created_by);
create policy "Creator can update community" on public.communities for update using (auth.uid() = created_by);
create policy "Creator can delete community" on public.communities for delete using (auth.uid() = created_by);

create table public.community_members (
  community_id uuid references public.communities(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete cascade,
  joined_at    timestamptz default now(),
  primary key (community_id, user_id)
);
alter table public.community_members enable row level security;
create policy "Members visible to all" on public.community_members for select using (true);
create policy "Users can join communities" on public.community_members for insert with check (auth.uid() = user_id);
create policy "Users can leave communities" on public.community_members for delete using (auth.uid() = user_id);

-- Auto-update members_count
create or replace function public.update_community_members_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.communities set members_count = members_count + 1 where id = NEW.community_id;
  elsif TG_OP = 'DELETE' then
    update public.communities set members_count = members_count - 1 where id = OLD.community_id;
  end if;
  return null;
end;
$$;
create trigger on_community_member_change
  after insert or delete on public.community_members
  for each row execute procedure public.update_community_members_count();

-- ─── Posts ────────────────────────────────────────────────
create table public.posts (
  id             uuid primary key default gen_random_uuid(),
  community_id   uuid references public.communities(id) on delete cascade not null,
  author_id      uuid references public.profiles(id) on delete cascade not null,
  title          text,
  content        text not null,
  type           text check (type in ('forum', 'feed')) default 'feed',
  images         text[],
  likes_count    int default 0,
  comments_count int default 0,
  created_at     timestamptz default now()
);
alter table public.posts enable row level security;
create policy "Posts viewable by everyone" on public.posts for select using (true);
create policy "Authenticated users can post" on public.posts for insert with check (auth.uid() = author_id);
create policy "Authors can update posts" on public.posts for update using (auth.uid() = author_id);
create policy "Authors can delete posts" on public.posts for delete using (auth.uid() = author_id);

create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);
alter table public.post_likes enable row level security;
create policy "Likes viewable by everyone" on public.post_likes for select using (true);
create policy "Users can like" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike" on public.post_likes for delete using (auth.uid() = user_id);

create or replace function public.update_post_likes_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set likes_count = likes_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$;
create trigger on_post_like_change
  after insert or delete on public.post_likes
  for each row execute procedure public.update_post_likes_count();

create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid references public.posts(id) on delete cascade not null,
  author_id   uuid references public.profiles(id) on delete cascade not null,
  content     text not null,
  likes_count int default 0,
  created_at  timestamptz default now()
);
alter table public.comments enable row level security;
create policy "Comments viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can comment" on public.comments for insert with check (auth.uid() = author_id);
create policy "Authors can delete comments" on public.comments for delete using (auth.uid() = author_id);

create or replace function public.update_post_comments_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set comments_count = comments_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$;
create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute procedure public.update_post_comments_count();

-- ─── Classrooms ───────────────────────────────────────────
create table public.classrooms (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  description    text,
  thumbnail_url  text,
  instructor_id  uuid references public.profiles(id) on delete cascade not null,
  is_public      boolean default true,
  students_count int default 0,
  courses_count  int default 0,
  created_at     timestamptz default now()
);
alter table public.classrooms enable row level security;
create policy "Classrooms viewable by everyone" on public.classrooms for select using (true);
create policy "Authenticated users can create classrooms" on public.classrooms for insert with check (auth.uid() = instructor_id);
create policy "Instructor can update classroom" on public.classrooms for update using (auth.uid() = instructor_id);
create policy "Instructor can delete classroom" on public.classrooms for delete using (auth.uid() = instructor_id);

create table public.classroom_enrollments (
  classroom_id uuid references public.classrooms(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete cascade,
  enrolled_at  timestamptz default now(),
  primary key (classroom_id, user_id)
);
alter table public.classroom_enrollments enable row level security;
create policy "Enrollments viewable by everyone" on public.classroom_enrollments for select using (true);
create policy "Users can enroll" on public.classroom_enrollments for insert with check (auth.uid() = user_id);
create policy "Users can unenroll" on public.classroom_enrollments for delete using (auth.uid() = user_id);

create or replace function public.update_classroom_students_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.classrooms set students_count = students_count + 1 where id = NEW.classroom_id;
  elsif TG_OP = 'DELETE' then
    update public.classrooms set students_count = students_count - 1 where id = OLD.classroom_id;
  end if;
  return null;
end;
$$;
create trigger on_classroom_enrollment_change
  after insert or delete on public.classroom_enrollments
  for each row execute procedure public.update_classroom_students_count();

-- ─── Courses & Lessons ────────────────────────────────────
create table public.courses (
  id            uuid primary key default gen_random_uuid(),
  classroom_id  uuid references public.classrooms(id) on delete cascade not null,
  title         text not null,
  description   text,
  thumbnail_url text,
  lessons_count int default 0,
  duration      int default 0,
  created_at    timestamptz default now()
);
alter table public.courses enable row level security;
create policy "Courses viewable by everyone" on public.courses for select using (true);
create policy "Instructor can manage courses" on public.courses for all using (
  auth.uid() = (select instructor_id from public.classrooms where id = classroom_id)
);

create table public.lessons (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid references public.courses(id) on delete cascade not null,
  title        text not null,
  video_url    text,
  duration     int default 0,
  lesson_order int default 0,
  is_draft     boolean default false,
  created_at   timestamptz default now()
);
alter table public.lessons enable row level security;
create policy "Published lessons viewable by everyone" on public.lessons for select using (not is_draft or
  auth.uid() = (select c.instructor_id from public.classrooms c join public.courses co on co.classroom_id = c.id where co.id = course_id)
);
create policy "Instructor can manage lessons" on public.lessons for all using (
  auth.uid() = (select c.instructor_id from public.classrooms c join public.courses co on co.classroom_id = c.id where co.id = course_id)
);

create table public.materials (
  id        uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  title     text not null,
  type      text check (type in ('pdf', 'link', 'file')),
  url       text not null
);
alter table public.materials enable row level security;
create policy "Materials viewable by everyone" on public.materials for select using (true);
create policy "Instructor can manage materials" on public.materials for all using (
  auth.uid() = (select c.instructor_id from public.classrooms c
    join public.courses co on co.classroom_id = c.id
    join public.lessons l on l.course_id = co.id
    where l.id = lesson_id)
);

create table public.quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  lesson_id      uuid references public.lessons(id) on delete cascade not null,
  question_text  text not null,
  question_type  text check (question_type in ('single', 'multiple')),
  question_order int default 0
);
alter table public.quiz_questions enable row level security;
create policy "Quiz questions viewable by everyone" on public.quiz_questions for select using (true);
create policy "Instructor can manage quiz questions" on public.quiz_questions for all using (
  auth.uid() = (select c.instructor_id from public.classrooms c
    join public.courses co on co.classroom_id = c.id
    join public.lessons l on l.course_id = co.id
    where l.id = lesson_id)
);

create table public.quiz_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid references public.quiz_questions(id) on delete cascade not null,
  option_text text not null,
  is_correct  boolean default false
);
alter table public.quiz_options enable row level security;
create policy "Quiz options viewable by everyone" on public.quiz_options for select using (true);
create policy "Instructor can manage quiz options" on public.quiz_options for all using (
  auth.uid() = (select c.instructor_id from public.classrooms c
    join public.courses co on co.classroom_id = c.id
    join public.lessons l on l.course_id = co.id
    join public.quiz_questions q on q.lesson_id = l.id
    where q.id = question_id)
);

create table public.lesson_completions (
  lesson_id    uuid references public.lessons(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete cascade,
  completed_at timestamptz default now(),
  primary key (lesson_id, user_id)
);
alter table public.lesson_completions enable row level security;
create policy "Users can view own completions" on public.lesson_completions for select using (auth.uid() = user_id);
create policy "Users can mark lessons completed" on public.lesson_completions for insert with check (auth.uid() = user_id);

-- ─── Live Streams ─────────────────────────────────────────
create table public.live_streams (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  host_id        uuid references public.profiles(id) on delete cascade not null,
  stream_url     text not null,
  thumbnail_url  text,
  scheduled_at   timestamptz,
  started_at     timestamptz,
  status         text check (status in ('scheduled', 'live', 'ended')) default 'scheduled',
  viewers_count  int default 0,
  platform       text check (platform in ('youtube', 'zoom', 'other')) default 'other',
  community_id   uuid references public.communities(id) on delete set null,
  created_at     timestamptz default now()
);
alter table public.live_streams enable row level security;
create policy "Live streams viewable by everyone" on public.live_streams for select using (true);
create policy "Host can manage streams" on public.live_streams for all using (auth.uid() = host_id);

-- ─── Messages (DM) ────────────────────────────────────────
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);
alter table public.messages enable row level security;
create policy "Users can view own messages" on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Receiver can mark as read" on public.messages for update using (auth.uid() = receiver_id);
