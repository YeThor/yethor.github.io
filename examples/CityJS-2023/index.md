# CityJS 2023 

Lifelong Learning Institute의 대강의실과 이벤트홀에서 진행
0840 - 0940 아침식사 & 커뮤니케이션

## Welcome Talk (09:40)
> Aris / Tech Lead Engineer **Foolproof/Zensar** 

- CityJS는 런던의 3개 JS 밋업 그룹에서 시작했다. 순수한 커뮤니티 이벤트다. 모든 기금은 커뮤니티와 이벤트 진행에 쓰인다. 
- CityJS를 하자! 그날밤 바로 부트스트랩을 다운받아서 돌렸더니 웹사이트가 돌아갔다 그게 2018년 CityJS 사이트의 탄생
- 2023년 런던, 상파울로, 그리스, 싱가폴, 독일, 인도, 나이지리아 등 곳곳에서 열리고 있다. 
- Code of Conduct 소개. 차별과 혐오는 허용되지 않는다. One 
- MC는 잉글랜드에서 온 Dan Starns씨가 이어받습니다. 
- 스폰서 소개 

## Do your regional websites talk funny?
> Chen Hui Jing 

- 오 revealJS로 발표한당 오 엄청난 E 에너지다 
- 've' 생략 고벌먼트 -> 고-먼트 .. 싱글리시에 대한 양해 구하는 중 
- Hui Jing이 이름임 
- Internationalisation은 문화,지역,언어가 다양한 사람들이 쉽게 프로덕트,앱, 문서를 사용할 수 있게 하는 design & development 
- "Billion" 문제
  - 한중일은 10, 100, 1000, 10000, ...  10000 그룹 단위로 간다.
  - 하지만 서구는 그렇지 않지 
- 많은 개발자들은 useTranslation(from react-i18next) 같은 함수를 통해 single content로부터 multiple content를 만들어낸다. 
  - 그러다보니 번역가들은..
    - Over %{total_stores} business ,,,,, in %{total_countries} 이런 문장을 보게된다 
- "200 ten million dollars" 는 문법적으로 오류다.
- %{total_gmv_billions}0억 달러 (USD) 이런 식으로 써봤다. 
- 교훈
  - i18n 라이브러리한테 맡겨라 . 모든 인기있는 프레임워크들은 다 그들만의 i18n을 가지고 있다
  - 코드에서 수동적으로 문장을 만들거나 구성하려고 하지 마라
  - Interpolate with caution 
- CJKV
  - 중국, 자팬, 코리아, 베트남 
- Unicode ranges
  - 베트남은 특이, non-contiguous ... 그래서 트리키하다. 
- ```
  :lang(vi) {
    font-family: -apple-system, sans-serif, ...;
  }
  ```
- :lang() 수도 클래스를 반드시 선언해야하자. 각 언어별로 적절한 폰트가 그려지도록 말이다. 
  - 디자이너랑 얘기해서 적절한 폰트를 선언해라 :lang(ko) { font-family: 'Work Sans', -apple-system, ... }
  - 기본 애플 한글폰트(Apple SD Gothic Neo)는 Latin-1 supplement 캐릭터 셋을 지원하지 않는다 즉 beyon'ce는 제대로 렌더링되지 않을거임 

## GraphQL is more than a Type System 
> Roy Derks  / 네덜란드 StepZen, author, engineer, public speaker /  @gethackteam 

- 왜 개발자는 그래프큐엘을 좋아하는가 
  - "FE개발자로서 REST API가 싫어요!" - Twitter(or X)
  - 하나의 API로 퉁친다 
- GraphQL
  - API를 위한 쿼리 언어
  - 다수의 리소스로부터 단일 엔드포인트를 제공하며
  - 타입 시스템에 기반한다 
    - 서버가 말없이 데이터 형식을 바꾸거나 하면.. Boom! 하지만 그래프큐엘을 사용하면 균일하게 유지 가능하며 문서화(Schema)도 쉬움
    - 모든 필드는 타입 정의를 가진다 
    ```
    created_at: Date
    Creation time of this account 
    ``` 
- Define nested relationships 
- Improves Developer Experience 
- GraphQL can also be your BFF (not BF maybe)
- 그래서 언제 이걸 쓰냐
  - Multiple clients use the same data
    - 하나의 api로 여러 플랫폼(앱, 웹앱, 웹)에 서빙될때. 한 플랫폼에서 특정 데이터를 추가하거나 바꿔야한다고하면 그냥 그래프큐엘로 필요없는 부분을 무시하면 된다. 
    - bandwidth를 보고 데이터의 양을 결정할 수도 있다 
  - You have data in multiple places
    - 주로 백엔드/풀스택 엔지니어가 겪는 문제 
    - 하나의 API안에 여러개의 서비스 및 데이터베이스가 함께 올 때 
  - 위의 두가지 이유로, 그래프큐엘은 데이터 레이어로 쓰일 것이다 
- DAL (Data Access Layer)
- 이미 API가 데이터레이어가 아니냐고 할 수 있겠지만
  - 인셉션 같은거다
  - 데이터 레이어 안의 또다른 데이터 레이어 
  - Scales on different clients 
  - Works with decoupled API 
  - GraphQL federation을 통해 각 그래프큐엘을(단일 API에 상응중인) 통합할 수도 있음
- Type nerd kkkkkkk
- End-to-end type safety can this way be achieved 
- Typical setup today
  - 리액트, 뷰, 스벨테로 이루어진 어플리케이션 
  - 데이터베이스와 서비스로 이루어진 API
  - 개인 개발자거나 스타트업이면 힘들 수 있다. 백엔드를 바꾸면 그래프큐엘도 바꿔야하고.. 
  - tRPC도 고려해봄직함 하다 (typesafe nature, Data Layer)
- AI랑 일하기도 좋다
  - how to interact in global level 
  - Declarative language이기 때문에 다른 언어와 소통하기도 쉽다 
- Recap
  - 우리는 그래프큐엘이 좋아( API 쿼리 랭귀지, 다수 리소스에 대한 단일 엔드포인트, 그레잇 툴링, 타임 시스템)
  - but
    - 1:N / N:N 에 좋은거고 1:1은 trpc ㄱㄱ 
    - 선언적 언어이므로 AI같은 다른 레벨의 것들과 소통하기 쉽다 


## Harnessing the Potential: AI's Role in Enhancing Media Experience 
> Tamas Piros 

- 신기하다 졸지 말라고 틈틈이 운동시켜주네 ㅋㅋㅋㅋ 
- Visual Media can be your biggest competitive language 
  - Zero image로 웹사이트 만들어본 사람? (그럴리가 .. )
  - 퍼포먼스가 점점 문제(matter)가 되고 있다 
  - 이미지 밴드위스는 2019년에서 2022년 사이에 25퍼 증가했고 비디오 트래픽은 37% 증가했다 
- Speed & Flexibility demand a composable architecture 
- 거시적 관점에서, transformation 에 기반한 AI는 더 나은 생산성을 만드는 데에 큰 도움이 될 것이다 
- 개발자로서는 어떤걸 할 수 있을까?
- Generative background fill
  - 기존 배경을 사용하여 배경을 더 넓힌다 (사이즈, 픽셀)
  - @cloudinary
- Generative replace 
  - 슈트사진을 입은 남자가 찍힌 세로사진이 원본이라고 치자 
  - 넥타이나 수트의 색을 바꾼다 (color replace) 오.. 이커머스에서 쓸만할듯 
  - new CloudinaryImage('suit,jpg').addTransformation("e_gen_recolor:promot_jacket;to-color_brown")
  - 쿠키가 찍힌 원본을 아보카도로 바꾼다거나 (동일한 배경에 주제가 되는 물건만 바뀜)
    - e_gen_replace: from_cookies; to_coffee mug
  - 특정 모습을 삭제할 수도 있지
    - e_gen_remove:prompt_apple logo
- Image captioning
  - 솔직히 말해봐 진짜 얼마나 meaningful한 캡션을 집어넣는데?
- Upscaling to super resolution
  - 작은 이미지가 있다고 칩시다. 
    - rezie(scale().width('4.0'))
    - 더 커짐 
    - addTransformation("e_upscale") 을 통해 더 선명하게 만들수있음 와 csi네 이거 
- Honourable Video 
  - 비디오 크롭도 가능하고 공을 따라 화면이 움직이도록 할 수 있음
- use case가 정말 무궁무진함. 생산성, 개발자경험, ux, 접근성, .... 


## Machine Learning in JS 
> Doni Rubiagatra / Zero.one Technology 

- Numerical Computation & 머신러닝 라이브러리 in JS
  - Numerical computiong : calculus and linear algebra with computers 
  - 왜 JS 써?
    - 웹은 오픈 플랫폼
    - 큰 개발자 생태계
    - privacy & security 
    - explorable explanation 
  - 왜 안 써?
    - 성능
    - 아직 커뮤니티가 nemerical computation에 그다지 집중하지 않고 있음 
    - 네이티브 다차원 배열에 대한 부재 
- 유명한 머신러닝 라이브러리
  - ML5, tensorflow, ... 
- 텐서플로우는 자바스크립트로 작성된 머신러닝 라이브러리다 
  - Layers API -> Core API ->
    - Brower - WebGL
    - Node.js - TF CPU 
- 라이브러리 선택 -> Dataset 구하기 (UCI)  -> 스크립트 작성 -> 모델 만들기 -> 모델 훈련시키기 -> 브라우저에 띄우기 
- 이제 재밌는거 만들어보자! 
  - 텐서플로우 예시 활용
  - 어떻게 동작하는지를 이해할것
- 미래: Runtime Backend 
  - WASM, WebGPU : backed for the browser 
- WebGPU: unlocking modern gpu access in the browser 
  - JS를 1타겟으로 디자인됨
  - 텐서플로우 성능이 향상된 것을 확인할 수 있음
- ML Powered App은 갈수록 많아질 것이다
  - 포즈 디텍션, 신체 분할, 표정 디텍션 , . . .

## Supercharging Web App with Headless and modern frontend frameworks 
>  @arorachakit / Chakit Arora / Storyblok에서 일하는 풀스택 엔지니어. 

- Headless CMS 
  - 모놀리식 vs 헤드리스 CMS
- 헤드리스 CMS 장점
  - decoupled frontend
  - omnichannel support
  - code maintainability
  - scalability and flexibility
  - API First


## Navigating the web in aworld full of constraints
> Zain Fathoni @ Ninja Van 

- 템플릿이.. 좌우 화면 양분해서 하는게 많네욤 깔끔해보임 좋아보이고 
- 흠 지나온 길에 대한 얘기인듯. 뭘로 뭘 어떻게 개발했고 어떻게 나아졌는지. 그런데 프로덕트에 대한 설명이 많아서. 더 적기엔 애매할 것 같다 

## Untestable : It's just pressing a button, how can it be hard?
> Tai Shi Ling, CEO, UUIlicious

- 수동적으로 테스트가 돌 땐 잘 되는데, 브라우저 자동화에서는 안될때가 있다 
- 안좋은거 
  - QA한테 일일이 얘기한다
  - QA한테 고쳐달라고 얘기한다 
- untestable.site 
- Glass door : 오버레이 요소가 있음 
- new TheFinger() 수동구현 ㅋㅋㅋㅋㅋㅋㅋ
  - 요소 주변에 getBoundingClientRect로 사각형을 구하고 중심이 되는 x,y 좌표를 찾아서 클릭하도록 한다 
- The Clone : 무한으로 UI를 리렌더링 (불필요하게) 
- The dodgeball : 마우스 포인터를 갖다대려고 할 때 UI 요소가 사라진다거나 움직인다거나. 사람은 알아서 하겠지만 시스템은 그걸 못하지
  - 이것도 driver.actions(...)를 통해서 일일이 구현했다 



## 점 심 시 간 


## Why Javascript will dominate web3 development 
> Neil Han  / Founder & CEO 

- 1st를 좋아하는 분이군 . . . 
- Architecture of Web2 Apps 
  - Database -> Backend -> Frontend 
- Web3 eliminates the middle man/single entity 
- Smart contract , Storage 
  - 중간에 Provider가 존재
- NFT를 5분만에 앱에 추가해주는 그런 툴인듯.. reddio 홍보 느낌도 살짝 남 
- Founder & CEO는 흠 역시... 이래서인가봄... 


## Prioritizing Accessibility in Web Development 
> Trung Vo / @ Ascenda 

- 1989- 1991로 돌아가자. 웹을 만든 팀 버너스리는 HyperText Server에 접근해 여러 플랫폼에서 동작하는 브라우저를 생각해냈다
- 1995년 IE1.0이 생겼고 
- 1997년 WAI라는 것이 제안되었다 Web Accessibility Initiative 
  - 당시에는 장애를 가진 750 million의 사람들이 있었고 이 사람들의 웹 경험을 위한 표준이 필요하다 
- 장애를 가진 사람들이 웹 사이트와 어플리케이션을 쉽게 이용할 수 있도록 하는 것
- a11y 
  - 11 : ccessibilit 가 11글자이기 때문이다 
- Accessibility Design은 장애우만을 위한게 아니라, 모두를 위한 것이다. 
- Essential for some, useful for all 
- 어디서부터 시작해야할까
  - WCAG : 접근성 가이드라인 
  - P.O.U.R -> 4가지 원칙 Perceivable Operable Understandable 
  - Non-tedt content 
  - contrast 비율은 최소 4.5 : 1 더 성공하고 싶으면 7:1 (WCAG AA, WCAG AAA)
- 웹 접근성 테스팅
- button 태그를 안쓰고 div에 클릭핸들러를 종종 걸어버리곤 하지만........
  - 라이트하우스에 접근성 카테고리를 체크하고 돌려버리면 ... 접근성 문제를 알려줄 것이다 . 하지만 alt만 알려주겠지. 그게 다일까?
  - eslint-plugin-jsx-a11y를 설치하면, non interactive element에 그 짓을 했다고 뭐라고 할 것이다. role='button'을 줘도 마찬가지일 것. 좋아 tabIndex까지 줘버린다. 
  - 결국엔 처음 button이 있던 시절로 돌아갈 것. 
- 주요 접근성 에러
  - 낮은 대비
  - 이미지 alt 텍스트 생략
  - 빈 링크
  - input 라벨의 부재
  - 빈 버튼
  - html lang="ko"과 같은 document language의 부재
- www -> wai -> wacg 1.0 -> wacg 2.0 -> we are here 

## What devs have to know about ML
> swyx

- Rise of the AI Engineer 
- 흠 DeepL 이야기였다.


## Designing and Building Micro Frontend on AWS
> Derick Chen / AWS

- Adaptive Systems Design
  - 최소한의 cost of future change 기반의 점진적이고 nimble한 아키텍쳐.
    - high cohesion / low coupling 
- DDD : Domain Driven Design 
- 마이크로 프론트엔드?
  - 모놀리스 프론트엔드
    - 하나의 FE가 프로필 서비스 찌르고 빌링 서비스 찌르고 쉬핑 서비스 찌르고 
  - 독립적으로 deliverble한 프론트엔드 서비스를 조합하는 것 
    - 프로필 서비스를 위한 프론트엔드, 빌링 서비스를 위한 프론트엔드... 이 친구들은 child frontend 
    - 그리고 상위에 parent fronted가 존재한다
  - 왜 이거야
    - 모놀리식 디자인에서는, 프로덕선 이슈 고쳐야해 -> 새 기능에 대한 시간이 없어 -> 개발자가 더 필요해 -> 우리 구조를 개선하고 변화시켜야해
    - big ball of mud 
  - Tradeoff
    - 스피드(개발시간, 협업, 릴리즈 속도, 짧은 개발 파이프라인)와 코드 품질(Tech agnostic, predictability, failure isolation)을 보장할 수 있지만
    복잡도(Deployment, Integration)와 전체 asset size가 증가한다 
  - 바운더리를 어떻게 결정할 것인가
    - DDD
- Domain Driven Design과 함께 하는 마이크로 프론트엔드 
  - 새로운 것이 아니다 
  - Strategic Design -> Tactical Design -> Improving software success metrics 
  - High cohesion, low coupling -> Independent deploy-ability -> ...
- Application Design with DDD & Event storming : sub domain & bounded context 파악 (여러 팀이 관여)
- 웹팩 Moduel Federation을 이용해 여러 마이크로프론트엔드 서비스(리액트, 앵귤러,...)를 여러개의 chunk js로 쪼갠다 
- Independent Deployability


## Module Federation, Bundlers, and Future state
> Zack Jackson

- Module Federation 
- 목표
  - 외부 코드를 런타임에 불러오는 것
  - 런타임에서의 다이나믹 쉐어링
  - 배포 독립 
  - 중복성 제거 
  - Great DX (Developer Experience)
- consuming it, using it 
- 언제 Federated Modules를 쓸래
  - 글로벌 컴포넌트
  - 다른 팀에 의해 운영되는 기능 
- 컴포넌트 레벨의 오너쉽 
  - 느슨한 커플링
  - 똑똑한 컴포넌트
  - Colocation 
  - 오너쉽 바운더리
- Federation을 통해 업스케일링이 용이 (홈페이지 테마색을 바꾼다거나)
- 이쪽도 Rspack을 홍보하기위해......
- 이 인간 대체 얼마나 오래 발표하는거냐 시간제한 1도 신경안쓰네 내가 나중에 녹화된 주최측 영상 확인해봄 


## 뷰 다시 만들기 : Lessons Learned 
> Even You 

- 뷰2에서 뷰3로 넘어가는건 스무스한 경험이 아니였다. 
- 사용자가 엄청 나는 프레임워크를 유지하기란.........
- 뷰와 비트에 풀타임으로 일하는 중 
- 뷰
  - 2013 첫 릴리즈, 2014년 2월에 대중에 공개, 2015년 10월에 1.0, 그로부터 1년후 2.0, 그리고 2018년 9월부터 3.0을 시작해 2년후에 3.0 soft launch,  2022년 1월에 3.0은 디폴트 버전이 되었다
  - 뷰2에서 뷰3로 가기엔 정말 오랜 기간이 필요했다
- 왜 그렇게 오래 걸렸나 & 뷰3를 만든 이유 
  - 뷰2 코드베이스는 모던화가 필요했다
    - 타입스크립트도 안썼고, 내부 레이어 분리가 엉망이었고, 컴파일러 capability가 제한적이었고
  - 재작성하는 동안 퍼포먼스 또한 향상시켜야했다 
  - Address scalability / 유지보수 이슈
    - 더 나은 타입 서포트
    - 더 많은 reuse / refactor-friendly APIs (Composition APIs)
  - 브라우저 서포트 최소점을 높여야했음 
    - 새로운 언어와 브라우저 feature를 사용하기 위해서 (프록시)
    - 지원 이슈가 있는 레거시 브라우저 드롭 (IE 따위에 갇혀있을 순 없다)

- 하지만 이런 실수를 했지
  - 모두에게 스무스한 경험은 아니였다
  - 많은 유저가 뷰2에 박혀있다
    - 마이그레이션 코스트
    - 의존성에 의한 블로킹 문제
    - 레거시 브라우저 서포트 (IE, old ios ver)
- 실수
  - 1. Too many small breaking changes
      - 각 변경사항은 고립된 채로 감당 가능한 것처럼 보였다
      - 하지만 그런 변화들이 함께 결합됐을때, complexity compounds가 무지막지하게 증가했다.
      - 유저가 골라서 하는게 아니라 모든걸 다 알아야했다
      - 그래, 한번에 모든걸 바꾸진 말자. 기본적으로는 기존에 돌아가던걸 돌아가게 하자
      - deprecate -> opt-in -> remove의 사이클을 따르자 
      - Stagger and spread out between releases
  - 2. 생태계 라이브러리에 끼치는 임팩트를 너무 과소평가함 
    - Breaking Change는 어플리케이션 레벨 코드 컨텍스트에서 논의되었다
    - 하지만 많은 라이브러리들이 내부 API (virtual Node같은거. 대중엔 공개되지 않았지만 라이브러리들이 가져다 쓰고있던)에 의존하고 있더라 
    - 라이브러리 입장에선 업그레이드가 어려워졌고, 결국 사용자들에게 걸림돌이 됨 
    - ecosystem dependencies는 마이그레이션의 가장 중요한 부분 중 하나다 
      - 라이브러리가 업그레이드를 하지 않는다면, 사용자도 할 수 없다 
      - 어플리케이션 코드 레벨만 생각하지 말고, 항상 라이브러리들을 염두에 둬라 
    - 라이브러리가 internal API를 쓰지 않도록 discourage하고 금지하라 
      - 왜 그런 상황이 생겼는지 생각하고 public으로 돌려라
  - 3. Not releasing Everything together
    - 2020년에 뷰3 코어가 배포되었을떄는 아직 vuex나 라우터같은 공식 라이브러리가 WIP 중이었다
    - 전체 생태계를 고려하지 않고 무작정 코어를 배포한 것은 혼란을 야기하고 첫 인상을 안좋게 만들었다 
    - 불완전한 채로 내느리 차라리 늦어라 
    - 라이브러리 메인테이너들과 깊게 협업해라 
- 그래도 잘한 것
  - 타입스크립트를 품었다
    - 타입체킹 
    - Vue 자체로 유지보수성이 올라감 
  - Embracing Composition
    - Composition API : 리액트 훅에 영감을 받아 Vue 자체적인 반응성 시스템에 적용했다. 
  - DX에 투자한 것 
    - vite, docs, volar
  - 확실히 더 나아졌고 생태계도 커졌다 
    - 작년에 다운로드 수가 거의 2배로 뜀 
- 다시는 2->3 같은 방식으로 버전을 올리지 않을 것임 
- 심리스하게 적용가능한 개선에 집중할 것 
  - Vapor mode, reactivity system / parser optimization



## A tale of two webs
> Kyle simpson

- 마침내..마지막 세션..
- 지쳐서... 귀에 영어가 박히지 않았다..
- 미안해요.. 



