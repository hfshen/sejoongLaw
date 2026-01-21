# 소송위임장 및 기타 문서 텍스트 패딩/레이아웃 이슈 수정 명령 프롬프트

## 발견된 문제점 요약

### 1. 소송위임장 (Litigation Power of Attorney) - 한국어 버전
**문제 (텍스트 잘림):**
- "전화"가 "저한"으로 표시됨 → 텍스트가 잘려서 보이는 문제
- "본국신분증번호"가 "보국신분증버ㅎ"로 표시됨 → 텍스트가 잘려서 보이는 문제

**수정 완료:**
- `litigation-who`, `litigation-to`, `litigation-addr`, `litigation-tel` 클래스에 `width: 100%`, `min-width: 0`, `padding: 0 2px` 추가
- `overflow: visible`, `word-wrap: break-word`, `overflow-wrap: break-word`, `white-space: normal` 추가
- 모든 텍스트 요소에 명시적인 `font-family` 설정 추가
- `litigation-bottom`의 padding을 `15px`에서 `20px`로 증가
- `litigation-suw-wrap`의 padding을 `15px 18px`에서 `15px 20px`로 증가

### 2. 소송위임장 (Litigation Power of Attorney) - 영어 버전
**문제:**
- "Address 2F Sejong Building 45 Wongok-ro..." - "Address" 뒤에 콜론(`:`)이 없음
- "Tel 031-8044-8805~8 Fax 031-491-3817" - "Tel"과 "Fax" 뒤에 콜론이 없음

**수정 필요:**
- `litigation-addr` 클래스의 주소 텍스트에 콜론 추가 확인
- `litigation-tel` 클래스의 전화/팩스 표기에 콜론 추가 확인

### 3. 소송위임장 (Litigation Power of Attorney) - 중국어 버전
**문제 (텍스트 잘림):**
- "电话:031-8044-8805~8 传直031-491-3817" - "传直"이 "传真"의 잘림으로 보임

**수정 완료:**
- `litigation-tel` 클래스에 `width: 100%`, `min-width: 0`, `padding: 0 2px` 추가
- `overflow: visible`, `word-wrap: break-word`, `overflow-wrap: break-word`, `white-space: normal` 추가
- 모든 텍스트 요소에 명시적인 `font-family` 설정 추가

### 4. 변호인 선임서 (Attorney Appointment) - 한국어 버전
**문제:**
- "전화 031-8044-8805 팩스 031-491-8817" - "전화"와 "팩스" 뒤에 콜론이 없음

**수정 필요:**
- `AttorneyAppointmentOldPreview` 컴포넌트에서 전화/팩스 표기에 콜론 추가

### 5. 사망보험금 확인서 (Insurance Consent) - 영어 버전
**문제:**
- "From: 91-11919" - 회사명이 빠지고 사업자등록번호만 표시됨
- "From" 섹션의 레이아웃이 깨져 보임

**수정 필요:**
- `InsuranceConsentOldPreview` 컴포넌트의 "From" 섹션에서 회사명과 사업자등록번호가 모두 표시되도록 수정
- 레이아웃 패딩 조정

### 6. 변호인 선임서 (Attorney Appointment) - 중국어 버전
**문제 (텍스트 잘림):**
- "电话:031-8044-8805~8 传直031-491-8817" - "传直"이 "传真"의 잘림으로 보임

**수정 완료:**
- 변호인 선임서의 모든 언어 버전에 콜론 추가 완료
- 중국어 번역 키에서 "传直" → "传真" 확인 필요 (코드에는 이미 "传真"으로 되어 있음)

## 수정 명령 프롬프트

```
다음 문제점들을 components/admin/DocumentPreview.tsx 파일에서 수정해줘:

1. 소송위임장 (LitigationPowerOldPreview) - 영어 버전:
   - litigation-addr 클래스의 주소 텍스트에 "Address:" 뒤에 콜론이 명시적으로 표시되도록 확인
   - litigation-tel 클래스의 전화/팩스 표기에서 "Tel:"과 "Fax:" 뒤에 콜론이 명시적으로 표시되도록 수정
   - 현재 코드: {t.tel} <span>...</span>, {t.fax} <span>...</span>
   - 수정: {t.tel}: <span>...</span>, {t.fax}: <span>...</span>

2. 소송위임장 (LitigationPowerOldPreview) - 중국어 버전:
   - 주소 텍스트에 "地址：" 뒤에 콜론이 명시적으로 표시되도록 확인 (전각 콜론 사용)
   - "传直" → "传真" 수정

3. 변호인 선임서 (AttorneyAppointmentOldPreview) - 한국어 버전:
   - 전화/팩스 표기에 콜론 추가: "전화: 031-8044-8805 팩스: 031-491-8817"

4. 변호인 선임서 (AttorneyAppointmentOldPreview) - 중국어 버전:
   - "传直" → "传真" 수정

5. 사망보험금 확인서 (InsuranceConsentOldPreview) - 영어 버전:
   - "From" 섹션에서 회사명(sender_company)과 사업자등록번호(sender_registration)가 모두 표시되도록 수정
   - 현재: {getValue("sender_company") || ""} {t.businessReg} : {getValue("sender_registration") || ""}
   - 수정: {getValue("sender_company") || ""} {getValue("sender_company") && getValue("sender_registration") ? `(${t.businessReg}: ${getValue("sender_registration")})` : ""}

6. 모든 문서의 주소/연락처 표기 일관성:
   - 모든 언어 버전에서 주소는 "Address:" / "地址：" / "주소:" 형식으로 통일
   - 모든 언어 버전에서 전화/팩스는 "Tel:" / "电话:" / "전화:" 형식으로 통일
   - 콜론 뒤에 공백 추가 여부도 일관되게 적용

7. 폰트 렌더링 문제 해결 (수정 완료):
   - 한국어에서 "전화"가 "저한"으로 표시되는 문제는 텍스트 잘림 문제
   - 모든 텍스트 요소에 명시적인 font-family 설정 추가 완료
   - 특히 litigation-tel, litigation-addr, litigation-who, litigation-to 클래스에 font-family 명시 완료

8. 패딩/여백 조정 (수정 완료):
   - litigation-bottom의 padding을 15px에서 20px로 증가
   - litigation-suw-wrap의 padding을 15px 18px에서 15px 20px로 증가
   - 모든 주소/연락처 섹션에 width: 100%, min-width: 0, padding: 0 2px 추가
   - 텍스트가 겹치지 않도록 overflow: visible, word-wrap: break-word, overflow-wrap: break-word, white-space: normal 추가
```

## 추가 확인 사항

1. **이미지 생성 시 폰트 로딩 문제:**
   - `lib/documents/image-generator.ts`에서 폰트 로딩 타임아웃이 충분한지 확인
   - `onclone` 함수에서 모든 텍스트 요소에 폰트가 명시적으로 적용되는지 확인

2. **CSS 클래스 일관성:**
   - 모든 문서에서 주소/연락처 표기 스타일이 일관되게 적용되는지 확인
   - 콜론 사용 여부와 공백 처리 통일

3. **번역 키 확인:**
   - `ko.json`, `en.json`, `zh-CN.json` 등에서 주소/연락처 관련 번역 키가 올바른지 확인
   - 텍스트 잘림이 아닌 실제 오타인지 확인 ("传直" → "传真" - 코드에는 이미 "传真"으로 되어 있음)
