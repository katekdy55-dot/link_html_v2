(function () {

    const jsonFiles = {
        'stockinfo_': '2000_stockinfo.json',
        'hotstock_': '3000_hotstock.json',
        'dividend_': '5000_dividend.json',
        'ferry_': '7000_ferry.json'
    };

    const baseUrl = 'https://raw.githubusercontent.com/katekdy55-dot/link_html_v2/main/';

    async function loadJsonContents() {

        const boxes = document.querySelectorAll('[data-json]');

        if (!boxes.length) {
            return;
        }

        const groups = {};

        boxes.forEach(function (box) {

            const id = box.getAttribute('data-json');

            if (!id) {
                return;
            }

            for (const prefix in jsonFiles) {

                if (id.startsWith(prefix)) {

                    if (!groups[prefix]) {
                        groups[prefix] = [];
                    }

                    groups[prefix].push(box);

                    break;
                }
            }
        });

        for (const prefix in groups) {

            const file = jsonFiles[prefix];

            try {

                console.log('[JSON Loader] 불러오는 파일:', file);

                const response = await fetch(
                    baseUrl + file + '?v=' + Date.now(),
                    {
                        cache: 'no-store'
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        file + ' 불러오기 실패: ' + response.status
                    );
                }

                const data = await response.json();

                console.log('[JSON Loader] JSON 로드 성공:', file);

                groups[prefix].forEach(function (box) {

                    const id = box.getAttribute('data-json');

                    const item = data[id];

                    if (!item) {

                        console.warn(
                            '[JSON Loader] 해당 ID 없음:',
                            id
                        );

                        box.remove();

                        return;
                    }

                    if (item.active === false) {

                        console.log(
                            '[JSON Loader] 비활성:',
                            id
                        );

                        box.remove();

                        return;
                    }

                    if (!item.html) {

                        console.warn(
                            '[JSON Loader] HTML 없음:',
                            id
                        );

                        box.remove();

                        return;
                    }

                    let html = item.html;

                    // html 안에 {{...}}가 있을 때만 치환 (없으면 기존과 완전히 동일)
                    // 예: data-keyword="KG이니시스" → {{keyword}}, {{keyword_url}}(인코딩)
                    if (html.indexOf('{{') !== -1) {
                        for (const k in box.dataset) {
                            const v = box.dataset[k];
                            html = html.split('{{' + k + '}}').join(v);
                            html = html.split('{{' + k + '_url}}').join(encodeURIComponent(v));
                        }
                    }

                    box.innerHTML = html;

                    console.log(
                        '[JSON Loader] 출력 완료:',
                        id
                    );

                });

            } catch (error) {

                console.error(
                    '[JSON Loader] 오류:',
                    file,
                    error
                );

                groups[prefix].forEach(function (box) {
                    box.remove();
                });

            }
        }
    }

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            loadJsonContents
        );

    } else {

        loadJsonContents();

    }

})();
