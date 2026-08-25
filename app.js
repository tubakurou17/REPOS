/* =================================
   REPOS × Supabase 接続
================================= */

const SUPABASE_URL =
    "https://wnfuyczwuptkwicpullu.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_tJYjnFCgcvUII28F8sGKLQ_aRcwntH2";
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

   
    const caseType =
        document.getElementById("caseType").value;

    const auditionDate =
        document.getElementById("auditionDate").value;

    const dateUnknown =
        document.getElementById("dateUnknown").checked;

    /* 新規案件は必ず「書類選考中」から開始 */
    const status = "書類選考中";


    /* 案件番号チェック */
    if (caseNumber === "") {

        alert("案件番号を入力してください。");
        return;

    }


    /* 案件種類チェック */
    if (caseType === "") {

        alert("案件種類を選択してください。");
        return;

    }


    /* オーディション日チェック */
    if (!dateUnknown && auditionDate === "") {

        alert(
            "オーディション日を入力するか、" +
            "「オーディション日不明」にチェックしてください。"
        );

        return;

    }


    try {

        const response = await fetch(
            SUPABASE_URL + "/rest/v1/auditions",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        "Bearer " + SUPABASE_KEY,

                    "Prefer":
                        "return=minimal"

                },

                body: JSON.stringify({

                    case_number:
                        caseNumber,

                   
                    case_type:
                        caseType,

                    audition_date:
                        dateUnknown
                            ? null
                            : auditionDate,

                    date_unknown:
                        dateUnknown,

                    status:
                        status

                })

            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Supabase保存エラー:",
                errorText
            );

            alert(
                "保存に失敗しました。\n" +
                errorText
            );

            return;

        }


        alert(
            "案件を登録しました。\n" +
            "🟡 書類選考中からスタートします。"
        );


        location.href =
            "list.html";


    } catch (error) {

        console.error(
            "保存エラー:",
            error
        );

        alert(
            "保存中にエラーが発生しました。"
        );

    }

}
/* =================================
   状態を表示用に変換
   REPOSは3段階
================================= */

function getStatusText(status) {

    if (status === "書類選考中") {
        return "🟡 書類選考中";
    }

    if (status === "書類選考終了") {
        return "🟥 書類選考終了";
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
   状態を直接変更
   🟡 書類選考中
   🟥 書類選考終了
   🟦 AD選考終了
================================= */

async function updateAuditionStatus(id, newStatus) {

    const allowedStatuses = [
        "書類選考中",
        "書類選考終了",
        "AD選考終了"
    ];

    if (!allowedStatuses.includes(newStatus)) {
        alert("選択できない状態です。");
        return;
    }

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/auditions?id=eq." +
            encodeURIComponent(id),
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization":
                        "Bearer " + SUPABASE_KEY,
                    "Prefer": "return=minimal"
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "状態更新エラー:",
                errorText
            );

            alert(
                "状態の更新に失敗しました。"
            );

            return;
        }

        /* 一覧を更新 */
        renderAuditionList();

        /* ホームの表示も更新 */
        renderTodayAuditions();
        renderTomorrowAuditions();
        updateHomeCounts();

    } catch (error) {

        console.error(
            "状態更新エラー:",
            error
        );

        alert(
            "状態の更新に失敗しました。"
        );
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

<select
    class="status-select-list"
    onchange="
        updateAuditionStatus(
            ${audition.id},
            this.value
        )
    "
>

<option
    value="書類選考中"
    ${audition.status === "書類選考中" ? "selected" : ""}
>
🟡 書類選考中
</option>

<option
    value="書類選考終了"
    ${audition.status === "書類選考終了" ? "selected" : ""}
>
🟥 書類選考終了
</option>

<option
    value="AD選考終了"
    ${audition.status === "AD選考終了" ? "selected" : ""}
>
🟦 AD選考終了
</option>

</select>

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
