window.addEventListener("load" , function (){

    //テキストボックスでEnterを押すと、submitされてしまう問題の対処。
    $(document).on("keypress", "input:not(.allow_submit)", function(event) {
        return event.which !== 13;
    });

    //検索ボタンが押される。テキストボックスでEnterを押すと、検索実行
    $("#search_button").on("click", function(){ search() });
    $("#search_text").on("keydown", function(e) { if( e.keyCode === 13 ) { search(); } });
    

    //動的に表示非表示される要素に対しては、$(document).on([トリガー],[要素],[処理])とする。
    $(document).on("click",".stack",function(){ stack( $(this).val() ); });

    //リムーブ処理
    $(document).on("click",".remove",function(){ $("." + $(this).val()).remove(); });

});
//検索の処理
function search(){

    let form_elem   = "#search_form";

    let data    = new FormData( $(form_elem).get(0) );

    //ここでテキストの値、チェックボックスの値を検知して、検索処理を実行する
    let request    = {};
    for (let pair of data.entries() ){
        request[pair[0]]   = pair[1];
    }

    let request_keys    = Object.keys(request);

    //ここでスペースのみの場合は除外
    if (request["search"] === "") {
        return false;
    }

    //スペース区切りで配列にする
    
    //全角は半角に
    let request_search  = console.log(request["search"]);
    request["search"]   = request["search"].replace("　"," ");
    let search_list     = request["search"].split(" ");

    let result          = [];

    //OR検索( AND検索にするには、fields_searchのif文を書き換え、AND検索を行う )
    for (let search of search_list){

        //チェックした内容で検索
        if ( request_keys.includes("name") ){
            result  = result.concat(fields_search("name",search));
        }
        if ( request_keys.includes("effect") ){
            result  = result.concat(fields_search("effect",search));
        }
        if ( request_keys.includes("caution") ){
            result  = result.concat(fields_search("caution",search));
        }
        if ( request_keys.includes("dosage") ){
            result  = result.concat(fields_search("dosage",search));
        }
        if ( request_keys.includes("side_effect") ){
            result  = result.concat(fields_search("side_effect",search));
        }

    }

    //重複を取り除く
    result  = Array.from(new Set(result));
    console.log(result);


    //レンダリング
    let html    = ""
    for (let r of result ){
        html = html + '<li><b>' + r["fields"]["name"] + '</b>|' + r["fields"]["effect"].slice(0,50) + '<button class="btn btn-outline-success stack" value="' + r["pk"] + '">スタック</button></li>';
    }

    $("#search_result").html(html);

}

//モデルフィールドに対する検索処理
//includesを使う(indexOfではヒットしない)
function fields_search(field,search){

    let result  = []

    for (let data of DATA){
        if ( data["fields"][field].includes(search) ){
            result.push(data);
        }
    }

    return result;
}

//医薬品情報をテーブルにスタックする処理
function stack(pk){
    console.log(pk);

    let target;

    for (let data of DATA){
        if ( data["pk"] === pk ){
            target = data;
        }
    }

    let name            = target["fields"]["name"       ].replace(/\n/g,"<br>");
    let effect          = target["fields"]["effect"     ].replace(/\n/g,"<br>");
    let caution         = target["fields"]["caution"    ].replace(/\n/g,"<br>");
    let dosage          = target["fields"]["dosage"     ].replace(/\n/g,"<br>");
    let side_effect     = target["fields"]["side_effect"].replace(/\n/g,"<br>");

    

    $("#table_name"       ).append("<th class='" + pk + "'>" + name         + " <button class='btn btn-danger remove' type='button' value='" + pk + "'>remove</button></th>",);
    $("#table_effect"     ).append("<td class='" + pk + "'>" + effect       + "</td>",);
    $("#table_caution"    ).append("<td class='" + pk + "'>" + caution      + "</td>",);
    $("#table_dosage"     ).append("<td class='" + pk + "'>" + dosage       + "</td>",);
    $("#table_side_effect").append("<td class='" + pk + "'>" + side_effect  + "</td>",);

}

