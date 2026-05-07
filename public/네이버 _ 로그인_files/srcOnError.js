/**
 * 사용법
 * 1. 스크립트를 페이지의 상단에 추가합니다.
 *   장점: 모든 리소스 로딩 에러를 캐치할 수 있습니다.
 *   단점: 다른 리소스 로드가 지연될 수 있습니다.
 * 2. 스크립트를 페이지의 하단에 추가합니다.
 *   장점: 다른 리소스 로드가 지연되지 않습니다.
 *   단점: 일부 리소스 로딩 에러를 캐치하지 못할 수 있습니다.
 * 3. 우려사항이 있는 태그들에 대해 각각 직접 onError 이벤트를 추가합니다.
 *   장점: 우려사항이 있는 태그에 대해서만 에러를 캐치할 수 있습니다.
 *   단점: 반복적인 코드 작성이 필요합니다.
 * 4. 아래 js를 html에 직접 삽입
 *   장점: 1,2번의 단점은 거의 없습니다.
 *   단점: 반복적인 코드 작성이 필요합니다.
 * */

function srcOnError() {
    // js파일 호출(로드) 실패, js파일이나 <script>에서의 js 실행실패(undefined '변수 혹은 함수' 사용 등의 이유 포함) / console창에서 발생한 실행 오류는 캐치하지 못함
    // CSP 에러는 캐치하지 못함
    window.addEventListener("error", errorCallbackEvent, true);
    // Promise에서 reject에 대한 처리가 없는 경우
    window.addEventListener("unhandledrejection", errorCallbackEvent, true);
    window.addEventListener("messageerror", errorCallbackEvent, true);
}
window.nid = window.nid || {};
window.nid.errorList = window.nid.errorList || [];
function errorCallbackEvent(e) {
    var target = e.target;
    var tag = target.tagName;
    var src = target.src;
    var message = e.message;
    var filename = e.filename;
    var error = e.error ? e.error.toString() : undefined;
    var type = e.type;
    var eventName = e.toString();
    var reason = e.reason; // promise용

    var body = {
        eventName: eventName,
        type: type,
        tag: tag,
        src: src,
        message: message,
        filename: filename,
        error: error,
        reason: reason,
        pageUrl: location.href,
        lineNo: e.lineno,
        colNo: e.colno,
        userAgent: navigator.userAgent,
    };

    // 서버로 보낼 요청 삽입
    if (allowPercentFilter(3)) {
        var bodyStr = JSON.stringify(body);
        if (isInErrorList(bodyStr)) {
            // 이미 전송된 에러는 중복으로 전송하지 않음
            return;
        }
        window.nid.errorList.push(bodyStr);
        jsLogPost("srcOnError", body);
    }
}
function isInErrorList(str) {
    var errorList = window.nid.errorList;
    var isExist = false;
    for (var i = 0; i < errorList.length; i++) {
        if (errorList[i] === str) {
            isExist = true;
            break;
        }
    }
    return isExist;
}
function allowPercentFilter(percent) {
    return Math.random() * 100 < percent;
}

function jsLogPost(page, data) {
    var url = "https://nid.naver.com/login/api/jsLog?page=" + page;
    var body = JSON.stringify(data);
    if (typeof fetch === "function") {
        fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                Accept: "application/json",
                "Content-type": "application/json",
            },
            body: body,
        });
    } else {
        try {
            var xhr = new XMLHttpRequest();

            xhr.open("POST", url);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === 4) {
                    xhr = null;
                }
            };

            xhr.send(body);
        } catch (ignored) {
            // IE 지원
            if (window.XDomainRequest) {
                var xdr = new XDomainRequest();

                xdr.open("POST", url);
                xdr.onload = function () {
                    xdr = null;
                };
                xdr.onerror = function () {
                    xdr = null;
                };
                window.setTimeout(function () {
                    xdr.send(body);
                }, 0);
            }
        }
    }
}

srcOnError();
