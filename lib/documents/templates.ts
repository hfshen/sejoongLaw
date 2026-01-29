// Document type definitions and field templates

export type DocumentType =
  | "agreement" // 합의서
  | "power_of_attorney" // 위임장
  | "attorney_appointment" // 변호인선임서
  | "litigation_power" // 소송위임장
  | "insurance_consent" // 사망보험금지급동의
  // SEJOONG (법원 제출용 원본 양식 기반)
  | "agreement_old"
  | "power_of_attorney_old"
  | "attorney_appointment_old"
  | "litigation_power_old"
  | "insurance_consent_old"

export interface DocumentTemplate {
  type: DocumentType
  fields: FieldDefinition[]
}

export interface FieldDefinition {
  key: string
  label: Record<"ko" | "en" | "zh-CN" | "si" | "ta", string>
  type: "text" | "date" | "number" | "textarea" | "select" | "checkbox"
  required?: boolean
  options?: Array<{ value: string; label: Record<"ko" | "en" | "zh-CN" | "si" | "ta", string> }>
  group?: string
}

// 합의서 (Agreement)
export const agreementTemplate: DocumentTemplate = {
  type: "agreement",
  fields: [
    {
      key: "deceased_name",
      label: { ko: "망인 성명", en: "Deceased Name", "zh-CN": "死者姓名", si: "මියගිය පුද්ගලයාගේ නම", ta: "இறந்தவரின் பெயர்" },
      type: "text",
      required: true,
      group: "deceased",
    },
    {
      key: "deceased_foreigner_id",
      label: { ko: "외국인등록번호", en: "Foreigner Registration Number", "zh-CN": "外国人登记号", si: "අන්යජාතික ලියාපදිංචි අංකය", ta: "வெளிநாட்டவர் பதிவு எண்" },
      type: "text",
      group: "deceased",
    },
    {
      key: "deceased_birthdate",
      label: { ko: "생년월일", en: "Date of Birth", "zh-CN": "出生日期", si: "උපන් දිනය", ta: "பிறந்த தேதி" },
      type: "date",
      group: "deceased",
    },
    {
      key: "deceased_address",
      label: { ko: "주소지", en: "Address", "zh-CN": "地址", si: "ලිපිනය", ta: "முகவரி" },
      type: "text",
      group: "deceased",
    },
    {
      key: "incident_location",
      label: { ko: "사건발생위치", en: "Incident Location", "zh-CN": "事件发生地点", si: "සිද්ධිය සිදුවූ ස්ථානය", ta: "சம்பவம் நடந்த இடம்" },
      type: "text",
      group: "deceased",
    },
    {
      key: "incident_time",
      label: { ko: "사건발생시간", en: "Incident Time", "zh-CN": "事件发生时间", si: "සිද්ධිය සිදුවූ වේලාව", ta: "சம்பவம் நடந்த நேரம்" },
      type: "text",
      group: "deceased",
    },
    // 갑 (유가족 대표)
    {
      key: "party_a_nationality",
      label: { ko: "국적", en: "Nationality", "zh-CN": "国籍", si: "ජාතිකත්වය", ta: "தேசியம்" },
      type: "text",
      group: "party_a",
    },
    {
      key: "party_a_name",
      label: { ko: "성명", en: "Name", "zh-CN": "姓名", si: "නම", ta: "பெயர்" },
      type: "text",
      required: true,
      group: "party_a",
    },
    {
      key: "party_a_birthdate",
      label: { ko: "생년월일", en: "Date of Birth", "zh-CN": "出生日期", si: "උපන් දිනය", ta: "பிறந்த தேதி" },
      type: "date",
      group: "party_a",
    },
    {
      key: "party_a_contact",
      label: { ko: "연락처", en: "Contact", "zh-CN": "联系方式", si: "සම්බන්ධකම්", ta: "தொடர்பு" },
      type: "text",
      group: "party_a",
    },
    {
      key: "party_a_relation",
      label: { ko: "관계", en: "Relation", "zh-CN": "关系", si: "සම්බන්ධතාවය", ta: "உறவு" },
      type: "select",
      options: [
        { value: "부", label: { ko: "부", en: "Father", "zh-CN": "父", si: "පියා", ta: "தந்தை" } },
        { value: "모", label: { ko: "모", en: "Mother", "zh-CN": "母", si: "මව", ta: "தாய்" } },
        { value: "기타", label: { ko: "기타", en: "Other", "zh-CN": "其他", si: "වෙනත්", ta: "மற்றவை" } },
      ],
      group: "party_a",
    },
    {
      key: "party_a_relation_other",
      label: { ko: "관계(기타)", en: "Relation (Other)", "zh-CN": "关系(其他)", si: "සම්බන්ධතාවය (වෙනත්)", ta: "உறவு (மற்றவை)" },
      type: "text",
      group: "party_a",
    },
    {
      key: "party_a_id_number",
      label: { ko: "본국 신분증 번호", en: "ID Number", "zh-CN": "本国身份证号", si: "ජාතික හැඳුනුම්පත් අංකය", ta: "தேசிய அடையாள அட்டை எண்" },
      type: "text",
      group: "party_a",
    },
    {
      key: "party_a_address",
      label: { ko: "본국 주소", en: "Home Address", "zh-CN": "本国地址", si: "මව්රට ලිපිනය", ta: "தாய்நாட்டு முகவரி" },
      type: "text",
      group: "party_a",
    },

    // 갑 (유가족 추가 1명: 부/모 등)
    {
      key: "party_a_2_name",
      label: { ko: "추가 유가족 성명", en: "Additional Family Name", "zh-CN": "追加家属姓名", si: "අමතර පවුලේ නම", ta: "கூடுதல் குடும்ப பெயர்" },
      type: "text",
      group: "party_a",
    },
    {
      key: "party_a_2_relation",
      label: { ko: "추가 유가족 관계", en: "Additional Relation", "zh-CN": "追加家属关系", si: "අමතර සම්බන්ධතාවය", ta: "கூடுதல் உறவு" },
      type: "select",
      options: [
        { value: "부", label: { ko: "부", en: "Father", "zh-CN": "父", si: "පියා", ta: "தந்தை" } },
        { value: "모", label: { ko: "모", en: "Mother", "zh-CN": "母", si: "මව", ta: "தாய்" } },
        { value: "기타", label: { ko: "기타", en: "Other", "zh-CN": "其他", si: "වෙනත්", ta: "மற்றவை" } },
      ],
      group: "party_a",
    },
    {
      key: "party_a_2_relation_other",
      label: { ko: "추가 유가족 관계(기타)", en: "Additional Relation (Other)", "zh-CN": "追加家属关系(其他)", si: "අමතර සම්බන්ධතාවය (වෙනත්)", ta: "கூடுதல் உறவு (மற்றவை)" },
      type: "text",
      group: "party_a",
    },
    {
      key: "party_a_2_id_number",
      label: { ko: "추가 유가족 본국 신분증 번호", en: "Additional ID Number", "zh-CN": "追加家属本国身份证号", si: "අමතර ජාතික හැඳුනුම්පත් අංකය", ta: "கூடுதல் தேசிய அடையாள அட்டை எண்" },
      type: "text",
      group: "party_a",
    },
    {
      key: "party_a_2_address",
      label: { ko: "추가 유가족 본국 주소", en: "Additional Home Address", "zh-CN": "追加家属本国地址", si: "අමතර මව්රට ලිපිනය", ta: "கூடுதல் தாய்நாட்டு முகவரி" },
      type: "text",
      group: "party_a",
    },
    // 을 (사업장 대표)
    {
      key: "party_b_company_name",
      label: { ko: "상호", en: "Company Name", "zh-CN": "公司名称", si: "සමාගමේ නම", ta: "நிறுவனத்தின் பெயர்" },
      type: "text",
      group: "party_b",
    },
    {
      key: "party_b_representative",
      label: { ko: "대표자 성명", en: "Representative Name", "zh-CN": "代表姓名", si: "නියෝජිත නම", ta: "பிரதிநிதி பெயர்" },
      type: "text",
      group: "party_b",
    },
    {
      key: "party_b_registration",
      label: { ko: "사업자등록번호", en: "Business Registration Number", "zh-CN": "营业执照号", si: "ව්‍යාපාර ලියාපදිංචි අංකය", ta: "வணிக பதிவு எண்" },
      type: "text",
      group: "party_b",
    },
    {
      key: "party_b_contact",
      label: { ko: "연락처", en: "Contact", "zh-CN": "联系方式", si: "සම්බන්ධකම්", ta: "தொடர்பு" },
      type: "text",
      group: "party_b",
    },
    {
      key: "party_b_address",
      label: { ko: "주소", en: "Address", "zh-CN": "地址", si: "ලිපිනය", ta: "முகவரி" },
      type: "textarea",
      group: "party_b",
    },
    {
      key: "agreement_date",
      label: { ko: "합의일자", en: "Agreement Date", "zh-CN": "协议日期", si: "එකඟතාවයේ දිනය", ta: "ஒப்பந்த தேதி" },
      type: "date",
      group: "general",
    },
    {
      key: "signature_date",
      label: { ko: "서명일자", en: "Signature Date", "zh-CN": "签名日期", si: "අත්සන දිනය", ta: "கையெழுத்து தேதி" },
      type: "date",
      group: "general",
    },
  ],
}

// SEJOONG 템플릿: 1차는 기존 필드셋을 그대로 재사용(레이아웃은 별도 Preview로 원본 양식에 맞춤)
export const agreementOldTemplate: DocumentTemplate = {
  type: "agreement_old",
  fields: agreementTemplate.fields,
}

// 위임장 (Power of Attorney)
export const powerOfAttorneyTemplate: DocumentTemplate = {
  type: "power_of_attorney",
  fields: [
    // 위임인
    {
      key: "principal_name",
      label: { ko: "성명", en: "Name", "zh-CN": "姓名", si: "නම", ta: "பெயர்" },
      type: "text",
      required: true,
      group: "principal",
    },
    {
      key: "principal_birthdate",
      label: { ko: "생년월일", en: "Date of Birth", "zh-CN": "出生日期", si: "උපන් දිනය", ta: "பிறந்த தேதி" },
      type: "date",
      group: "principal",
    },
    {
      key: "principal_passport",
      label: { ko: "여권번호", en: "Passport Number", "zh-CN": "护照号", si: "රැකියා අංකය", ta: "கடவுச்சீட்டு எண்" },
      type: "text",
      group: "principal",
    },
    {
      key: "principal_id_number",
      label: { ko: "본국신분증번호", en: "ID Number", "zh-CN": "本国身份证号", si: "ජාතික හැඳුනුම්පත් අංකය", ta: "தேசிய அடையாள அட்டை எண்" },
      type: "text",
      group: "principal",
    },
    {
      key: "principal_address",
      label: { ko: "본국주소", en: "Home Address", "zh-CN": "本国地址", si: "මව්රට ලිපිනය", ta: "தாய்நாட்டு முகவரி" },
      type: "textarea",
      group: "principal",
    },
    // 위임업무
    {
      key: "authorized_tasks",
      label: { ko: "위임업무", en: "Authorized Tasks", "zh-CN": "委托业务", si: "අනුමත කාර්යයන්", ta: "அங்கீகரிக்கப்பட்ட பணிகள்" },
      type: "checkbox",
      options: [
        { value: "civil_criminal", label: { ko: "민·형사소송 위임", en: "Civil/Criminal Litigation", "zh-CN": "民事/刑事诉讼委托", si: "සිවිල්/අපරාධ නඩු කටයුතු", ta: "சிவில்/குற்றவியல் வழக்கு" } },
        { value: "labor_complaint", label: { ko: "노동부진정서 위임", en: "Labor Complaint", "zh-CN": "劳动部申诉委托", si: "කම්කරු පැමිණිලි", ta: "தொழிலாளர் புகார்" } },
        { value: "wage_claim", label: { ko: "임금체불 및 수령행위", en: "Wage Claim", "zh-CN": "工资拖欠及领取", si: "වැටුප් ණය සහ ලැබීම", ta: "சம்பள கடன் மற்றும் பெறுதல்" } },
        { value: "damages_claim", label: { ko: "손해배상청구 위임", en: "Damages Claim", "zh-CN": "损害赔偿请求委托", si: "හානි හිමිකම්", ta: "சேதம் கோரிக்கை" } },
        { value: "death_insurance", label: { ko: "사망보험금 청구 및 수령행위 일체권한", en: "Death Insurance Claim", "zh-CN": "死亡保险金请求及领取全部权限", si: "මරණ රක්ෂණ ප්‍රතිලාභ හිමිකම් සහ ලැබීම (සම්පූර්ණ අධිකාරිය)", ta: "மரண காப்பீட்டு நன்மை கோரிக்கை மற்றும் பெறுதல் (முழு அதிகாரம்)" } },
        { value: "insurance_claim", label: { ko: "보험금청구 및 수령행위", en: "Insurance Claim", "zh-CN": "保险金请求及领取", si: "රක්ෂණ හිමිකම් සහ ලැබීම", ta: "காப்பீட்டு கோரிக்கை மற்றும் பெறுதல்" } },
        { value: "deposit_withdrawal", label: { ko: "공탁출금 및 수령행위", en: "Deposit Withdrawal", "zh-CN": "提存提取及领取", si: "අධිකරණ තැන්පතුව ආපසු ගැනීම සහ ලැබීම", ta: "நீதிமன்ற வைப்பு திரும்பப்பெறுதல் மற்றும் பெறுதல்" } },
        { value: "criminal_settlement", label: { ko: "형사합의", en: "Criminal Settlement", "zh-CN": "刑事和解", si: "අපරාධ එකඟතාවය", ta: "குற்றவியல் ஒப்பந்தம்" } },
        { value: "severance_claim", label: { ko: "퇴직금청구 및 급여정산 수령행위", en: "Severance Claim", "zh-CN": "退休金请求及工资结算领取", si: "විශ්‍රාම වැටුප් හිමිකම් සහ වැටුප් ගණනය ලැබීම", ta: "ஓய்வூதிய கோரிக்கை மற்றும் சம்பள தீர்வு பெறுதல்" } },
        { value: "financial_inquiry", label: { ko: "금융권 내역사실 확인", en: "Financial Inquiry", "zh-CN": "金融机构明细事实确认", si: "මූල්‍ය ගනුදෙනු වාර්තා සත්‍යාපනය", ta: "நிதி பரிவர்த்தனை பதிவுகள் சரிபார்ப்பு" } },
        { value: "civil_settlement", label: { ko: "민사합의", en: "Civil Settlement", "zh-CN": "民事和解", si: "සිවිල් එකඟතාවය", ta: "சிவில் ஒப்பந்தம்" } },
        { value: "insurance_settlement", label: { ko: "보험사합의", en: "Insurance Settlement", "zh-CN": "保险公司和解", si: "රක්ෂක එකඟතාවය", ta: "காப்பீட்டாளர் ஒப்பந்தம்" } },
        { value: "departure_insurance", label: { ko: "출국보험청구및수령행위", en: "Departure Insurance Claim", "zh-CN": "出境保险请求及领取", si: "පිටවීමේ රක්ෂණ හිමිකම් සහ ලැබීම", ta: "வெளியேறும் காப்பீட்டு கோரிக்கை மற்றும் பெறுதல்" } },
        { value: "funeral_expenses", label: { ko: "장제비청구 등", en: "Funeral Expenses Claim", "zh-CN": "丧葬费请求等", si: "අවමංගල්‍ය වියදම් හිමිකම්, ආදිය", ta: "இறுதி சடங்கு செலவு கோரிக்கை, முதலியன" } },
      ],
      group: "tasks",
    },
    {
      key: "power_date",
      label: { ko: "위임일자", en: "Power Date", "zh-CN": "委托日期", si: "අධිකාරිය දිනය", ta: "அதிகாரம் தேதி" },
      type: "date",
    },
  ],
}

export const powerOfAttorneyOldTemplate: DocumentTemplate = {
  type: "power_of_attorney_old",
  fields: powerOfAttorneyTemplate.fields,
}

// 변호인선임서 (Attorney Appointment)
export const attorneyAppointmentTemplate: DocumentTemplate = {
  type: "attorney_appointment",
  fields: [
    {
      key: "case_number",
      label: { ko: "사건", en: "Case Number", "zh-CN": "案件", si: "නඩුව", ta: "வழக்கு" },
      type: "text",
      group: "case",
    },
    {
      key: "victim",
      label: { ko: "피해자", en: "Victim", "zh-CN": "受害者", si: "අනතුරට ලක්වූ", ta: "பாதிக்கப்பட்டவர்" },
      type: "text",
      group: "case",
    },
    {
      key: "appointer_name",
      label: { ko: "성명", en: "Name", "zh-CN": "姓名", si: "නම", ta: "பெயர்" },
      type: "text",
      required: true,
      group: "appointer",
    },
    {
      key: "appointer_id_number",
      label: { ko: "본국신분증번호", en: "ID Number", "zh-CN": "本国身份证号", si: "ජාතික හැඳුනුම්පත් අංකය", ta: "தேசிய அடையாள அட்டை எண்" },
      type: "text",
      group: "appointer",
    },
    {
      key: "appointer_relation",
      label: { ko: "관계", en: "Relation", "zh-CN": "关系", si: "සම්බන්ධතාවය", ta: "உறவு" },
      type: "select",
      options: [
        { value: "부", label: { ko: "부", en: "Father", "zh-CN": "父", si: "පියා", ta: "தந்தை" } },
        { value: "모", label: { ko: "모", en: "Mother", "zh-CN": "母", si: "මව", ta: "தாய்" } },
        { value: "기타", label: { ko: "기타", en: "Other", "zh-CN": "其他", si: "වෙනත්", ta: "மற்றவை" } },
      ],
      group: "appointer",
    },
    {
      key: "court",
      label: { ko: "법원", en: "Court", "zh-CN": "法院", si: "අධිකරණය", ta: "நீதிமன்றம்" },
      type: "text",
      group: "case",
    },
    {
      key: "appointment_date",
      label: { ko: "선임일자", en: "Appointment Date", "zh-CN": "任命日期", si: "පත් කිරීමේ දිනය", ta: "நியமன தேதி" },
      type: "date",
    },
  ],
}

export const attorneyAppointmentOldTemplate: DocumentTemplate = {
  type: "attorney_appointment_old",
  fields: attorneyAppointmentTemplate.fields,
}

// 소송위임장 (Litigation Power)
export const litigationPowerTemplate: DocumentTemplate = {
  type: "litigation_power",
  fields: [
    {
      key: "case_number",
      label: { ko: "사건", en: "Case Number", "zh-CN": "案件", si: "නඩුව", ta: "வழக்கு" },
      type: "text",
      group: "case",
    },
    {
      key: "plaintiff",
      label: { ko: "원고", en: "Plaintiff", "zh-CN": "原告", si: "පෙළඹවීම්කරු", ta: "வாதி" },
      type: "text",
      group: "case",
    },
    {
      key: "defendant",
      label: { ko: "피고", en: "Defendant", "zh-CN": "被告", si: "චෝදනාකරු", ta: "பிரதிவாதி" },
      type: "text",
      group: "case",
    },
    {
      key: "special_authority.withdrawal_of_suit",
      label: { ko: "소의 취하", en: "Withdrawal of Suit", "zh-CN": "诉讼撤回", si: "නඩුව ඉවත් කිරීම", ta: "வழக்கு திரும்பப்பெறுதல்" },
      type: "select",
      options: [
        { value: "O", label: { ko: "O (수권)", en: "O (Granted)", "zh-CN": "O（授权）", si: "O (අධිකාරිය)", ta: "O (அதிகாரம்)" } },
        { value: "X", label: { ko: "X (보류)", en: "X (Reserved)", "zh-CN": "X（保留）", si: "X (රඳවා තබා)", ta: "X (ஒத்திவைக்கப்பட்டது)" } },
      ],
      group: "special",
    },
    {
      key: "special_authority.withdrawal_of_appeal",
      label: { ko: "상소의 취하", en: "Withdrawal of Appeal", "zh-CN": "上诉撤回", si: "අභියාචනය ඉවත් කිරීම", ta: "மேல்முறையீட்டை திரும்பப்பெறுதல்" },
      type: "select",
      options: [
        { value: "O", label: { ko: "O (수권)", en: "O (Granted)", "zh-CN": "O（授权）", si: "O (අධිකාරිය)", ta: "O (அதிகாரம்)" } },
        { value: "X", label: { ko: "X (보류)", en: "X (Reserved)", "zh-CN": "X（保留）", si: "X (රඳවා තබා)", ta: "X (ஒத்திவைக்கப்பட்டது)" } },
      ],
      group: "special",
    },
    {
      key: "special_authority.waiver_of_claim",
      label: { ko: "청구의 포기", en: "Waiver of Claim", "zh-CN": "请求放弃", si: "හිමිකම් අත්හැරීම", ta: "கோரிக்கை கைவிடுதல்" },
      type: "select",
      options: [
        { value: "O", label: { ko: "O (수권)", en: "O (Granted)", "zh-CN": "O（授权）", si: "O (අධිකාරිය)", ta: "O (அதிகாரம்)" } },
        { value: "X", label: { ko: "X (보류)", en: "X (Reserved)", "zh-CN": "X（保留）", si: "X (රඳවා තබා)", ta: "X (ஒத்திவைக்கப்பட்டது)" } },
      ],
      group: "special",
    },
    {
      key: "special_authority.admission_of_claim",
      label: { ko: "청구의 인낙", en: "Admission of Claim", "zh-CN": "请求承认", si: "හිමිකම පිළිගැනීම", ta: "கோரிக்கையை ஒப்புக்கொள்ளுதல்" },
      type: "select",
      options: [
        { value: "O", label: { ko: "O (수권)", en: "O (Granted)", "zh-CN": "O（授权）", si: "O (අධිකාරිය)", ta: "O (அதிகாரம்)" } },
        { value: "X", label: { ko: "X (보류)", en: "X (Reserved)", "zh-CN": "X（保留）", si: "X (රඳවා තබා)", ta: "X (ஒத்திவைக்கப்பட்டது)" } },
      ],
      group: "special",
    },
    {
      key: "special_authority.withdrawal_from_suit",
      label: { ko: "소송 탈퇴", en: "Withdrawal from Suit", "zh-CN": "诉讼退出", si: "නඩුවෙන් ඉවත් වීම", ta: "வழக்கிலிருந்து விலகுதல்" },
      type: "select",
      options: [
        { value: "O", label: { ko: "O (수권)", en: "O (Granted)", "zh-CN": "O（授权）", si: "O (අධිකාරිය)", ta: "O (அதிகாரம்)" } },
        { value: "X", label: { ko: "X (보류)", en: "X (Reserved)", "zh-CN": "X（保留）", si: "X (රඳවා තබා)", ta: "X (ஒத்திவைக்கப்பட்டது)" } },
      ],
      group: "special",
    },
    {
      key: "principal_name",
      label: { ko: "위임인 성명", en: "Principal Name", "zh-CN": "委托人姓名", si: "නියෝජිත නම", ta: "நியமிப்பாளர் பெயர்" },
      type: "text",
      required: true,
      group: "principal",
    },
    {
      key: "principal_id_number",
      label: { ko: "본국신분증번호", en: "ID Number", "zh-CN": "本国身份证号", si: "ජාතික හැඳුනුම්පත් අංකය", ta: "தேசிய அடையாள அட்டை எண்" },
      type: "text",
      group: "principal",
    },
    {
      key: "court",
      label: { ko: "법원", en: "Court", "zh-CN": "法院", si: "අධිකරණය", ta: "நீதிமன்றம்" },
      type: "text",
      group: "attorney",
    },
    {
      key: "power_date",
      label: { ko: "위임일자", en: "Power Date", "zh-CN": "委托日期", si: "අධිකාරිය දිනය", ta: "அதிகாரம் தேதி" },
      type: "date",
    },
  ],
}

export const litigationPowerOldTemplate: DocumentTemplate = {
  type: "litigation_power_old",
  fields: litigationPowerTemplate.fields,
}

// 사망보험금지급동의 (Insurance Consent)
export const insuranceConsentTemplate: DocumentTemplate = {
  type: "insurance_consent",
  fields: [
    {
      key: "recipient_company",
      label: { ko: "보험사 이름", en: "Recipient Insurance Company", "zh-CN": "收件保险公司", si: "ලබන්නාගේ රක්ෂණ සමාගම", ta: "பெறுநர் காப்பீட்டு நிறுவனம்" },
      type: "text",
      group: "recipient",
    },
    {
      key: "sender_company",
      label: { ko: "발신 회사", en: "Sender Company", "zh-CN": "发件公司", si: "යවන්නාගේ සමාගම", ta: "அனுப்புநர் நிறுவனம்" },
      type: "text",
      group: "recipient",
    },
    {
      key: "sender_representative",
      label: { ko: "대표", en: "Representative", "zh-CN": "代表", si: "නියෝජිත", ta: "பிரதிநிதி" },
      type: "text",
      group: "recipient",
    },
    {
      key: "sender_registration",
      label: { ko: "사업자등록번호", en: "Business Registration Number", "zh-CN": "营业执照号", si: "ව්‍යාපාර ලියාපදිංචි අංකය", ta: "வணிக பதிவு எண்" },
      type: "text",
      group: "recipient",
    },
    {
      key: "sender_address",
      label: { ko: "주소", en: "Address", "zh-CN": "地址", si: "ලිපිනය", ta: "முகவரி" },
      type: "textarea",
      group: "recipient",
    },
    {
      key: "insured_name",
      label: { ko: "피보험자 성명", en: "Insured Name", "zh-CN": "被保险人姓名", si: "රක්ෂණය කරන ලද පුද්ගලයාගේ නම", ta: "காப்பீடு செய்யப்பட்டவரின் பெயர்" },
      type: "text",
      required: true,
      group: "insured",
    },
    {
      key: "insured_registration",
      label: { ko: "거소신고번호", en: "Residence Registration", "zh-CN": "居所申报号", si: "නිවාස ලියාපදිංචි අංකය", ta: "வாழ்விட பதிவு எண்" },
      type: "text",
      group: "insured",
    },
    {
      key: "insured_birthdate",
      label: { ko: "생년월일", en: "Date of Birth", "zh-CN": "出生日期", si: "උපන් දිනය", ta: "பிறந்த தேதி" },
      type: "date",
      group: "insured",
    },
    {
      key: "insured_gender",
      label: { ko: "성별", en: "Gender", "zh-CN": "性别", si: "ලිංගභේදය", ta: "பாலினம்" },
      type: "select",
      options: [
        { value: "남", label: { ko: "남", en: "Male", "zh-CN": "男", si: "පිරිමි", ta: "ஆண்" } },
        { value: "여", label: { ko: "여", en: "Female", "zh-CN": "女", si: "ගැහැණු", ta: "பெண்" } },
      ],
      group: "insured",
    },
    {
      key: "insured_address",
      label: { ko: "주소", en: "Address", "zh-CN": "地址", si: "ලිපිනය", ta: "முகவரி" },
      type: "textarea",
      group: "insured",
    },
    {
      key: "insurance_product",
      label: { ko: "보험상품명", en: "Insurance Product", "zh-CN": "保险产品名称", si: "රක්ෂණ නිෂ්පාදන නම", ta: "காப்பீட்டு தயாரிப்பு பெயர்" },
      type: "text",
      group: "insurance",
    },
    // 보험계약자는 발신회사와 동일하므로 sender_company, sender_registration을 사용
    {
      key: "contract_date_1",
      label: { ko: "시작일", en: "Contract Date 1", "zh-CN": "合同日期1", si: "ආරම්භක දිනය", ta: "தொடக்க தேதி" },
      type: "date",
      group: "insurance",
    },
    {
      key: "contract_date_2",
      label: { ko: "종료일", en: "Contract Date 2", "zh-CN": "合同日期2", si: "අවසාන දිනය", ta: "முடிவு தேதி" },
      type: "date",
      group: "insurance",
    },
    // 수익자 정보는 불필요 - 제거됨
    {
      key: "heir_1_name",
      label: { ko: "법정상속인 1 성명", en: "Heir 1 Name", "zh-CN": "法定继承人1姓名", si: "නීතිමය උරුමක්කාරයා 1 නම", ta: "சட்ட வாரிசு 1 பெயர்" },
      type: "text",
      group: "heirs",
    },
    {
      key: "heir_1_id",
      label: { ko: "본국 신분증번호", en: "ID Number", "zh-CN": "本国身份证号", si: "ජාතික හැඳුනුම්පත් අංකය", ta: "தேசிய அடையாள அட்டை எண்" },
      type: "text",
      group: "heirs",
    },
    {
      key: "heir_1_relation",
      label: { ko: "관계", en: "Relation", "zh-CN": "关系", si: "සම්බන්ධතාවය", ta: "உறவு" },
      type: "text",
      group: "heirs",
    },
    {
      key: "heir_2_name",
      label: { ko: "법정상속인 2 성명", en: "Heir 2 Name", "zh-CN": "法定继承人2姓名", si: "නීතිමය උරුමක්කාරයා 2 නම", ta: "சட்ட வாரிசு 2 பெயர்" },
      type: "text",
      group: "heirs",
    },
    {
      key: "heir_2_id",
      label: { ko: "본국 신분증번호", en: "ID Number", "zh-CN": "本国身份证号", si: "ජාතික හැඳුනුම්පත් අංකය", ta: "தேசிய அடையாள அட்டை எண்" },
      type: "text",
      group: "heirs",
    },
    {
      key: "heir_2_relation",
      label: { ko: "관계", en: "Relation", "zh-CN": "关系", si: "සම්බන්ධතාවය", ta: "உறவு" },
      type: "text",
      group: "heirs",
    },
    {
      key: "consent_date",
      label: { ko: "동의일자", en: "Consent Date", "zh-CN": "同意日期", si: "එකඟතාවයේ දිනය", ta: "ஒப்புதல் தேதி" },
      type: "date",
    },
  ],
}

export const insuranceConsentOldTemplate: DocumentTemplate = {
  type: "insurance_consent_old",
  fields: insuranceConsentTemplate.fields,
}

export const documentTemplates: Record<DocumentType, DocumentTemplate> = {
  agreement: agreementTemplate,
  power_of_attorney: powerOfAttorneyTemplate,
  attorney_appointment: attorneyAppointmentTemplate,
  litigation_power: litigationPowerTemplate,
  insurance_consent: insuranceConsentTemplate,
  agreement_old: agreementOldTemplate,
  power_of_attorney_old: powerOfAttorneyOldTemplate,
  attorney_appointment_old: attorneyAppointmentOldTemplate,
  litigation_power_old: litigationPowerOldTemplate,
  insurance_consent_old: insuranceConsentOldTemplate,
}

export function getTemplate(type: DocumentType): DocumentTemplate {
  return documentTemplates[type]
}

export function getDocumentTypeLabel(
  type: DocumentType,
  locale: "ko" | "en" | "zh-CN" | "si" | "ta" = "ko"
): string {
  const labels: Record<DocumentType, Record<"ko" | "en" | "zh-CN" | "si" | "ta", string>> = {
    agreement: { 
      ko: "합의서", 
      en: "Agreement", 
      "zh-CN": "协议",
      si: "එකඟතාවය",
      ta: "ஒப்பந்தம்"
    },
    power_of_attorney: { 
      ko: "위임장", 
      en: "Power of Attorney", 
      "zh-CN": "委托书",
      si: "අධිකරණ නියෝජිත බලය",
      ta: "அதிகார பத்திரம்"
    },
    attorney_appointment: { 
      ko: "변호인선임서", 
      en: "Attorney Appointment", 
      "zh-CN": "律师任命书",
      si: "නීතිඥ පත් කිරීම",
      ta: "வழக்கறிஞர் நியமனம்"
    },
    litigation_power: { 
      ko: "소송위임장", 
      en: "Litigation Power", 
      "zh-CN": "诉讼委托书",
      si: "නඩු පැවරීමේ බලය",
      ta: "வழக்கு அதிகாரம்"
    },
    insurance_consent: { 
      ko: "사망보험금지급동의", 
      en: "Insurance Consent", 
      "zh-CN": "死亡保险金支付同意书",
      si: "විශුරණ ගෙවීම් එකඟතාවය",
      ta: "காப்பீட்டு ஒப்புதல்"
    },
    agreement_old: { 
      ko: "합의서(SEJOONG)", 
      en: "Agreement (SEJOONG)", 
      "zh-CN": "协议（旧版）",
      si: "එකඟතාවය (SEJOONG)",
      ta: "ஒப்பந்தம் (SEJOONG)"
    },
    power_of_attorney_old: { 
      ko: "위임장(SEJOONG)", 
      en: "Power of Attorney (SEJOONG)", 
      "zh-CN": "委托书（旧版）",
      si: "අධිකරණ නියෝජිත බලය (SEJOONG)",
      ta: "அதிகார பத்திரம் (SEJOONG)"
    },
    attorney_appointment_old: { 
      ko: "변호인선임서(SEJOONG)", 
      en: "Attorney Appointment (SEJOONG)", 
      "zh-CN": "律师任命书（旧版）",
      si: "නීතිඥ පත් කිරීම (SEJOONG)",
      ta: "வழக்கறிஞர் நியமனம் (SEJOONG)"
    },
    litigation_power_old: { 
      ko: "소송위임장(SEJOONG)", 
      en: "Litigation Power (SEJOONG)", 
      "zh-CN": "诉讼委托书（旧版）",
      si: "නඩු පැවරීමේ බලය (SEJOONG)",
      ta: "வழக்கு அதிகாரம் (SEJOONG)"
    },
    insurance_consent_old: { 
      ko: "사망보험금지급동의(SEJOONG)", 
      en: "Insurance Consent (SEJOONG)", 
      "zh-CN": "死亡保险金支付同意书（旧版）",
      si: "විශුරණ ගෙවීම් එකඟතාවය (SEJOONG)",
      ta: "காப்பீட்டு ஒப்புதல் (SEJOONG)"
    },
  }
  return labels[type][locale] || labels[type]["en"] // Fallback to English if locale not found
}

