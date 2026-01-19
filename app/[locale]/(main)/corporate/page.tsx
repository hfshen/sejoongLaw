"use client"

import { Badge } from "@/components/ui/Badge"
import Tabs from "@/components/ui/Tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Building2, FileText, Scale, Users, Shield, CheckCircle, DollarSign, Globe, TrendingUp } from "lucide-react"
import Link from "next/link"
import Button from "@/components/ui/Button"
import { useTranslations } from "next-intl"

export default function CorporatePage() {
  const t = useTranslations()
  const tabs = [
    {
      id: "advisory",
      label: t("corporate.advisory"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("corporate.tabs.advisory.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("corporate.tabs.advisory.description2")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("corporate.tabs.advisory.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("corporate.tabs.advisory.services.corporate.title"), desc: t("corporate.tabs.advisory.services.corporate.desc"), icon: <Building2 className="w-6 h-6" /> },
                { title: t("corporate.tabs.advisory.services.contract.title"), desc: t("corporate.tabs.advisory.services.contract.desc"), icon: <FileText className="w-6 h-6" /> },
                { title: t("corporate.tabs.advisory.services.regulation.title"), desc: t("corporate.tabs.advisory.services.regulation.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("corporate.tabs.advisory.services.labor.title"), desc: t("corporate.tabs.advisory.services.labor.desc"), icon: <Users className="w-6 h-6" /> },
                { title: t("corporate.tabs.advisory.services.ip.title"), desc: t("corporate.tabs.advisory.services.ip.desc"), icon: <Shield className="w-6 h-6" /> },
                { title: t("corporate.tabs.advisory.services.structure.title"), desc: t("corporate.tabs.advisory.services.structure.desc"), icon: <CheckCircle className="w-6 h-6" /> },
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
              <h3 className="text-xl font-bold text-secondary mb-4">{t("corporate.tabs.advisory.process")}</h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: t("corporate.tabs.advisory.processSteps.consultation.title"), desc: t("corporate.tabs.advisory.processSteps.consultation.desc") },
                  { step: "2", title: t("corporate.tabs.advisory.processSteps.review.title"), desc: t("corporate.tabs.advisory.processSteps.review.desc") },
                  { step: "3", title: t("corporate.tabs.advisory.processSteps.solution.title"), desc: t("corporate.tabs.advisory.processSteps.solution.desc") },
                  { step: "4", title: t("corporate.tabs.advisory.processSteps.execution.title"), desc: t("corporate.tabs.advisory.processSteps.execution.desc") },
                  { step: "5", title: t("corporate.tabs.advisory.processSteps.followup.title"), desc: t("corporate.tabs.advisory.processSteps.followup.desc") },
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
      label: t("corporate.tabs.mna.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("corporate.tabs.mna.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("corporate.tabs.mna.description2")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("corporate.tabs.mna.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("corporate.tabs.mna.services.valuation.title"), desc: t("corporate.tabs.mna.services.valuation.desc"), icon: <DollarSign className="w-6 h-6" /> },
                { title: t("corporate.tabs.mna.services.contract.title"), desc: t("corporate.tabs.mna.services.contract.desc"), icon: <FileText className="w-6 h-6" /> },
                { title: t("corporate.tabs.mna.services.permit.title"), desc: t("corporate.tabs.mna.services.permit.desc"), icon: <CheckCircle className="w-6 h-6" /> },
                { title: t("corporate.tabs.mna.services.tax.title"), desc: t("corporate.tabs.mna.services.tax.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("corporate.tabs.mna.services.labor.title"), desc: t("corporate.tabs.mna.services.labor.desc"), icon: <Users className="w-6 h-6" /> },
                { title: t("corporate.tabs.mna.services.restructuring.title"), desc: t("corporate.tabs.mna.services.restructuring.desc"), icon: <Building2 className="w-6 h-6" /> },
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
      label: t("corporate.tabs.overseas.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("corporate.tabs.overseas.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("corporate.tabs.overseas.description2")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("corporate.tabs.overseas.description3")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("corporate.tabs.overseas.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("corporate.tabs.overseas.services.incorporation.title"), desc: t("corporate.tabs.overseas.services.incorporation.desc"), icon: <Building2 className="w-6 h-6" /> },
                { title: t("corporate.tabs.overseas.services.ma.title"), desc: t("corporate.tabs.overseas.services.ma.desc"), icon: <DollarSign className="w-6 h-6" /> },
                { title: t("corporate.tabs.overseas.services.regulation.title"), desc: t("corporate.tabs.overseas.services.regulation.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("corporate.tabs.overseas.services.contract.title"), desc: t("corporate.tabs.overseas.services.contract.desc"), icon: <FileText className="w-6 h-6" /> },
                { title: t("corporate.tabs.overseas.services.tax.title"), desc: t("corporate.tabs.overseas.services.tax.desc"), icon: <CheckCircle className="w-6 h-6" /> },
                { title: t("corporate.tabs.overseas.services.dispute.title"), desc: t("corporate.tabs.overseas.services.dispute.desc"), icon: <Globe className="w-6 h-6" /> },
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
      label: t("corporate.tabs.finance.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("corporate.tabs.finance.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("corporate.tabs.finance.description2")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("corporate.tabs.finance.description3")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("corporate.tabs.finance.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("corporate.tabs.finance.services.mortgage.title"), desc: t("corporate.tabs.finance.services.mortgage.desc"), icon: <DollarSign className="w-6 h-6" /> },
                { title: t("corporate.tabs.finance.services.project.title"), desc: t("corporate.tabs.finance.services.project.desc"), icon: <Building2 className="w-6 h-6" /> },
                { title: t("corporate.tabs.finance.services.fund.title"), desc: t("corporate.tabs.finance.services.fund.desc"), icon: <TrendingUp className="w-6 h-6" /> },
                { title: t("corporate.tabs.finance.services.reits.title"), desc: t("corporate.tabs.finance.services.reits.desc"), icon: <Building2 className="w-6 h-6" /> },
                { title: t("corporate.tabs.finance.services.regulation.title"), desc: t("corporate.tabs.finance.services.regulation.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("corporate.tabs.finance.services.contract.title"), desc: t("corporate.tabs.finance.services.contract.desc"), icon: <FileText className="w-6 h-6" /> },
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
      label: t("corporate.tabs.indirect.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("corporate.tabs.indirect.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("corporate.tabs.indirect.description2")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("corporate.tabs.indirect.description3")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("corporate.tabs.indirect.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("corporate.tabs.indirect.services.fund.title"), desc: t("corporate.tabs.indirect.services.fund.desc"), icon: <TrendingUp className="w-6 h-6" /> },
                { title: t("corporate.tabs.indirect.services.reits.title"), desc: t("corporate.tabs.indirect.services.reits.desc"), icon: <Building2 className="w-6 h-6" /> },
                { title: t("corporate.tabs.indirect.services.project.title"), desc: t("corporate.tabs.indirect.services.project.desc"), icon: <DollarSign className="w-6 h-6" /> },
                { title: t("corporate.tabs.indirect.services.protection.title"), desc: t("corporate.tabs.indirect.services.protection.desc"), icon: <Shield className="w-6 h-6" /> },
                { title: t("corporate.tabs.indirect.services.regulation.title"), desc: t("corporate.tabs.indirect.services.regulation.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("corporate.tabs.indirect.services.tax.title"), desc: t("corporate.tabs.indirect.services.tax.desc"), icon: <CheckCircle className="w-6 h-6" /> },
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
              {t("nav.corporate")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              {t("nav.corporate")}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              {t("corporate.description")}
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("corporate.ctaTitle")}</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            {t("corporate.ctaDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                {t("corporate.cta.button")}
              </Button>
            </Link>
            <Link href="tel:03180448805">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {t("corporate.cta.phone")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

