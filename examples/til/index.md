
# Google Analytics를 Gatsby에 적용하기 
> 이하 GA라고 축약함

## GA 데이터 축적하기 : 성공 
- 적용하는 것 자체는 어렵지 않다. `gatsby-plugin-google-gtag` 플러그인을 설치하고, [공식문서](https://www.gatsbyjs.com/plugins/gatsby-plugin-google-gtag/)에 설정 파일을 수정해주면 된다.
  - 구글은 gtag라는 JavaScript Tagging Framework를 사용하여 여러 구글 서비스에 이벤트 데이터를 보내주는 역할을 한다. Google Analytics, Google Ads 등이 대표적이다. 
  - GA에서 계정 생성 프로세스를 거치다보면 자연스럽게 프로젝트도 만들게 되고, 결국 Measurement ID: G-XXXXX 형식의 아이디를 얻게 된다. 이 값을 `gatsby-plugin-google-gtag`의 `trackingIds` 옵션 배열 요소로 추가해주기만 하면 된다.
  - 블로그를 배포하고, 한번 접속한 후, GA의 실시간 탭을 새로고침해보면 몇 분 후 카운터 1이 찍히는걸 볼 수 있다.
  - 이제 GA에 데이터들이 축적될 것이다

## GA 데이터 가져오기 : 실패, 하지만 배운 것들
- 이제는 반대로 GA에서 데이터를 쿼리해 가져오고 싶었다. 대표적으로 나는 페이지 방문자수(today, total)등을 가져오고 싶었지만 결론적으로 여러번의 삽질끝에 실패하고 잠시 보류중이다. 그 이유는 내가 만지던 샘플 코드들이 server-side에서만 돌아가기 때문인데 이걸 뒤늦게 깨달아서다. 서버 사이드에 맞춰져 필요한 dependency들이 세팅되어있었을텐데, 이걸 웹어플리케이션에서 돌리려다보니 당연히 환경적인 차이로 일부 모듈을 resolve할 수 없었다. 
- 아래부터는 삽질의 기록이다. 잊어버리는 것보다는 적어두면 나중에 다시 작업을 이어나가기 좋을 것 같아서.
- 구글링을 통해 기존 아티클들을 확인하며 작업함: 실패. 왜냐하면 이번에 GA4가 새로 등장하면서 2023년 1월 이전 글은 다 예전 방식이 되어버렸기 때문이다. 
  - "viewId를 세팅하여 데이터를 가져와봐라"
    - 아무리봐도 내 GA 화면에서는 3번째 row로 떠야할 view가 뜨지 않았고, 당연히 viewId를 세팅해야한다는 글들을 따라서 작업을 진행할 때 이 부분에서 막히게 되었다. 알고보니 이제 view id가 Google Analytics 4부터 Universal Analytics property로 바뀌게 되었다더라. 당연히 나는 2023년 초에 GA 프로젝트를 세팅했기 때문에 여기에 해당하는 케이스였다. 
  - "그럼 Universal Analytics property 쓰면 되겠네?" 
    - 이 속성은 GA > 관리 메뉴에서 새 Property를 만들 때 advanced option에서 선택할 수 있었다. 그런데 해당 옵션을 활성화하려고 보니 이런 노티스가 있었다.
    - > Universal Analytics properties will stop collecting data starting July 1, 2023. It’s recommended that you create a Google Analytics 4 property instead.
    - 하하.. 올해 7월 1일에 데이터 수집이 멈춘다는 방식을 굳이 쓸 필요가 없었다.
  - "Google Analytics 4가 그럼 뭔데요"
    - 이때부터 GA4 문서를 찾아보기 시작했다. 위에서 설명했던 gtag랑 일맥상통하는 듯한 구조로 보였고, 2022년 12월에 [소개](https://developers.google.com/analytics/devguides/collection/ga4?hl=ko)가 올라왔다.
    - GA4부터 The Google Analytics Data API v1 라는 것이 등장한다. The Google Analytics Data API v1은 GA4가 수집하는 데이터들을 프로그래머블한 방식으로 접근할 수 있도록 해준다. (어디선 버전4래고 어디선 버전1이래서 처음에 헷갈렸다) 
    - 자세한건 [GA Data API 공식문서](https://developers.google.com/analytics/devguides/reporting/data/v1?hl=en)를 참고할 것 
  - "좋아 그럼 Data API로 가져오면 되겠네!" 
    - [Quick Guide](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries?hl=en)를 따라 `@google-analytics/data` 패키지를 설치하고 차근차근 코드를 작성했다. 하지만 삽질끝에 잠시 지쳤던건지 샘플코드가 NodeJS 대상이라는걸 간과하고 말았다
    - 서비스계정 생성과정에서 마지막에 보안정보가 담긴 json을 다운로드하게 된다. 이건 환경변수로 숨겨놓거나, 아니면 [API 문서 - BetaAnalyticsDataClient](https://googleapis.dev/nodejs/analytics-data/latest/v1beta.BetaAnalyticsDataClient.html)의 credentials 옵션으로 넘겨줄 수 있다. (사실 이때부터 이건 서버 코드라고 의심했어야한다. 공식문서에서는 해당 json의 로컬 경로를 작성하게 하는데, 클라이언트에서 보안 key가 담긴 json을 그대로 내보내는건 말이 안되니까) 
    - 당연히 웹팩으로 빌드를 돌리니 `Can't resolve ....` 류의 모듈 에러가 나타나기 시작했다. 당연하다. 내 프로젝트는 서버사이드가 아닌 웹 어플리케이션이니까.
    - 나와 비슷한 사람이 있었는지, 프론트엔드에서 어떻게 사용하면 될지에 대한 보강 설명이 필요하다는 [이슈](https://github.com/googleapis/google-cloud-node/issues/2918)가 하나 올라와있었다. 코멘트에 Google-APIs 멤버분이 답변을 달아주셨다. 그 내용은 아래와 같다.
      - > Note 1: for the time being (while GAPIC libraries are server-side only), we can direct people to use googleapis package which can be used in browser. This is worse in terms of usability but an acceptable alternative. 
      - > Note 2: even when we start fully supporting GAPIC libraries in browser using gRPC-Web, some gRPC functionality (client streaming calls) will never be supported (until gRPC-Web implements it).
    - [GAPIC](https://googleapis.github.io/gapic-generators/)는 Generated API Clients의 약자다 
  - 그럼 이제는?
    - 위 답변에 따라, googleapis와 gRPC에 대해 좀 더 알아봐야할 것 같다. 
- 2022년 12월~ 2023년 1월 사이에 GA4로 바뀐걸 모르고 평소에 공부하던 방식으로 찾아보다가 삽질을 좀 했다. 추후에 마무리가 되면 잘 정리해서 블로그 글에 올리고 싶다.