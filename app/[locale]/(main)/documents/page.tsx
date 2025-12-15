import { getTranslations } from "next-intl/server"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import DocumentGenerator from "@/components/documents/DocumentGenerator"
import { Card, CardContent } from "@/components/ui/Card"
import { FileText, CheckCircle, Download, Mail } from "lucide-react"

export async function generateMetadata() {
  const t = await getTranslations()
  return {
    title: "법률 문서 생성 | 법무법인 세중",
    description:
      "상담 신청서, 계약서 검토 요청서, 증명서 요청서 등 필요한 법률 문서를 자동으로 생성하세요.",
  }
}

export default async function DocumentsPage() {
  const t = await getTranslations()

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "다양한 문서 템플릿",
      description: "상담 신청서부터 계약서까지 다양한 법률 문서를 제공합니다.",
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "즉시 PDF 다운로드",
      description: "생성된 문서를 즉시 PDF로 다운로드할 수 있습니다.",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "이메일 자동 발송",
      description: "생성된 문서가 자동으로 이메일로 발송됩니다.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "법률 전문가 검토",
      description: "생성된 문서는 전문 변호사가 검토합니다.",
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background section-padding">
        <div className="container-max">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="section-title">법률 문서 생성</h1>
              <p className="body-text max-w-2xl mx-auto">
                필요한 법률 문서를 간편하게 생성하세요.
                <br />
                상담 신청서, 계약서 검토 요청서, 증명서 요청서 등을 자동으로
                생성할 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <DocumentGenerator />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">주요 기능</h3>
                    <div className="space-y-4">
                      {features.map((feature, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="text-primary flex-shrink-0 mt-1">
                            {feature.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-xs text-text-secondary">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">안내사항</h3>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• 생성된 문서는 법무법인 세중에서 검토합니다.</li>
                      <li>• 문서는 PDF 형식으로 다운로드됩니다.</li>
                      <li>• 이메일로도 자동 발송됩니다.</li>
                      <li>• 추가 수정이 필요한 경우 상담을 통해 안내받으실 수 있습니다.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

