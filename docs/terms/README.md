# 약관 문서

Solar Work 동의 화면이 여는 약관 본문입니다. 다운로드 페이지(`index.html`·`business.html`)에서는 링크하지 않습니다.
폴더 이름은 `terms_documents.kind`, 파일 이름은 `version`과 같습니다.

```
docs/terms/
  age_14_or_over/2026-11-01.html      (필수) 만 14세 이상 확인
  age_14_or_over/versions.json        버전 목록(최신 먼저) — 페이지의 버전 선택 상자가 읽음
  terms_of_service/2026-11-01.html    (필수) 이용약관
  privacy_required/2026-11-01.html    (필수) 개인정보 수집·이용
  privacy_marketing/2026-11-01.html   (선택) 마케팅 목적 개인정보 수집·이용
  ad_messages/2026-11-01.html         (선택) 광고성 정보 수신
  open_source_licenses.html           오픈소스 라이선스 고지(동의 대상 아님, 경로 고정)
```

URL: `https://upstageai.github.io/solar-work-release/terms/<kind>/<version>.html`

## 규칙

- **게시한 파일은 고치지 않습니다.** 동의 기록이 `content_sha256`으로 원문을 증명하기 때문입니다. 오탈자도 새 버전으로 게시합니다.
- 개정은 같은 폴더에 `<새 시행일>.html`을 더하고 `versions.json` 맨 앞에 그 버전을 넣습니다. 지난 버전은 지우지 않습니다.
  버전이 둘 이상이면 모든 버전 페이지에 버전 선택 상자가 나타나 지난 약관을 볼 수 있습니다.
- 페이지는 외부 CSS·폰트·스크립트 없이 한 파일로 둡니다(버전 목록만 `versions.json`에서 읽습니다). 공용 파일이 바뀌어도 동의한 화면이 그대로 남게 합니다.
- 게시 후 해시를 계산해 운영 SQL(`terms_documents`)에 넣습니다.

```sh
shasum -a 256 docs/terms/terms_of_service/2026-11-01.html
```

## 오픈소스 라이선스 고지

`open_source_licenses.html`은 앱이 링크하는 **고정 경로**입니다(`https://upstageai.github.io/solar-work-release/terms/open_source_licenses.html`).
동의 문서가 아니라서 버전 파일을 두지 않고, 릴리스마다 같은 파일을 다시 생성해 덮어씁니다. 위의 "고치지 않는다" 규칙은 이 파일에 적용하지 않습니다.

배포되는 것만 담습니다: 서버·CLI 바이너리에 링크되는 Rust crate, 웹·데스크톱 화면 번들에 들어가는 npm 패키지, Electron, 바이너리에 함께 빌드되는 라이선스·NOTICE 파일.

```sh
# solar-work 체크아웃: 루트와 ui/desktop에서 npm ci 후
node scripts/open-source-licenses.mjs ../solar-work
```

데스크톱 앱에 함께 싣는 `solar` CLI(UpstageAI/solar-code)는 이 목록에 들어가지 않습니다.
