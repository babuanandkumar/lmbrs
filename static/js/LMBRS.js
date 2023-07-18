fetching = false;

function doLogin() {
    if ($('#txt_user').val().trim() == "" || $('#txt_pwd').val().trim() == "") {
        showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> User / Password", "User Name and Password cannot be blank.")
        return false;
    }
    document.login_form.submit();
}

function showModal(title, message) {
    $("#modalTitle").html(title);
    $("#modalBody").html(message);
    $('#appModal').modal();
}

function showPane(paneId, message) {
    $("#" + paneId).html(message);
    $("#" + paneId).show();
}

function hidePane(paneId) {
    $("#" + paneId).hide();
}

function get_new_publications() {
    fetch_data("/getbooks", {"key": "NEW_PUB", "start": $("#startRow").val()}, books_fetched, books_fetch_failed);
}

function truncateStr(data, length) {
    if (data.length > length)
        return data.substring(0, length) + "..."
    return data
}

function books_fetched(books) {
    books_html = new Array()
    for (i = 0; i < books.length; i++) {
        book = books[i];
        books_html.push("<tr>");
        books_html.push("   <td style = 'text-align:left; padding-bottom:5px;border-bottom:5px double lightgray;cursor:hand;'>");
        books_html.push("       <table width = '100%' cellspacing = '0' cellpadding = '0'>");
        books_html.push("          <tr>");
        books_html.push("              <td rowspan = '4' align = 'left' width = '125'>");
        books_html.push("                <img src = '" + book["coverImg"] + "' width = '100' height = '100' />");
        books_html.push("              </td>");
        books_html.push("              <td style = 'text-align:left;left-padding:10px;' class = 'bookTitleList'>");
        books_html.push(                  truncateStr(book["title"], 100) + "&nbsp;(" + book["lang"] + ")");
        books_html.push("              </td>");
        books_html.push("              <td align = 'right'>");
        books_html.push("                  <button type='button' class='btn btn-info btn-xs'>View</button>&nbsp;");
        books_html.push("                  <button type='button' class='btn btn-primary btn-xs'>Borrow</button>");
        books_html.push("               </td>");
        books_html.push("           </tr>");
        books_html.push("           <tr>");
        books_html.push("              <td colspan = '2' style = 'text-align:left;left-padding:10px;' class = 'descriptionList'>");
        books_html.push(                     truncateStr(book["description"], 250));
        books_html.push("               </td>");
        books_html.push("           </tr>");
        books_html.push("           <tr>");
        books_html.push("               <td colspan = '2'>");
        books_html.push("                  <table width = '100%'>");
        books_html.push("                      <tr>");
        books_html.push("                          <td width = '50%' style = 'text-align:left;padding-left:0px;' class = 'textList'>");
        books_html.push("                               <i class='fa fa-solid fa-pen-nib'></i>&nbsp;");
        books_html.push(                                truncateStr(book["author"], 150));
        books_html.push("                           </td>");
        books_html.push("                          <td width = '20%' style = 'text-align:center;padding-left:0px;' class = 'textList'>");
        books_html.push("                                &nbsp;" + getRatingStarsHTML(book["rating"]) + "&nbsp;(" + book["rating"] + ")");
        books_html.push("                           </td>");
        books_html.push("                           <td width = '30%' style = 'text-align:right;padding-right:10px;' class = 'textList'>");
        books_html.push("                               <i class='fa fa-solid fa-print'></i>&nbsp;");
        books_html.push(                                truncateStr(book["pub_name"], 150));
        books_html.push("                           </td>");
        books_html.push("                      </tr>");
        books_html.push("         </table>");
        books_html.push("       </td>");
        books_html.push("     </tr>");
        books_html.push("   </table>");
        books_html.push("  </td>");
        books_html.push("</tr>");
        books_html.push("<tr>");
        books_html.push("   <td>&nbsp;</td>");
        books_html.push("</tr>");
    }
    $("#booksPane").html($("#booksPane").html() + books_html.join(""));
    $("#startRow").val(parseInt($("#startRow").val()) + 20);
    fetching = false;
}

function getRatingStarsHTML(rating) {
    stars_html = new Array();
    for (j = 0; j < 5; j++) {
        if (rating >= 1) stars_html.push("<i class='fa-solid fa-star' style = 'font-size:10pt;color:orange;'></i>");
        else if (rating > 0) stars_html.push("<i class='fa-solid fa-star-half-stroke' style = 'font-size:10pt;color:orange;'></i>");
        else stars_html.push("<i class='fa fa-star' style = 'font-size:10pt;color:lightgray;'></i>");
        rating = rating - 1;
    }
    return stars_html.join("");
}

function books_fetch_failed() {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Failed to fetch books list")
}

function fetch_data(url, input, success_callback, error_callback) {
    if (!fetching) {
        fetching = true;
        $.ajax({
            url: url,
            type: "POST",
            dataType: "json",
            data: input,
            success: success_callback,
            error: error_callback
        });
    }
}

function booksListScrolled(div) {
    if(div.scrollTop + div.clientHeight >= div.scrollHeight - 20) {
        get_new_publications();
    }
}


/*
<table width = "100%">
                        {% for book in new_publications %}
                            <tr>
                                <td style = "text-align:left; padding-bottom:5px;border-bottom:5px double lightgray;">
                                    <table width = "100%" cellspacing = "0" cellpadding = "0">
                                        <tr>
                                            <td rowspan = "4" align = "left" width = "125">
                                                <img src = "{{ book['coverImg'] }}" width = "100" height = "100" />
                                            </td>
                                            <td style = "text-align:left;padding-left:10px;" class = "bookTitleList">
                                                {% if book["title"] | length > 100 %}
                                                    {{ book["title"][0:100] + "..." }}
                                                {% else %}
                                                    {{ book["title"] }}
                                                {% endif %}

                                                {% if book["lang"] | length > 0 %}
                                                    &nbsp;({{ book["lang"] }})
                                                {% endif %}
                                                &nbsp;

                                                {% set rating = book["rating"]|float %}
                                                {% set check = 5 %}
                                                {% for i in range(0, 5) %}
                                                    {% if rating > 1 %}
                                                        {% print("Rating " + check|string) %}
                                                        <i class="fa-solid fa-star" style = "font-size:10pt;color:darkred;"></i>
                                                    {% elif rating > 0 %}
                                                        <i class="fa-solid fa-star-half-stroke" style = "font-size:10pt;color:darkred;"></i>
                                                    {% else %}
                                                        <i class="fa fa-star" style = "font-size:10pt;color:lightgray;"></i>
                                                    {% endif %}
                                                    {% set rating = rating-1 %}
                                                    {% set check = check-1 %}
                                                {% endfor %}
                                                &nbsp; ({{ book["rating"] }})
                                            </td>
                                            <td align = "right">
                                                <button type="button" class="btn btn-info btn-xs" onclick = "get_new_publications()">View</button>
                                                &nbsp;
                                                <button type="button" class="btn btn-primary btn-xs">Borrow</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan = "2" style = "text-align:left;padding-left:10px;" class = "descriptionList">
                                                {% if book["description"] | length > 250 %}
                                                    {{ book["description"][0:250] + "..." }}
                                                {% else %}
                                                    {{ book["description"] }}
                                                {% endif %}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan = "2">
                                                <table width = "100%">
                                                    <tr>
                                                        <td width = "100%" style = "text-align:left;padding-left:10px;" class = "textList">
                                                            <br/><i class="fa fa-solid fa-pen-nib"></i>
                                                            &nbsp;
                                                            {% if ", ".join(book["author"]) | length > 150 %}
                                                                {{ ", ".join(book["author"])[0:150] + "..." }}
                                                            {% else %}
                                                                {{ ", ".join(book["author"]) }}
                                                            {% endif %}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td>&nbsp;</td>
                            </tr>
                        {% endfor %}
                    </table>
*/


