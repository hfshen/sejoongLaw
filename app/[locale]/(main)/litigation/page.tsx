"use client"

import { Badge } from "@/components/ui/Badge"
import Tabs from "@/components/ui/Tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Scale, FileText, Users, CheckCircle, DollarSign, Shield, Heart, Globe, AlertTriangle, Car, Building2 } from "lucide-react"
import Link from "next/link"
import Button from "@/components/ui/Button"
import { useTranslations } from "next-intl"

export default function LitigationPage() {
  const t = useTranslations()
  const tabs = [
    {
      id: "real-estate",
      label: t("litigation.tabs.realEstate.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.realEstate.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("litigation.tabs.realEstate.description2")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("litigation.tabs.realEstate.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: t("litigation.tabs.realEstate.services.contract.title"), desc: t("litigation.tabs.realEstate.services.contract.desc"), icon: <FileText className="w-6 h-6" /> },
                { title: t("litigation.tabs.realEstate.services.ownership.title"), desc: t("litigation.tabs.realEstate.services.ownership.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("litigation.tabs.realEstate.services.lease.title"), desc: t("litigation.tabs.realEstate.services.lease.desc"), icon: <Users className="w-6 h-6" /> },
                { title: t("litigation.tabs.realEstate.services.construction.title"), desc: t("litigation.tabs.realEstate.services.construction.desc"), icon: <CheckCircle className="w-6 h-6" /> },
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
              <h3 className="text-xl font-bold text-secondary mb-4">{t("litigation.tabs.realEstate.process")}</h3>
              <div className="space-y-4">
                {[
                  { step: "1", title: t("litigation.tabs.realEstate.processSteps.consultation.title"), desc: t("litigation.tabs.realEstate.processSteps.consultation.desc") },
                  { step: "2", title: t("litigation.tabs.realEstate.processSteps.investigation.title"), desc: t("litigation.tabs.realEstate.processSteps.investigation.desc") },
                  { step: "3", title: t("litigation.tabs.realEstate.processSteps.strategy.title"), desc: t("litigation.tabs.realEstate.processSteps.strategy.desc") },
                  { step: "4", title: t("litigation.tabs.realEstate.processSteps.negotiation.title"), desc: t("litigation.tabs.realEstate.processSteps.negotiation.desc") },
                  { step: "5", title: t("litigation.tabs.realEstate.processSteps.litigation.title"), desc: t("litigation.tabs.realEstate.processSteps.litigation.desc") },
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
      label: t("litigation.tabs.divorce.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.divorce.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("litigation.tabs.divorce.description2")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("litigation.tabs.divorce.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("litigation.tabs.divorce.services.judicial.title"), desc: t("litigation.tabs.divorce.services.judicial.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("litigation.tabs.divorce.services.agreement.title"), desc: t("litigation.tabs.divorce.services.agreement.desc"), icon: <FileText className="w-6 h-6" /> },
                { title: t("litigation.tabs.divorce.services.property.title"), desc: t("litigation.tabs.divorce.services.property.desc"), icon: <Shield className="w-6 h-6" /> },
                { title: t("litigation.tabs.divorce.services.alimony.title"), desc: t("litigation.tabs.divorce.services.alimony.desc"), icon: <Heart className="w-6 h-6" /> },
                { title: t("litigation.tabs.divorce.services.custody.title"), desc: t("litigation.tabs.divorce.services.custody.desc"), icon: <Users className="w-6 h-6" /> },
                { title: t("litigation.tabs.divorce.services.international.title"), desc: t("litigation.tabs.divorce.services.international.desc"), icon: <Globe className="w-6 h-6" /> },
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
      label: t("litigation.tabs.inheritance.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.inheritance.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("litigation.tabs.inheritance.description2")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("litigation.tabs.inheritance.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("litigation.tabs.inheritance.services.division.title"), desc: t("litigation.tabs.inheritance.services.division.desc"), icon: <DollarSign className="w-6 h-6" /> },
                { title: t("litigation.tabs.inheritance.services.reserve.title"), desc: t("litigation.tabs.inheritance.services.reserve.desc"), icon: <Shield className="w-6 h-6" /> },
                { title: t("litigation.tabs.inheritance.services.recovery.title"), desc: t("litigation.tabs.inheritance.services.recovery.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("litigation.tabs.inheritance.services.will.title"), desc: t("litigation.tabs.inheritance.services.will.desc"), icon: <FileText className="w-6 h-6" /> },
                { title: t("litigation.tabs.inheritance.services.tax.title"), desc: t("litigation.tabs.inheritance.services.tax.desc"), icon: <CheckCircle className="w-6 h-6" /> },
                { title: t("litigation.tabs.inheritance.services.international.title"), desc: t("litigation.tabs.inheritance.services.international.desc"), icon: <Globe className="w-6 h-6" /> },
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
      label: t("litigation.tabs.traffic.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.traffic.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("litigation.tabs.traffic.description2")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("litigation.tabs.traffic.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("litigation.tabs.traffic.services.damages.title"), desc: t("litigation.tabs.traffic.services.damages.desc"), icon: <DollarSign className="w-6 h-6" /> },
                { title: t("litigation.tabs.traffic.services.insurance.title"), desc: t("litigation.tabs.traffic.services.insurance.desc"), icon: <FileText className="w-6 h-6" /> },
                { title: t("litigation.tabs.traffic.services.fault.title"), desc: t("litigation.tabs.traffic.services.fault.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("litigation.tabs.traffic.services.criminal.title"), desc: t("litigation.tabs.traffic.services.criminal.desc"), icon: <AlertTriangle className="w-6 h-6" /> },
                { title: t("litigation.tabs.traffic.services.sequelae.title"), desc: t("litigation.tabs.traffic.services.sequelae.desc"), icon: <Users className="w-6 h-6" /> },
                { title: t("litigation.tabs.traffic.services.investigation.title"), desc: t("litigation.tabs.traffic.services.investigation.desc"), icon: <Car className="w-6 h-6" /> },
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
      label: t("litigation.tabs.industrial.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.industrial.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.industrial.description2")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("litigation.tabs.industrial.description3")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("litigation.tabs.industrial.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("litigation.tabs.industrial.services.recognition.title"), desc: t("litigation.tabs.industrial.services.recognition.desc"), icon: <CheckCircle className="w-6 h-6" /> },
                { title: t("litigation.tabs.industrial.services.disability.title"), desc: t("litigation.tabs.industrial.services.disability.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("litigation.tabs.industrial.services.compensation.title"), desc: t("litigation.tabs.industrial.services.compensation.desc"), icon: <DollarSign className="w-6 h-6" /> },
                { title: t("litigation.tabs.industrial.services.damages.title"), desc: t("litigation.tabs.industrial.services.damages.desc"), icon: <FileText className="w-6 h-6" /> },
                { title: t("litigation.tabs.industrial.services.investigation.title"), desc: t("litigation.tabs.industrial.services.investigation.desc"), icon: <Users className="w-6 h-6" /> },
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
      label: t("litigation.tabs.insurance.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.insurance.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.insurance.description2")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("litigation.tabs.insurance.description3")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("litigation.tabs.insurance.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("litigation.tabs.insurance.services.refusal.title"), desc: t("litigation.tabs.insurance.services.refusal.desc"), icon: <FileText className="w-6 h-6" /> },
                { title: t("litigation.tabs.insurance.services.reduction.title"), desc: t("litigation.tabs.insurance.services.reduction.desc"), icon: <DollarSign className="w-6 h-6" /> },
                { title: t("litigation.tabs.insurance.services.interpretation.title"), desc: t("litigation.tabs.insurance.services.interpretation.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("litigation.tabs.insurance.services.delay.title"), desc: t("litigation.tabs.insurance.services.delay.desc"), icon: <CheckCircle className="w-6 h-6" /> },
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
      label: t("litigation.tabs.tax.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.tax.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.tax.description2")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("litigation.tabs.tax.description3")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("litigation.tabs.tax.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("litigation.tabs.tax.services.response.title"), desc: t("litigation.tabs.tax.services.response.desc"), icon: <FileText className="w-6 h-6" /> },
                { title: t("litigation.tabs.tax.services.objection.title"), desc: t("litigation.tabs.tax.services.objection.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("litigation.tabs.tax.services.lawsuit.title"), desc: t("litigation.tabs.tax.services.lawsuit.desc"), icon: <CheckCircle className="w-6 h-6" /> },
                { title: t("litigation.tabs.tax.services.planning.title"), desc: t("litigation.tabs.tax.services.planning.desc"), icon: <DollarSign className="w-6 h-6" /> },
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
      label: t("litigation.tabs.general.label"),
      content: (
        <div className="space-y-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.general.description1")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.general.description2")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("litigation.tabs.general.description3")}
            </p>
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-8">
              {t("litigation.tabs.general.description4")}
            </p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-secondary mb-6">{t("litigation.tabs.general.mainServices")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: t("litigation.tabs.general.services.family.title"), desc: t("litigation.tabs.general.services.family.desc"), icon: <Users className="w-6 h-6" /> },
                { title: t("litigation.tabs.general.services.civil.title"), desc: t("litigation.tabs.general.services.civil.desc"), icon: <Scale className="w-6 h-6" /> },
                { title: t("litigation.tabs.general.services.criminal.title"), desc: t("litigation.tabs.general.services.criminal.desc"), icon: <Shield className="w-6 h-6" /> },
                { title: t("litigation.tabs.general.services.administrative.title"), desc: t("litigation.tabs.general.services.administrative.desc"), icon: <FileText className="w-6 h-6" /> },
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
              {t("nav.litigation")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              {t("nav.litigation")}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              {t("litigation.description")}
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("litigation.cta.title")}</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            {t("litigation.cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                {t("litigation.cta.button")}
              </Button>
            </Link>
            <Link href="tel:03180448805">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {t("litigation.cta.phone")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

