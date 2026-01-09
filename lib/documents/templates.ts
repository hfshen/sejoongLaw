// Document type definitions and field templates

export type DocumentType =
  | "agreement" // 합의서
  | "power_of_attorney" // 위임장
  | "attorney_appointment" // 변호인선임서
  | "litigation_power" // 소송위임장
  | "insurance_consent" // 사망보험금지급동의

export interface DocumentTemplate {
  type: DocumentType
  fields: FieldDefinition[]
}

export interface FieldDefinition {
  key: string
  label: Record<"ko" | "en" | "zh-CN", string>
  type: "text" | "date" | "number" | "textarea" | "select" | "checkbox"
  required?: boolean
  options?: Array<{ value: string; label: Record<"ko" | "en" | "zh-CN", string> }>
  group?: string
}

// 합의서 (Agreement)
export const agreementTemplate: DocumentTemplate = {
  type: "agreement",
  fields: [
    {
      key: "deceased_name",
      label: { ko: "망인 성명", en: "Deceased Name", "zh-CN": "死者姓名" },
      type: "text",
      required: true,
      group: "deceased",
    },
    {
      key: "deceased_foreigner_id",
      label: { ko: "외국인등록번호", en: "Foreigner Registration Number", "zh-CN": "外国人登记号" },
      type: "text",
      group: "deceased",
    },
    {
      key: "deceased_birthdate",
      label: { ko: "생년월일", en: "Date of Birth", "zh-CN": "出生日期" },
      type: "date",
      group: "deceased",
    },
    {
      key: "deceased_address",
      label: { ko: "주소지", en: "Address", "zh-CN": "地址" },
      type: "text",
      group: "deceased",
    },
    {
      key: "incident_location",
      label: { ko: "사건발생위치", en: "Incident Location", "zh-CN": "事件发生地点" },
      type: "text",
      group: "deceased",
    },
    {
      key: "incident_time",
      label: { ko: "사건발생시간", en: "Incident Time", "zh-CN": "事件发生时间" },
      type: "text",
      group: "deceased",
    },
    // 갑 (유가족 대표)
    {
      key: "party_a_nationality",
      label: { ko: "국적", en: "Nationality", "zh-CN": "国籍" },
      type: "text",
      group: "party_a",
    },
    {
      key: "party_a_name",
      label: { ko: "성명", en: "Name", "zh-CN": "姓名" },
      type: "text",
      required: true,
      group: "party_a",
    },
    {
      key: "party_a_birthdate",
      label: { ko: "생년월일", en: "Date of Birth", "zh-CN": "出生日期" },
      type: "date",
      group: "party_a",
    },
    {
      key: "party_a_contact",
      label: { ko: "연락처", en: "Contact", "zh-CN": "联系方式" },
      type: "text",
      group: "party_a",
    },
    {
      key: "party_a_relation",
      label: { ko: "관계", en: "Relation", "zh-CN": "关系" },
      type: "select",
      options: [
        { value: "부", label: { ko: "부", en: "Father", "zh-CN": "父" } },
        { value: "모", label: { ko: "모", en: "Mother", "zh-CN": "母" } },
        { value: "기타", label: { ko: "기타", en: "Other", "zh-CN": "其他" } },
      ],
      group: "party_a",
    },
    {
      key: "party_a_id_number",
      label: { ko: "본국 신분증 번호", en: "ID Number", "zh-CN": "本国身份证号" },
      type: "text",
      group: "party_a",
    },
    {
      key: "party_a_address",
      label: { ko: "본국 주소", en: "Home Address", "zh-CN": "本国地址" },
      type: "text",
      group: "party_a",
    },
    // 을 (사업장 대표)
    {
      key: "party_b_company_name",
      label: { ko: "상호", en: "Company Name", "zh-CN": "公司名称" },
      type: "text",
      group: "party_b",
    },
    {
      key: "party_b_representative",
      label: { ko: "대표자 성명", en: "Representative Name", "zh-CN": "代表姓名" },
      type: "text",
      group: "party_b",
    },
    {
      key: "party_b_registration",
      label: { ko: "사업자등록번호", en: "Business Registration Number", "zh-CN": "营业执照号" },
      type: "text",
      group: "party_b",
    },
    {
      key: "party_b_contact",
      label: { ko: "연락처", en: "Contact", "zh-CN": "联系方式" },
      type: "text",
      group: "party_b",
    },
    {
      key: "party_b_address",
      label: { ko: "주소", en: "Address", "zh-CN": "地址" },
      type: "textarea",
      group: "party_b",
    },
    {
      key: "agreement_date",
      label: { ko: "합의일자", en: "Agreement Date", "zh-CN": "协议日期" },
      type: "date",
      required: true,
      group: "general",
    },
    {
      key: "signature_date",
      label: { ko: "서명일자", en: "Signature Date", "zh-CN": "签名日期" },
      type: "date",
      group: "general",
    },
  ],
}

// 위임장 (Power of Attorney)
export const powerOfAttorneyTemplate: DocumentTemplate = {
  type: "power_of_attorney",
  fields: [
    // 위임인
    {
      key: "principal_name",
      label: { ko: "성명", en: "Name", "zh-CN": "姓名" },
      type: "text",
      required: true,
      group: "principal",
    },
    {
      key: "principal_birthdate",
      label: { ko: "생년월일", en: "Date of Birth", "zh-CN": "出生日期" },
      type: "date",
      group: "principal",
    },
    {
      key: "principal_passport",
      label: { ko: "여권번호", en: "Passport Number", "zh-CN": "护照号" },
      type: "text",
      group: "principal",
    },
    {
      key: "principal_id_number",
      label: { ko: "본국신분증번호", en: "ID Number", "zh-CN": "本国身份证号" },
      type: "text",
      group: "principal",
    },
    {
      key: "principal_address",
      label: { ko: "본국주소", en: "Home Address", "zh-CN": "本国地址" },
      type: "textarea",
      group: "principal",
    },
    // 위임업무
    {
      key: "authorized_tasks",
      label: { ko: "위임업무", en: "Authorized Tasks", "zh-CN": "委托业务" },
      type: "checkbox",
      options: [
        { value: "civil_criminal", label: { ko: "민·형사소송 위임", en: "Civil/Criminal Litigation", "zh-CN": "民事/刑事诉讼委托" } },
        { value: "labor_complaint", label: { ko: "노동부진정서 위임", en: "Labor Complaint", "zh-CN": "劳动部申诉委托" } },
        { value: "wage_claim", label: { ko: "임금체불 및 수령행위", en: "Wage Claim", "zh-CN": "工资拖欠及领取" } },
        { value: "damages_claim", label: { ko: "손해배상청구 위임", en: "Damages Claim", "zh-CN": "损害赔偿请求委托" } },
        { value: "death_insurance", label: { ko: "사망보험금 청구 및 수령행위 일체권한", en: "Death Insurance Claim", "zh-CN": "死亡保险金请求及领取全部权限" } },
        { value: "insurance_claim", label: { ko: "보험금청구 및 수령행위", en: "Insurance Claim", "zh-CN": "保险金请求及领取" } },
        { value: "deposit_withdrawal", label: { ko: "공탁출금 및 수령행위", en: "Deposit Withdrawal", "zh-CN": "提存提取及领取" } },
        { value: "criminal_settlement", label: { ko: "형사합의", en: "Criminal Settlement", "zh-CN": "刑事和解" } },
        { value: "severance_claim", label: { ko: "퇴직금청구 및 급여정산 수령행위", en: "Severance Claim", "zh-CN": "退休金请求及工资结算领取" } },
        { value: "financial_inquiry", label: { ko: "금융권 내역사실 확인", en: "Financial Inquiry", "zh-CN": "金融机构明细事实确认" } },
        { value: "civil_settlement", label: { ko: "민사합의", en: "Civil Settlement", "zh-CN": "民事和解" } },
        { value: "insurance_settlement", label: { ko: "보험사합의", en: "Insurance Settlement", "zh-CN": "保险公司和解" } },
        { value: "departure_insurance", label: { ko: "출국보험청구및수령행위", en: "Departure Insurance Claim", "zh-CN": "出境保险请求及领取" } },
        { value: "funeral_expenses", label: { ko: "장제비청구 등", en: "Funeral Expenses Claim", "zh-CN": "丧葬费请求等" } },
      ],
      group: "tasks",
    },
    {
      key: "power_date",
      label: { ko: "위임일자", en: "Power Date", "zh-CN": "委托日期" },
      type: "date",
      required: true,
    },
  ],
}

// 변호인선임서 (Attorney Appointment)
export const attorneyAppointmentTemplate: DocumentTemplate = {
  type: "attorney_appointment",
  fields: [
    {
      key: "case_number",
      label: { ko: "사건", en: "Case Number", "zh-CN": "案件" },
      type: "text",
      group: "case",
    },
    {
      key: "victim",
      label: { ko: "피해자", en: "Victim", "zh-CN": "受害者" },
      type: "text",
      group: "case",
    },
    {
      key: "appointer_name",
      label: { ko: "성명", en: "Name", "zh-CN": "姓名" },
      type: "text",
      required: true,
      group: "appointer",
    },
    {
      key: "appointer_id_number",
      label: { ko: "본국신분증번호", en: "ID Number", "zh-CN": "本国身份证号" },
      type: "text",
      group: "appointer",
    },
    {
      key: "appointer_relation",
      label: { ko: "관계", en: "Relation", "zh-CN": "关系" },
      type: "select",
      options: [
        { value: "부", label: { ko: "부", en: "Father", "zh-CN": "父" } },
        { value: "모", label: { ko: "모", en: "Mother", "zh-CN": "母" } },
        { value: "기타", label: { ko: "기타", en: "Other", "zh-CN": "其他" } },
      ],
      group: "appointer",
    },
    {
      key: "attorney_name",
      label: { ko: "변호인 성명", en: "Attorney Name", "zh-CN": "律师姓名" },
      type: "text",
      required: true,
      group: "attorney",
    },
    {
      key: "attorney_office",
      label: { ko: "법률사무소", en: "Law Office", "zh-CN": "律师事务所" },
      type: "text",
      group: "attorney",
    },
    {
      key: "attorney_address",
      label: { ko: "주소", en: "Address", "zh-CN": "地址" },
      type: "textarea",
      group: "attorney",
    },
    {
      key: "attorney_phone",
      label: { ko: "전화", en: "Phone", "zh-CN": "电话" },
      type: "text",
      group: "attorney",
    },
    {
      key: "attorney_fax",
      label: { ko: "팩스", en: "Fax", "zh-CN": "传真" },
      type: "text",
      group: "attorney",
    },
    {
      key: "court",
      label: { ko: "법원", en: "Court", "zh-CN": "法院" },
      type: "text",
      group: "attorney",
    },
    {
      key: "appointment_date",
      label: { ko: "선임일자", en: "Appointment Date", "zh-CN": "任命日期" },
      type: "date",
      required: true,
    },
  ],
}

// 소송위임장 (Litigation Power)
export const litigationPowerTemplate: DocumentTemplate = {
  type: "litigation_power",
  fields: [
    {
      key: "case_number",
      label: { ko: "사건", en: "Case Number", "zh-CN": "案件" },
      type: "text",
      group: "case",
    },
    {
      key: "plaintiff",
      label: { ko: "원고", en: "Plaintiff", "zh-CN": "原告" },
      type: "text",
      group: "case",
    },
    {
      key: "defendant",
      label: { ko: "피고", en: "Defendant", "zh-CN": "被告" },
      type: "text",
      group: "case",
    },
    {
      key: "special_authority.withdrawal_of_suit",
      label: { ko: "소의 취하", en: "Withdrawal of Suit", "zh-CN": "诉讼撤回" },
      type: "select",
      options: [
        { value: "O", label: { ko: "O (수권)", en: "O (Granted)", "zh-CN": "O（授权）" } },
        { value: "X", label: { ko: "X (보류)", en: "X (Reserved)", "zh-CN": "X（保留）" } },
      ],
      group: "special",
    },
    {
      key: "special_authority.withdrawal_of_appeal",
      label: { ko: "상소의 취하", en: "Withdrawal of Appeal", "zh-CN": "上诉撤回" },
      type: "select",
      options: [
        { value: "O", label: { ko: "O (수권)", en: "O (Granted)", "zh-CN": "O（授权）" } },
        { value: "X", label: { ko: "X (보류)", en: "X (Reserved)", "zh-CN": "X（保留）" } },
      ],
      group: "special",
    },
    {
      key: "special_authority.waiver_of_claim",
      label: { ko: "청구의 포기", en: "Waiver of Claim", "zh-CN": "请求放弃" },
      type: "select",
      options: [
        { value: "O", label: { ko: "O (수권)", en: "O (Granted)", "zh-CN": "O（授权）" } },
        { value: "X", label: { ko: "X (보류)", en: "X (Reserved)", "zh-CN": "X（保留）" } },
      ],
      group: "special",
    },
    {
      key: "special_authority.admission_of_claim",
      label: { ko: "청구의 인낙", en: "Admission of Claim", "zh-CN": "请求承认" },
      type: "select",
      options: [
        { value: "O", label: { ko: "O (수권)", en: "O (Granted)", "zh-CN": "O（授权）" } },
        { value: "X", label: { ko: "X (보류)", en: "X (Reserved)", "zh-CN": "X（保留）" } },
      ],
      group: "special",
    },
    {
      key: "special_authority.withdrawal_from_suit",
      label: { ko: "소송 탈퇴", en: "Withdrawal from Suit", "zh-CN": "诉讼退出" },
      type: "select",
      options: [
        { value: "O", label: { ko: "O (수권)", en: "O (Granted)", "zh-CN": "O（授权）" } },
        { value: "X", label: { ko: "X (보류)", en: "X (Reserved)", "zh-CN": "X（保留）" } },
      ],
      group: "special",
    },
    {
      key: "principal_name",
      label: { ko: "위임인 성명", en: "Principal Name", "zh-CN": "委托人姓名" },
      type: "text",
      required: true,
      group: "principal",
    },
    {
      key: "principal_id_number",
      label: { ko: "본국신분증번호", en: "ID Number", "zh-CN": "本国身份证号" },
      type: "text",
      group: "principal",
    },
    {
      key: "court",
      label: { ko: "법원", en: "Court", "zh-CN": "法院" },
      type: "text",
      group: "attorney",
    },
    {
      key: "power_date",
      label: { ko: "위임일자", en: "Power Date", "zh-CN": "委托日期" },
      type: "date",
      required: true,
    },
  ],
}

// 사망보험금지급동의 (Insurance Consent)
export const insuranceConsentTemplate: DocumentTemplate = {
  type: "insurance_consent",
  fields: [
    {
      key: "recipient_company",
      label: { ko: "수신 보험사", en: "Recipient Insurance Company", "zh-CN": "收件保险公司" },
      type: "text",
      group: "recipient",
    },
    {
      key: "sender_company",
      label: { ko: "발신 회사", en: "Sender Company", "zh-CN": "发件公司" },
      type: "text",
      group: "recipient",
    },
    {
      key: "sender_registration",
      label: { ko: "사업자등록번호", en: "Business Registration Number", "zh-CN": "营业执照号" },
      type: "text",
      group: "recipient",
    },
    {
      key: "sender_address",
      label: { ko: "주소", en: "Address", "zh-CN": "地址" },
      type: "textarea",
      group: "recipient",
    },
    {
      key: "insured_name",
      label: { ko: "피보험자 성명", en: "Insured Name", "zh-CN": "被保险人姓名" },
      type: "text",
      required: true,
      group: "insured",
    },
    {
      key: "insured_registration",
      label: { ko: "거소신고번호", en: "Residence Registration", "zh-CN": "居所申报号" },
      type: "text",
      group: "insured",
    },
    {
      key: "insured_birthdate",
      label: { ko: "생년월일", en: "Date of Birth", "zh-CN": "出生日期" },
      type: "date",
      group: "insured",
    },
    {
      key: "insured_gender",
      label: { ko: "성별", en: "Gender", "zh-CN": "性别" },
      type: "select",
      options: [
        { value: "남", label: { ko: "남", en: "Male", "zh-CN": "男" } },
        { value: "여", label: { ko: "여", en: "Female", "zh-CN": "女" } },
      ],
      group: "insured",
    },
    {
      key: "insured_address",
      label: { ko: "주소", en: "Address", "zh-CN": "地址" },
      type: "textarea",
      group: "insured",
    },
    {
      key: "insurance_product",
      label: { ko: "보험상품명", en: "Insurance Product", "zh-CN": "保险产品名称" },
      type: "text",
      group: "insurance",
    },
    {
      key: "policyholder",
      label: { ko: "보험계약자", en: "Policyholder", "zh-CN": "投保人" },
      type: "text",
      group: "insurance",
    },
    {
      key: "policyholder_registration",
      label: { ko: "사업자등록번호", en: "Business Registration Number", "zh-CN": "营业执照号" },
      type: "text",
      group: "insurance",
    },
    {
      key: "contract_date_1",
      label: { ko: "계약일자 1", en: "Contract Date 1", "zh-CN": "合同日期1" },
      type: "date",
      group: "insurance",
    },
    {
      key: "contract_date_2",
      label: { ko: "계약일자 2", en: "Contract Date 2", "zh-CN": "合同日期2" },
      type: "date",
      group: "insurance",
    },
    {
      key: "beneficiary_name",
      label: { ko: "수익자 성명", en: "Beneficiary Name", "zh-CN": "受益人姓名" },
      type: "text",
      group: "beneficiary",
    },
    {
      key: "beneficiary_registration",
      label: { ko: "사업자등록번호", en: "Business Registration Number", "zh-CN": "营业执照号" },
      type: "text",
      group: "beneficiary",
    },
    {
      key: "heir_1_name",
      label: { ko: "법정상속인 1 성명", en: "Heir 1 Name", "zh-CN": "法定继承人1姓名" },
      type: "text",
      group: "heirs",
    },
    {
      key: "heir_1_id",
      label: { ko: "본국 신분증번호", en: "ID Number", "zh-CN": "本国身份证号" },
      type: "text",
      group: "heirs",
    },
    {
      key: "heir_1_relation",
      label: { ko: "관계", en: "Relation", "zh-CN": "关系" },
      type: "text",
      group: "heirs",
    },
    {
      key: "heir_2_name",
      label: { ko: "법정상속인 2 성명", en: "Heir 2 Name", "zh-CN": "法定继承人2姓名" },
      type: "text",
      group: "heirs",
    },
    {
      key: "heir_2_id",
      label: { ko: "본국 신분증번호", en: "ID Number", "zh-CN": "本国身份证号" },
      type: "text",
      group: "heirs",
    },
    {
      key: "heir_2_relation",
      label: { ko: "관계", en: "Relation", "zh-CN": "关系" },
      type: "text",
      group: "heirs",
    },
    {
      key: "consent_date",
      label: { ko: "동의일자", en: "Consent Date", "zh-CN": "同意日期" },
      type: "date",
      required: true,
    },
  ],
}

export const documentTemplates: Record<DocumentType, DocumentTemplate> = {
  agreement: agreementTemplate,
  power_of_attorney: powerOfAttorneyTemplate,
  attorney_appointment: attorneyAppointmentTemplate,
  litigation_power: litigationPowerTemplate,
  insurance_consent: insuranceConsentTemplate,
}

export function getTemplate(type: DocumentType): DocumentTemplate {
  return documentTemplates[type]
}

export function getDocumentTypeLabel(
  type: DocumentType,
  locale: "ko" | "en" | "zh-CN" = "ko"
): string {
  const labels: Record<DocumentType, Record<"ko" | "en" | "zh-CN", string>> = {
    agreement: { ko: "합의서", en: "Agreement", "zh-CN": "协议" },
    power_of_attorney: { ko: "위임장", en: "Power of Attorney", "zh-CN": "委托书" },
    attorney_appointment: { ko: "변호인선임서", en: "Attorney Appointment", "zh-CN": "律师任命书" },
    litigation_power: { ko: "소송위임장", en: "Litigation Power", "zh-CN": "诉讼委托书" },
    insurance_consent: { ko: "사망보험금지급동의", en: "Insurance Consent", "zh-CN": "死亡保险金支付同意书" },
  }
  return labels[type][locale]
}

