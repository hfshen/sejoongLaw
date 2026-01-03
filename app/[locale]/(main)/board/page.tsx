import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { FileText, MessageSquare, Newspaper, Award, ArrowRight, Calendar } from "lucide-react"
import Button from "@/components/ui/Button"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "상담게시판 | 법무법인 세중",
  description: "최근업무사례, 온라인상담 Q/A, 세중 칼럼, 최신뉴스를 확인하세요.",
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

const boardCategories = [
  {
    key: "cases",
    title: "최근업무사례",
    description: "법무법인 세중의 최근 업무 사례를 확인하세요.",
    icon: <Award className="w-6 h-6" />,
    href: "/board",
    color: "primary",
  },
  {
    key: "qa",
    title: "온라인상담 Q/A",
    description: "자주 묻는 질문과 답변을 확인하세요.",
    icon: <MessageSquare className="w-6 h-6" />,
    href: "/board/qa",
    color: "default",
  },
  {
    key: "column",
    title: "세중 칼럼",
    description: "전문 변호사의 법률 칼럼을 읽어보세요.",
    icon: <FileText className="w-6 h-6" />,
    href: "/board/column",
    color: "success",
  },
  {
    key: "news",
    title: "최신뉴스",
    description: "법무법인 세중의 최신 소식을 확인하세요.",
    icon: <Newspaper className="w-6 h-6" />,
    href: "/board/news",
    color: "default",
  },
]

export default async function BoardPage() {
  const posts = await getBoardPosts()

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
              상담게시판
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              상담게시판
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              최근업무사례, 온라인상담, 칼럼, 뉴스 등 다양한 정보를 확인하세요.
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
                      자세히 보기
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
            <h2 className="section-title mb-0">최근업무사례</h2>
            <Link href="/board/write">
              <Button variant="outline">
                글쓰기
              </Button>
            </Link>
          </div>

          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-text-secondary mb-4">
                  등록된 업무사례가 없습니다.
                </p>
                <Link href="/board/write">
                  <Button>첫 글 작성하기</Button>
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
                          업무사례
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
                        자세히 보기
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

