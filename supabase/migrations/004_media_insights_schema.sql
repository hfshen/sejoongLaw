-- 미디어 콘텐츠 관리용 테이블
CREATE TABLE IF NOT EXISTS media_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('column', 'case', 'news')),
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES members(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 미디어 콘텐츠 다국어 지원
CREATE TABLE IF NOT EXISTS media_articles_i18n (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES media_articles(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, locale)
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_media_articles_type ON media_articles(type);
CREATE INDEX IF NOT EXISTS idx_media_articles_published_at ON media_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_articles_is_featured ON media_articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_media_articles_i18n_locale ON media_articles_i18n(locale);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_media_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_articles_updated_at
  BEFORE UPDATE ON media_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_media_articles_updated_at();

CREATE TRIGGER update_media_articles_i18n_updated_at
  BEFORE UPDATE ON media_articles_i18n
  FOR EACH ROW
  EXECUTE FUNCTION update_media_articles_updated_at();

