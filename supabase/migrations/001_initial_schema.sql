-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Members table (구성원 정보)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT, -- 대표 변호사, 변호사 등
  profile_image_url TEXT,
  introduction TEXT,
  specialties TEXT[], -- 전문 분야 배열
  education TEXT[],
  career TEXT[],
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page contents table (웹 아카이브 콘텐츠 저장)
CREATE TABLE IF NOT EXISTS page_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_path TEXT UNIQUE NOT NULL, -- 예: '/litigation/divorce'
  title TEXT NOT NULL,
  content TEXT, -- HTML 또는 마크다운
  meta_description TEXT,
  branch TEXT, -- 'headquarter', 'uijeongbu', 'ansan', 'all'
  section TEXT, -- 'litigation', 'corporate', 'immigration' 등
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inquiries table (문의 게시글)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  branch TEXT NOT NULL, -- 'headquarter', 'uijeongbu', 'ansan'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'answered', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inquiry responses table (관리자 답변)
CREATE TABLE IF NOT EXISTS inquiry_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table (관리자 계정)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  branch TEXT, -- 'headquarter', 'uijeongbu', 'ansan', 'all'
  role TEXT DEFAULT 'admin', -- 'admin', 'super_admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News articles table (언론기사)
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  source TEXT,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Board posts table (게시판)
CREATE TABLE IF NOT EXISTS board_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'cases', 'qa', 'column', 'news'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_page_contents_route ON page_contents(route_path);
CREATE INDEX IF NOT EXISTS idx_page_contents_branch ON page_contents(branch);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_branch ON inquiries(branch);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_board_posts_category ON board_posts(category);
CREATE INDEX IF NOT EXISTS idx_board_posts_published ON board_posts(is_published);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for members (public read)
CREATE POLICY "Anyone can view members"
  ON members FOR SELECT
  USING (true);

-- RLS Policies for page_contents (public read)
CREATE POLICY "Anyone can view page contents"
  ON page_contents FOR SELECT
  USING (true);

-- RLS Policies for inquiries
CREATE POLICY "Users can create inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for admins
CREATE POLICY "Admins can view all inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND (admins.branch = inquiries.branch OR admins.branch = 'all')
    )
  );

-- RLS Policies for inquiry_responses
CREATE POLICY "Admins can create responses"
  ON inquiry_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view responses to their inquiries"
  ON inquiry_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = inquiry_responses.inquiry_id
      AND inquiries.user_id = auth.uid()
    )
  );

-- RLS Policies for board_posts
CREATE POLICY "Anyone can view published posts"
  ON board_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can create posts"
  ON board_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for news_articles (public read)
CREATE POLICY "Anyone can view news articles"
  ON news_articles FOR SELECT
  USING (true);

