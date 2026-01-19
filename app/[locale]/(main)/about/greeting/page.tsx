import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Award, Users, Globe, Heart } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: `${t("pages.greeting.title")} | ${t("common.title")}`,
    description: t("pages.greeting.description"),
  }
}

export default async function GreetingPage() {
  const t = await getTranslations("pages.greeting")

  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: t("valueItems.expertise.title"),
      description: t("valueItems.expertise.description"),
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t("valueItems.trust.title"),
      description: t("valueItems.trust.description"),
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t("valueItems.global.title"),
      description: t("valueItems.global.description"),
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: t("valueItems.customer.title"),
      description: t("valueItems.customer.description"),
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container-max relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="primary" className="mb-6 text-sm md:text-base">
              {t("badge")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              {t("heroDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            {/* Vision Section */}
            <Card className="mb-12">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                    <span className="text-primary">世中</span> - {t("visionTitle")}
                  </h2>
                  <p className="text-lg text-text-secondary italic">
                    {t("visionSubtitle")}
                  </p>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-6">
                    {t("visionText1")}
                  </p>
                  <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-6">
                    {t("visionText2")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Values Section */}
            <Card className="mb-12">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-8 text-center">
                  {t("valuesTitle")}
                </h2>
                <div className="space-y-8">
                  <div className="prose prose-lg max-w-none">
                    <h3 className="text-xl font-semibold text-secondary mb-4">
                      {t("value1Title")}
                    </h3>
                    <p className="text-lg text-text-secondary leading-relaxed mb-6">
                      {t("value1Text")}
                    </p>
                  </div>
                  
                  <div className="prose prose-lg max-w-none">
                    <h3 className="text-xl font-semibold text-secondary mb-4">
                      {t("value2Title")}
                    </h3>
                    <p className="text-lg text-text-secondary leading-relaxed mb-6">
                      {t("value2Text")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Values */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-8 text-center">
                {t("firmValuesTitle")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <Card key={index} hover className="text-center">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex justify-center mb-4 text-primary">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-bold text-secondary mb-3">
                        {value.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-primary to-accent text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("ctaTitle")}
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            {t("ctaDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100"
              >
                {t("ctaButton")}
              </Button>
            </Link>
            <Link href="tel:03180448805">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {t("ctaPhone")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
