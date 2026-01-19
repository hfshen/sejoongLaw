"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { Award, GraduationCap, Briefcase, Phone, Mail, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import Image from "next/image"

export interface Member {
  id: string
  name: string
  position: string
  specialties?: string[]
  phone?: string
  email?: string
  education?: string[]
  career?: string[]
  history?: string[]
  description?: string
  clients?: string[]
  cases?: string[]
  achievements?: string[]
  image?: string
  isForeign?: boolean
  isManager?: boolean
}

interface MembersGridProps {
  members: Member[]
}

export default function MembersGrid({ members }: MembersGridProps) {
  const t = useTranslations()
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="cursor-pointer"
          >
            <Card
              hover
              className="text-center h-full transition-all hover:shadow-xl"
            >
              <CardHeader>
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-6 flex items-center justify-center relative">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={128}
                      height={128}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-primary">
                      {member.name[0]}
                    </span>
                  )}
                  {member.id === "1" && (
                    <div className="absolute -top-2 -right-2">
                      <Badge variant="primary" className="text-xs">
                        {t("about.members.badges.managingPartner")}
                      </Badge>
                    </div>
                  )}
                  {member.isForeign && (
                    <div className="absolute -top-2 -right-2">
                      <Badge variant="accent" className="text-xs">
                        {t("about.members.badges.foreign")}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl mb-2">{member.name}</CardTitle>
                <p className="text-text-secondary font-semibold mb-4">
                  {member.position}
                </p>
              </CardHeader>
              <CardContent>
                {member.specialties && member.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {member.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="primary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {member.specialties.length > 3 && (
                      <Badge variant="default" className="text-xs">
                        +{member.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center justify-center gap-2 text-sm text-text-secondary mb-2">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-center text-primary text-sm font-semibold">
                  {t("about.members.modal.viewDetails")} <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedMember && (
        <Modal
          open={!!selectedMember}
          onOpenChange={(open) => !open && setSelectedMember(null)}
          title={`${selectedMember.name} ${selectedMember.position}`}
        >
          <div className="space-y-6">
            {selectedMember.description && (
              <div>
                <h3 className="font-bold text-lg text-secondary mb-3">{t("about.members.modal.introduction")}</h3>
                <p className="text-text-secondary leading-relaxed">
                  {selectedMember.description}
                </p>
              </div>
            )}

            {(selectedMember.phone || selectedMember.email) && (
              <div>
                <h3 className="font-bold text-lg text-secondary mb-3">{t("about.members.modal.contact")}</h3>
                <div className="space-y-2">
                  {selectedMember.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <a
                        href={`tel:${selectedMember.phone.replace(/[^0-9]/g, "")}`}
                        className="text-primary hover:underline"
                      >
                        {selectedMember.phone}
                      </a>
                    </div>
                  )}
                  {selectedMember.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <a
                        href={`mailto:${selectedMember.email}`}
                        className="text-primary hover:underline"
                      >
                        {selectedMember.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedMember.education && selectedMember.education.length > 0 && (
              <div>
                <h3 className="font-bold text-lg text-secondary mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  {t("about.members.modal.education")}
                </h3>
                <ul className="space-y-2 text-text-secondary">
                  {selectedMember.education.map((edu, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedMember.history && selectedMember.history.length > 0 && (
              <div>
                <h3 className="font-bold text-lg text-secondary mb-3">{t("about.members.modal.history")}</h3>
                <ul className="space-y-2 text-text-secondary">
                  {selectedMember.history.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedMember.career && selectedMember.career.length > 0 && (
              <div>
                <h3 className="font-bold text-lg text-secondary mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  {t("about.members.modal.career")}
                </h3>
                <ul className="space-y-2 text-text-secondary">
                  {selectedMember.career.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedMember.achievements && selectedMember.achievements.length > 0 && (
              <div>
                <h3 className="font-bold text-lg text-secondary mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  {t("about.members.modal.achievements")}
                </h3>
                <ul className="space-y-2 text-text-secondary">
                  {selectedMember.achievements.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedMember.clients && selectedMember.clients.length > 0 && (
              <div>
                <h3 className="font-bold text-lg text-secondary mb-3">
                  {t("about.members.modal.clients")}
                </h3>
                <ul className="space-y-2 text-text-secondary">
                  {selectedMember.clients.map((client, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{client}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedMember.cases && selectedMember.cases.length > 0 && (
              <div>
                <h3 className="font-bold text-lg text-secondary mb-3">
                  {t("about.members.modal.cases")}
                </h3>
                <ul className="space-y-2 text-text-secondary">
                  {selectedMember.cases.map((caseItem, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{caseItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedMember.specialties && selectedMember.specialties.length > 0 && (
              <div>
                <h3 className="font-bold text-lg text-secondary mb-3">{t("about.members.modal.specialties")}</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.specialties.map((specialty, index) => (
                    <Badge key={index} variant="primary" className="text-sm">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}

