/* =================================
   REPOS × Supabase 接続
================================= */

const SUPABASE_URL =
    "https://wnfuyczwuptkwicpullu.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_tJYjnFCgcvUII28F8sGKLQ_aRcwntH2_"
/* =================================
   REPOS × Supabase 接続確認
================================= */

async function testSupabaseConnection() {

    try {

        const response = await fetch(
            SUPABASE_URL + "/rest/v1/auditions?select=*",
            {
                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization":
                        "Bearer " + SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                "Supabaseへの接続に失敗しました。"
            );

        }

        const data =
            await response.json();

        console.log(
            "🌸 Supabase接続成功",
            data
        );

    } catch (error) {

        console.error(
            "Supabase接続エラー:",
            error
        );

    }

}
/* =================================
   REPOS
   新しいオーディションを保存
================================= */

async function saveAudition() {

    const caseNumber =
        document.getElementById("caseNumber").value.trim();

    const auditionDate =
        document.getElementById("auditionDate").value;

    const caseName =
        document.getElementById("caseName").value.trim();

    const dateUnknown =
        document.getElementById("dateUnknown").checked;

    const status =
        document.getElementById("status").value;


    if (caseNumber === "") {
        alert("案件番号を入力してください。");
        return;
    }


    if (!dateUnknown && auditionDate === "") {
        alert(
            "オーディション日を入力するか、「オーディション日不明」にチェックしてください。"
        );
        return;
    }


    const response = await fetch( 
        "https://wnfuyczwuptkwicpullu.supabase.co/rest/v1/auditions",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY,
                "Prefer": "return=minimal"
            },

            body: JSON.stringify({
                case_number: caseNumber,
                case_name: caseName,
                audition_date:
                    dateUnknown ? null : auditionDate,
                date_unknown: dateUnknown,
                status: status
            })
        }
    );


    if (response.ok) {
        alert("Supabaseに保存しました。");
        location.href = "list.html";
        return;
    }


    alert(
        "Supabaseへの保存に失敗しました。\n" +
        "エラー内容を確認してください。"
    );
}

/* =================================
   状態を表示用に変換
================================= */

function getStatusText(status) {

    if (status === "書類選考中") {
        return "🟡 書類選考中";
    }

    if (status === "書類選考終了") {
        return "🟥 書類選考終了";
    }

    if (status === "AD結果待ち") {
        return "🟢 AD結果待ち";
    }

    if (status === "AD選考終了") {
        return "🟦 AD選考終了";
    }

    return status || "";
}


/* =================================
   日付表示
================================= */

function getDateText(audition) {

    if (
        !audition.dateUnknown &&
        audition.auditionDate
    ) {

        return audition.auditionDate.replace(/-/g, "/");
    }

    return "不明";
}


/* =================================
   登録案件一覧
================================= */

function renderAuditionList() {

    const list =
        document.getElementById("auditionList");


    if (!list) {
        return;
    }


    const auditions =
        JSON.parse(
            localStorage.getItem("auditions") || "[]"
        );


    list.innerHTML = "";


    if (auditions.length === 0) {

        list.innerHTML = `
            <tr>
                <td colspan="6">
                    登録されている案件はありません
                </td>
            </tr>
        `;

        return;
    }

    auditions.forEach(function(audition, index) {

        const dateText =
            getDateText(audition);

        const statusText =
            getStatusText(audition.status);


        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>${audition.caseNumber}</td>

            <td>${audition.caseName || ""}</td>

            <td>${dateText}</td>

            <td>${statusText}</td>

            <td>
                <button
                    onclick="editAudition(${index})"
                >
                    📝
                </button>
            </td>

            <td>
                <button
                    onclick="deleteAudition(${index})"
                >
                    🗑️
                </button>
            </td>
        `;


        list.appendChild(row);

    });
}


/* =================================
   案件削除
================================= */

function deleteAudition(index) {

    if (
        !confirm(
            "この案件を削除しますか？"
        )
    ) {
        return;
    }


    const auditions =
        JSON.parse(
            localStorage.getItem("auditions") || "[]"
        );


    auditions.splice(index, 1);


    localStorage.setItem(
        "auditions",
        JSON.stringify(auditions)
    );


    renderAuditionList();
}


/* =================================
   編集
================================= */

function editAudition(index) {

    const auditions =
        JSON.parse(
            localStorage.getItem("auditions") || "[]"
        );


    const audition =
        auditions[index];


    if (!audition) {

        alert(
            "編集する案件が見つかりません。"
        );

        return;
    }


    localStorage.setItem(
        "editingAuditionIndex",
        index
    );


    location.href = "edit.html";
}


/* =================================
   3日前の入力確認
================================= */

function checkThreeDaysBefore() {

    const auditions =
        JSON.parse(
            localStorage.getItem("auditions") || "[]"
        );


    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const targetDate =
        new Date(today);

    targetDate.setDate(
        today.getDate() + 3
    );


    let count = 0;


    auditions.forEach(function(audition) {

        if (audition.dateUnknown) {
            return;
        }


        if (!audition.auditionDate) {
            return;
        }


        const auditionDate =
            new Date(
                audition.auditionDate
            );


        auditionDate.setHours(
            0, 0, 0, 0
        );


        if (
            auditionDate.getTime() ===
            targetDate.getTime()
        ) {

            count++;
        }

    });


    const notice =
        document.getElementById(
            "inputCheckCount"
        );


    if (notice) {

        notice.textContent =
            count;
    }


    const noticeArea =
        document.getElementById(
            "inputCheckNotice"
        );


    if (noticeArea) {

        if (count > 0) {

            noticeArea.style.display =
                "block";

        } else {

            noticeArea.style.display =
                "none";
        }
    }
}


/* =================================
   明日のオーディション
================================= */

function renderTomorrowAuditions() {

    const list =
        document.getElementById(
            "tomorrowList"
        );


    if (!list) {
        return;
    }


    const auditions =
        JSON.parse(
            localStorage.getItem("auditions") || "[]"
        );


    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const tomorrow =
        new Date(today);

    tomorrow.setDate(
        today.getDate() + 1
    );


    const tomorrowAuditions =
        auditions.filter(function(audition) {

            if (audition.dateUnknown) {
                return false;
            }


            if (!audition.auditionDate) {
                return false;
            }


            const auditionDate =
                new Date(
                    audition.auditionDate
                );


            auditionDate.setHours(
                0, 0, 0, 0
            );


            return (
                auditionDate.getTime() ===
                tomorrow.getTime()
            );

        });


    list.innerHTML = "";


    if (
        tomorrowAuditions.length === 0
    ) {

        list.innerHTML = `
            <div class="no-audition">
                明日のオーディションはありません
            </div>
        `;

        return;
    }


    tomorrowAuditions.forEach(
        function(audition) {

            const item =
                document.createElement("div");


            item.className =
                "tomorrow-item";


            item.innerHTML = `

                <div class="tomorrow-number">
                    案件番号：${audition.caseNumber}
                </div>

                <div class="tomorrow-name">
                    ${audition.caseName || "案件名未入力"}
                </div>

                <div class="tomorrow-status">
                    AD日：
                    ${audition.auditionDate.replace(/-/g, "/")}
                </div>

                <div class="tomorrow-status">
                    ${getStatusText(audition.status)}
                </div>

            `;


            list.appendChild(item);

        }
    );
}


/* =================================
   3日前の案件一覧
================================= */

function renderCheckList() {

    const list =
        document.getElementById(
            "checkList"
        );


    if (!list) {
        return;
    }


    const auditions =
        JSON.parse(
            localStorage.getItem("auditions") || "[]"
        );


    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const targetDate =
        new Date(today);

    targetDate.setDate(
        today.getDate() + 3
    );


    const checkAuditions =
        auditions.filter(function(audition) {

            if (audition.dateUnknown) {
                return false;
            }


            if (!audition.auditionDate) {
                return false;
            }


            const auditionDate =
                new Date(
                    audition.auditionDate
                );


            auditionDate.setHours(
                0, 0, 0, 0
            );


            return (
                auditionDate.getTime() ===
                targetDate.getTime()
            );

        });


    list.innerHTML = "";


    if (
        checkAuditions.length === 0
    ) {

        list.innerHTML = `
            <div class="no-audition">
                入力確認が必要な案件はありません
            </div>
        `;

        return;
    }


    checkAuditions.forEach(
        function(audition) {

            const item =
                document.createElement("div");


            item.className =
                "tomorrow-item";


            item.innerHTML = `

                <div class="tomorrow-number">
                    案件番号：${audition.caseNumber}
                </div>

                <div class="tomorrow-name">
                    ${audition.caseName || "案件名未入力"}
                </div>

                <div class="tomorrow-status">
                    AD日：
                    ${audition.auditionDate.replace(/-/g, "/")}
                </div>

                <div class="tomorrow-status">
                    ${getStatusText(audition.status)}
                </div>

            `;


            list.appendChild(item);

        }
    );
}


/* =================================
   本日のオーディション
================================= */

function renderTodayAuditions() {

    const list =
        document.getElementById(
            "todayList"
        );


    if (!list) {
        return;
    }


    const auditions =
        JSON.parse(
            localStorage.getItem("auditions") || "[]"
        );


    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const todayAuditions =
        auditions.filter(function(audition) {

            if (audition.dateUnknown) {
                return false;
            }


            if (!audition.auditionDate) {
                return false;
            }


            const auditionDate =
                new Date(
                    audition.auditionDate
                );


            auditionDate.setHours(
                0, 0, 0, 0
            );


            return (
                auditionDate.getTime() ===
                today.getTime()
            );

        });


    list.innerHTML = "";


    if (
        todayAuditions.length === 0
    ) {

        list.innerHTML = `
            <div class="no-audition">
                本日のオーディションはありません
            </div>
        `;

        return;
    }


    todayAuditions.forEach(
        function(audition) {

            const item =
                document.createElement("div");


            item.className =
                "tomorrow-item";


            item.innerHTML = `

                <div class="tomorrow-number">
                    案件番号：${audition.caseNumber}
                </div>

                <div class="tomorrow-name">
                    ${audition.caseName || "案件名未入力"}
                </div>

                <div class="tomorrow-status">
                    AD日：
                    ${audition.auditionDate.replace(/-/g, "/")}
                </div>

                <div class="tomorrow-status">
                    ${getStatusText(audition.status)}
                </div>

            `;


            list.appendChild(item);

        }
    );
}


/* =================================
   案件番号検索
================================= */

function searchAuditions() {

    const searchInput =
        document.getElementById(
            "caseNumberSearch"
        );


    const list =
        document.getElementById(
            "auditionList"
        );


    if (!searchInput || !list) {
        return;
    }


    const keyword =
        searchInput.value.trim();


    const auditions =
        JSON.parse(
            localStorage.getItem("auditions") || "[]"
        );


    /* 空欄なら全件表示 */

    if (keyword === "") {

        renderAuditionList();

        return;
    }


    const results =
        auditions.filter(
            function(audition) {

                return String(
                    audition.caseNumber
                ) === keyword;

            }
        );


    list.innerHTML = "";


    if (results.length === 0) {

        list.innerHTML = `
            <tr>
                <td colspan="6">
                    案件番号「${keyword}」は
                    見つかりませんでした。
                </td>
            </tr>
        `;

        return;
    }


    results.forEach(
        function(audition) {

            const originalIndex =
                auditions.indexOf(audition);


            const dateText =
                getDateText(audition);


            const statusText =
                getStatusText(
                    audition.status
                );


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${audition.caseNumber}
                </td>

                <td>
                    ${audition.caseName || ""}
                </td>

                <td>
                    ${dateText}
                </td>

                <td>
                    ${statusText}
                </td>

                <td>
                    <button
                        onclick="editAudition(${originalIndex})"
                    >
                        📝
                    </button>
                </td>

                <td>
                    <button
                        onclick="deleteAudition(${originalIndex})"
                    >
                        🗑️
                    </button>
                </td>

            `;


            list.appendChild(row);

        }
    );
}


/* =================================
   ホームの件数
================================= */

function updateHomeCounts() {

    const auditions =
        JSON.parse(
            localStorage.getItem("auditions") || "[]"
        );


    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const tomorrow =
        new Date(today);

    tomorrow.setDate(
        today.getDate() + 1
    );


    let todayCount = 0;
    let tomorrowCount = 0;


    auditions.forEach(
        function(audition) {

            if (
                audition.dateUnknown ||
                !audition.auditionDate
            ) {
                return;
            }


            const auditionDate =
                new Date(
                    audition.auditionDate
                );


            auditionDate.setHours(
                0, 0, 0, 0
            );


            if (
                auditionDate.getTime() ===
                today.getTime()
            ) {

                todayCount++;
            }


            if (
                auditionDate.getTime() ===
                tomorrow.getTime()
            ) {

                tomorrowCount++;
            }

        }
    );


    const todayElement =
        document.getElementById(
            "todayCount"
        );


    if (todayElement) {
        todayElement.textContent =
            todayCount;
    }


    const tomorrowElement =
        document.getElementById(
            "tomorrowCount"
        );


    if (tomorrowElement) {
        tomorrowElement.textContent =
            tomorrowCount;
    }
}


/* =================================
   ページを開いたとき
================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderAuditionList();

        checkThreeDaysBefore();

        renderTomorrowAuditions();

        renderCheckList();

        renderTodayAuditions();

        updateHomeCounts();


        /* 案件番号検索 */

        const searchButton =
            document.getElementById(
                "searchButton"
            );


        const searchInput =
            document.getElementById(
                "caseNumberSearch"
            );


        const searchResetButton =
            document.getElementById(
                "searchResetButton"
            );


        if (searchButton && searchInput) {

            searchButton.addEventListener(
                "click",
                function() {

                    searchAuditions();

                }
            );


            searchInput.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key === "Enter"
                    ) {

                        searchAuditions();

                    }

                }
            );

        }


        /* 全件表示 */

        if (searchResetButton) {

            searchResetButton.addEventListener(
                "click",
                function() {

                    if (searchInput) {
                        searchInput.value = "";
                    }

                    renderAuditionList();

                }
            );

        }

    }
);
testSupabaseConnection();
