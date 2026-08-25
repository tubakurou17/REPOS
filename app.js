/* =========================================================
   REPOS
   Supabase 接続
   ========================================================= */

const SUPABASE_URL =
    "https://wnfuyczwuptkwicpullu.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZnV5Y3p3dXB0a3dpY3B1bGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Mzk0MzUsImV4cCI6MjEwMjQxNTQzNX0.dYyBPtW40RPLrH96K39DjmzUJGMHZedKSu-26sc-6fA";


/* =========================================================
   Supabase 共通設定
   ========================================================= */

const SUPABASE_HEADERS = {

    "apikey": SUPABASE_KEY,

    "Authorization":
        "Bearer " + SUPABASE_KEY,

    "Content-Type":
        "application/json"

};


/* =========================================================
   ページ読み込み
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        console.log("REPOS 起動");

        /* 一覧ページなら読み込み */
        if (
            document.getElementById("auditionList")
        ){

            loadAuditions();

        }

        /* 検索ボタン */
        const searchButton =
            document.getElementById(
                "searchButton"
            );

        if(searchButton){

            searchButton.addEventListener(
                "click",
                searchAuditions
            );

        }

        /* 全件表示 */
        const resetButton =
            document.getElementById(
                "searchResetButton"
            );

        if(resetButton){

            resetButton.addEventListener(
                "click",
                loadAuditions
            );

        }

    }
);


/* =========================================================
   新規案件保存
   ========================================================= */

async function saveAudition() {

    const caseNumberElement =
        document.getElementById("caseNumber");

    const caseTypeElement =
        document.getElementById("caseType");

    const auditionDateElement =
        document.getElementById("auditionDate");

    const dateUnknownElement =
        document.getElementById("dateUnknown");


    if (
        !caseNumberElement ||
        !caseTypeElement ||
        !auditionDateElement ||
        !dateUnknownElement
    ) {

        alert(
            "入力画面の項目を確認できませんでした。\n" +
            "ページを再読み込みしてください。"
        );

        return;
    }


    const caseNumber =
        caseNumberElement.value.trim();

    const caseType =
        caseTypeElement.value;

    const auditionDate =
        auditionDateElement.value;

    const dateUnknown =
        dateUnknownElement.checked;


    /* 案件番号 */

    if (!/^\d{4}$/.test(caseNumber)) {

        alert(
            "案件番号は4桁の数字で入力してください。\n" +
            "例：0006、0007"
        );

        return;
    }


    /* 案件種類 */

    if (caseType === "") {

        alert(
            "案件種類を選択してください。"
        );

        return;
    }


    /* オーディション日 */

    if (!dateUnknown && auditionDate === "") {

        alert(
            "オーディション日を入力するか、\n" +
            "「オーディション日未定」にチェックしてください。"
        );

        return;
    }


    /* 新規案件の状態 */

    const status = "書類選考中";


    try {

        const response = await fetch(
            SUPABASE_URL + "/rest/v1/auditions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization":
                        "Bearer " + SUPABASE_KEY,
                    "Prefer": "return=minimal"
                },

                body: JSON.stringify({

                    case_number:
                        caseNumber,

                    /* 現在のSupabaseでは
                       case_name列を使用 */
                    case_name:
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


        if (response.ok) {

            alert(
                "保存しました。"
            );

            location.href = "list.html";

            return;
        }


        const errorText =
            await response.text();


        console.error(
            "Supabase保存エラー:",
            response.status,
            errorText
        );


        alert(
            "保存できませんでした。\n\n" +
            "Supabaseエラー：" +
            response.status +
            "\n\n" +
            errorText
        );


    } catch (error) {

        console.error(
            "保存エラー:",
            error
        );


        alert(
            "保存中にエラーが発生しました。\n" +
            "インターネット接続を確認してください。"
        );
    }
}
/* =========================================================
   案件一覧取得
   ========================================================= */

async function loadAuditions(){

    const list =
        document.getElementById(
            "auditionList"
        );

    if(!list){

        return;

    }


    list.innerHTML =

        "<tr>" +
        "<td colspan='6'>読み込み中…</td>" +
        "</tr>";


    try{

        const url =
            SUPABASE_URL +
            "/rest/v1/auditions" +
            "?select=*" +
            "&order=audition_date.asc";


        const response =
            await fetch(
                url,
                {
                    method:"GET",
                    headers:SUPABASE_HEADERS
                }
            );


        if(!response.ok){

            const errorText =
                await response.text();

            console.error(
                "一覧取得エラー:",
                errorText
            );

            list.innerHTML =

                "<tr>" +
                "<td colspan='6'>" +
                "一覧を取得できませんでした。" +
                "</td>" +
                "</tr>";

            return;

        }


        const data =
            await response.json();


        displayAuditions(data);

    }
    catch(error){

        console.error(
            "一覧取得エラー:",
            error
        );

        list.innerHTML =

            "<tr>" +
            "<td colspan='6'>" +
            "通信エラーが発生しました。" +
            "</td>" +
            "</tr>";

    }

}


/* =========================================================
   案件一覧表示
   ========================================================= */

function displayAuditions(data){

    const list =
        document.getElementById(
            "auditionList"
        );


    if(!list){

        return;

    }


    list.innerHTML = "";


    if(!data || data.length === 0){

        list.innerHTML =

            "<tr>" +
            "<td colspan='6'>" +
            "登録されている案件はありません。" +
            "</td>" +
            "</tr>";

        return;

    }


    data.forEach(function(item){

        const row =
            document.createElement(
                "tr"
            );


        /* 案件番号 */

        const numberCell =
            document.createElement(
                "td"
            );

        numberCell.textContent =
            item.case_number || "";


        /* 案件名 */

        const nameCell =
            document.createElement(
                "td"
            );

        nameCell.textContent =
            item.case_name || "";


        /* AD日 */

        const dateCell =
            document.createElement(
                "td"
            );


        if(item.date_unknown){

            dateCell.textContent =
                "未定";

        }
        else if(item.audition_date){

            dateCell.textContent =
                formatDate(
                    item.audition_date
                );

        }
        else{

            dateCell.textContent =
                "";

        }


        /* 状態 */

        const statusCell =
            document.createElement(
                "td"
            );


        const select =
            document.createElement(
                "select"
            );


        select.className =
            "status-select-list";


        const statuses = [

            "書類選考中",

            "書類選考終了",

            "AD結果待ち",

            "AD選考終了"

        ];


        statuses.forEach(function(status){

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                status;

            option.textContent =
                getStatusText(status);

            if(
                item.status === status
            ){

                option.selected = true;

            }

            select.appendChild(
                option
            );

        });


        select.addEventListener(
            "change",
            function(){

                updateStatus(
                    item.id,
                    select.value
                );

            }
        );


        statusCell.appendChild(
            select
        );


        /* 編集 */

        const editCell =
            document.createElement(
                "td"
            );


        const editButton =
            document.createElement(
                "button"
            );

        editButton.textContent =
            "✏️ 編集";

        editButton.type =
            "button";

        editButton.addEventListener(
            "click",
            function(){

                editAudition(item);

            }
        );


        editCell.appendChild(
            editButton
        );


        /* 削除 */

        const deleteCell =
            document.createElement(
                "td"
            );


        const deleteButton =
            document.createElement(
                "button"
            );

        deleteButton.textContent =
            "🗑️ 削除";

        deleteButton.type =
            "button";


        deleteButton.addEventListener(
            "click",
            function(){

                deleteAudition(
                    item.id,
                    item.case_number
                );

            }
        );


        deleteCell.appendChild(
            deleteButton
        );


        row.appendChild(
            numberCell
        );

        row.appendChild(
            nameCell
        );

        row.appendChild(
            dateCell
        );

        row.appendChild(
            statusCell
        );

        row.appendChild(
            editCell
        );

        row.appendChild(
            deleteCell
        );


        list.appendChild(
            row
        );

    });

}


/* =========================================================
   日付表示
   ========================================================= */

function formatDate(dateString){

    if(!dateString){

        return "";

    }


    const parts =
        dateString.split("-");


    if(parts.length !== 3){

        return dateString;

    }


    return (
        parts[0] +
        "/" +
        parts[1] +
        "/" +
        parts[2]
    );

}


/* =========================================================
   状態表示
   ========================================================= */

function getStatusText(status){

    if(status === "書類選考中"){

        return "🟡 書類選考中";

    }


    if(status === "書類選考終了"){

        return "🟥 書類選考終了";

    }


    if(status === "AD結果待ち"){

        return "🟢 AD結果待ち";

    }


    if(status === "AD選考終了"){

        return "🟦 AD選考終了";

    }


    return status || "";

}


/* =========================================================
   状態変更
   ========================================================= */

async function updateStatus(
    id,
    newStatus
){

    try{

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/auditions" +
                "?id=eq." +
                encodeURIComponent(id),
                {
                    method:"PATCH",

                    headers:{
                        ...SUPABASE_HEADERS,

                        "Prefer":
                            "return=minimal"
                    },

                    body:
                        JSON.stringify({
                            status:
                                newStatus
                        })
                }
            );


        if(!response.ok){

            const errorText =
                await response.text();

            console.error(
                "状態変更エラー:",
                errorText
            );

            alert(
                "状態の変更に失敗しました。"
            );

            return;

        }


        console.log(
            "状態を変更しました"
        );

    }
    catch(error){

        console.error(
            error
        );

        alert(
            "状態変更中にエラーが発生しました。"
        );

    }

}


/* =========================================================
   案件編集
   ========================================================= */

async function editAudition(item){

    const newName =
        prompt(
            "案件名を入力してください。",
            item.case_name || ""
        );


    if(newName === null){

        return;

    }


    if(newName.trim() === ""){

        alert(
            "案件名を入力してください。"
        );

        return;

    }


    const newDate =
        prompt(
            "オーディション日を入力してください。\n例：2026-08-29\n未定の場合は空欄",
            item.audition_date || ""
        );


    if(newDate === null){

        return;

    }


    const dateUnknown =
        newDate.trim() === "";


    try{

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/auditions" +
                "?id=eq." +
                encodeURIComponent(item.id),
                {
                    method:"PATCH",

                    headers:{
                        ...SUPABASE_HEADERS,

                        "Prefer":
                            "return=minimal"
                    },

                    body:
                        JSON.stringify({

                            case_name:
                                newName.trim(),

                            audition_date:
                                dateUnknown
                                    ? null
                                    : newDate.trim(),

                            date_unknown:
                                dateUnknown

                        })
                }
            );


        if(!response.ok){

            const errorText =
                await response.text();

            console.error(
                "編集エラー:",
                errorText
            );

            alert(
                "編集に失敗しました。\n\n" +
                errorText
            );

            return;

        }


        alert(
            "変更しました。"
        );


        loadAuditions();

    }
    catch(error){

        console.error(
            error
        );

        alert(
            "編集中にエラーが発生しました。"
        );

    }

}


/* =========================================================
   案件削除
   ========================================================= */

async function deleteAudition(
    id,
    caseNumber
){

    const answer =
        confirm(
            "案件番号 " +
            caseNumber +
            " を削除しますか？"
        );


    if(!answer){

        return;

    }


    try{

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/auditions" +
                "?id=eq." +
                encodeURIComponent(id),
                {
                    method:"DELETE",

                    headers:
                        SUPABASE_HEADERS
                }
            );


        if(!response.ok){

            const errorText =
                await response.text();

            console.error(
                "削除エラー:",
                errorText
            );

            alert(
                "削除に失敗しました。\n\n" +
                errorText
            );

            return;

        }


        alert(
            "削除しました。"
        );


        loadAuditions();

    }
    catch(error){

        console.error(
            error
        );

        alert(
            "削除中にエラーが発生しました。"
        );

    }

}


/* =========================================================
   案件番号検索
   ========================================================= */

async function searchAuditions(){

    const searchInput =
        document.getElementById(
            "caseNumberSearch"
        );


    if(!searchInput){

        return;

    }


    const keyword =
        searchInput.value.trim();


    if(keyword === ""){

        loadAuditions();

        return;

    }


    const list =
        document.getElementById(
            "auditionList"
        );


    if(list){

        list.innerHTML =

            "<tr>" +
            "<td colspan='6'>検索中…</td>" +
            "</tr>";

    }


    try{

        const url =
            SUPABASE_URL +
            "/rest/v1/auditions" +
            "?case_number=eq." +
            encodeURIComponent(keyword) +
            "&select=*" +
            "&order=audition_date.asc";


        const response =
            await fetch(
                url,
                {
                    method:"GET",
                    headers:SUPABASE_HEADERS
                }
            );


        if(!response.ok){

            const errorText =
                await response.text();

            console.error(
                errorText
            );

            alert(
                "検索に失敗しました。"
            );

            return;

        }


        const data =
            await response.json();


        displayAuditions(data);

    }
    catch(error){

        console.error(
            error
        );

        alert(
            "検索中にエラーが発生しました。"
        );

    }

}


/* =========================================================
   メンバー用データ取得
   ---------------------------------------------------------
   メンバー画面側に auditionList がある場合、
   同じ一覧データを表示できます。
   ========================================================= */

async function loadMemberAuditions(){

    try{

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/auditions" +
                "?select=case_number,case_name,audition_date,date_unknown,status" +
                "&order=audition_date.asc",
                {
                    method:"GET",
                    headers:SUPABASE_HEADERS
                }
            );


        if(!response.ok){

            console.error(
                await response.text()
            );

            return;

        }


        const data =
            await response.json();


        return data;

    }
    catch(error){

        console.error(
            "メンバー案件取得エラー:",
            error
        );

        return [];

    }

}
