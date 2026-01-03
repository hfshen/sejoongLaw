"use client"

import { Badge } from "@/components/ui/Badge"
import Tabs from "@/components/ui/Tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Scale, FileText, Users, CheckCircle, DollarSign, Shield, Heart, Globe, AlertTriangle, Car, Building2 } from "lucide-react"
import Link from "next/link"
import Button from "@/components/ui/Button"

export default function LitigationPage() {
  const tabs = [
    {
      id: "real-estate",
      label: "부동산분쟁",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              부동산은 우리 삶의 중요한 자산이며, 부동산 관련 분쟁은 복잡하고 전문적인 법률 지식이 필요합니다. 법무법인 세중은 부동산 계약, 소유권 분쟁, 임대차 분쟁, 건설 분쟁 등 모든 부동산 관련 법률 문제를 전문적으로 해결합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              우리는 부동산 분쟁 해결을 위해 체계적인 접근 방식을 채택하고 있습니다. 먼저 고객과의 상담을 통해 사건의 전반적인 상황을 파악하고, 관련 서류와 증거 자료를 철저히 수집합니다. 그 다음 법률적 검토를 통해 최적의 해결 방안을 제시하며, 협상을 통해 조정 가능성을 모색합니다. 협상이 불가능한 경우에는 소송을 통해 고객의 권리를 보호합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "부동산 계약 분쟁", desc: "매매계약, 전세계약, 임대차계약 등 부동산 계약 관련 분쟁 해결", icon: <FileText className="w-6 h-6" /> },
                { title: "소유권 분쟁", desc: "등기부등본 오류, 명의신탁, 소유권 이전 등 소유권 관련 분쟁", icon: <Scale className="w-6 h-6" /> },
                { title: "임대차 분쟁", desc: "전세금 반환, 보증금 반환, 계약 갱신 등 임대차 관련 분쟁", icon: <Users className="w-6 h-6" /> },
                { title: "건설 분쟁", desc: "하자보수, 공사 지연, 계약 해지 등 건설 관련 분쟁", icon: <CheckCircle className="w-6 h-6" /> },
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
                  { step: "1", title: "상담 및 사건 분석", desc: "고객과 상담을 통해 사건의 전반적인 상황을 파악하고 분석합니다." },
                  { step: "2", title: "증거 수집 및 조사", desc: "관련 서류, 계약서, 증거 자료를 수집하고 법적 검토를 진행합니다." },
                  { step: "3", title: "법률 검토 및 전략 수립", desc: "수집한 자료를 바탕으로 법률적 검토를 하고 해결 전략을 수립합니다." },
                  { step: "4", title: "협상 및 조정", desc: "상대방과의 협상을 통해 조정 가능성을 모색합니다." },
                  { step: "5", title: "소송 진행 (필요시)", desc: "협상이 불가능한 경우 소송을 통해 고객의 권리를 보호합니다." },
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
      id: "divorce",
      label: "이혼/국제이혼",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              이혼은 인생의 중요한 전환점이며, 이혼 과정에서 발생하는 법률 문제는 신중하고 전문적인 접근이 필요합니다. 법무법인 세중은 재판상 이혼, 협의 이혼, 재산분할, 위자료, 양육권 등 이혼 관련 모든 법률 문제를 전문적으로 해결합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              특히 국제이혼의 경우, 서로 다른 국가의 법률 체계와 언어적 장벽으로 인해 더욱 복잡합니다. 우리는 내국인과 외국인 간의 이혼 사건에서 풍부한 경험을 보유하고 있으며, 국제사법과 각국의 가족법을 정확히 이해하고 적용합니다. 또한 양육권, 면접교섭권, 재산분할 등 후속 문제까지 종합적으로 해결합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "재판상 이혼", desc: "협의 이혼이 불가능한 경우 재판을 통한 이혼 절차 진행", icon: <Scale className="w-6 h-6" /> },
                { title: "협의 이혼", desc: "부부 간 합의를 통한 이혼 협상 및 이혼서류 작성", icon: <FileText className="w-6 h-6" /> },
                { title: "재산분할", desc: "혼인 중 형성된 재산의 공정한 분할 및 청구", icon: <Shield className="w-6 h-6" /> },
                { title: "위자료 청구", desc: "이혼 원인 제공자에 대한 위자료 청구 및 협상", icon: <Heart className="w-6 h-6" /> },
                { title: "양육권 및 친권", desc: "자녀의 양육권자 지정 및 친권자 결정", icon: <Users className="w-6 h-6" /> },
                { title: "국제이혼", desc: "내국인과 외국인 간의 이혼 및 가사분쟁 해결", icon: <Globe className="w-6 h-6" /> },
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
      id: "inheritance",
      label: "상속분쟁",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              상속은 조상으로부터 물려받는 재산이지만, 상속 과정에서 발생하는 분쟁은 가족 간의 감정적 갈등과 법적 복잡성이 얽혀 있어 신중한 접근이 필요합니다. 법무법인 세중은 상속재산분할, 유류분반환청구, 상속회복청구 등 상속 관련 모든 법률 문제를 전문적으로 해결합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              우리는 상속 분쟁 해결을 위해 먼저 상속재산의 범위를 정확히 파악하고, 각 상속인의 상속 지분을 산정합니다. 유류분 권리자가 있는 경우 유류분 반환청구를 지원하며, 상속권이 침해된 경우 상속회복청구 소송을 진행합니다. 또한 상속 전 단계에서 상속계획을 수립하고 유언을 작성하는 것도 지원합니다. 상속세 절세를 위한 법률 자문도 제공하여 고객의 부담을 최소화합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "상속재산분할", desc: "상속재산의 공정한 분할 및 분할 협상", icon: <DollarSign className="w-6 h-6" /> },
                { title: "유류분반환청구", desc: "유류분 권리자의 권리 보호 및 반환청구", icon: <Shield className="w-6 h-6" /> },
                { title: "상속회복청구", desc: "상속권 침해에 대한 회복청구 소송", icon: <Scale className="w-6 h-6" /> },
                { title: "유언 및 상속계획", desc: "상속 전 단계의 상속계획 수립 및 유언 작성", icon: <FileText className="w-6 h-6" /> },
                { title: "상속세 절세", desc: "상속세 절세를 위한 법률 자문 및 계획", icon: <CheckCircle className="w-6 h-6" /> },
                { title: "국내외 상속사건", desc: "해외 재산이 있는 경우의 상속 사건 처리", icon: <Globe className="w-6 h-6" /> },
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
      id: "traffic",
      label: "교통사고",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              교통사고는 누구에게나 발생할 수 있는 불의의 사고이며, 사고 후 적절한 법적 대응이 중요합니다. 법무법인 세중은 교통사고 손해배상, 보험금 청구, 과실비율 분쟁 등 교통사고 관련 모든 법률 문제를 전문적으로 해결합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              우리는 교통사고 발생 즉시 사고 현장 조사와 증거 수집을 통해 정확한 사고 원인을 파악합니다. 과실비율 산정에 있어서는 도로교통법과 관련 판례를 정확히 적용하여 고객에게 유리한 결과를 도출합니다. 보험사와의 협상에서도 전문성을 발휘하여 최대한의 보험금을 받을 수 있도록 지원합니다. 후유증이나 장해가 발생한 경우 추가 배상 청구도 진행합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "손해배상 청구", desc: "교통사고로 인한 재산상 손해 및 정신적 손해 배상 청구", icon: <DollarSign className="w-6 h-6" /> },
                { title: "보험금 청구", desc: "자동차보험, 상해보험 등 보험금 청구 및 분쟁 해결", icon: <FileText className="w-6 h-6" /> },
                { title: "과실비율 분쟁", desc: "사고 원인 분석 및 과실비율 산정, 분쟁 해결", icon: <Scale className="w-6 h-6" /> },
                { title: "형사처벌 대응", desc: "도로교통법 위반, 과실치상 등 형사처벌 대응", icon: <AlertTriangle className="w-6 h-6" /> },
                { title: "후유증 및 장해", desc: "교통사고 후유증 및 장해 등급 산정, 추가 배상 청구", icon: <Users className="w-6 h-6" /> },
                { title: "사고 조사", desc: "사고 현장 조사, 증거 수집, 사고 원인 분석", icon: <Car className="w-6 h-6" /> },
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
      id: "industrial",
      label: "산업재해",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              산업재해는 근로자가 업무상 재해를 입었을 때 발생하는 법률 문제입니다. 산업안전보건법과 산업재해보상보험법에 따라 근로자는 적절한 보상을 받을 권리가 있습니다. 법무법인 세중은 산업재해 인정, 장해등급 판정, 보상금 청구 등 산업재해 관련 모든 법률 문제를 전문적으로 해결합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              우리는 산업재해 사건에서 먼저 재해 발생 경위를 정확히 파악하고, 업무상 재해 여부를 판단합니다. 업무상 재해 인정을 위해서는 업무상 질병, 업무상 재해, 통근재해 등 각 유형별 인정 요건을 정확히 충족해야 합니다. 산업재해보상보험법에 따른 각종 급여(요양급여, 휴업급여, 장해급여, 간병급여, 유족급여 등)의 청구를 지원하며, 장해등급 판정에 이의가 있는 경우 재심을 신청합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              또한 사용자에 대한 손해배상 청구도 진행하여 근로자의 권리를 최대한 보호합니다. 산업재해보상보험법상 보상 외에 사용자의 고의 또는 과실로 인한 손해에 대해서는 민법상 손해배상청구가 가능합니다. 우리는 근로자의 권익을 보호하기 위해 최선을 다합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "산업재해 인정", desc: "업무상 재해 인정 신청 및 이의신청, 재심청구", icon: <CheckCircle className="w-6 h-6" /> },
                { title: "장해등급 판정", desc: "장해등급 판정 및 이의신청, 재심청구", icon: <Scale className="w-6 h-6" /> },
                { title: "보상금 청구", desc: "요양급여, 휴업급여, 장해급여 등 각종 급여 청구", icon: <DollarSign className="w-6 h-6" /> },
                { title: "손해배상 청구", desc: "사용자에 대한 민법상 손해배상 청구", icon: <FileText className="w-6 h-6" /> },
                { title: "재해 조사", desc: "재해 발생 경위 조사 및 증거 수집", icon: <Users className="w-6 h-6" /> },
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
      id: "insurance",
      label: "보험소송",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              보험은 예상치 못한 사고나 질병에 대비하기 위한 중요한 수단이지만, 보험금 지급을 거부하거나 부당하게 감액하는 경우가 발생합니다. 법무법인 세중은 생명보험, 손해보험, 자동차보험, 화재보험, 상해보험 등 모든 보험 관련 분쟁을 전문적으로 해결합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              우리는 보험약관을 정확히 해석하고, 보험사가 부당하게 보험금 지급을 거부한 경우 소송을 통해 고객의 권리를 보호합니다. 특히 계약 전 알릴 의무 위반을 이유로 한 보험금 지급 거부에 대해서는 계약자에게 유리한 판례를 적극 활용합니다. 보험약관의 해석에 있어서도 보험사에게 불리하게 해석하는 것이 원칙이므로, 이를 적극 활용하여 고객의 권리를 보호합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              또한 보험금 산정에 이의가 있는 경우 재산정을 요구하고, 필요시 소송을 진행합니다. 보험금 지급 지연에 대해서는 지연손해금도 청구할 수 있습니다. 우리는 보험사와의 협상부터 소송까지 전 과정을 지원하여 고객이 최대한의 보험금을 받을 수 있도록 합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "보험금 지급 거부", desc: "보험금 지급 거부에 대한 이의신청 및 소송", icon: <FileText className="w-6 h-6" /> },
                { title: "보험금 감액", desc: "부당한 보험금 감액에 대한 이의신청 및 소송", icon: <DollarSign className="w-6 h-6" /> },
                { title: "계약 해석", desc: "보험약관의 해석 및 보험금 산정", icon: <Scale className="w-6 h-6" /> },
                { title: "지연손해금", desc: "보험금 지급 지연에 대한 지연손해금 청구", icon: <CheckCircle className="w-6 h-6" /> },
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
      id: "tax",
      label: "조세소송",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              조세소송은 세무당국과 납세자 간의 세금 부과 및 징수에 관한 분쟁을 해결하는 소송입니다. 법무법인 세중은 소득세, 법인세, 부가가치세, 종부세, 상속세, 증여세 등 모든 세금 관련 소송을 전문적으로 다룹니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              우리는 세무조사 단계부터 고객을 지원하여 부당한 세금 부과를 사전에 방지합니다. 세무조사 과정에서 세무당국의 부당한 처분을 방지하고, 조사 결과에 대해서는 이의신청과 심사청구를 진행합니다. 심사청구가 기각되거나 불만족스러운 경우 행정소송을 제기하여 고객의 권리를 보호합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              세법과 관련 판례를 정확히 이해하고 적용하여 고객에게 유리한 결과를 도출합니다. 특히 세법의 불명확한 조항에 대해서는 납세자에게 유리하게 해석하는 것이 원칙이므로, 이를 적극 활용합니다. 또한 세무조사 전 단계에서 세무 계획을 수립하여 세금 부담을 최소화하는 것도 지원합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "세무조사 대응", desc: "세무조사 과정에서의 법률 자문 및 대응", icon: <FileText className="w-6 h-6" /> },
                { title: "이의신청", desc: "세무조사 결과에 대한 이의신청 및 심사청구", icon: <Scale className="w-6 h-6" /> },
                { title: "행정소송", desc: "세금 부과 처분 취소를 위한 행정소송", icon: <CheckCircle className="w-6 h-6" /> },
                { title: "세무 계획", desc: "세무조사 전 단계의 세무 계획 수립", icon: <DollarSign className="w-6 h-6" /> },
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
      id: "general",
      label: "가사/민사/형사/행정",
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              법무법인 세중은 가사, 민사, 형사, 행정 등 다양한 법률 분야에서 전문적인 서비스를 제공합니다. 각 분야별 전문 변호사들이 협력하여 고객의 복잡한 법률 문제를 해결합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              가사소송에서는 이혼, 상속, 친양자 입양, 친권, 양육권, 면접교섭권 등 가족법 관련 모든 문제를 다룹니다. 가사소송은 가족 간의 감정적 갈등이 얽혀 있어 신중한 접근이 필요하며, 우리는 고객의 감정을 고려하면서도 법적으로 최선의 결과를 도출하기 위해 노력합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              민사소송에서는 계약 분쟁, 불법행위로 인한 손해배상, 채권 회수, 부동산 분쟁, 건설 분쟁 등 다양한 민사 분쟁을 해결합니다. 민사소송은 증거 수집과 법률 해석이 중요하므로, 우리는 철저한 사전 준비를 통해 고객에게 유리한 결과를 도출합니다.
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              형사사건에서는 변호인으로서 피고인의 권리를 보호하고, 무죄를 주장하거나 형량 감경을 위한 변론을 진행합니다. 행정소송에서는 행정처분의 취소나 무효 확인을 구하는 소송을 진행하며, 행정절차법과 각종 행정법령을 정확히 적용하여 고객의 권리를 보호합니다.
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">주요 서비스</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "가사소송", desc: "이혼, 상속, 친양자 입양, 친권, 양육권 등 가족법 관련 소송", icon: <Users className="w-6 h-6" /> },
                { title: "민사소송", desc: "계약 분쟁, 손해배상, 채권 회수, 부동산 분쟁 등 민사 분쟁", icon: <Scale className="w-6 h-6" /> },
                { title: "형사사건", desc: "형사 변호, 무죄 주장, 형량 감경 변론", icon: <Shield className="w-6 h-6" /> },
                { title: "행정소송", desc: "행정처분 취소, 무효 확인 소송", icon: <FileText className="w-6 h-6" /> },
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
              소송업무
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              소송업무
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              다양한 법률 분야에서 전문적인 소송 서비스를 제공합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-6xl mx-auto">
            <Tabs tabs={tabs} defaultTab="real-estate" />
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-primary to-accent text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">지금 바로 상담받으세요</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            소송 전문 변호사가 직접 상담해드립니다.
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

