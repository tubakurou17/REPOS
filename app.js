/* =================================
   REPOS（ルポ） 共通 app.js
================================= */

const SUPABASE_URL =
    "https://wnfuyczwuptkwicpullu.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_tJYjnFCgcvUII28F8sGKLQ_aRcwntH2";


/* =================================
   Supabase共通ヘッダー
================================= */

function supabaseHeaders(extra = {}) {

    return Object.assign({

        "apikey": SUPABASE_KEY,

        "Authorization":
            "Bearer " + SUPABASE_KEY

    }, extra);

}


/* =================================
   案件種類
================================= */

function getCaseTypeText(type) {

    const value =
        String(type || "")
            .trim()
            .toLowerCase();

if (
    value === "movie" ||
    value === "映画・ドラマ・映像系"
) {
    return "🎬 映画・ドラマ・映像系";
}

if (
    value === "cm" ||
    value === "CM・スチール系" ||
    value === "cm・スチール系"
) {
    return "📸 CM・スチール系";
}

return value || "";    
}


/* =================================
   状態
   新規登録時は書類選考中
================================= */

const STATUS_OPTIONS = [

    [
        "書類選考中",
        "🟡 書類選考中"
    ],

    [
        "書類選考終了",
        "🟥 書類選考終了"
    ],

    [
        "AD選考終了",
        "🟦 AD選考終了"
    ]

];


function getStatusText(status) {

    const found =
        STATUS_OPTIONS.find(function(item) {

            return item[0] === status;

        });


    return found
        ? found[1]
        : (status || "");

}


function getDateText(item) {

    if (
        item.date_unknown ||
        !item.audition_date
    ) {

        return "未定";

    }


    return item.audition_date
        .replace(/-/g, "/");

}


/* =================================
   新規案件保存
================================= */

async function saveAudition() {

    const numberEl =
        document.getElementById("caseNumber");

    const typeEl =
        document.getElementById("caseType");

    const dateEl =
        document.getElementById("auditionDate");

    const unknownEl =
        document.getElementById("dateUnknown");


    if (
        !numberEl ||
        !typeEl ||
        !dateEl ||
        !unknownEl
    ) {

        return;

    }


    const caseNumber =
        numberEl.value.trim();

    const caseType =
        typeEl.value;

    const auditionDate =
        dateEl.value;

    const dateUnknown =
        unknownEl.checked;


    if (!/^\d{4}$/.test(caseNumber)) {

        alert(
            "案件番号は4桁で入力してください。\n例：0006"
        );

        return;

    }


    if (!caseType) {

        alert(
            "案件種類を選択してください。"
        );

        return;

    }


    if (
        !dateUnknown &&
        !auditionDate
    ) {

        alert(
            "オーディション日を入力するか、「オーディション日未定」にチェックしてください。"
        );

        return;

    }


    try {

        const response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/auditions",

                {

                    method: "POST",

                    headers:
                        supabaseHeaders({

                            "Content-Type":
                                "application/json",

                            "Prefer":
                                "return=minimal"

                        }),

                    body:
                        JSON.stringify({

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
                                "書類選考中"

                        })

                }

            );


        if (!response.ok) {

            throw new Error(
                await response.text()
            );

        }


        alert("保存しました。");


        location.href =
            "list.html";


    } catch (error) {

        console.error(
            "保存エラー:",
            error
        );


        alert(
            "保存に失敗しました。\n\n" +
            error.message
        );

    }

}


/* =================================
   状態選択
================================= */

function createStatusSelect(item) {

    const select =
        document.createElement("select");


    select.className =
        "status-select-list";


    STATUS_OPTIONS.forEach(
        function(pair) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                pair[0];


            option.textContent =
                pair[1];


            if (
                item.status === pair[0]
            ) {

                option.selected =
                    true;

            }


            select.appendChild(
                option
            );

        }
    );


    select.addEventListener(
        "change",
        function() {

            updateAuditionStatus(
                item.id,
                select.value
            );

        }
    );


    return select;

}


/* =================================
   一覧1行
================================= */

function createAuditionRow(item) {

    const row =
        document.createElement("tr");


    /* 選択＋案件番号 */

    const selectCell =
        document.createElement("td");


    const label =
        document.createElement("label");


    label.style.cssText =
        "display:inline-flex;" +
        "align-items:center;" +
        "justify-content:center;" +
        "gap:5px;" +
        "cursor:pointer;" +
        "white-space:nowrap;";


    const checkbox =
        document.createElement("input");


    checkbox.type =
        "checkbox";


    checkbox.className =
        "case-select-checkbox";


    checkbox.value =
        item.id;


    checkbox.setAttribute(
        "aria-label",
        "案件 " +
        (item.case_number || "") +
        "を選択"
    );


    const number =
        document.createElement("span");


    number.textContent =
        item.case_number || "";


    label.appendChild(
        checkbox
    );


    label.appendChild(
        number
    );


    selectCell.appendChild(
        label
    );


    row.appendChild(
        selectCell
    );


    /* 案件種類 */

    const typeCell =
        document.createElement("td");


    typeCell.className =
        "type-cell";


    typeCell.textContent =
        getCaseTypeText(
            item.case_type
        );


    row.appendChild(
        typeCell
    );


    /* AD日 */

    const dateCell =
        document.createElement("td");


    dateCell.textContent =
        getDateText(item);


    row.appendChild(
        dateCell
    );


    /* 状態 */

    const statusCell =
        document.createElement("td");


    statusCell.appendChild(
        createStatusSelect(item)
    );


    row.appendChild(
        statusCell
    );


    /* 編集 */

    const editCell =
        document.createElement("td");


    const editButton =
        document.createElement("button");


    editButton.type =
        "button";


    editButton.textContent =
        "✏️";


    editButton.title =
        "編集";


    editButton.style.cssText =
        "border:0;" +
        "background:transparent;" +
        "font-size:24px;" +
        "cursor:pointer;" +
        "padding:4px;";


    editButton.addEventListener(
        "click",
        function() {

            editAudition(
                item.id
            );

        }
    );


    editCell.appendChild(
        editButton
    );


    row.appendChild(
        editCell
    );


    return row;

}


/* =================================
   案件取得
================================= */

async function getAuditions(
    query = ""
) {

    let url =
        SUPABASE_URL +
        "/rest/v1/auditions" +
        "?select=*" +
        "&order=case_number.asc";


    if (query) {

        url =
            SUPABASE_URL +
            "/rest/v1/auditions" +
            "?case_number=eq." +
            encodeURIComponent(query) +
            "&select=*" +
            "&order=case_number.asc";

    }


    const response =
        await fetch(

            url,

            {

                method: "GET",

                headers:
                    supabaseHeaders()

            }

        );


    if (!response.ok) {

        throw new Error(
            await response.text()
        );

    }


    return await response.json();

}


/* =================================
   登録案件一覧
================================= */

async function renderAuditionList(
    query = ""
) {

    const list =
        document.getElementById(
            "auditionList"
        );


    if (!list) return;


    list.innerHTML = "";


    try {

        const auditions =
            await getAuditions(query);


        if (
            !Array.isArray(
                auditions
            ) ||
            auditions.length === 0
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            const cell =
                document.createElement(
                    "td"
                );


            cell.colSpan =
                5;


            cell.textContent =
                query
                    ? "案件番号「" +
                      query +
                      "」は見つかりませんでした。"

                    : "登録されている案件はありません。";


            row.appendChild(
                cell
            );


            list.appendChild(
                row
            );


            updateSelectAllState();


            return;

        }


        auditions.forEach(
            function(item) {

                list.appendChild(
                    createAuditionRow(
                        item
                    )
                );

            }
        );


        updateSelectAllState();


    } catch (error) {

        console.error(
            "案件一覧取得エラー:",
            error
        );


        const row =
            document.createElement(
                "tr"
            );


        const cell =
            document.createElement(
                "td"
            );


        cell.colSpan =
            5;


        cell.textContent =
            "案件一覧を取得できませんでした。";


        row.appendChild(
            cell
        );


        list.appendChild(
            row
        );

    }

}


/* =================================
   検索
================================= */

function searchAuditions() {

    const input =
        document.getElementById(
            "caseNumberSearch"
        );


    if (!input) return;


    renderAuditionList(
        input.value.trim()
    );

}


/* =================================
   全選択
================================= */

function updateSelectAllState() {

    const master =
        document.getElementById(
            "selectAllCheckbox"
        );


    if (!master) return;


    const boxes =
        Array.from(
            document.querySelectorAll(
                ".case-select-checkbox"
            )
        );


    const checked =
        boxes.filter(
            function(box) {

                return box.checked;

            }
        );


    master.checked =
        boxes.length > 0 &&
        checked.length === boxes.length;


    master.indeterminate =
        checked.length > 0 &&
        checked.length < boxes.length;

}


/* =================================
   一括削除
================================= */

async function deleteSelectedAuditions() {

    const boxes =
        Array.from(
            document.querySelectorAll(
                ".case-select-checkbox:checked"
            )
        );


    if (boxes.length === 0) {

        alert(
            "削除する案件を選択してください。"
        );

        return;

    }


    if (
        !confirm(
            boxes.length +
            "件の案件を削除しますか？"
        )
    ) {

        return;

    }


    try {

        for (
            const box of boxes
        ) {

            const response =
                await fetch(

                    SUPABASE_URL +
                    "/rest/v1/auditions?id=eq." +
                    encodeURIComponent(
                        box.value
                    ),

                    {

                        method:
                            "DELETE",

                        headers:
                            supabaseHeaders()

                    }

                );


            if (!response.ok) {

                throw new Error(
                    await response.text()
                );

            }

        }


        alert(
            boxes.length +
            "件の案件を削除しました。"
        );


        renderAuditionList();


    } catch (error) {

        console.error(
            "一括削除エラー:",
            error
        );


        alert(
            "一括削除に失敗しました。\n\n" +
            error.message
        );

    }

}


/* =================================
   編集
================================= */

function editAudition(id) {

    if (!id) {

        alert(
            "編集する案件が見つかりません。"
        );

        return;

    }


    localStorage.setItem(
        "editingAuditionId",
        id
    );


    location.href =
        "edit.html";

}


/* =================================
   状態変更
================================= */

async function updateAuditionStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/auditions?id=eq." +
                encodeURIComponent(id),

                {

                    method:
                        "PATCH",

                    headers:
                        supabaseHeaders({

                            "Content-Type":
                                "application/json",

                            "Prefer":
                                "return=minimal"

                        }),

                    body:
                        JSON.stringify({

                            status:
                                status

                        })

                }

            );


        if (!response.ok) {

            throw new Error(
                await response.text()
            );

        }


        await renderAuditionList();


        updateHomeCounts();


    } catch (error) {

        console.error(
            "状態更新エラー:",
            error
        );


        alert(
            "状態の更新に失敗しました。\nもう一度お試しください。"
        );

    }

}


/* =================================
   日付関連
================================= */

async function fetchAllAuditions() {

    const response =
        await fetch(

            SUPABASE_URL +
            "/rest/v1/auditions" +
            "?select=*" +
            "&order=audition_date.asc",

            {

                method:
                    "GET",

                headers:
                    supabaseHeaders()

            }

        );


    if (!response.ok) {

        throw new Error(
            await response.text()
        );

    }


    return await response.json();

}


function getAuditionsForDate(
    auditions,
    offset
) {

    const target =
        new Date();


    target.setHours(
        0,
        0,
        0,
        0
    );


    target.setDate(
        target.getDate() +
        offset
    );


    return auditions.filter(
        function(item) {

            if (
                item.date_unknown ||
                !item.audition_date
            ) {

                return false;

            }


            const date =
                new Date(
                    item.audition_date +
                    "T00:00:00"
                );


            date.setHours(
                0,
                0,
                0,
                0
            );


            return (
                date.getTime() ===
                target.getTime()
            );

        }
    );

}


/* =================================
   今日・明日・3日前の表示
================================= */

function renderDateAuditionItems(
    list,
    auditions,
    emptyText
) {

    list.innerHTML = "";


    if (
        auditions.length === 0
    ) {

        const item =
            document.createElement(
                "div"
            );


        item.textContent =
            emptyText;


        list.appendChild(
            item
        );


        return;

    }


    auditions.forEach(
        function(item) {

            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "tomorrow-item";


            const number =
                document.createElement(
                    "div"
                );


            number.textContent =
                "案件番号：" +
                (item.case_number || "");


            const type =
                document.createElement(
                    "div"
                );


            type.textContent =
                getCaseTypeText(
                    item.case_type
                );


            const date =
                document.createElement(
                    "div"
                );


            date.textContent =
                "AD日：" +
                getDateText(item);


            const status =
                document.createElement(
                    "div"
                );


            status.textContent =
                getStatusText(
                    item.status
                );


            box.appendChild(
                number
            );


            box.appendChild(
                type
            );


            box.appendChild(
                date
            );


            box.appendChild(
                status
            );


            list.appendChild(
                box
            );

        }
    );

}


/* =================================
   今日
================================= */

async function renderTodayAuditions() {

    const list =
        document.getElementById(
            "todayList"
        );


    if (!list) return;


    try {

        const auditions =
            await fetchAllAuditions();


        renderDateAuditionItems(

            list,

            getAuditionsForDate(
                auditions,
                0
            ),

            "本日のオーディションはありません"

        );


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =================================
   明日
================================= */

async function renderTomorrowAuditions() {

    const list =
        document.getElementById(
            "tomorrowList"
        );


    if (!list) return;


    try {

        const auditions =
            await fetchAllAuditions();


        renderDateAuditionItems(

            list,

            getAuditionsForDate(
                auditions,
                1
            ),

            "明日のオーディションはありません"

        );


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =================================
   3日前
================================= */

async function renderCheckList() {

    const list =
        document.getElementById(
            "checkList"
        );


    if (!list) return;


    try {

        const auditions =
            await fetchAllAuditions();


        renderDateAuditionItems(

            list,

            getAuditionsForDate(
                auditions,
                3
            ),

            "入力確認が必要な案件はありません"

        );


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =================================
   3日前のお知らせ件数
================================= */

async function checkThreeDaysBefore() {

    const countEl =
        document.getElementById(
            "inputCheckCount"
        );


    const noticeEl =
        document.getElementById(
            "inputCheckNotice"
        );


    if (
        !countEl &&
        !noticeEl
    ) {

        return;

    }


    try {

        const auditions =
            await fetchAllAuditions();


        const count =
            getAuditionsForDate(
                auditions,
                3
            ).length;


        if (countEl) {

            countEl.textContent =
                count;

        }


        if (noticeEl) {

            noticeEl.style.display =
                count > 0
                    ? "block"
                    : "none";

        }


    } catch (error) {

        console.error(
            error
        );


        if (noticeEl) {

            noticeEl.style.display =
                "none";

        }

    }

}


/* =================================
   ホーム件数
================================= */

async function updateHomeCounts() {

    const todayEl =
        document.getElementById(
            "todayCount"
        );


    const tomorrowEl =
        document.getElementById(
            "tomorrowCount"
        );


    if (
        !todayEl &&
        !tomorrowEl
    ) {

        return;

    }


    try {

        const auditions =
            await fetchAllAuditions();


        if (todayEl) {

            todayEl.textContent =
                getAuditionsForDate(
                    auditions,
                    0
                ).length;

        }


        if (tomorrowEl) {

            tomorrowEl.textContent =
                getAuditionsForDate(
                    auditions,
                    1
                ).length;

        }


    } catch (error) {

        console.error(
            "ホーム件数取得エラー:",
            error
        );

    }

}


/* =================================
   ページ開始
================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /* 一覧 */

        if (
            document.getElementById(
                "auditionList"
            )
        ) {

            renderAuditionList();

        }


        /* 検索 */

        const searchButton =
            document.getElementById(
                "searchButton"
            );


        const searchInput =
            document.getElementById(
                "caseNumberSearch"
            );


        const resetButton =
            document.getElementById(
                "searchResetButton"
            );


        if (searchButton) {

            searchButton.addEventListener(
                "click",
                searchAuditions
            );

        }


        if (searchInput) {

            searchInput.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        searchAuditions();

                    }

                }
            );

        }


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                function() {

                    if (searchInput) {

                        searchInput.value =
                            "";

                    }


                    renderAuditionList();

                }
            );

        }


        /* 全選択 */

        const selectAll =
            document.getElementById(
                "selectAllCheckbox"
            );


        if (selectAll) {

            selectAll.addEventListener(
                "change",
                function() {

                    document
                        .querySelectorAll(
                            ".case-select-checkbox"
                        )
                        .forEach(
                            function(box) {

                                box.checked =
                                    selectAll.checked;

                            }
                        );


                    updateSelectAllState();

                }
            );


            document.addEventListener(
                "change",
                function(event) {

                    if (
                        event.target.classList
                            .contains(
                                "case-select-checkbox"
                            )
                    ) {

                        updateSelectAllState();

                    }

                }
            );

        }


        /* 一括削除 */

        const bulkDeleteButton =
            document.getElementById(
                "bulkDeleteButton"
            );


        if (bulkDeleteButton) {

            bulkDeleteButton.addEventListener(
                "click",
                deleteSelectedAuditions
            );

        }


        /* ホーム関連 */

        checkThreeDaysBefore();

        renderTodayAuditions();

        renderTomorrowAuditions();

        renderCheckList();

        updateHomeCounts();

    }

);
