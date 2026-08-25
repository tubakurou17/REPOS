/* =========================================================
   REPOS（ルポ）
   Supabase 共通処理
   ========================================================= */

/* ---------- Supabase設定 ---------- */

const SUPABASE_URL =
  "今現在入っているSUPABASE_URLをここに入れる";

const SUPABASE_KEY =
  "今現在入っているSUPABASE_KEYをここに入れる";


/* =========================================================
   Supabase 通信用
   ========================================================= */

async function supabaseRequest(url, options = {}) {

  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  return fetch(
    SUPABASE_URL + url,
    {
      ...options,
      headers: headers
    }
  );
}


/* =========================================================
   Supabase 接続確認
   ========================================================= */

async function testSupabaseConnection() {

  try {

    const response = await supabaseRequest(
      "/rest/v1/auditions?select=*"
    );

    if (!response.ok) {
      throw new Error(
        "Supabaseへの接続に失敗しました。"
      );
    }

    const data = await response.json();

    console.log(
      "🌸 Supabase接続成功",
      data
    );

    return data;

  } catch (error) {

    console.error(
      "Supabase接続エラー:",
      error
    );

    return null;
  }
}


/* =========================================================
   新規案件を保存
   ========================================================= */

async function saveAudition() {

  /* ---------- 案件番号 ---------- */

  const caseNumberElement =
    document.getElementById("caseNumber");

  const caseNumber =
    caseNumberElement
      ? caseNumberElement.value.trim()
      : "";


  /* ---------- 案件名 ---------- */

  /*
   * 現在の画面では「案件種類」という名前になっていても、
   * 保存するときは必ず case_name に統一します。
   *
   * そのため、
   * caseName があれば caseName
   * なければ caseType
   * を読みます。
   */

  const caseNameElement =
    document.getElementById("caseName") ||
    document.getElementById("caseType");

  const caseName =
    caseNameElement
      ? caseNameElement.value.trim()
      : "";


  /* ---------- AD日 ---------- */

  const auditionDateElement =
    document.getElementById("auditionDate");

  const auditionDate =
    auditionDateElement
      ? auditionDateElement.value
      : "";


  /* ---------- AD日未定 ---------- */

  const dateUnknownElement =
    document.getElementById("dateUnknown");

  const dateUnknown =
    dateUnknownElement
      ? dateUnknownElement.checked
      : false;


  /* =====================================================
     入力チェック
     ===================================================== */

  if (caseNumber === "") {

    alert(
      "案件番号を入力してください。"
    );

    return;
  }


  if (caseName === "") {

    alert(
      "案件名を入力してください。"
    );

    return;
  }


  if (
    !dateUnknown &&
    auditionDate === ""
  ) {

    alert(
      "オーディション日を入力するか、\n" +
      "「オーディション日未定」にチェックしてください。"
    );

    return;
  }


  /* =====================================================
     新規案件は必ず「書類選考中」
     ===================================================== */

  const status =
    "書類選考中";


  /* =====================================================
     Supabaseへ保存するデータ
     ===================================================== */

  const record = {

    case_number:
      caseNumber,

    case_name:
      caseName,

    audition_date:
      dateUnknown
        ? null
        : auditionDate,

    date_unknown:
      dateUnknown,

    status:
      status
  };


  console.log(
    "保存するデータ:",
    record
  );


  /* =====================================================
     Supabase 保存
     ===================================================== */

  try {

    const response =
      await supabaseRequest(
        "/rest/v1/auditions",
        {
          method: "POST",

          headers: {
            "Prefer": "return=representation"
          },

          body:
            JSON.stringify(record)
        }
      );


    /* ---------- 保存成功 ---------- */

    if (response.ok) {

      alert(
        "Supabaseに保存しました。"
      );

      /*
       * 保存後は登録案件一覧へ
       */
      location.href =
        "list.html";

      return;
    }


    /* ---------- 保存失敗 ---------- */

    const errorText =
      await response.text();

    console.error(
      "Supabase保存エラー:",
      errorText
    );

    alert(
      "保存に失敗しました。\n\n" +
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
   案件一覧を取得
   ========================================================= */

async function getAuditions() {

  try {

    const response =
      await supabaseRequest(
        "/rest/v1/auditions?select=*&order=audition_date.asc"
      );


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        errorText
      );
    }


    const data =
      await response.json();


    console.log(
      "案件一覧:",
      data
    );


    return data;


  } catch (error) {

    console.error(
      "案件一覧取得エラー:",
      error
    );

    return [];
  }
}


/* =========================================================
   状態表示
   ========================================================= */

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


/* =========================================================
   AD日の表示
   ========================================================= */

function getAuditionDateText(
  audition
) {

  if (
    audition.date_unknown
  ) {

    return "未定";
  }


  if (
    !audition.audition_date
  ) {

    return "";
  }


  const date =
    new Date(
      audition.audition_date
    );


  if (
    isNaN(date.getTime())
  ) {

    return audition.audition_date;
  }


  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  return (
    year +
    "/" +
    month +
    "/" +
    day
  );
}


/* =========================================================
   案件一覧を表示
   ========================================================= */

async function renderAuditionList() {

  const auditions =
    await getAuditions();


  const tableBody =
    document.getElementById(
      "auditionList"
    ) ||
    document.getElementById(
      "auditionTableBody"
    );


  if (!tableBody) {

    console.log(
      "案件一覧表示エリアがありません。"
    );

    return;
  }


  tableBody.innerHTML = "";


  /* =====================================================
     案件を1件ずつ表示
     ===================================================== */

  auditions.forEach(
    function(audition) {

      const row =
        document.createElement("tr");


      /* ---------- 案件番号 ---------- */

      const numberCell =
        document.createElement("td");

      numberCell.textContent =
        audition.case_number || "";

      row.appendChild(
        numberCell
      );


      /* ---------- 案件名 ---------- */

      const nameCell =
        document.createElement("td");

      /*
       * ここが今回の重要部分です。
       *
       * case_type ではなく
       * case_name を表示します。
       */

      nameCell.textContent =
        audition.case_name || "";

      row.appendChild(
        nameCell
      );


      /* ---------- AD日 ---------- */

      const dateCell =
        document.createElement("td");

      dateCell.textContent =
        getAuditionDateText(
          audition
        );

      row.appendChild(
        dateCell
      );


      /* ---------- 状態 ---------- */

      const statusCell =
        document.createElement("td");

      statusCell.textContent =
        getStatusText(
          audition.status
        );

      row.appendChild(
        statusCell
      );


      /* ---------- 編集 ---------- */

      const editCell =
        document.createElement("td");

      const editButton =
        document.createElement("button");

      editButton.textContent =
        "📝";

      editButton.title =
        "編集";

      editButton.onclick =
        function() {

          editAudition(
            audition
          );
        };

      editCell.appendChild(
        editButton
      );

      row.appendChild(
        editCell
      );


      /* ---------- 削除 ---------- */

      const deleteCell =
        document.createElement("td");

      const deleteButton =
        document.createElement("button");

      deleteButton.textContent =
        "🗑️";

      deleteButton.title =
        "削除";

      deleteButton.onclick =
        function() {

          deleteAudition(
            audition.id
          );
        };

      deleteCell.appendChild(
        deleteButton
      );

      row.appendChild(
        deleteCell
      );


      tableBody.appendChild(
        row
      );
    }
  );
}


/* =========================================================
   案件を検索
   ========================================================= */

async function searchAudition() {

  const searchElement =
    document.getElementById(
      "searchCaseNumber"
    ) ||
    document.getElementById(
      "searchNumber"
    );


  if (!searchElement) {

    return;
  }


  const number =
    searchElement.value.trim();


  if (number === "") {

    await renderAuditionList();

    return;
  }


  try {

    const response =
      await supabaseRequest(
        "/rest/v1/auditions" +
        "?case_number=eq." +
        encodeURIComponent(number) +
        "&select=*"
      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }


    const data =
      await response.json();


    displaySearchResults(
      data
    );


  } catch (error) {

    console.error(
      "検索エラー:",
      error
    );

    alert(
      "検索中にエラーが発生しました。"
    );
  }
}


/* =========================================================
   検索結果表示
   ========================================================= */

function displaySearchResults(
  auditions
) {

  const tableBody =
    document.getElementById(
      "auditionList"
    ) ||
    document.getElementById(
      "auditionTableBody"
    );


  if (!tableBody) {

    return;
  }


  tableBody.innerHTML = "";


  if (
    auditions.length === 0
  ) {

    const row =
      document.createElement("tr");

    const cell =
      document.createElement("td");

    cell.colSpan = 6;

    cell.textContent =
      "該当する案件がありません。";

    row.appendChild(
      cell
    );

    tableBody.appendChild(
      row
    );

    return;
  }


  auditions.forEach(
    function(audition) {

      const row =
        document.createElement("tr");


      const numberCell =
        document.createElement("td");

      numberCell.textContent =
        audition.case_number || "";

      row.appendChild(
        numberCell
      );


      const nameCell =
        document.createElement("td");

      nameCell.textContent =
        audition.case_name || "";

      row.appendChild(
        nameCell
      );


      const dateCell =
        document.createElement("td");

      dateCell.textContent =
        getAuditionDateText(
          audition
        );

      row.appendChild(
        dateCell
      );


      const statusCell =
        document.createElement("td");

      statusCell.textContent =
        getStatusText(
          audition.status
        );

      row.appendChild(
        statusCell
      );


      const editCell =
        document.createElement("td");

      const editButton =
        document.createElement("button");

      editButton.textContent =
        "📝";

      editButton.onclick =
        function() {

          editAudition(
            audition
          );
        };

      editCell.appendChild(
        editButton
      );

      row.appendChild(
        editCell
      );


      const deleteCell =
        document.createElement("td");

      const deleteButton =
        document.createElement("button");

      deleteButton.textContent =
        "🗑️";

      deleteButton.onclick =
        function() {

          deleteAudition(
            audition.id
          );
        };

      deleteCell.appendChild(
        deleteButton
      );

      row.appendChild(
        deleteCell
      );


      tableBody.appendChild(
        row
      );
    }
  );
}


/* =========================================================
   案件削除
   ========================================================= */

async function deleteAudition(
  id
) {

  if (
    !confirm(
      "この案件を削除しますか？"
    )
  ) {

    return;
  }


  try {

    const response =
      await supabaseRequest(
        "/rest/v1/auditions?id=eq." +
        encodeURIComponent(id),
        {
          method: "DELETE"
        }
      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );
    }


    alert(
      "削除しました。"
    );


    await renderAuditionList();


  } catch (error) {

    console.error(
      "削除エラー:",
      error
    );

    alert(
      "削除に失敗しました。"
    );
  }
}


/* =========================================================
   編集
   ========================================================= */

function editAudition(
  audition
) {

  /*
   * 編集画面がある場合は、
   * 保存用データを一時保存します。
   */

  localStorage.setItem(
    "repos_edit_audition",
    JSON.stringify(audition)
  );


  /*
   * edit.html がある場合
   */

  if (
    location.pathname.includes(
      "list.html"
    )
  ) {

    /*
     * 今は一覧画面で直接編集処理を
     * 入れず、後から編集画面につなげられる
     * ようにしています。
     */

    alert(
      "編集する案件番号：" +
      audition.case_number
    );

    return;
  }
}


/* =========================================================
   ページ読み込み時
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "🌸 REPOS 起動"
    );


    /*
     * 一覧画面なら自動表示
     */

    if (
      document.getElementById(
        "auditionList"
      ) ||
      document.getElementById(
        "auditionTableBody"
      )
    ) {

      renderAuditionList();
    }

  }
);
