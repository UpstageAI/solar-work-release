<div align="center">

<img src="docs/assets/icon.png" width="112" alt="Solar Work">

# Solar Work

**말로 맡기면, 일은 Solar가 합니다.**

Upstage Solar로 일하는 AI 에이전트.<br>
폴더를 열어 주고 할 일을 말하면 문서를 읽고, 분석하고, 보고서 · 발표 자료 · 대시보드까지 만들어 둡니다.

[![Latest release](https://img.shields.io/github/v/release/UpstageAI/solar-work-release?include_prereleases&label=release&color=5b4cf0)](https://github.com/UpstageAI/solar-work-release/releases)
[![Downloads](https://img.shields.io/github/downloads/UpstageAI/solar-work-release/total?color=5b4cf0)](https://github.com/UpstageAI/solar-work-release/releases)
![Platforms](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-eeedff)

[**다운로드 페이지**](https://upstageai.github.io/solar-work-release/) · [기업용 소개](https://upstageai.github.io/solar-work-release/business.html) · [릴리스 목록](https://github.com/UpstageAI/solar-work-release/releases)

</div>

---

| 💻 내 PC에서 | 🙋 먼저 묻고 실행 | 📦 결과물까지 | 🇰🇷 한국어 문서 |
|:---:|:---:|:---:|:---:|
| 내가 고른 폴더 안에서만 | 중요한 작업은 확인 후에 | 문서 · 표 · 발표 자료 | HWP · PDF · 스캔 · 오피스 |

## ✨ 이런 일을 맡겨 보세요

| | |
|---|---|
| 📄 **문서 읽고 정리하기** | HWP · PDF · 스캔본 · 오피스 문서를 읽고 요약하거나, 필요한 내용만 뽑아 표로 정리합니다. |
| 📊 **엑셀 분석과 대시보드** | 흩어진 엑셀 · CSV를 합치고 집계해서, 한눈에 보이는 대시보드와 차트로 만듭니다. |
| 🖥️ **보고서 · 발표 자료** | 조사한 내용을 Word · PowerPoint · Excel · PDF 파일로 바로 만들어 둡니다. |
| 🔎 **자료 조사** | 웹을 검색하고 페이지를 직접 열어 읽은 뒤, 출처와 함께 정리합니다. |
| 📁 **파일 · 폴더 정리** | 쌓인 파일을 종류 · 날짜별로 나누고, 이름을 바꾸고, 중복을 찾아 정리합니다. |
| 📬 **메일 · 업무 도구 연결** | Gmail · Notion · GitHub 같은 서비스를 연결해 메일 요약이나 문서 작업을 함께 맡깁니다. |

## 🛡️ 안심하고 맡기도록

- **내 PC에서 일합니다** — 내가 고른 폴더 안에서 파일을 읽고 씁니다. 대화와 결과물도 내 기기에 저장됩니다.
- **먼저 묻고 실행합니다** — 안전한 작업은 알아서 하고, 파일 이동 · 삭제처럼 되돌리기 어려운 작업은 실행 전에 꼭 확인을 받습니다.
- **과정이 다 보입니다** — 어떤 파일을 읽고 어떤 도구를 썼는지 실시간으로 보이고, 작업 중에도 `⌘/Ctrl+Enter`로 방향을 바꿀 수 있습니다.
- **언제든 다시 봅니다** — 지난 대화와 만든 결과물이 남아 있어 나중에 이어서 작업할 수 있습니다.

## 🇰🇷 한국어 문서에 강합니다

Upstage **Document Parse**로 표 · 스캔본까지 구조 그대로 읽고, 한국어에 강한 **Upstage Solar** 모델로 생각하고 일합니다.
차트 · 영수증 같은 이미지도 읽고, 오래 걸리는 조사는 서브에이전트에게 나눠 맡겨 동시에 진행합니다.

## 🏢 팀과 회사에서 쓰려면

사내 서버에 설치하고, 승인 · 기록 · 권한 관리까지 갖춘 기업용 Solar Work가 있습니다.

- 서버 · 데이터 · 기록을 사내에 두는 설치형 운영
- 도구별 승인 정책과 전 과정 감사 기록
- 조직 · 프로젝트 권한과 사내 로그인 연동
- 기존 시스템에서 API · SDK로 업무 연동

👉 **[기업용 소개 보기](https://upstageai.github.io/solar-work-release/business.html)**

## 📥 다운로드

가장 쉬운 방법은 **[다운로드 페이지](https://upstageai.github.io/solar-work-release/)** 에서 내 운영체제용 파일을 받는 것입니다.
모든 버전은 [Releases](https://github.com/UpstageAI/solar-work-release/releases)에 있습니다.

| 플랫폼 | 파일 | 비고 |
|---|---|---|
| **macOS** (Apple Silicon) | `SolarWork-<버전>-mac-arm64.dmg` | Developer ID 서명·Apple 공증 |
| **Windows** (x64) | `SolarWork-<버전>-win-x64-setup.exe` | [Git for Windows](https://git-scm.com/download/win) 필요 |
| **Linux** (x64) | `SolarWork-<버전>-linux-x64.deb`<br>`SolarWork-<버전>-linux-x64.AppImage` | Ubuntu/Debian은 `.deb` 권장 |

다운로드한 파일은 릴리스에 함께 올라간 `SHA256SUMS`로 무결성을 확인할 수 있습니다.

```bash
shasum -a 256 -c SHA256SUMS --ignore-missing     # macOS
sha256sum -c SHA256SUMS --ignore-missing         # Linux
```

## 🚀 시작하기

1. **설치** — 내 운영체제용 설치 파일을 실행합니다.
2. **모델 연결** — 첫 화면의 *모델 연결* 카드에서 [Upstage 콘솔](https://console.upstage.ai/) API 키를 붙여넣습니다.
3. **맡기기** — 작업할 폴더를 고르고 할 일을 평소 말투로 적습니다.

> 💡 이런 걸 맡겨 보세요
> - "카드 내역 엑셀이랑 영수증 사진으로 이번 달 지출 보고서 만들어 줘"
> - "이 HWP 공고문 읽고 신청 자격이랑 제출 서류만 표로 정리해 줘"
> - "다운로드 폴더 파일들 종류별로 폴더 나눠서 정리해 줘"
> - "전기차 충전 인프라 현황 조사해서 발표 자료 10장으로 만들어 줘"

<details>
<summary><b>macOS</b> 설치 안내</summary>

dmg를 열어 `SolarWork.app`을 **응용 프로그램** 폴더로 드래그하면 바로 실행됩니다.

공증 이전의 오래된 버전(rc.25 이하)이 열리지 않으면 아래 명령으로 차단을 해제하세요.

```bash
xattr -dr com.apple.quarantine /Applications/SolarWork.app
```
</details>

<details>
<summary><b>Windows</b> 설치 안내</summary>

`SolarWork-<버전>-win-x64-setup.exe`를 실행합니다. SmartScreen 경고가 뜨면 **추가 정보 → 실행**을 누르세요.
에이전트가 명령을 실행할 때 Git Bash를 사용하므로 [Git for Windows](https://git-scm.com/download/win)를 먼저 설치해야 합니다.
</details>

<details>
<summary><b>Linux</b> 설치 안내</summary>

```bash
# Ubuntu / Debian — 의존성까지 자동 설치
sudo apt install ./SolarWork-<버전>-linux-x64.deb

# AppImage
chmod +x SolarWork-<버전>-linux-x64.AppImage
./SolarWork-<버전>-linux-x64.AppImage
```

AppImage는 `libatomic1`, `libgbm1`, ALSA(`libasound2` 또는 `libasound2t64`)가 필요합니다.
FUSE 2가 없으면 `--appimage-extract-and-run` 옵션을 붙여 실행하세요.
OS 보안 저장소가 없는 환경에서는 로그인 토큰을 디스크에 저장하지 않습니다.
</details>

## 🔄 업데이트

새 버전이 나오면 앱이 알려 줍니다. 이 저장소의 Releases가 앱의 업데이트 채널이므로, 최신 설치 파일을 받아 덮어 설치해도 됩니다.
현재는 프리릴리스(`-rc`) 단계입니다.

---

<div align="center">
<sub>이 저장소는 Solar Work 설치 파일 배포용입니다. 소스 코드는 포함되어 있지 않습니다.<br>
Made by <a href="https://www.upstage.ai/">Upstage</a></sub>
</div>
