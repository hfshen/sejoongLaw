"use client"

import { Badge } from "@/components/ui/Badge"
import Tabs from "@/components/ui/Tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Building2, FileText, Scale, Users, Shield, CheckCircle, DollarSign, Globe, TrendingUp } from "lucide-react"
import Link from "next/link"
import Button from "@/components/ui/Button"

export default function CorporatePage() {
  const tabs = [
    {
      id: "advisory",
      label: "기업자문 안내",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              기업의 성공적인 운영을 위해서는 법률적 리스크를 사전에 예방하고 관리하는 것이 중요합니다. 법무법인 세중은 기업의 법률 문제 해결을 위한 전문적인 자문 서비스를 제공합니다. 기업법무, 계약 검토, 규제 대응 등 전 분야를 지원합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              우리는 기업의 법률 문제를 해결하기 위해 체계적인 프로세스를 따릅니다. 먼저 기업의 법률 문제 현황을 파악하고 분석합니다. 그 다음 관련 법령 및 판례 검토를 통한 법적 검토를 진행하며, 법률적 위험을 최소화하는 해결 방안을 제시합니다. 제시된 방안의 실행을 지원하고 모니터링하며, 지속적인 법률 자문 및 사후 관리를 제공합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "기업법무 자문", desc: "기업 운영 전반에 대한 법률 자문 및 위험 관리", icon: <Building2 className="w-6 h-6" /> },
                { title: "계약서 검토 및 작성", desc: "각종 계약서의 법률 검토 및 작성 지원", icon: <FileText className="w-6 h-6" /> },
                { title: "규제 대응", desc: "공정거래법, 개인정보보호법 등 각종 규제 대응", icon: <Scale className="w-6 h-6" /> },
                { title: "노동법 자문", desc: "근로계약, 퇴직금, 부당해고 등 노동 관련 자문", icon: <Users className="w-6 h-6" /> },
                { title: "지적재산권", desc: "특허, 상표, 저작권 등 지적재산권 보호", icon: <Shield className="w-6 h-6" /> },
                { title: "기업 구조 자문", desc: "법인 설립, 조직 재편, 지배구조 개선 자문", icon: <CheckCircle className="w-6 h-6" /> },
              ].map((service, index) => (
                <Card key={index} hover>
                  <CardHeader>
                    <div className="text-primary mb-4">{service.icon}</div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-text-secondary">{service.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-secondary mb-4">처리 프로세스</h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: "상담 및 현황 파악", desc: "기업의 법률 문제 현황을 파악하고 분석합니다." },
                  { step: "2", title: "법률 검토", desc: "관련 법령 및 판례 검토를 통한 법적 검토" },
                  { step: "3", title: "해결 방안 제시", desc: "법률적 위험을 최소화하는 해결 방안 제시" },
                  { step: "4", title: "실행 지원", desc: "제시된 방안의 실행을 지원하고 모니터링" },
                  { step: "5", title: "후속 관리", desc: "지속적인 법률 자문 및 사후 관리" },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary mb-1">{item.title}</h4>
                      <p className="text-sm text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "m-a",
      label: "기업인수합병(M&A)",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              기업 인수합병(M&A)은 기업 성장과 시장 경쟁력 강화를 위한 중요한 전략입니다. 법무법인 세중은 M&A 관련 법률 서비스를 제공합니다. 기업 가치 평가, 계약서 작성, 인허가 절차 등 전 과정을 지원합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              우리는 M&A 사건에서 먼저 인수 대상 기업의 가치 평가와 실사(Due Diligence)를 진행합니다. 법률적, 재무적, 세무적 리스크를 파악하고, 인수합병 계약서와 주식양수도계약서를 작성합니다. 공정거래위원회 신고, 외국인투자 신고 등 필요한 인허가 절차를 대행하며, M&A 관련 세무 계획과 절세 방안을 제시합니다. 인수합병 시 발생하는 노동 문제도 해결하고, 합병, 분할, 전환 등 기업 구조 재편을 지원합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "기업 가치 평가", desc: "인수 대상 기업의 가치 평가 및 실사(Due Diligence)", icon: <DollarSign className="w-6 h-6" /> },
                { title: "M&A 계약서 작성", desc: "인수합병 계약서, 주식양수도계약서 등 각종 계약서 작성", icon: <FileText className="w-6 h-6" /> },
                { title: "인허가 절차", desc: "공정거래위원회 신고, 외국인투자 신고 등 인허가 절차 대행", icon: <CheckCircle className="w-6 h-6" /> },
                { title: "조세 자문", desc: "M&A 관련 세무 계획 및 절세 방안 제시", icon: <Scale className="w-6 h-6" /> },
                { title: "노동 문제", desc: "인수합병 시 발생하는 노동 문제 해결 및 대응", icon: <Users className="w-6 h-6" /> },
                { title: "기업 구조 재편", desc: "합병, 분할, 전환 등 기업 구조 재편 지원", icon: <Building2 className="w-6 h-6" /> },
              ].map((service, index) => (
                <Card key={index} hover>
                  <CardHeader>
                    <div className="text-primary mb-4">{service.icon}</div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-text-secondary">{service.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "overseas",
      label: "해외투자",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              해외투자는 기업의 글로벌 경쟁력 강화와 시장 확장을 위한 중요한 전략입니다. 법무법인 세중은 해외투자 관련 법률 서비스를 제공합니다. 해외투자 신고, 외국인투자 기업 설립, 해외 지사 설립 등 전 과정을 지원합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              우리는 해외투자 사건에서 먼저 투자 대상 국가의 법률 체계와 투자 환경을 분석합니다. 각 국가별로 다른 법률 체계와 투자 규제를 정확히 파악하여 투자 리스크를 최소화합니다. 외국인투자촉진법에 따른 외국인투자 신고와 외국인투자 기업 설립을 지원하며, 해외 지사나 현지 법인 설립도 지원합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              해외투자와 관련된 세무 계획과 절세 방안을 제시하고, 현지 법률과의 충돌을 방지하기 위한 법률 자문을 제공합니다. 또한 해외투자와 관련된 외환거래법 규제도 준수하도록 지원하며, 해외투자 관련 분쟁이 발생한 경우 국제 중재나 현지 소송을 통한 해결도 지원합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "해외 법인 설립", desc: "해외 국가별 법인 설립 및 인허가 절차 지원", icon: <Building2 className="w-6 h-6" /> },
                { title: "해외 M&A", desc: "해외 기업 인수합병 관련 법률 서비스", icon: <DollarSign className="w-6 h-6" /> },
                { title: "해외 투자 규제", desc: "외국인투자법, 외환거래법 등 해외 투자 규제 대응", icon: <Scale className="w-6 h-6" /> },
                { title: "국제 계약", desc: "해외 투자 관련 각종 계약서 작성 및 검토", icon: <FileText className="w-6 h-6" /> },
                { title: "세무 계획", desc: "해외 투자 관련 세무 계획 및 절세 방안", icon: <CheckCircle className="w-6 h-6" /> },
                { title: "분쟁 해결", desc: "해외 투자 관련 분쟁 해결 및 국제 중재", icon: <Globe className="w-6 h-6" /> },
              ].map((service, index) => (
                <Card key={index} hover>
                  <CardHeader>
                    <div className="text-primary mb-4">{service.icon}</div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-text-secondary">{service.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "finance",
      label: "부동산금융",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              부동산금융은 부동산 개발과 투자를 위한 자금 조달 방법입니다. 법무법인 세중은 부동산금융 관련 법률 서비스를 제공합니다. 부동산 담보대출, 프로젝트 파이낸싱, 부동산 펀드, REITs 등 다양한 부동산금융 상품에 대한 법률 자문을 제공합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              우리는 부동산금융 사건에서 먼저 부동산의 가치 평가와 담보 가치를 산정합니다. 부동산의 시장 가치와 담보 가치를 정확히 평가하여 적정한 대출 한도를 산정합니다. 금융기관과의 대출 계약서를 검토하고 작성하며, 대출 조건과 이자율, 상환 조건 등을 협상합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              프로젝트 파이낸싱의 경우 프로젝트 계약서와 금융 계약서를 모두 검토하여 프로젝트의 성공 가능성을 높입니다. 부동산 펀드의 경우 집합투자법에 따른 규제를 준수하도록 지원하며, 부동산금융과 관련된 세무 계획도 제시합니다. 부동산금융 관련 분쟁이 발생한 경우 소송을 통한 해결도 지원합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "부동산 담보대출", desc: "부동산 담보대출 계약 검토 및 분쟁 해결", icon: <DollarSign className="w-6 h-6" /> },
                { title: "프로젝트 파이낸싱", desc: "부동산 개발 프로젝트 파이낸싱 계약 검토", icon: <Building2 className="w-6 h-6" /> },
                { title: "부동산 펀드", desc: "부동산 펀드 설립, 운용, 해산 관련 자문", icon: <TrendingUp className="w-6 h-6" /> },
                { title: "REITs", desc: "부동산투자회사(REITs) 설립 및 운용 자문", icon: <Building2 className="w-6 h-6" /> },
                { title: "부동산 금융 규제", desc: "부동산금융 관련 규제 대응 및 인허가", icon: <Scale className="w-6 h-6" /> },
                { title: "계약서 검토", desc: "부동산금융 관련 각종 계약서 검토 및 작성", icon: <FileText className="w-6 h-6" /> },
              ].map((service, index) => (
                <Card key={index} hover>
                  <CardHeader>
                    <div className="text-primary mb-4">{service.icon}</div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-text-secondary">{service.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "indirect",
      label: "부동산간접투자",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              부동산간접투자는 부동산에 직접 투자하지 않고 간접적으로 투자하는 방법입니다. 법무법인 세중은 부동산간접투자 관련 법률 서비스를 제공합니다. 부동산 펀드, 리츠(REITs), 부동산 개발 프로젝트 투자 등 다양한 부동산간접투자 상품에 대한 법률 자문을 제공합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              우리는 부동산간접투자 사건에서 먼저 투자 대상 부동산의 가치와 수익성을 분석합니다. 부동산의 시장 가치, 임대 수익성, 향후 가치 상승 가능성 등을 종합적으로 분석하여 투자 가치를 평가합니다. 집합투자법과 자본시장법에 따른 규제를 준수하도록 지원하며, 투자 계약서와 운용 계약서를 검토하고 작성합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              부동산간접투자와 관련된 세무 계획과 절세 방안을 제시하고, 투자자 보호를 위한 법률 자문을 제공합니다. 특히 집합투자기구의 경우 투자자 보호를 위한 엄격한 규제가 있으므로, 이를 정확히 준수하도록 지원합니다. 부동산간접투자 관련 분쟁이 발생한 경우 소송을 통한 해결도 지원합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "부동산 펀드", desc: "부동산 펀드 설립, 운용, 해산 관련 자문", icon: <TrendingUp className="w-6 h-6" /> },
                { title: "REITs", desc: "부동산투자회사(REITs) 설립 및 운용 자문", icon: <Building2 className="w-6 h-6" /> },
                { title: "프로젝트 투자", desc: "부동산 개발 프로젝트 투자 계약 검토", icon: <DollarSign className="w-6 h-6" /> },
                { title: "투자자 보호", desc: "집합투자법에 따른 투자자 보호 자문", icon: <Shield className="w-6 h-6" /> },
                { title: "규제 대응", desc: "집합투자법, 자본시장법 등 규제 대응", icon: <Scale className="w-6 h-6" /> },
                { title: "세무 계획", desc: "부동산간접투자 관련 세무 계획 및 절세 방안", icon: <CheckCircle className="w-6 h-6" /> },
              ].map((service, index) => (
                <Card key={index} hover>
                  <CardHeader>
                    <div className="text-primary mb-4">{service.icon}</div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-text-secondary">{service.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container-max relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="primary" className="mb-6 text-sm md:text-base">
              기업자문
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              기업자문
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              기업의 법률 문제 해결을 위한 전문적인 자문 서비스를 제공합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-6xl mx-auto">
            <Tabs tabs={tabs} defaultTab="advisory" />
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-primary to-accent text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">지금 바로 상담받으세요</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            기업자문 전문 변호사가 직접 상담해드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                무료 상담 신청
              </Button>
            </Link>
            <Link href="tel:03180448805">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                전화 상담: 031-8044-8805
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

