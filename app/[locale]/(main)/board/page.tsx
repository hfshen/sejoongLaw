import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { FileText, MessageSquare, Newspaper, Award, ArrowRight, Calendar } from "lucide-react"
import Button from "@/components/ui/Button"

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: `${t("pages.board.title")} | ${t("common.title")}`,
    description: t("pages.board.description"),
  }
}

async function getBoardPosts() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("board_posts")
      .select("*")
      .eq("category", "cases")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching board posts:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getBoardPosts:", error)
    return []
  }
}

export default async function BoardPage() {
  const t = await getTranslations("pages.board")
  const posts = await getBoardPosts()

  const boardCategories = [
    {
      key: "cases",
      title: t("categories.cases.title"),
      description: t("categories.cases.description"),
      icon: <Award className="w-6 h-6" />,
      href: "/board",
      color: "primary",
    },
    {
      key: "qa",
      title: t("categories.qa.title"),
      description: t("categories.qa.description"),
      icon: <MessageSquare className="w-6 h-6" />,
      href: "/board/qa",
      color: "default",
    },
    {
      key: "column",
      title: t("categories.column.title"),
      description: t("categories.column.description"),
      icon: <FileText className="w-6 h-6" />,
      href: "/board/column",
      color: "success",
    },
    {
      key: "news",
      title: t("categories.news.title"),
      description: t("categories.news.description"),
      icon: <Newspaper className="w-6 h-6" />,
      href: "/board/news",
      color: "default",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container-max relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-6 text-sm md:text-base">
              {t("title")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              {t("title")}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              {t("description")}
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {boardCategories.map((category) => (
              <Link key={category.key} href={category.href}>
                <Card hover className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-primary mb-4 flex justify-center">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-secondary mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-center text-primary font-semibold text-sm">
                      {t("viewMore")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Cases */}
      <section className="section-padding bg-background-alt">
        <div className="container-max">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title mb-0">{t("categories.cases.title")}</h2>
            <Link href="/board/write">
              <Button variant="outline">
                {t("write")}
              </Button>
            </Link>
          </div>

          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-text-secondary mb-4">
                  {t("noPosts")}
                </p>
                <Link href="/board/write">
                  <Button>{t("writeFirst")}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <Link key={post.id} href={`/board/${post.id}`}>
                  <Card hover className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="primary" className="text-xs">
                          {t("categories.cases.title")}
                        </Badge>
                        <span className="text-xs text-text-secondary">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(post.created_at).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-secondary mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-text-secondary line-clamp-3 mb-4">
                        {post.content}
                      </p>
                      <div className="flex items-center text-primary font-semibold text-sm">
                        {t("viewMore")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

