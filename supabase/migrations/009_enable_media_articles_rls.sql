-- Enable Row Level Security for media_articles tables
ALTER TABLE media_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_articles_i18n ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_articles
-- Public read access (anyone can view published articles)
CREATE POLICY "Anyone can view media articles"
  ON media_articles FOR SELECT
  USING (true);

-- Admin users can manage media articles
CREATE POLICY "Admin users can manage media articles"
  ON media_articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- RLS Policies for media_articles_i18n
-- Public read access (anyone can view i18n content)
CREATE POLICY "Anyone can view media articles i18n"
  ON media_articles_i18n FOR SELECT
  USING (true);

-- Admin users can manage media articles i18n
CREATE POLICY "Admin users can manage media articles i18n"
  ON media_articles_i18n FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );
