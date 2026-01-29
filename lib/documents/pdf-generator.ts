import { jsPDF } from "jspdf"
import { type DocumentType } from "./templates"

interface PDFData {
  [key: string]: any
}

// 합의서.pdf와 유사한 양식으로 PDF 생성
export function generateAgreementPDF(data: PDFData, locale: "ko" | "en" | "zh-CN" | "si" | "ta" = "ko") {
  const doc = new jsPDF()
  let yPos = 20

  // 제목
  doc.setFontSize(18)
  const title = locale === "ko" ? "합의서" : locale === "en" ? "Agreement" : "协议"
  doc.text(title, 105, yPos, { align: "center" })
  yPos += 15

  // 서문
  doc.setFontSize(11)
  const intro = locale === "ko" 
    ? "본 합의서는 고(故) _________________________ (이하 \"망인\")의 사망과 관련하여, 망인의 유족 대표(이하 \"갑\")와 사업장 대표(이하 \"을\")가 상호 원만히 분쟁을 종결하기 위하여 다음과 같이 체결한다."
    : locale === "en"
    ? "This agreement is entered into between the family representative (hereinafter \"Party A\") and the company representative (hereinafter \"Party B\") regarding the death of _________________________ (hereinafter \"the deceased\") to amicably resolve disputes."
    : "本协议由家属代表（以下简称\"甲方\"）和公司代表（以下简称\"乙方\"）就死者_________________________（以下简称\"死者\"）的死亡相关事宜，为友好解决争议而签订。"

  doc.text(intro, 20, yPos, { maxWidth: 170 })
  yPos += 20

  // 갑 정보
  doc.setFontSize(12)
  const partyALabel = locale === "ko" ? "\"갑\" 유가족 대표" : locale === "en" ? "\"Party A\" Family Representative" : "\"甲方\" 家属代表"
  doc.text(partyALabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const tableHeaders = locale === "ko"
    ? ["국적", "성명", "생년월일", "연락처", "관계", "본국 신분증 번호", "본국 주소"]
    : locale === "en"
    ? ["Nationality", "Name", "Date of Birth", "Contact", "Relation", "ID Number", "Home Address"]
    : ["国籍", "姓名", "出生日期", "联系方式", "关系", "本国身份证号", "本国地址"]

  // 테이블 형식으로 정보 표시
  const partyAFields = [
    { key: "party_a_nationality", label: tableHeaders[0] },
    { key: "party_a_name", label: tableHeaders[1] },
    { key: "party_a_birthdate", label: tableHeaders[2] },
    { key: "party_a_contact", label: tableHeaders[3] },
    { key: "party_a_relation", label: tableHeaders[4] },
    { key: "party_a_id_number", label: tableHeaders[5] },
    { key: "party_a_address", label: tableHeaders[6] },
  ]

  partyAFields.forEach((field) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    const value = data[field.key] || ""
    doc.text(`${field.label}: ${value}`, 20, yPos)
    yPos += 7
  })

  yPos += 5

  // 을 정보
  doc.setFontSize(12)
  const partyBLabel = locale === "ko" ? "\"을\" 회사측 대표" : locale === "en" ? "\"Party B\" Company Representative" : "\"乙方\" 公司代表"
  doc.text(partyBLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const partyBFields = [
    { key: "party_b_company_name", label: locale === "ko" ? "상호" : locale === "en" ? "Company Name" : "公司名称" },
    { key: "party_b_representative", label: locale === "ko" ? "대표자 성명" : locale === "en" ? "Representative Name" : "代表姓名" },
    { key: "party_b_registration", label: locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : "营业执照号" },
    { key: "party_b_contact", label: locale === "ko" ? "연락처" : locale === "en" ? "Contact" : "联系方式" },
    { key: "party_b_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址" },
  ]

  partyBFields.forEach((field) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    const value = data[field.key] || ""
    doc.text(`${field.label}: ${value}`, 20, yPos)
    yPos += 7
  })

  yPos += 5

  // 고인 정보
  doc.setFontSize(12)
  const deceasedLabel = locale === "ko" ? "고인(망인)" : locale === "en" ? "Deceased" : "死者"
  doc.text(deceasedLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const deceasedFields = [
    { key: "deceased_name", label: locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名" },
    { key: "deceased_foreigner_id", label: locale === "ko" ? "외국인등록번호" : locale === "en" ? "Foreigner Registration Number" : "外国人登记号" },
    { key: "deceased_birthdate", label: locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : "出生日期" },
    { key: "deceased_address", label: locale === "ko" ? "주소지" : locale === "en" ? "Address" : "地址" },
    { key: "incident_location", label: locale === "ko" ? "사건발생위치" : locale === "en" ? "Incident Location" : "事件发生地点" },
    { key: "incident_time", label: locale === "ko" ? "사건발생시간" : locale === "en" ? "Incident Time" : "事件发生时间" },
  ]

  deceasedFields.forEach((field) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    const value = data[field.key] || ""
    doc.text(`${field.label}: ${value}`, 20, yPos)
    yPos += 7
  })

  yPos += 10

  // 합의 내용
  doc.setFontSize(11)
  const agreementTerms = locale === "ko"
    ? [
        "1. 갑과 을은 본 사건(망인의 사망 관련 건)에 관하여 상호 원만히 합의하였고, 본 합의서 체결로써 본 사건과 관련된 분쟁이 종결되었음을 확인한다.",
        "2. 갑은 본 사건과 관련하여 향후 을 및 을의 대표자, 사업장에 대하여 민사·형사·행정(산재 등 포함) 기타 일체의 사항에 관하여 어떠한 이의도 제기하지 아니하며, 추가로 어떠한 청구나 권리 주장도 하지 아니한다.",
        "3. 갑은 본 사건과 관련하여 을의 대표자에 대한 처벌을 원하지 아니한다. 갑은 위의사를 표시한 처벌불원서를 본 합의서와 함께 제출한다.",
        "4. 갑과 을은 본 합의가 각 당사자의 자유로운 의사에 따라 작성·체결되었으며, 강박 또는 기망 등에 의한 것이 아님을 상호 확인한다.",
      ]
    : locale === "en"
    ? [
        "1. Party A and Party B have amicably agreed regarding this case (related to the death of the deceased), and confirm that all disputes related to this case are resolved by the execution of this agreement.",
        "2. Party A shall not raise any objections or make any additional claims or assertions of rights against Party B, its representative, or the workplace regarding civil, criminal, administrative (including industrial accidents) or any other matters related to this case.",
        "3. Party A does not wish for the punishment of Party B's representative in relation to this case. Party A shall submit a non-prosecution request expressing this intention together with this agreement.",
        "4. Party A and Party B mutually confirm that this agreement has been prepared and executed according to each party's free will and is not the result of coercion or fraud.",
      ]
    : [
        "1. 甲方和乙方就本案（与死者死亡相关）已友好达成协议，并确认通过签署本协议，与本案相关的所有争议已解决。",
        "2. 甲方就本案相关事宜，今后不对乙方及其代表、工作场所提出任何民事、刑事、行政（包括工伤等）或其他任何异议，也不提出任何追加请求或权利主张。",
        "3. 甲方不希望就本案对乙方代表进行处罚。甲方应提交表示此意的免予起诉书，与本协议一起提交。",
        "4. 甲方和乙方相互确认，本协议是根据各方自由意志编写和签署的，并非因胁迫或欺诈所致。",
      ]

  agreementTerms.forEach((term) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    doc.text(term, 20, yPos, { maxWidth: 170 })
    yPos += 12
  })

  yPos += 10

  // 서명란
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  const signatureNote = locale === "ko"
    ? "본 합의서는 2부 작성하여 갑과 을이 각각 서명(또는 기명) 날인 후 각 1부씩 보관한다."
    : locale === "en"
    ? "This agreement is prepared in duplicate, with Party A and Party B each signing (or initialing) and sealing, and each party keeping one copy."
    : "本协议一式两份，甲方和乙方各自签名（或署名）盖章后，各保存一份。"

  doc.text(signatureNote, 20, yPos, { maxWidth: 170 })
  yPos += 15

  const agreementDate = data.agreement_date || new Date().toISOString().split("T")[0]
  const dateLabel = locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"
  doc.text(`${dateLabel}: ${agreementDate}`, 20, yPos)
  yPos += 10

  const partyASignature = locale === "ko" ? "갑(유가족 대표) 성명:" : locale === "en" ? "Party A (Family Representative) Name:" : "甲方（家属代表）姓名："
  doc.text(partyASignature, 20, yPos)
  yPos += 10

  const partyBSignature = locale === "ko" ? "을(사업장 대표) 성명:" : locale === "en" ? "Party B (Company Representative) Name:" : "乙方（公司代表）姓名："
  doc.text(partyBSignature, 20, yPos)

  // 푸터
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    const footerText = locale === "ko"
      ? "법무법인 세중 | 경기도 안산시 단원구 원곡로 45 세중빌딩 2층 | 전화: 031-8044-8805 | 이메일: contact@sejoonglaw.kr"
      : locale === "en"
      ? "Sejoong Law Firm | 2F Sejoong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do | Phone: 031-8044-8805 | Email: contact@sejoonglaw.kr"
      : "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: contact@sejoonglaw.kr"
    doc.text(footerText, 105, 285, { align: "center", maxWidth: 170 })
  }

  return doc
}

// 위임장 PDF 생성
export function generatePowerOfAttorneyPDF(data: PDFData, locale: "ko" | "en" | "zh-CN" | "si" | "ta" = "ko") {
  const doc = new jsPDF()
  let yPos = 20

  // 제목
  doc.setFontSize(18)
  const title = locale === "ko" ? "위임장" : locale === "en" ? "Power of Attorney" : "委托书"
  doc.text(title, 105, yPos, { align: "center" })
  yPos += 15

  // 위임인 정보
  doc.setFontSize(12)
  const principalLabel = locale === "ko" ? "1. 위임인" : locale === "en" ? "1. Principal" : "1. 委托人"
  doc.text(principalLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const principalFields = [
    { key: "principal_name", label: locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名" },
    { key: "principal_birthdate", label: locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : "出生日期" },
    { key: "principal_passport", label: locale === "ko" ? "여권번호" : locale === "en" ? "Passport Number" : "护照号" },
    { key: "principal_id_number", label: locale === "ko" ? "본국신분증번호" : locale === "en" ? "ID Number" : "本国身份证号" },
    { key: "principal_address", label: locale === "ko" ? "본국주소" : locale === "en" ? "Home Address" : "本国地址" },
  ]

  principalFields.forEach((field) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    const value = data[field.key] || ""
    doc.text(`${field.label}: ${value}`, 20, yPos)
    yPos += 7
  })

  yPos += 10

  // 수임인 정보
  doc.setFontSize(12)
  const attorneyLabel = locale === "ko" ? "2. 수임인" : locale === "en" ? "2. Attorney" : "2. 受托人"
  doc.text(attorneyLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const attorneyFields = [
    { key: "attorney_name", label: locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名" },
    { key: "attorney_registration", label: locale === "ko" ? "주민등록번호" : locale === "en" ? "Registration Number" : "登记号" },
    { key: "attorney_office", label: locale === "ko" ? "사업장명" : locale === "en" ? "Office Name" : "事务所名称" },
    { key: "attorney_business_number", label: locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : "营业执照号" },
    { key: "attorney_position", label: locale === "ko" ? "직위" : locale === "en" ? "Position" : "职位" },
    { key: "attorney_contact", label: locale === "ko" ? "연락처" : locale === "en" ? "Contact" : "联系方式" },
    { key: "attorney_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址" },
  ]

  attorneyFields.forEach((field) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    const value = data[field.key] || ""
    doc.text(`${field.label}: ${value}`, 20, yPos)
    yPos += 7
  })

  yPos += 10

  // 복 대리인 정보 (있는 경우)
  if (data.sub_attorney_name) {
    doc.setFontSize(12)
    const subAttorneyLabel = locale === "ko" ? "3. 수임인 복 대리인" : locale === "en" ? "3. Sub-Attorney" : "3. 复代理人"
    doc.text(subAttorneyLabel, 20, yPos)
    yPos += 8

    doc.setFontSize(10)
    const subAttorneyFields = [
      { key: "sub_attorney_name", label: locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名" },
      { key: "sub_attorney_registration", label: locale === "ko" ? "주민등록번호" : locale === "en" ? "Registration Number" : "登记号" },
      { key: "sub_attorney_position", label: locale === "ko" ? "직위" : locale === "en" ? "Position" : "职位" },
      { key: "sub_attorney_contact", label: locale === "ko" ? "연락처" : locale === "en" ? "Contact" : "联系方式" },
      { key: "sub_attorney_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址" },
    ]

    subAttorneyFields.forEach((field) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      const value = data[field.key] || ""
      doc.text(`${field.label}: ${value}`, 20, yPos)
      yPos += 7
    })

    yPos += 10
  }

  // 위임업무
  doc.setFontSize(12)
  const tasksLabel = locale === "ko" ? "위임업무" : locale === "en" ? "Authorized Tasks" : "委托业务"
  doc.text(tasksLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const taskLabels: Record<string, Record<"ko" | "en" | "zh-CN", string>> = {
    civil_criminal: { ko: "민·형사소송 위임", en: "Civil/Criminal Litigation", "zh-CN": "民事/刑事诉讼委托" },
    labor_complaint: { ko: "노동부진정서 위임", en: "Labor Complaint", "zh-CN": "劳动部申诉委托" },
    wage_claim: { ko: "임금체불 및 수령행위", en: "Wage Claim", "zh-CN": "工资拖欠及领取" },
    damages_claim: { ko: "손해배상청구 위임", en: "Damages Claim", "zh-CN": "损害赔偿请求委托" },
    death_insurance: { ko: "사망보험금 청구 및 수령행위 일체권한", en: "Death Insurance Claim", "zh-CN": "死亡保险金请求及领取全部权限" },
    insurance_claim: { ko: "보험금청구 및 수령행위", en: "Insurance Claim", "zh-CN": "保险金请求及领取" },
    deposit_withdrawal: { ko: "공탁출금 및 수령행위", en: "Deposit Withdrawal", "zh-CN": "提存提取及领取" },
    criminal_settlement: { ko: "형사합의", en: "Criminal Settlement", "zh-CN": "刑事和解" },
    severance_claim: { ko: "퇴직금청구 및 급여정산 수령행위", en: "Severance Claim", "zh-CN": "退休金请求及工资结算领取" },
    financial_inquiry: { ko: "금융권 내역사실 확인", en: "Financial Inquiry", "zh-CN": "金融机构明细事实确认" },
    civil_settlement: { ko: "민사합의", en: "Civil Settlement", "zh-CN": "民事和解" },
    insurance_settlement: { ko: "보험사합의", en: "Insurance Settlement", "zh-CN": "保险公司和解" },
    departure_insurance: { ko: "출국보험청구및수령행위", en: "Departure Insurance Claim", "zh-CN": "出境保险请求及领取" },
    funeral_expenses: { ko: "장제비청구 등", en: "Funeral Expenses Claim", "zh-CN": "丧葬费请求等" },
  }

  Object.keys(taskLabels).forEach((taskKey) => {
    const value = data[`authorized_tasks.${taskKey}`] || data?.authorized_tasks?.[taskKey] || false
    if (value === true || value === "true" || value === "on") {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.text(`☑ ${taskLabels[taskKey][locale]}`, 20, yPos)
      yPos += 7
    }
  })

  yPos += 10

  // 서명란
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  const powerDate = data.power_date || new Date().toISOString().split("T")[0]
  const dateLabel = locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"
  doc.text(`${dateLabel}: ${powerDate}`, 20, yPos)
  yPos += 10

  const principalSignature = locale === "ko" ? "위임인(외국인 부/모):" : locale === "en" ? "Principal (Foreign Parent):" : "委托人（外国人父/母）："
  doc.text(principalSignature, 20, yPos)
  yPos += 10

  const attorneySignature = locale === "ko" ? "수임인 변호사 이택기 (인)" : locale === "en" ? "Attorney Lee Taek-gi (Seal)" : "受托人 律师 李택기（印）"
  doc.text(attorneySignature, 20, yPos)

  // 푸터
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    const footerText = locale === "ko"
      ? "법무법인 세중 | 경기도 안산시 단원구 원곡로 45 세중빌딩 2층 | 전화: 031-8044-8805 | 이메일: contact@sejoonglaw.kr"
      : locale === "en"
      ? "Sejoong Law Firm | 2F Sejoong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do | Phone: 031-8044-8805 | Email: contact@sejoonglaw.kr"
      : "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: contact@sejoonglaw.kr"
    doc.text(footerText, 105, 285, { align: "center", maxWidth: 170 })
  }

  return doc
}

// 변호인선임서 PDF 생성
export function generateAttorneyAppointmentPDF(data: PDFData, locale: "ko" | "en" | "zh-CN" | "si" | "ta" = "ko") {
  const doc = new jsPDF()
  let yPos = 20

  const counselOffice = locale === "ko" ? "법률사무소 세중" : locale === "en" ? "Sejoong Law Office" : "世中律师事务所"
  const counselName = locale === "ko" ? "변호사 이택기" : locale === "en" ? "Attorney Lee Taek-gi" : "律师 李택기"
  const counselAddress =
    locale === "ko"
      ? "안산시 단원구 원곡로 45, 세중빌딩 2층"
      : locale === "en"
        ? "2F Sejoong Building, 45 Wonkok-ro, Danwon-gu, Ansan-si"
        : "安山市檀园区元谷路45号世中大厦2层"
  const counselPhoneFax =
    locale === "ko"
      ? "전화: 031-8044-8805  팩스: 031-491-8817"
      : locale === "en"
        ? "Phone: 031-8044-8805  Fax: 031-491-8817"
        : "电话: 031-8044-8805  传真: 031-491-8817"

  // 제목
  doc.setFontSize(18)
  const title = locale === "ko" ? "변호인선임서" : locale === "en" ? "Attorney Appointment" : "律师任命书"
  doc.text(title, 105, yPos, { align: "center" })
  yPos += 15

  doc.setFontSize(10)
  const fields = [
    { key: "case_number", label: locale === "ko" ? "사건" : locale === "en" ? "Case Number" : "案件" },
    { key: "victim", label: locale === "ko" ? "피해자" : locale === "en" ? "Victim" : "受害者" },
    { key: "appointer_name", label: locale === "ko" ? "선임인 가족대표자 성명" : locale === "en" ? "Appointer Family Representative Name" : "任命人家属代表姓名" },
    { key: "appointer_id_number", label: locale === "ko" ? "본국신분증번호" : locale === "en" ? "ID Number" : "本国身份证号" },
    { key: "appointer_relation", label: locale === "ko" ? "관계" : locale === "en" ? "Relation" : "关系" },
    { key: "court", label: locale === "ko" ? "법원" : locale === "en" ? "Court" : "法院" },
  ]

  fields.forEach((field) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    const value = data[field.key] || ""
    doc.text(`${field.label}: ${value}`, 20, yPos)
    yPos += 7
  })

  yPos += 6
  doc.setFontSize(11)
  const counselLabel = locale === "ko" ? "변호인" : locale === "en" ? "Counsel" : "律师"
  doc.text(`${counselLabel}:`, 20, yPos)
  yPos += 7
  doc.setFontSize(10)
  doc.text(`${counselOffice}`, 26, yPos)
  yPos += 6
  doc.text(`${counselName}`, 26, yPos)
  yPos += 6
  doc.text(`${counselAddress}`, 26, yPos)
  yPos += 6
  doc.text(`${counselPhoneFax}`, 26, yPos)

  yPos += 10

  const appointmentDate = data.appointment_date || new Date().toISOString().split("T")[0]
  const dateLabel = locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"
  doc.text(`${dateLabel}: ${appointmentDate}`, 20, yPos)

  // 푸터
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    const footerText = locale === "ko"
      ? "법무법인 세중 | 경기도 안산시 단원구 원곡로 45 세중빌딩 2층 | 전화: 031-8044-8805 | 이메일: contact@sejoonglaw.kr"
      : locale === "en"
      ? "Sejoong Law Firm | 2F Sejoong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do | Phone: 031-8044-8805 | Email: contact@sejoonglaw.kr"
      : "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: contact@sejoonglaw.kr"
    doc.text(footerText, 105, 285, { align: "center", maxWidth: 170 })
  }

  return doc
}

// 소송위임장 PDF 생성
export function generateLitigationPowerPDF(data: PDFData, locale: "ko" | "en" | "zh-CN" | "si" | "ta" = "ko") {
  const doc = new jsPDF()
  let yPos = 20

  // 제목
  doc.setFontSize(18)
  const title = locale === "ko" ? "소송위임장" : locale === "en" ? "Litigation Power" : "诉讼委托书"
  doc.text(title, 105, yPos, { align: "center" })
  yPos += 15

  doc.setFontSize(10)
  const fields = [
    { key: "case_number", label: locale === "ko" ? "사건" : locale === "en" ? "Case Number" : "案件" },
    { key: "plaintiff", label: locale === "ko" ? "원고" : locale === "en" ? "Plaintiff" : "原告" },
    { key: "defendant", label: locale === "ko" ? "피고" : locale === "en" ? "Defendant" : "被告" },
    { key: "attorney_office", label: locale === "ko" ? "법률사무소" : locale === "en" ? "Law Office" : "律师事务所" },
    { key: "attorney_name", label: locale === "ko" ? "변호사 성명" : locale === "en" ? "Attorney Name" : "律师姓名" },
    { key: "attorney_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址" },
    { key: "attorney_phone", label: locale === "ko" ? "전화" : locale === "en" ? "Phone" : "电话" },
    { key: "attorney_fax", label: locale === "ko" ? "팩스" : locale === "en" ? "Fax" : "传真" },
    { key: "principal_name", label: locale === "ko" ? "위임인 가족대표 성명" : locale === "en" ? "Principal Family Representative Name" : "委托人家属代表姓名" },
    { key: "principal_id_number", label: locale === "ko" ? "본국신분증번호" : locale === "en" ? "ID Number" : "本国身份证号" },
    { key: "court", label: locale === "ko" ? "법원" : locale === "en" ? "Court" : "法院" },
  ]

  fields.forEach((field) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    const value = data[field.key] || ""
    doc.text(`${field.label}: ${value}`, 20, yPos)
    yPos += 7
  })

  yPos += 5

  // 수권사항
  doc.setFontSize(12)
  const authorizedLabel = locale === "ko" ? "수권사항" : locale === "en" ? "Authorized Actions" : "授权事项"
  doc.text(authorizedLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const authorizedLabels: Record<string, Record<"ko" | "en" | "zh-CN", string>> = {
    all_litigation: { ko: "일체의 소송행위", en: "All Litigation Actions", "zh-CN": "一切诉讼行为" },
    record_access: { ko: "기록복사 및 열람", en: "Record Copy and Access", "zh-CN": "记录复制及查阅" },
    payment_receipt: { ko: "변제의 수령", en: "Payment Receipt", "zh-CN": "还款领取" },
    sub_attorney: { ko: "복대리인의 선임", en: "Sub-Attorney Appointment", "zh-CN": "复代理人任命" },
    settlement: { ko: "재판상 또는 재판외의 화해", en: "Settlement", "zh-CN": "审判上或审判外和解" },
    security_rights: { ko: "담보권 행사 및 최고신청", en: "Security Rights", "zh-CN": "担保权行使及催告申请" },
    costs_application: { ko: "소송비용 확정 신청", en: "Costs Application", "zh-CN": "诉讼费用确定申请" },
    deposit_actions: { ko: "공탁신청 및 공탁금 납입행위", en: "Deposit Actions", "zh-CN": "提存申请及提存金缴纳行为" },
    withdrawal_actions: { ko: "공탁금 출급회 수청구 및 공탁통지서 수령행위", en: "Withdrawal Actions", "zh-CN": "提存金提取请求及提存通知书领取行为" },
    record_access_detailed: { ko: "공탁기록 열람/복사", en: "Deposit Record Access", "zh-CN": "提存记录查阅/复制" },
    certificate_receipt: { ko: "사실증명•청과 수령행위 일체", en: "Certificate Receipt", "zh-CN": "事实证明•请求领取行为一切" },
  }

  Object.keys(authorizedLabels).forEach((key) => {
    const value = data[`authorized_actions.${key}`] || data?.authorized_actions?.[key] || false
    if (value === true || value === "true" || value === "on") {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.text(`☑ ${authorizedLabels[key][locale]}`, 20, yPos)
      yPos += 7
    }
  })

  yPos += 5

  // 기타 특별수권사항
  doc.setFontSize(12)
  const specialLabel = locale === "ko" ? "기타 특별수권사항" : locale === "en" ? "Special Authority" : "其他特别授权事项"
  doc.text(specialLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const specialLabels: Record<string, Record<"ko" | "en" | "zh-CN", string>> = {
    withdrawal_of_suit: { ko: "소의 취하", en: "Withdrawal of Suit", "zh-CN": "诉讼撤回" },
    withdrawal_of_appeal: { ko: "상소의 취하", en: "Withdrawal of Appeal", "zh-CN": "上诉撤回" },
    waiver_of_claim: { ko: "청구의 포기", en: "Waiver of Claim", "zh-CN": "请求放弃" },
    admission_of_claim: { ko: "청구의 인낙", en: "Admission of Claim", "zh-CN": "请求承认" },
    withdrawal_from_suit: { ko: "소송 탈퇴", en: "Withdrawal from Suit", "zh-CN": "诉讼退出" },
  }

  Object.keys(specialLabels).forEach((key) => {
    const value = data[`special_authority.${key}`] || data?.special_authority?.[key] || false
    if (value === true || value === "true" || value === "on") {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.text(`☑ ${specialLabels[key][locale]}`, 20, yPos)
      yPos += 7
    }
  })

  yPos += 10

  const powerDate = data.power_date || new Date().toISOString().split("T")[0]
  const dateLabel = locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"
  doc.text(`${dateLabel}: ${powerDate}`, 20, yPos)

  // 푸터
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    const footerText = locale === "ko"
      ? "법무법인 세중 | 경기도 안산시 단원구 원곡로 45 세중빌딩 2층 | 전화: 031-8044-8805 | 이메일: contact@sejoonglaw.kr"
      : locale === "en"
      ? "Sejoong Law Firm | 2F Sejoong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do | Phone: 031-8044-8805 | Email: contact@sejoonglaw.kr"
      : "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: contact@sejoonglaw.kr"
    doc.text(footerText, 105, 285, { align: "center", maxWidth: 170 })
  }

  return doc
}

// 사망보험금지급동의 PDF 생성
export function generateInsuranceConsentPDF(data: PDFData, locale: "ko" | "en" | "zh-CN" | "si" | "ta" = "ko") {
  const doc = new jsPDF()
  let yPos = 20

  // 제목
  doc.setFontSize(16)
  const title = locale === "ko" 
    ? "사망보험금 지급 동의 법정상속인 확인서"
    : locale === "en"
    ? "Death Insurance Payment Consent Legal Heir Confirmation"
    : "死亡保险金支付同意法定继承人确认书"
  doc.text(title, 105, yPos, { align: "center" })
  yPos += 15

  doc.setFontSize(10)
  const fields = [
    { key: "recipient_company", label: locale === "ko" ? "수신" : locale === "en" ? "Recipient" : "收件" },
    { key: "sender_company", label: locale === "ko" ? "발신" : locale === "en" ? "Sender" : "发件" },
    { key: "sender_registration", label: locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : "营业执照号" },
    { key: "sender_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址" },
    { key: "insured_name", label: locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名" },
    { key: "insured_registration", label: locale === "ko" ? "거소신고" : locale === "en" ? "Residence Registration" : "居所申报" },
    { key: "insured_birthdate", label: locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : "出生日期" },
    { key: "insured_gender", label: locale === "ko" ? "성별" : locale === "en" ? "Gender" : "性别" },
    { key: "insured_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址" },
    { key: "insurance_product", label: locale === "ko" ? "보험상품명" : locale === "en" ? "Insurance Product" : "保险产品名称" },
    { key: "policyholder", label: locale === "ko" ? "보험계약자" : locale === "en" ? "Policyholder" : "投保人" },
    { key: "policyholder_registration", label: locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : "营业执照号" },
    { key: "contract_date_1", label: locale === "ko" ? "계약일자 1" : locale === "en" ? "Contract Date 1" : "合同日期1" },
    { key: "contract_date_2", label: locale === "ko" ? "계약일자 2" : locale === "en" ? "Contract Date 2" : "合同日期2" },
    { key: "beneficiary_name", label: locale === "ko" ? "수익자 성명" : locale === "en" ? "Beneficiary Name" : "受益人姓名" },
    { key: "beneficiary_registration", label: locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : "营业执照号" },
  ]

  fields.forEach((field) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    const value = data[field.key] || ""
    doc.text(`${field.label}: ${value}`, 20, yPos)
    yPos += 7
  })

  yPos += 5

  // 법정상속인
  doc.setFontSize(12)
  const heirsLabel = locale === "ko" ? "법정상속인" : locale === "en" ? "Legal Heirs" : "法定继承人"
  doc.text(heirsLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const heirFields = [
    { key: "heir_1_name", label: locale === "ko" ? "본국성명" : locale === "en" ? "Name" : "本国姓名" },
    { key: "heir_1_id", label: locale === "ko" ? "본국 신분증번호" : locale === "en" ? "ID Number" : "本国身份证号" },
    { key: "heir_1_relation", label: locale === "ko" ? "보험자와의 관계" : locale === "en" ? "Relation" : "与投保人关系" },
    { key: "heir_2_name", label: locale === "ko" ? "본국성명" : locale === "en" ? "Name" : "本国姓名" },
    { key: "heir_2_id", label: locale === "ko" ? "본국 신분증번호" : locale === "en" ? "ID Number" : "本国身份证号" },
    { key: "heir_2_relation", label: locale === "ko" ? "보험자와의 관계" : locale === "en" ? "Relation" : "与投保人关系" },
  ]

  heirFields.forEach((field) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    const value = data[field.key] || ""
    doc.text(`${field.label}: ${value}`, 20, yPos)
    yPos += 7
  })

  yPos += 10

  const consentDate = data.consent_date || new Date().toISOString().split("T")[0]
  const dateLabel = locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"
  doc.text(`${dateLabel}: ${consentDate}`, 20, yPos)

  // 푸터
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    const footerText = locale === "ko"
      ? "법무법인 세중 | 경기도 안산시 단원구 원곡로 45 세중빌딩 2층 | 전화: 031-8044-8805 | 이메일: contact@sejoonglaw.kr"
      : locale === "en"
      ? "Sejoong Law Firm | 2F Sejoong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do | Phone: 031-8044-8805 | Email: contact@sejoonglaw.kr"
      : "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: contact@sejoonglaw.kr"
    doc.text(footerText, 105, 285, { align: "center", maxWidth: 170 })
  }

  return doc
}

// 메인 PDF 생성 함수
export function generatePDF(
  documentType: DocumentType,
  data: PDFData,
  locale: "ko" | "en" | "zh-CN" | "si" | "ta" = "ko"
): jsPDF {
  switch (documentType) {
    case "agreement":
    case "agreement_old":
      return generateAgreementPDF(data, locale)
    case "power_of_attorney":
    case "power_of_attorney_old":
      return generatePowerOfAttorneyPDF(data, locale)
    case "attorney_appointment":
    case "attorney_appointment_old":
      return generateAttorneyAppointmentPDF(data, locale)
    case "litigation_power":
    case "litigation_power_old":
      return generateLitigationPowerPDF(data, locale)
    case "insurance_consent":
    case "insurance_consent_old":
      return generateInsuranceConsentPDF(data, locale)
    default:
      throw new Error(`Unknown document type: ${documentType}`)
  }
}

