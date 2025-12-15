-- 다국어 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS page_contents_i18n (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_content_id UUID REFERENCES page_contents(id) ON DELETE CASCADE,
  locale TEXT NOT NULL, -- 'ko', 'en', 'zh-CN' 등
  title TEXT NOT NULL,
  content TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_content_id, locale)
);

-- 구성원 다국어 정보
CREATE TABLE IF NOT EXISTS members_i18n (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  introduction TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, locale)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_page_contents_i18n_locale ON page_contents_i18n(locale);
CREATE INDEX IF NOT EXISTS idx_page_contents_i18n_content_id ON page_contents_i18n(page_content_id);
CREATE INDEX IF NOT EXISTS idx_members_i18n_locale ON members_i18n(locale);
CREATE INDEX IF NOT EXISTS idx_members_i18n_member_id ON members_i18n(member_id);

-- RLS 정책
ALTER TABLE page_contents_i18n ENABLE ROW LEVEL SECURITY;
ALTER TABLE members_i18n ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Anyone can view page contents i18n"
  ON page_contents_i18n FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view members i18n"
  ON members_i18n FOR SELECT
  USING (true);

