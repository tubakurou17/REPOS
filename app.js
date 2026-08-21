/* =================================
   REPOS × Supabase 接続
================================= */

const SUPABASE_URL =
    "https://wnfuyczwuptkwicpullu.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZnV5Y3p3dXB0a3dpY3B1bGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Mzk0MzUsImV4cCI6MjEwMjQxNTQzNX0.dYyBPtW40RPLrH96K39DjmzUJGMHZedKSu-26sc-6fA";
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
            "apikey": SUPABASE_KEY
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

async function renderAuditionList() {

    const list = document.getElementById("auditionList");

    if (!list) {
        return;
    }

    try {

        const response = await fetch(
            SUPABASE_URL + "/rest/v1/auditions?select=*",
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error("案件一覧の取得に失敗しました。");
        }

        const auditions = await response.json();

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

        auditions.forEach(function(audition) {

            let dateText = "不明";

            if (
                !audition.date_unknown &&
                audition.audition_date
            ) {
                dateText =
                    audition.audition_date.replace(/-/g, "/");
            }

            let statusText =
                audition.status || "";

            if (audition.status === "書類選考中") {
                statusText = "🟡 書類選考中";
            }

            if (audition.status === "書類選考終了") {
                statusText = "🟥 書類選考終了";
            }

            if (audition.status === "AD結果待ち") {
                statusText = "🟢 AD結果待ち";
            }

            if (audition.status === "AD選考終了") {
                statusText = "🟦 AD選考終了";
            }

            const row = document.createElement("tr");

            row.innerHTML = `
    <td>${audition.case_number || ""}</td>
    <td>${audition.case_name || ""}</td>
    <td>${dateText}</td>
   <td>${statusText}</td>

<td>
    <button
        onclick="editAudition(${audition.id})"
    >
        📝
    </button>
</td>

<td>
    <button
        onclick="deleteAudition(${audition.id})"
    >
        🗑️
    </button>
</td>
`;

            list.appendChild(row);

        });

    } catch (error) {

        console.error(
            "案件一覧取得エラー:",
            error
        );

        list.innerHTML = `
            <tr>
                <td colspan="6">
                    案件一覧の取得に失敗しました
                </td>
            </tr>
        `;
    }
}

   
   


    
     

/* =================================
   案件削除
================================= */

async function deleteAudition(id) {

    if (!confirm("この案件を削除しますか？")) {
        return;
    }

    try {

        const response = await fetch(
            SUPABASE_URL + "/rest/v1/auditions?id=eq." + id,
            {
                method: "DELETE",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error("案件の削除に失敗しました");
        }

        alert("案件を削除しました。");

        renderAuditionList();

    } catch (error) {

        console.error(
            "案件削除エラー:",
            error
        );

        alert(
            "案件の削除に失敗しました。"
        );
    }
}

/* =================================
   案件編集
   Supabaseから案件を取得
================================= */

async function editAudition(id) {

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/auditions?id=eq." +
            encodeURIComponent(id) +
            "&select=*",
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "編集する案件の取得に失敗しました。"
            );
        }

        const auditions =
            await response.json();

        if (auditions.length === 0) {

            alert(
                "編集する案件が見つかりません。"
            );

            return;
        }

        /*
         * 編集する案件のIDを保存
         */

        localStorage.setItem(
            "editingAuditionId",
            id
        );

        location.href = "edit.html";

    } catch (error) {

        console.error(
            "編集案件取得エラー:",
            error
        );

        alert(
            "編集する案件の取得に失敗しました。"
        );
    }
}



/* =================================
   3日前の入力確認
   Supabaseから取得
================================= */

async function checkThreeDaysBefore() {

    const notice =
        document.getElementById("inputCheckCount");

    const noticeArea =
        document.getElementById("inputCheckNotice");

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/auditions?select=*",
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "3日前の案件取得に失敗しました。"
            );
        }

        const auditions =
            await response.json();

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const targetDate =
            new Date(today);

        targetDate.setDate(
            today.getDate() + 3
        );

        let count = 0;

        auditions.forEach(function(audition) {

            /*
             * オーディション日不明は対象外
             */

            if (audition.date_unknown) {
                return;
            }

            if (!audition.audition_date) {
                return;
            }

            const auditionDate =
                new Date(
                    audition.audition_date
                );

            auditionDate.setHours(
                0, 0, 0, 0
            );

            /*
             * オーディション3日前なら
             * 入力確認の対象
             */

            if (
                auditionDate.getTime() ===
                targetDate.getTime()
            ) {
                count++;
            }

        });

        /*
         * 件数を表示
         */

        if (notice) {
            notice.textContent = count;
        }

        /*
         * 0件なら非表示
         * 1件以上なら表示
         */

        if (noticeArea) {

            if (count > 0) {

                noticeArea.style.display =
                    "block";

            } else {

                noticeArea.style.display =
                    "none";
            }
        }

        console.log(
            "🌸 3日前の入力確認：",
            count,
            "件"
        );

    } catch (error) {

        console.error(
            "3日前の入力確認エラー:",
            error
        );

        /*
         * エラー時は
         * 通知を誤表示しない
         */

        if (noticeArea) {
            noticeArea.style.display =
                "none";
        }

    }
}

/* =================================
   明日のオーディション
   Supabaseから取得
================================= */

async function renderTomorrowAuditions() {

    const list =
        document.getElementById("tomorrowList");

    if (!list) {
        return;
    }

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/auditions?select=*&order=audition_date.asc",
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "明日のオーディション取得に失敗しました。"
            );
        }

        const auditions =
            await response.json();

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const tomorrow =
            new Date(today);

        tomorrow.setDate(
            today.getDate() + 1
        );

        const tomorrowAuditions =
            auditions.filter(function(audition) {

                if (
                    audition.date_unknown ||
                    !audition.audition_date
                ) {
                    return false;
                }

                const auditionDate =
                    new Date(
                        audition.audition_date
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
                        案件番号：
                        ${audition.case_number || ""}
                    </div>

                    <div class="tomorrow-name">
                        ${audition.case_name || "案件名未入力"}
                    </div>

                    <div class="tomorrow-status">
                        AD日：
                        ${audition.audition_date.replace(/-/g, "/")}
                    </div>

                    <div class="tomorrow-status">
                        ${getStatusText(audition.status)}
                    </div>

                `;

                list.appendChild(item);

            }
        );

    } catch (error) {

        console.error(
            "明日のオーディション取得エラー:",
            error
        );

        list.innerHTML = `
            <div class="no-audition">
                明日のオーディションを取得できませんでした
            </div>
        `;
    }
}
/* =================================
   3日前の案件一覧
   Supabaseから取得
================================= */

async function renderCheckList() {

    const list =
        document.getElementById("checkList");

    if (!list) {
        return;
    }

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/auditions?select=*&order=audition_date.asc",
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "3日前の案件取得に失敗しました。"
            );
        }

        const auditions =
            await response.json();

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const targetDate =
            new Date(today);

        targetDate.setDate(
            today.getDate() + 3
        );

        const checkAuditions =
            auditions.filter(function(audition) {

                if (
                    audition.date_unknown ||
                    !audition.audition_date
                ) {
                    return false;
                }

                const auditionDate =
                    new Date(
                        audition.audition_date
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
                        案件番号：
                        ${audition.case_number || ""}
                    </div>

                    <div class="tomorrow-name">
                        ${audition.case_name || "案件名未入力"}
                    </div>

                    <div class="tomorrow-status">
                        AD日：
                        ${audition.audition_date.replace(/-/g, "/")}
                    </div>

                    <div class="tomorrow-status">
                        ${getStatusText(audition.status)}
                    </div>

                `;

                list.appendChild(item);

            }
        );

    } catch (error) {

        console.error(
            "3日前の案件取得エラー:",
            error
        );

        list.innerHTML = `
            <div class="no-audition">
                入力確認案件の取得に失敗しました
            </div>
        `;
    }
}

/* =================================
   本日のオーディション
   Supabaseから取得
================================= */

async function renderTodayAuditions() {

    const list =
        document.getElementById("todayList");

    if (!list) {
        return;
    }

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/auditions?select=*&order=audition_date.asc",
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "本日のオーディション取得に失敗しました。"
            );
        }

        const auditions =
            await response.json();

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const todayAuditions =
            auditions.filter(function(audition) {

                if (
                    audition.date_unknown ||
                    !audition.audition_date
                ) {
                    return false;
                }

                const auditionDate =
                    new Date(
                        audition.audition_date
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
                        案件番号：
                        ${audition.case_number || ""}
                    </div>

                    <div class="tomorrow-name">
                        ${audition.case_name || "案件名未入力"}
                    </div>

                    <div class="tomorrow-status">
                        AD日：
                        ${audition.audition_date.replace(/-/g, "/")}
                    </div>

                    <div class="tomorrow-status">
                        ${getStatusText(audition.status)}
                    </div>

                `;

                list.appendChild(item);

            }
        );

    } catch (error) {

        console.error(
            "本日のオーディション取得エラー:",
            error
        );

        list.innerHTML = `
            <div class="no-audition">
                本日のオーディションを取得できませんでした
            </div>
        `;
    }
}
/* =================================
   案件番号検索
   Supabaseから取得
================================= */

async function searchAuditions() {

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

    /* 空欄なら全件表示 */

    if (keyword === "") {

        renderAuditionList();

        return;
    }

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/auditions?case_number=eq." +
            encodeURIComponent(keyword) +
            "&select=*",
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "案件検索に失敗しました。"
            );
        }

        const results =
            await response.json();

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

                let dateText = "不明";

                if (
                    !audition.date_unknown &&
                    audition.audition_date
                ) {
                    dateText =
                        audition.audition_date
                            .replace(/-/g, "/");
                }

                const statusText =
                    getStatusText(
                        audition.status
                    );

                const row =
                    document.createElement("tr");

                row.innerHTML = `

                    <td>
                        ${audition.case_number || ""}
                    </td>

                    <td>
                        ${audition.case_name || ""}
                    </td>

                    <td>
                        ${dateText}
                    </td>

                    <td>
                        ${statusText}
                    </td>

                    <td>
                        <button
                            onclick="editAudition(${audition.id})"
                        >
                            📝
                        </button>
                    </td>

                    <td>
                        <button
                            onclick="deleteAudition(${audition.id})"
                        >
                            🗑️
                        </button>
                    </td>

                `;

                list.appendChild(row);

            }
        );

    } catch (error) {

        console.error(
            "案件検索エラー:",
            error
        );

        list.innerHTML = `
            <tr>
                <td colspan="6">
                    案件検索に失敗しました。
                </td>
            </tr>
        `;
    }
}
/* =================================
   ホームの件数
   Supabaseから取得
================================= */

async function updateHomeCounts() {

    const todayElement =
        document.getElementById("todayCount");

    const tomorrowElement =
        document.getElementById("tomorrowCount");

    /* ホーム画面に件数表示がない場合は終了 */

    if (!todayElement && !tomorrowElement) {
        return;
    }

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/auditions?select=*",
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "オーディション件数の取得に失敗しました。"
            );
        }

        const auditions =
            await response.json();

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const tomorrow =
            new Date(today);

        tomorrow.setDate(
            today.getDate() + 1
        );

        let todayCount = 0;
        let tomorrowCount = 0;

        auditions.forEach(function(audition) {

            if (
                audition.date_unknown ||
                !audition.audition_date
            ) {
                return;
            }

            const auditionDate =
                new Date(
                    audition.audition_date
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

        });

        if (todayElement) {
            todayElement.textContent =
                todayCount;
        }

        if (tomorrowElement) {
            tomorrowElement.textContent =
                tomorrowCount;
        }

        console.log(
            "🌸 今日:",
            todayCount,
            "件 / 明日:",
            tomorrowCount,
            "件"
        );

    } catch (error) {

        console.error(
            "ホーム件数取得エラー:",
            error
        );

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
