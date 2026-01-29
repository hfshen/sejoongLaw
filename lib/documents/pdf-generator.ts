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
  const title = locale === "ko" ? "합의서" : locale === "en" ? "Agreement" : locale === "zh-CN" ? "协议" : locale === "si" ? "එකඟතාවය" : "ஒப்பந்தம்"
  doc.text(title, 105, yPos, { align: "center" })
  yPos += 15

  // 서문
  doc.setFontSize(11)
  const intro = locale === "ko" 
    ? "본 합의서는 고(故) _________________________ (이하 \"망인\")의 사망과 관련하여, 망인의 유족 대표(이하 \"갑\")와 사업장 대표(이하 \"을\")가 상호 원만히 분쟁을 종결하기 위하여 다음과 같이 체결한다."
    : locale === "en"
    ? "This agreement is entered into between the family representative (hereinafter \"Party A\") and the company representative (hereinafter \"Party B\") regarding the death of _________________________ (hereinafter \"the deceased\") to amicably resolve disputes."
    : locale === "zh-CN"
    ? "本协议由家属代表（以下简称\"甲方\"）和公司代表（以下简称\"乙方\"）就死者_________________________（以下简称\"死者\"）的死亡相关事宜，为友好解决争议而签订。"
    : locale === "si"
    ? "මෙම එකඟතාවය _________________________ (පහත \"මියගිය පුද්ගලයා\" ලෙස හැඳින්වේ) ගේ මරණය සම්බන්ධයෙන්, මියගිය පුද්ගලයාගේ පවුලේ නියෝජිත (පහත \"පාර්ශ්වය A\" ලෙස හැඳින්වේ) සහ සමාගමේ නියෝජිත (පහත \"පාර්ශ්වය B\" ලෙස හැඳින්වේ) අතර මෘදුවෙන් ගැටලු විසඳීම සඳහා පහත පරිදි සාදනු ලැබේ."
    : "இந்த ஒப்பந்தம் _________________________ (இனிமேல் \"இறந்தவர்\" என அழைக்கப்படும்) இன் மரணம் தொடர்பாக, இறந்தவரின் குடும்ப பிரதிநிதி (இனிமேல் \"கட்சி A\" என அழைக்கப்படும்) மற்றும் நிறுவன பிரதிநிதி (இனிமேல் \"கட்சி B\" என அழைக்கப்படும்) இடையே நல்லிணக்கமாக பிரச்சினைகளை தீர்ப்பதற்காக பின்வருமாறு செய்யப்படுகிறது."

  doc.text(intro, 20, yPos, { maxWidth: 170 })
  yPos += 20

  // 갑 정보
  doc.setFontSize(12)
  const partyALabel = locale === "ko" ? "\"갑\" 유가족 대표" : locale === "en" ? "\"Party A\" Family Representative" : locale === "zh-CN" ? "\"甲方\" 家属代表" : locale === "si" ? "\"පාර්ශ්වය A\" පවුලේ නියෝජිත" : "\"கட்சி A\" குடும்ப பிரதிநிதி"
  doc.text(partyALabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const tableHeaders = locale === "ko"
    ? ["국적", "성명", "생년월일", "연락처", "관계", "본국 신분증 번호", "본국 주소"]
    : locale === "en"
    ? ["Nationality", "Name", "Date of Birth", "Contact", "Relation", "ID Number", "Home Address"]
    : locale === "zh-CN"
    ? ["国籍", "姓名", "出生日期", "联系方式", "关系", "本国身份证号", "本国地址"]
    : locale === "si"
    ? ["ජාතිකත්වය", "නම", "උපන් දිනය", "සම්බන්ධකම්", "සම්බන්ධතාවය", "ජාතික හැඳුනුම්පත් අංකය", "මව්රට ලිපිනය"]
    : ["தேசியம்", "பெயர்", "பிறந்த தேதி", "தொடர்பு", "உறவு", "தேசிய அடையாள அட்டை எண்", "தாய்நாட்டு முகவரி"]

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
  const partyBLabel = locale === "ko" ? "\"을\" 회사측 대표" : locale === "en" ? "\"Party B\" Company Representative" : locale === "zh-CN" ? "\"乙方\" 公司代表" : locale === "si" ? "\"පාර්ශ්වය B\" සමාගමේ නියෝජිත" : "\"கட்சி B\" நிறுவன பிரதிநிதி"
  doc.text(partyBLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const partyBFields = [
    { key: "party_b_company_name", label: locale === "ko" ? "상호" : locale === "en" ? "Company Name" : locale === "zh-CN" ? "公司名称" : locale === "si" ? "සමාගමේ නම" : "நிறுவனத்தின் பெயர்" },
    { key: "party_b_representative", label: locale === "ko" ? "대표자 성명" : locale === "en" ? "Representative Name" : locale === "zh-CN" ? "代表姓名" : locale === "si" ? "නියෝජිත නම" : "பிரதிநிதி பெயர்" },
    { key: "party_b_registration", label: locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : locale === "zh-CN" ? "营业执照号" : locale === "si" ? "ව්‍යාපාර ලියාපදිංචි අංකය" : "வணிக பதிவு எண்" },
    { key: "party_b_contact", label: locale === "ko" ? "연락처" : locale === "en" ? "Contact" : locale === "zh-CN" ? "联系方式" : locale === "si" ? "සම්බන්ධකම්" : "தொடர்பு" },
    { key: "party_b_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : locale === "zh-CN" ? "地址" : locale === "si" ? "ලිපිනය" : "முகவரி" },
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
  const deceasedLabel = locale === "ko" ? "고인(망인)" : locale === "en" ? "Deceased" : locale === "zh-CN" ? "死者" : locale === "si" ? "මියගිය පුද්ගලයා" : "இறந்தவர்"
  doc.text(deceasedLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const deceasedFields = [
    { key: "deceased_name", label: locale === "ko" ? "성명" : locale === "en" ? "Name" : locale === "zh-CN" ? "姓名" : locale === "si" ? "නම" : "பெயர்" },
    { key: "deceased_foreigner_id", label: locale === "ko" ? "외국인등록번호" : locale === "en" ? "Foreigner Registration Number" : locale === "zh-CN" ? "外国人登记号" : locale === "si" ? "අන්යජාතික ලියාපදිංචි අංකය" : "வெளிநாட்டவர் பதிவு எண்" },
    { key: "deceased_birthdate", label: locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : locale === "zh-CN" ? "出生日期" : locale === "si" ? "උපන් දිනය" : "பிறந்த தேதி" },
    { key: "deceased_address", label: locale === "ko" ? "주소지" : locale === "en" ? "Address" : locale === "zh-CN" ? "地址" : locale === "si" ? "ලිපිනය" : "முகவரி" },
    { key: "incident_location", label: locale === "ko" ? "사건발생위치" : locale === "en" ? "Incident Location" : locale === "zh-CN" ? "事件发生地点" : locale === "si" ? "සිද්ධිය සිදුවූ ස්ථානය" : "சம்பவம் நடந்த இடம்" },
    { key: "incident_time", label: locale === "ko" ? "사건발생시간" : locale === "en" ? "Incident Time" : locale === "zh-CN" ? "事件发生时间" : locale === "si" ? "සිද්ධිය සිදුවූ වේලාව" : "சம்பவம் நடந்த நேரம்" },
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
    : locale === "zh-CN"
    ? [
        "1. 甲方和乙方就本案（与死者死亡相关）已友好达成协议，并确认通过签署本协议，与本案相关的所有争议已解决。",
        "2. 甲方就本案相关事宜，今后不对乙方及其代表、工作场所提出任何民事、刑事、行政（包括工伤等）或其他任何异议，也不提出任何追加请求或权利主张。",
        "3. 甲方不希望就本案对乙方代表进行处罚。甲方应提交表示此意的免予起诉书，与本协议一起提交。",
        "4. 甲方和乙方相互确认，本协议是根据各方自由意志编写和签署的，并非因胁迫或欺诈所致。",
      ]
    : locale === "si"
    ? [
        "1. පාර්ශ්වය A සහ පාර්ශ්වය B මෙම නඩුව (මියගිය පුද්ගලයාගේ මරණයට සම්බන්ධ) සම්බන්ධයෙන් මෘදුවෙන් එකඟ වී ඇති අතර, මෙම එකඟතාවය ක්‍රියාත්මක කිරීමෙන් මෙම නඩුවට සම්බන්ධ සියලුම ගැටලු විසඳා ඇති බව තහවුරු කරයි.",
        "2. පාර්ශ්වය A මෙම නඩුවට සම්බන්ධව අනාගතයේදී පාර්ශ්වය B, එහි නියෝජිත, හෝ කර්මාන්තශාලාවට එරෙහිව සිවිල්, අපරාධ, පරිපාලන (කර්මාන්තශාලා අනතුරු ඇතුළුව) හෝ මෙම නඩුවට සම්බන්ධ වෙනත් කිසිදු කාරණා සම්බන්ධයෙන් කිසිදු අභියෝගයක් හෝ අමතර හිමිකම් හෝ අයිතිවාසිකම් ප්‍රකාශ කිරීමක් නොකරයි.",
        "3. පාර්ශ්වය A මෙම නඩුවට සම්බන්ධව පාර්ශ්වය B හි නියෝජිතයාට දඬුවම් කිරීමට අවශ්‍ය නොවේ. පාර්ශ්වය A මෙම අභිප්‍රාය ප්‍රකාශ කරන දඬුවම් නොකිරීමේ ඉල්ලීමක් මෙම එකඟතාවය සමඟ ඉදිරිපත් කරයි.",
        "4. පාර්ශ්වය A සහ පාර්ශ්වය B මෙම එකඟතාවය එක් එක් පාර්ශ්වයේ නිදහස් අදහස් අනුව සකසා ක්‍රියාත්මක කර ඇති අතර, බලහත්කාරය හෝ වංචාවක ප්‍රතිඵලයක් නොවන බව අන්යෝන්යව තහවුරු කරයි.",
      ]
    : [
        "1. கட்சி A மற்றும் கட்சி B இந்த வழக்கு (இறந்தவரின் மரணம் தொடர்பானது) தொடர்பாக நல்லிணக்கமாக ஒப்புக்கொண்டுள்ளனர், மற்றும் இந்த ஒப்பந்தத்தை செயல்படுத்துவதன் மூலம் இந்த வழக்குடன் தொடர்புடைய அனைத்து பிரச்சினைகளும் தீர்க்கப்பட்டுள்ளன என்பதை உறுதிப்படுத்துகின்றனர்.",
        "2. கட்சி A இந்த வழக்கு தொடர்பாக எதிர்காலத்தில் கட்சி B, அதன் பிரதிநிதி, அல்லது பணியிடத்திற்கு எதிராக சிவில், குற்றவியல், நிர்வாக (தொழில்துறை விபத்துகள் உட்பட) அல்லது இந்த வழக்குடன் தொடர்புடைய வேறு எந்த விஷயங்களிலும் எந்தவொரு ஆட்சேபனையையும் அல்லது கூடுதல் கோரிக்கைகள் அல்லது உரிமைகளை முன்வைக்க மாட்டார்.",
        "3. கட்சி A இந்த வழக்கு தொடர்பாக கட்சி B இன் பிரதிநிதிக்கு தண்டனை விரும்பவில்லை. கட்சி A இந்த நோக்கத்தை வெளிப்படுத்தும் தண்டனை இல்லாத கோரிக்கையை இந்த ஒப்பந்தத்துடன் சமர்ப்பிக்கிறார்.",
        "4. கட்சி A மற்றும் கட்சி B இந்த ஒப்பந்தம் ஒவ்வொரு கட்சியின் சுதந்திர விருப்பத்தின் பேரில் தயாரிக்கப்பட்டு செயல்படுத்தப்பட்டுள்ளது மற்றும் கட்டாயப்படுத்துதல் அல்லது மோசடியின் விளைவு அல்ல என்பதை பரஸ்பரம் உறுதிப்படுத்துகின்றனர்.",
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
    : locale === "zh-CN"
    ? "本协议一式两份，甲方和乙方各自签名（或署名）盖章后，各保存一份。"
    : locale === "si"
    ? "මෙම එකඟතාවය දෙවරක් සකසා, පාර්ශ්වය A සහ පාර්ශ්වය B එක් එක් අත්සන තබා (හෝ අකුරු තබා) මුද්‍රා තබා, එක් එක් පාර්ශ්වය එක් පිටපතක් තබා ගනී."
    : "இந்த ஒப்பந்தம் இரண்டு பிரதிகளில் தயாரிக்கப்பட்டு, கட்சி A மற்றும் கட்சி B ஒவ்வொருவரும் கையெழுத்திட்டு (அல்லது பெயர் எழுதி) முத்திரை இட்டு, ஒவ்வொரு கட்சியும் ஒரு பிரதியை வைத்திருக்கிறது."

  doc.text(signatureNote, 20, yPos, { maxWidth: 170 })
  yPos += 15

  const agreementDate = data.agreement_date || new Date().toISOString().split("T")[0]
  const dateLabel = locale === "ko" ? "일자" : locale === "en" ? "Date" : locale === "zh-CN" ? "日期" : locale === "si" ? "දිනය" : "தேதி"
  doc.text(`${dateLabel}: ${agreementDate}`, 20, yPos)
  yPos += 10

  const partyASignature = locale === "ko" ? "갑(유가족 대표) 성명:" : locale === "en" ? "Party A (Family Representative) Name:" : locale === "zh-CN" ? "甲方（家属代表）姓名：" : locale === "si" ? "පාර්ශ්වය A (පවුලේ නියෝජිත) නම:" : "கட்சி A (குடும்ப பிரதிநிதி) பெயர்:"
  doc.text(partyASignature, 20, yPos)
  yPos += 10

  const partyBSignature = locale === "ko" ? "을(사업장 대표) 성명:" : locale === "en" ? "Party B (Company Representative) Name:" : locale === "zh-CN" ? "乙方（公司代表）姓名：" : locale === "si" ? "පාර්ශ්වය B (සමාගමේ නියෝජිත) නම:" : "கட்சி B (நிறுவன பிரதிநிதி) பெயர்:"
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
      : locale === "zh-CN"
      ? "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: contact@sejoonglaw.kr"
      : locale === "si"
      ? "සේජූං නීති සමාගම | ග්යොංගි-දෝ, අන්සන්-සි, දන්වොන්-ගු, වොන්ගොක්-රෝ 45, සේජූං ගොඩනැගිල්ල 2වන මහල | දුරකථන: 031-8044-8805 | විද්‍යුත් තැපෑල: contact@sejoonglaw.kr"
      : "சேஜூங் சட்ட நிறுவனம் | கியோங்கி-டோ, அன்சன்-சி, டான்வான்-கு, வோன்கோக்-ரோ 45, சேஜூங் கட்டிடம் 2வது மாடி | தொலைபேசி: 031-8044-8805 | மின்னஞ்சல்: contact@sejoonglaw.kr"
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
  const title = locale === "ko" ? "위임장" : locale === "en" ? "Power of Attorney" : locale === "zh-CN" ? "委托书" : locale === "si" ? "අධිකරණ නියෝජිත බලය" : "அதிகார பத்திரம்"
  doc.text(title, 105, yPos, { align: "center" })
  yPos += 15

  // 위임인 정보
  doc.setFontSize(12)
  const principalLabel = locale === "ko" ? "1. 위임인" : locale === "en" ? "1. Principal" : locale === "zh-CN" ? "1. 委托人" : locale === "si" ? "1. අධිකරණ නියෝජිත" : "1. முதன்மை"
  doc.text(principalLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const principalFields = [
    { key: "principal_name", label: locale === "ko" ? "성명" : locale === "en" ? "Name" : locale === "zh-CN" ? "姓名" : locale === "si" ? "නම" : "பெயர்" },
    { key: "principal_birthdate", label: locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : locale === "zh-CN" ? "出生日期" : locale === "si" ? "උපන් දිනය" : "பிறந்த தேதி" },
    { key: "principal_passport", label: locale === "ko" ? "여권번호" : locale === "en" ? "Passport Number" : locale === "zh-CN" ? "护照号" : locale === "si" ? "රැකියා අංකය" : "கடவுச்சீட்டு எண்" },
    { key: "principal_id_number", label: locale === "ko" ? "본국신분증번호" : locale === "en" ? "ID Number" : locale === "zh-CN" ? "本国身份证号" : locale === "si" ? "ජාතික හැඳුනුම්පත් අංකය" : "தேசிய அடையாள அட்டை எண்" },
    { key: "principal_address", label: locale === "ko" ? "본국주소" : locale === "en" ? "Home Address" : locale === "zh-CN" ? "本国地址" : locale === "si" ? "මව්රට ලිපිනය" : "தாய்நாட்டு முகவரி" },
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
  const attorneyLabel = locale === "ko" ? "2. 수임인" : locale === "en" ? "2. Attorney" : locale === "zh-CN" ? "2. 受托人" : locale === "si" ? "2. නීතිඥ" : "2. வழக்கறிஞர்"
  doc.text(attorneyLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const attorneyFields = [
    { key: "attorney_name", label: locale === "ko" ? "성명" : locale === "en" ? "Name" : locale === "zh-CN" ? "姓名" : locale === "si" ? "නම" : "பெயர்" },
    { key: "attorney_registration", label: locale === "ko" ? "주민등록번호" : locale === "en" ? "Registration Number" : locale === "zh-CN" ? "登记号" : locale === "si" ? "නිවාස ලියාපදිංචි අංකය" : "வாழ்விட பதிவு எண்" },
    { key: "attorney_office", label: locale === "ko" ? "사업장명" : locale === "en" ? "Office Name" : locale === "zh-CN" ? "事务所名称" : locale === "si" ? "කාර්යාල නම" : "அலுவலக பெயர்" },
    { key: "attorney_business_number", label: locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : locale === "zh-CN" ? "营业执照号" : locale === "si" ? "ව්‍යාපාර ලියාපදිංචි අංකය" : "வணிக பதிவு எண்" },
    { key: "attorney_position", label: locale === "ko" ? "직위" : locale === "en" ? "Position" : locale === "zh-CN" ? "职位" : locale === "si" ? "තනතුර" : "பதவி" },
    { key: "attorney_contact", label: locale === "ko" ? "연락처" : locale === "en" ? "Contact" : locale === "zh-CN" ? "联系方式" : locale === "si" ? "සම්බන්ධකම්" : "தொடர்பு" },
    { key: "attorney_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : locale === "zh-CN" ? "地址" : locale === "si" ? "ලිපිනය" : "முகவரி" },
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
    const subAttorneyLabel = locale === "ko" ? "3. 수임인 복 대리인" : locale === "en" ? "3. Sub-Attorney" : locale === "zh-CN" ? "3. 复代理人" : locale === "si" ? "3. උප නීතිඥ" : "3. துணை வழக்கறிஞர்"
    doc.text(subAttorneyLabel, 20, yPos)
    yPos += 8

    doc.setFontSize(10)
    const subAttorneyFields = [
      { key: "sub_attorney_name", label: locale === "ko" ? "성명" : locale === "en" ? "Name" : locale === "zh-CN" ? "姓名" : locale === "si" ? "නම" : "பெயர்" },
      { key: "sub_attorney_registration", label: locale === "ko" ? "주민등록번호" : locale === "en" ? "Registration Number" : locale === "zh-CN" ? "登记号" : locale === "si" ? "නිවාස ලියාපදිංචි අංකය" : "வாழ்விட பதிவு எண்" },
      { key: "sub_attorney_position", label: locale === "ko" ? "직위" : locale === "en" ? "Position" : locale === "zh-CN" ? "职位" : locale === "si" ? "තනතුර" : "பதவி" },
      { key: "sub_attorney_contact", label: locale === "ko" ? "연락처" : locale === "en" ? "Contact" : locale === "zh-CN" ? "联系方式" : locale === "si" ? "සම්බන්ධකම්" : "தொடர்பு" },
      { key: "sub_attorney_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : locale === "zh-CN" ? "地址" : locale === "si" ? "ලිපිනය" : "முகவரி" },
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
  const tasksLabel = locale === "ko" ? "위임업무" : locale === "en" ? "Authorized Tasks" : locale === "zh-CN" ? "委托业务" : locale === "si" ? "අනුමත කාර්යයන්" : "அங்கீகரிக்கப்பட்ட பணிகள்"
  doc.text(tasksLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const taskLabels: Record<string, Record<"ko" | "en" | "zh-CN" | "si" | "ta", string>> = {
    civil_criminal: { ko: "민·형사소송 위임", en: "Civil/Criminal Litigation", "zh-CN": "民事/刑事诉讼委托", si: "සිවිල්/අපරාධ නඩු කටයුතු", ta: "சிவில்/குற்றவியல் வழக்கு" },
    labor_complaint: { ko: "노동부진정서 위임", en: "Labor Complaint", "zh-CN": "劳动部申诉委托", si: "කම්කරු පැමිණිලි", ta: "தொழிலாளர் புகார்" },
    wage_claim: { ko: "임금체불 및 수령행위", en: "Wage Claim", "zh-CN": "工资拖欠及领取", si: "වැටුප් ණය සහ ලැබීම", ta: "சம்பள கடன் மற்றும் பெறுதல்" },
    damages_claim: { ko: "손해배상청구 위임", en: "Damages Claim", "zh-CN": "损害赔偿请求委托", si: "හානි හිමිකම්", ta: "சேதம் கோரிக்கை" },
    death_insurance: { ko: "사망보험금 청구 및 수령행위 일체권한", en: "Death Insurance Claim", "zh-CN": "死亡保险金请求及领取全部权限", si: "මරණ රක්ෂණ ප්‍රතිලාභ හිමිකම් සහ ලැබීම (සම්පූර්ණ අධිකාරිය)", ta: "மரண காப்பீட்டு நன்மை கோரிக்கை மற்றும் பெறுதல் (முழு அதிகாரம்)" },
    insurance_claim: { ko: "보험금청구 및 수령행위", en: "Insurance Claim", "zh-CN": "保险金请求及领取", si: "රක්ෂණ හිමිකම් සහ ලැබීම", ta: "காப்பீட்டு கோரிக்கை மற்றும் பெறுதல்" },
    deposit_withdrawal: { ko: "공탁출금 및 수령행위", en: "Deposit Withdrawal", "zh-CN": "提存提取及领取", si: "අධිකරණ තැන්පතුව ආපසු ගැනීම සහ ලැබීම", ta: "நீதிமன்ற வைப்பு திரும்பப்பெறுதல் மற்றும் பெறுதல்" },
    criminal_settlement: { ko: "형사합의", en: "Criminal Settlement", "zh-CN": "刑事和解", si: "අපරාධ එකඟතාවය", ta: "குற்றவியல் ஒப்பந்தம்" },
    severance_claim: { ko: "퇴직금청구 및 급여정산 수령행위", en: "Severance Claim", "zh-CN": "退休金请求及工资结算领取", si: "විශ්‍රාම වැටුප් හිමිකම් සහ වැටුප් ගණනය ලැබීම", ta: "ஓய்வூதிய கோரிக்கை மற்றும் சம்பள தீர்வு பெறுதல்" },
    financial_inquiry: { ko: "금융권 내역사실 확인", en: "Financial Inquiry", "zh-CN": "金融机构明细事实确认", si: "මූල්‍ය ගනුදෙනු වාර්තා සත්‍යාපනය", ta: "நிதி பரிவர்த்தனை பதிவுகள் சரிபார்ப்பு" },
    civil_settlement: { ko: "민사합의", en: "Civil Settlement", "zh-CN": "民事和解", si: "සිවිල් එකඟතාවය", ta: "சிவில் ஒப்பந்தம்" },
    insurance_settlement: { ko: "보험사합의", en: "Insurance Settlement", "zh-CN": "保险公司和解", si: "රක්ෂක එකඟතාවය", ta: "காப்பீட்டாளர் ஒப்பந்தம்" },
    departure_insurance: { ko: "출국보험청구및수령행위", en: "Departure Insurance Claim", "zh-CN": "出境保险请求及领取", si: "පිටවීමේ රක්ෂණ හිමිකම් සහ ලැබීම", ta: "வெளியேறும் காப்பீட்டு கோரிக்கை மற்றும் பெறுதல்" },
    funeral_expenses: { ko: "장제비청구 등", en: "Funeral Expenses Claim", "zh-CN": "丧葬费请求等", si: "අවමංගල්‍ය වියදම් හිමිකම්, ආදිය", ta: "இறுதி சடங்கு செலவு கோரிக்கை, முதலியன" },
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
  const dateLabel = locale === "ko" ? "일자" : locale === "en" ? "Date" : locale === "zh-CN" ? "日期" : locale === "si" ? "දිනය" : "தேதி"
  doc.text(`${dateLabel}: ${powerDate}`, 20, yPos)
  yPos += 10

  const principalSignature = locale === "ko" ? "위임인(외국인 부/모):" : locale === "en" ? "Principal (Foreign Parent):" : locale === "zh-CN" ? "委托人（外国人父/母）：" : locale === "si" ? "අධිකරණ නියෝජිත (අන්යජාතික මව්පිය):" : "முதன்மை (வெளிநாட்டு பெற்றோர்):"
  doc.text(principalSignature, 20, yPos)
  yPos += 10

  const attorneySignature = locale === "ko" ? "수임인 변호사 이택기 (인)" : locale === "en" ? "Attorney Lee Taek-gi (Seal)" : locale === "zh-CN" ? "受托人 律师 李택기（印）" : locale === "si" ? "නීතිඥ ලී ටේක්-ගි (මුද්‍රාව)" : "வழக்கறிஞர் லீ டேக்-கி (முத்திரை)"
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
      : locale === "zh-CN"
      ? "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: contact@sejoonglaw.kr"
      : locale === "si"
      ? "සේජූං නීති සමාගම | ග්යොංගි-දෝ, අන්සන්-සි, දන්වොන්-ගු, වොන්ගොක්-රෝ 45, සේජූං ගොඩනැගිල්ල 2වන මහල | දුරකථන: 031-8044-8805 | විද්‍යුත් තැපෑල: contact@sejoonglaw.kr"
      : "சேஜூங் சட்ட நிறுவனம் | கியோங்கி-டோ, அன்சன்-சி, டான்வான்-கு, வோன்கோக்-ரோ 45, சேஜூங் கட்டிடம் 2வது மாடி | தொலைபேசி: 031-8044-8805 | மின்னஞ்சல்: contact@sejoonglaw.kr"
    doc.text(footerText, 105, 285, { align: "center", maxWidth: 170 })
  }

  return doc
}

// 변호인선임서 PDF 생성
export function generateAttorneyAppointmentPDF(data: PDFData, locale: "ko" | "en" | "zh-CN" | "si" | "ta" = "ko") {
  const doc = new jsPDF()
  let yPos = 20

  const counselOffice = locale === "ko" ? "법률사무소 세중" : locale === "en" ? "Sejoong Law Office" : locale === "zh-CN" ? "世中律师事务所" : locale === "si" ? "සේජූං නීති කාර්යාලය" : "சேஜூங் சட்ட அலுவலகம்"
  const counselName = locale === "ko" ? "변호사 이택기" : locale === "en" ? "Attorney Lee Taek-gi" : locale === "zh-CN" ? "律师 李택기" : locale === "si" ? "නීතිඥ ලී ටේක්-ගි" : "வழக்கறிஞர் லீ டேக்-கி"
  const counselAddress =
    locale === "ko"
      ? "안산시 단원구 원곡로 45, 세중빌딩 2층"
      : locale === "en"
        ? "2F Sejoong Building, 45 Wonkok-ro, Danwon-gu, Ansan-si"
        : locale === "zh-CN"
        ? "安山市檀园区元谷路45号世中大厦2层"
        : locale === "si"
        ? "අන්සන්-සි, දන්වොන්-ගු, වොන්ගොක්-රෝ 45, සේජූං ගොඩනැගිල්ල 2වන මහල"
        : "அன்சன்-சி, டான்வான்-கு, வோன்கோக்-ரோ 45, சேஜூங் கட்டிடம் 2வது மாடி"
  const counselPhoneFax =
    locale === "ko"
      ? "전화: 031-8044-8805  팩스: 031-491-8817"
      : locale === "en"
        ? "Phone: 031-8044-8805  Fax: 031-491-8817"
        : locale === "zh-CN"
        ? "电话: 031-8044-8805  传真: 031-491-8817"
        : locale === "si"
        ? "දුරකථන: 031-8044-8805  ෆැක්ස්: 031-491-8817"
        : "தொலைபேசி: 031-8044-8805  ஃபாக்ஸ்: 031-491-8817"

  // 제목
  doc.setFontSize(18)
  const title = locale === "ko" ? "변호인선임서" : locale === "en" ? "Attorney Appointment" : locale === "zh-CN" ? "律师任命书" : locale === "si" ? "නීතිඥ පත් කිරීම" : "வழக்கறிஞர் நியமனம்"
  doc.text(title, 105, yPos, { align: "center" })
  yPos += 15

  doc.setFontSize(10)
  const fields = [
    { key: "case_number", label: locale === "ko" ? "사건" : locale === "en" ? "Case Number" : locale === "zh-CN" ? "案件" : locale === "si" ? "නඩුව" : "வழக்கு" },
    { key: "victim", label: locale === "ko" ? "피해자" : locale === "en" ? "Victim" : locale === "zh-CN" ? "受害者" : locale === "si" ? "අනතුරට ලක්වූ" : "பாதிக்கப்பட்டவர்" },
    { key: "appointer_name", label: locale === "ko" ? "선임인 가족대표자 성명" : locale === "en" ? "Appointer Family Representative Name" : locale === "zh-CN" ? "任命人家属代表姓名" : locale === "si" ? "පත් කරන්නාගේ පවුලේ නියෝජිත නම" : "நியமிப்பாளரின் குடும்ப பிரதிநிதி பெயர்" },
    { key: "appointer_id_number", label: locale === "ko" ? "본국신분증번호" : locale === "en" ? "ID Number" : locale === "zh-CN" ? "本国身份证号" : locale === "si" ? "ජාතික හැඳුනුම්පත් අංකය" : "தேசிய அடையாள அட்டை எண்" },
    { key: "appointer_relation", label: locale === "ko" ? "관계" : locale === "en" ? "Relation" : locale === "zh-CN" ? "关系" : locale === "si" ? "සම්බන්ධතාවය" : "உறவு" },
    { key: "court", label: locale === "ko" ? "법원" : locale === "en" ? "Court" : locale === "zh-CN" ? "法院" : locale === "si" ? "අධිකරණය" : "நீதிமன்றம்" },
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
  const counselLabel = locale === "ko" ? "변호인" : locale === "en" ? "Counsel" : locale === "zh-CN" ? "律师" : locale === "si" ? "නීතිඥ" : "வழக்கறிஞர்"
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
  const dateLabel = locale === "ko" ? "일자" : locale === "en" ? "Date" : locale === "zh-CN" ? "日期" : locale === "si" ? "දිනය" : "தேதி"
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
      : locale === "zh-CN"
      ? "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: contact@sejoonglaw.kr"
      : locale === "si"
      ? "සේජූං නීති සමාගම | ග්යොංගි-දෝ, අන්සන්-සි, දන්වොන්-ගු, වොන්ගොක්-රෝ 45, සේජූං ගොඩනැගිල්ල 2වන මහල | දුරකථන: 031-8044-8805 | විද්‍යුත් තැපෑල: contact@sejoonglaw.kr"
      : "சேஜூங் சட்ட நிறுவனம் | கியோங்கி-டோ, அன்சன்-சி, டான்வான்-கு, வோன்கோக்-ரோ 45, சேஜூங் கட்டிடம் 2வது மாடி | தொலைபேசி: 031-8044-8805 | மின்னஞ்சல்: contact@sejoonglaw.kr"
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
  const title = locale === "ko" ? "소송위임장" : locale === "en" ? "Litigation Power" : locale === "zh-CN" ? "诉讼委托书" : locale === "si" ? "නඩු කටයුතු අධිකාරිය" : "வழக்கு அதிகாரம்"
  doc.text(title, 105, yPos, { align: "center" })
  yPos += 15

  doc.setFontSize(10)
  const fields = [
    { key: "case_number", label: locale === "ko" ? "사건" : locale === "en" ? "Case Number" : locale === "zh-CN" ? "案件" : locale === "si" ? "නඩුව" : "வழக்கு" },
    { key: "plaintiff", label: locale === "ko" ? "원고" : locale === "en" ? "Plaintiff" : locale === "zh-CN" ? "原告" : locale === "si" ? "පෙළඹවීම්කරු" : "வாதி" },
    { key: "defendant", label: locale === "ko" ? "피고" : locale === "en" ? "Defendant" : locale === "zh-CN" ? "被告" : locale === "si" ? "චෝදනාකරු" : "பிரதிவாதி" },
    { key: "attorney_office", label: locale === "ko" ? "법률사무소" : locale === "en" ? "Law Office" : locale === "zh-CN" ? "律师事务所" : locale === "si" ? "නීති කාර්යාලය" : "சட்ட அலுவலகம்" },
    { key: "attorney_name", label: locale === "ko" ? "변호사 성명" : locale === "en" ? "Attorney Name" : locale === "zh-CN" ? "律师姓名" : locale === "si" ? "නීතිඥ නම" : "வழக்கறிஞர் பெயர்" },
    { key: "attorney_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : locale === "zh-CN" ? "地址" : locale === "si" ? "ලිපිනය" : "முகவரி" },
    { key: "attorney_phone", label: locale === "ko" ? "전화" : locale === "en" ? "Phone" : locale === "zh-CN" ? "电话" : locale === "si" ? "දුරකථන" : "தொலைபேசி" },
    { key: "attorney_fax", label: locale === "ko" ? "팩스" : locale === "en" ? "Fax" : locale === "zh-CN" ? "传真" : locale === "si" ? "ෆැක්ස්" : "ஃபாக்ஸ்" },
    { key: "principal_name", label: locale === "ko" ? "위임인 가족대표 성명" : locale === "en" ? "Principal Family Representative Name" : locale === "zh-CN" ? "委托人家属代表姓名" : locale === "si" ? "අධිකරණ නියෝජිත පවුලේ නියෝජිත නම" : "முதன்மை குடும்ப பிரதிநிதி பெயர்" },
    { key: "principal_id_number", label: locale === "ko" ? "본국신분증번호" : locale === "en" ? "ID Number" : locale === "zh-CN" ? "本国身份证号" : locale === "si" ? "ජාතික හැඳුනුම්පත් අංකය" : "தேசிய அடையாள அட்டை எண்" },
    { key: "court", label: locale === "ko" ? "법원" : locale === "en" ? "Court" : locale === "zh-CN" ? "法院" : locale === "si" ? "අධිකරණය" : "நீதிமன்றம்" },
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
  const authorizedLabel = locale === "ko" ? "수권사항" : locale === "en" ? "Authorized Actions" : locale === "zh-CN" ? "授权事项" : locale === "si" ? "අනුමත ක්‍රියා" : "அங்கீகரிக்கப்பட்ட செயல்கள்"
  doc.text(authorizedLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const authorizedLabels: Record<string, Record<"ko" | "en" | "zh-CN" | "si" | "ta", string>> = {
    all_litigation: { ko: "일체의 소송행위", en: "All Litigation Actions", "zh-CN": "一切诉讼行为", si: "සියලුම නඩු කටයුතු", ta: "அனைத்து வழக்கு நடவடிக்கைகள்" },
    record_access: { ko: "기록복사 및 열람", en: "Record Copy and Access", "zh-CN": "记录复制及查阅", si: "වාර්තා පිටපත් කිරීම සහ ප්‍රවේශය", ta: "பதிவு நகல் மற்றும் அணுகல்" },
    payment_receipt: { ko: "변제의 수령", en: "Payment Receipt", "zh-CN": "还款领取", si: "ගෙවීම් ලැබීම", ta: "கட்டணம் பெறுதல்" },
    sub_attorney: { ko: "복대리인의 선임", en: "Sub-Attorney Appointment", "zh-CN": "复代理人任命", si: "උප නීතිඥ පත් කිරීම", ta: "துணை வழக்கறிஞர் நியமனம்" },
    settlement: { ko: "재판상 또는 재판외의 화해", en: "Settlement", "zh-CN": "审判上或审判外和解", si: "එකඟතාවය", ta: "ஒப்பந்தம்" },
    security_rights: { ko: "담보권 행사 및 최고신청", en: "Security Rights", "zh-CN": "担保权行使及催告申请", si: "ආරක්ෂණ අයිතිවාසිකම්", ta: "பாதுகாப்பு உரிமைகள்" },
    costs_application: { ko: "소송비용 확정 신청", en: "Costs Application", "zh-CN": "诉讼费用确定申请", si: "වියදම් අයදුම්කරීම", ta: "செலவு விண்ணப்பம்" },
    deposit_actions: { ko: "공탁신청 및 공탁금 납입행위", en: "Deposit Actions", "zh-CN": "提存申请及提存金缴纳行为", si: "තැන්පතු ක්‍රියා", ta: "வைப்பு நடவடிக்கைகள்" },
    withdrawal_actions: { ko: "공탁금 출급회 수청구 및 공탁통지서 수령행위", en: "Withdrawal Actions", "zh-CN": "提存金提取请求及提存通知书领取行为", si: "ආපසු ගැනීමේ ක්‍රියා", ta: "திரும்பப்பெறுதல் நடவடிக்கைகள்" },
    record_access_detailed: { ko: "공탁기록 열람/복사", en: "Deposit Record Access", "zh-CN": "提存记录查阅/复制", si: "තැන්පතු වාර්තා ප්‍රවේශය", ta: "வைப்பு பதிவு அணுகல்" },
    certificate_receipt: { ko: "사실증명•청과 수령행위 일체", en: "Certificate Receipt", "zh-CN": "事实证明•请求领取行为一切", si: "සහතික ලැබීම", ta: "சான்றிதழ் பெறுதல்" },
  }

  Object.keys(authorizedLabels).forEach((key) => {
    const value = data[`authorized_actions.${key}`] || data?.authorized_actions?.[key] || false
    if (value === true || value === "true" || value === "on") {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      const authLabel = authorizedLabels[key]?.[locale as keyof typeof authorizedLabels[string]] || authorizedLabels[key]?.["en"] || ""
      doc.text(`☑ ${authLabel}`, 20, yPos)
      yPos += 7
    }
  })

  yPos += 5

  // 기타 특별수권사항
  doc.setFontSize(12)
  const specialLabel = locale === "ko" ? "기타 특별수권사항" : locale === "en" ? "Special Authority" : locale === "zh-CN" ? "其他特别授权事项" : locale === "si" ? "වෙනත් විශේෂ අධිකාරිය" : "மற்ற சிறப்பு அதிகாரம்"
  doc.text(specialLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const specialLabels: Record<string, Record<"ko" | "en" | "zh-CN" | "si" | "ta", string>> = {
    withdrawal_of_suit: { ko: "소의 취하", en: "Withdrawal of Suit", "zh-CN": "诉讼撤回", si: "නඩුව ඉවත් කිරීම", ta: "வழக்கு திரும்பப்பெறுதல்" },
    withdrawal_of_appeal: { ko: "상소의 취하", en: "Withdrawal of Appeal", "zh-CN": "上诉撤回", si: "අභියාචනය ඉවත් කිරීම", ta: "மேல்முறையீட்டை திரும்பப்பெறுதல்" },
    waiver_of_claim: { ko: "청구의 포기", en: "Waiver of Claim", "zh-CN": "请求放弃", si: "හිමිකම් අත්හැරීම", ta: "கோரிக்கை கைவிடுதல்" },
    admission_of_claim: { ko: "청구의 인낙", en: "Admission of Claim", "zh-CN": "请求承认", si: "හිමිකම පිළිගැනීම", ta: "கோரிக்கையை ஒப்புக்கொள்ளுதல்" },
    withdrawal_from_suit: { ko: "소송 탈퇴", en: "Withdrawal from Suit", "zh-CN": "诉讼退出", si: "නඩුවෙන් ඉවත් වීම", ta: "வழக்கிலிருந்து விலகுதல்" },
  }

  Object.keys(specialLabels).forEach((key) => {
    const value = data[`special_authority.${key}`] || data?.special_authority?.[key] || false
    if (value === true || value === "true" || value === "on") {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      const specLabel = specialLabels[key]?.[locale as keyof typeof specialLabels[string]] || specialLabels[key]?.["en"] || ""
      doc.text(`☑ ${specLabel}`, 20, yPos)
      yPos += 7
    }
  })

  yPos += 10

  const powerDate = data.power_date || new Date().toISOString().split("T")[0]
  const dateLabel = locale === "ko" ? "일자" : locale === "en" ? "Date" : locale === "zh-CN" ? "日期" : locale === "si" ? "දිනය" : "தேதி"
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
      : locale === "zh-CN"
      ? "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: contact@sejoonglaw.kr"
      : locale === "si"
      ? "සේජූං නීති සමාගම | ග්යොංගි-දෝ, අන්සන්-සි, දන්වොන්-ගු, වොන්ගොක්-රෝ 45, සේජූං ගොඩනැගිල්ල 2වන මහල | දුරකථන: 031-8044-8805 | විද්‍යුත් තැපෑල: contact@sejoonglaw.kr"
      : "சேஜூங் சட்ட நிறுவனம் | கியோங்கி-டோ, அன்சன்-சி, டான்வான்-கு, வோன்கோக்-ரோ 45, சேஜூங் கட்டிடம் 2வது மாடி | தொலைபேசி: 031-8044-8805 | மின்னஞ்சல்: contact@sejoonglaw.kr"
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
    : locale === "zh-CN"
    ? "死亡保险金支付同意法定继承人确认书"
    : locale === "si"
    ? "මරණ රක්ෂණ ගෙවීම් එකඟතාවය නීතිමය උරුමක්කාරයා තහවුරු කිරීම"
    : "மரண காப்பீட்டு கட்டணம் ஒப்புதல் சட்ட வாரிசு உறுதிப்படுத்தல்"
  doc.text(title, 105, yPos, { align: "center" })
  yPos += 15

  doc.setFontSize(10)
  const fields = [
    { key: "recipient_company", label: locale === "ko" ? "수신" : locale === "en" ? "Recipient" : locale === "zh-CN" ? "收件" : locale === "si" ? "ලබන්නා" : "பெறுநர்" },
    { key: "sender_company", label: locale === "ko" ? "발신" : locale === "en" ? "Sender" : locale === "zh-CN" ? "发件" : locale === "si" ? "යවන්නා" : "அனுப்புநர்" },
    { key: "sender_registration", label: locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : locale === "zh-CN" ? "营业执照号" : locale === "si" ? "ව්‍යාපාර ලියාපදිංචි අංකය" : "வணிக பதிவு எண்" },
    { key: "sender_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : locale === "zh-CN" ? "地址" : locale === "si" ? "ලිපිනය" : "முகவரி" },
    { key: "insured_name", label: locale === "ko" ? "성명" : locale === "en" ? "Name" : locale === "zh-CN" ? "姓名" : locale === "si" ? "නම" : "பெயர்" },
    { key: "insured_registration", label: locale === "ko" ? "거소신고" : locale === "en" ? "Residence Registration" : locale === "zh-CN" ? "居所申报" : locale === "si" ? "නිවාස ලියාපදිංචි" : "வாழ்விட பதிவு" },
    { key: "insured_birthdate", label: locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : locale === "zh-CN" ? "出生日期" : locale === "si" ? "උපන් දිනය" : "பிறந்த தேதி" },
    { key: "insured_gender", label: locale === "ko" ? "성별" : locale === "en" ? "Gender" : locale === "zh-CN" ? "性别" : locale === "si" ? "ලිංගභේදය" : "பாலினம்" },
    { key: "insured_address", label: locale === "ko" ? "주소" : locale === "en" ? "Address" : locale === "zh-CN" ? "地址" : locale === "si" ? "ලිපිනය" : "முகவரி" },
    { key: "insurance_product", label: locale === "ko" ? "보험상품명" : locale === "en" ? "Insurance Product" : locale === "zh-CN" ? "保险产品名称" : locale === "si" ? "රක්ෂණ නිෂ්පාදන නම" : "காப்பீட்டு தயாரிப்பு பெயர்" },
    { key: "policyholder", label: locale === "ko" ? "보험계약자" : locale === "en" ? "Policyholder" : locale === "zh-CN" ? "投保人" : locale === "si" ? "රක්ෂණ ගිවිසුම්කරු" : "காப்பீட்டு ஒப்பந்தக்காரர்" },
    { key: "policyholder_registration", label: locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : locale === "zh-CN" ? "营业执照号" : locale === "si" ? "ව්‍යාපාර ලියාපදිංචි අංකය" : "வணிக பதிவு எண்" },
    { key: "contract_date_1", label: locale === "ko" ? "계약일자 1" : locale === "en" ? "Contract Date 1" : locale === "zh-CN" ? "合同日期1" : locale === "si" ? "ගිවිසුම් දිනය 1" : "ஒப்பந்த தேதி 1" },
    { key: "contract_date_2", label: locale === "ko" ? "계약일자 2" : locale === "en" ? "Contract Date 2" : locale === "zh-CN" ? "合同日期2" : locale === "si" ? "ගිවිසුම් දිනය 2" : "ஒப்பந்த தேதி 2" },
    { key: "beneficiary_name", label: locale === "ko" ? "수익자 성명" : locale === "en" ? "Beneficiary Name" : locale === "zh-CN" ? "受益人姓名" : locale === "si" ? "ලාභාංශක නම" : "பயனாளி பெயர்" },
    { key: "beneficiary_registration", label: locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : locale === "zh-CN" ? "营业执照号" : locale === "si" ? "ව්‍යාපාර ලියාපදිංචි අංකය" : "வணிக பதிவு எண்" },
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
  const heirsLabel = locale === "ko" ? "법정상속인" : locale === "en" ? "Legal Heirs" : locale === "zh-CN" ? "法定继承人" : locale === "si" ? "නීතිමය උරුමක්කාරයන්" : "சட்ட வாரிசுகள்"
  doc.text(heirsLabel, 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  const heirFields = [
    { key: "heir_1_name", label: locale === "ko" ? "본국성명" : locale === "en" ? "Name" : locale === "zh-CN" ? "本国姓名" : locale === "si" ? "මව්රට නම" : "தாய்நாட்டு பெயர்" },
    { key: "heir_1_id", label: locale === "ko" ? "본국 신분증번호" : locale === "en" ? "ID Number" : locale === "zh-CN" ? "本国身份证号" : locale === "si" ? "ජාතික හැඳුනුම්පත් අංකය" : "தேசிய அடையாள அட்டை எண்" },
    { key: "heir_1_relation", label: locale === "ko" ? "보험자와의 관계" : locale === "en" ? "Relation" : locale === "zh-CN" ? "与投保人关系" : locale === "si" ? "රක්ෂණ ගිවිසුම්කරු සමඟ සම්බන්ධතාවය" : "காப்பீட்டு ஒப்பந்தக்காரருடன் உறவு" },
    { key: "heir_2_name", label: locale === "ko" ? "본국성명" : locale === "en" ? "Name" : locale === "zh-CN" ? "本国姓名" : locale === "si" ? "මව්රට නම" : "தாய்நாட்டு பெயர்" },
    { key: "heir_2_id", label: locale === "ko" ? "본국 신분증번호" : locale === "en" ? "ID Number" : locale === "zh-CN" ? "本国身份证号" : locale === "si" ? "ජාතික හැඳුනුම්පත් අංකය" : "தேசிய அடையாள அட்டை எண்" },
    { key: "heir_2_relation", label: locale === "ko" ? "보험자와의 관계" : locale === "en" ? "Relation" : locale === "zh-CN" ? "与投保人关系" : locale === "si" ? "රක්ෂණ ගිවිසුම්කරු සමඟ සම්බන්ධතාවය" : "காப்பீட்டு ஒப்பந்தக்காரருடன் உறவு" },
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
  const dateLabel = locale === "ko" ? "일자" : locale === "en" ? "Date" : locale === "zh-CN" ? "日期" : locale === "si" ? "දිනය" : "தேதி"
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
      : locale === "zh-CN"
      ? "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: contact@sejoonglaw.kr"
      : locale === "si"
      ? "සේජූං නීති සමාගම | ග්යොංගි-දෝ, අන්සන්-සි, දන්වොන්-ගු, වොන්ගොක්-රෝ 45, සේජූං ගොඩනැගිල්ල 2වන මහල | දුරකථන: 031-8044-8805 | විද්‍යුත් තැපෑල: contact@sejoonglaw.kr"
      : "சேஜூங் சட்ட நிறுவனம் | கியோங்கி-டோ, அன்சன்-சி, டான்வான்-கு, வோன்கோக்-ரோ 45, சேஜூங் கட்டிடம் 2வது மாடி | தொலைபேசி: 031-8044-8805 | மின்னஞ்சல்: contact@sejoonglaw.kr"
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

