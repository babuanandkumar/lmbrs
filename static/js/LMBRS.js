fetching = false;
booksLoaded = [];
booksCount = 0;
bookLoadAlertShown = false;
lastPane = 1;
scrollToElementId = "";
doScrollTo = false;
isRecommended = false;

function doLogin() {
    if ($('#txt_user').val().trim() == "" || $('#txt_pwd').val().trim() == "") {
        showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> User / Password", "User Name and Password cannot be blank.")
        return false;
    }
    document.login_form.submit();
}

function doLogout() {
    document.logout_form.submit();
}

function showBooks() {
    document.books_form.submit();
}

function showBooksRecommended() {
    document.books_recommended_form.submit();
}

function showMemberBorrowals() {
    document.member_borrowals_form.submit();
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

function checkEnter() {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13') newSearch(1);
}

function cancelBorrow(bookCopyId, bookId) {
    if (confirm("Please confirm cancelling the borrowal of the book - '" + booksLoaded["" + bookId]["title"] + "'")) {
        fetchData("/cancelborrow", {"book_copy_id": bookCopyId}, cancelBorrowSuccess, cancelBorrowFailed);
    }
}

function returnBook(bookCopyId, bookId) {
    if (confirm("Please confirm return of the book - '" + booksLoaded["" + bookId]["title"] + "'")) {
        fetchData("/returnbook", {"book_copy_id": bookCopyId}, returnBookSuccess, returnBookFailed);
    }
}

function cancelBorrowSuccess(data) {
    if (data["success"] == true) {
        getMemberBooks();
    } else {
        showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Error while attempting to cancel borrow.")
    }
}

function cancelBorrowFailed(data) {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Error while attempting to cancel borrow.")
}

function returnBookSuccess(data) {
    if (data["success"] == true) {
        getMemberBooks();
    } else {
        showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Error while attempting to return book.")
    }
}

function returnBookFailed(data) {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Error while attempting to return book.")
}

function searchBooks(limit) {
    togglePanes(1);
    search = $("#hidSearch").val();
    langId = "" + $("#hidLang").val();
    order = $("#hidOrder").val();
    start = $("#startRow").val();
    fetchData("/getbooks", {"start": start, "lang_id": langId, "order": order, "search": search, "limit": limit, "recommended": isRecommended},
                        booksFetched, booksFetchFailed);
}

function getMemberBooks() {
    fetchData("/getmemberbooks", {}, memberBooksFetched, memberBooksFetchFailed);
}

function refreshSearch(id) {
    scrollToElementId = id;
    doScrollTo = true;
    newSearch(2, booksCount);
}

function togglePanes(func) {
    hidePane("errorPane");
    hidePane("successPane");
    if (func == 1) { //Show Books list
        $("#viewBookPane").fadeOut('slow');
        $("#borrowBookPane").fadeOut('slow');
        $("#searchPane").fadeIn('slow');
        $("#booksPane").fadeIn('slow');
    } else if (func == 2) { //Show View Book
        $("#searchPane").fadeOut('slow');
        $("#borrowBookPane").fadeOut('slow');
        $("#booksPane").fadeOut('slow');
        $("#viewBookPane").fadeIn('slow');
    } else if (func == 3) { //Show Borrow Book
        $("#searchPane").fadeOut('slow');
        $("#booksPane").fadeOut('slow');
        $("#viewBookPane").fadeOut('slow');
        $("#borrowBookPane").fadeIn('slow');
    }
}

function borrowBook(id) {
    fetchData("/borrowbook", {"book_id": id}, handleBorrowResponse, handleBorrowResponseError);
}

function handleBorrowResponse(data) {
    $("#btnBorrow").hide();
    if (data["status"] == true) {
        showPane("successPane", "Borrowed the book successfully");
    } else {
        showPane("errorPane", "Oops! The books is not available now for borrowing.");
    }
    fetching = false;
}

function handleBorrowResponseError(data) {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Error while trying to borrow the book. Please try again later.")
    fetching = false;
}


function borrowBookPage(id, fromPage) {
    book = booksLoaded["" + id];
    if (!book) {
        alert("Book Not Found");
        return;
    }
    borrow_html = new Array();
    borrow_html.push("<table width = '100%' cellspacing = '5' cellpadding = '5'>");
    borrow_html.push("    <tr>");
    borrow_html.push("        <td align = 'right' colspan = '2'>");
    borrow_html.push("            <button type='button' class='btn btn-danger btn-sm' onclick = 'refreshSearch(" + book["id"] + ");'>Close</button>");
    borrow_html.push("        </td>");
    borrow_html.push("    </tr>");
    borrow_html.push("    <tr style = 'border-bottom:5px double lightgray;'>");
    borrow_html.push("        <td width = '20%'>");
    borrow_html.push("            <img src = '" + book["coverImg"] + "' width = '200' height = '200' />");
    borrow_html.push("        </td>");
    borrow_html.push("        <td width = '80%'>");
    borrow_html.push("            <table width = '100%' cellspacing = '3' cellpadding = '3'>");
    borrow_html.push("                <tr>");
    borrow_html.push("                    <td width = '100%' colspan = '2' class = 'bookTitleView'>");
    borrow_html.push(                         book["title"]);
    borrow_html.push("                    </td>");
    borrow_html.push("                </tr>");
    borrow_html.push("                <tr>");
    borrow_html.push("                    <td width = '60%' style = 'text-align:left;padding-left:0px;'>");
    borrow_html.push("                        <i class='fa-solid fa-language'></i>&nbsp;Language : ");
    borrow_html.push(                         book["lang"]);
    borrow_html.push("                    </td>");
    borrow_html.push("                    <td width = '40%' style = 'text-align:left;padding-left:0px;'>");
    borrow_html.push("                        <i class='fa-regular fa-star'></i>&nbsp;Rating : ");
    borrow_html.push(                         getRatingStarsHTML(book["rating"]) + "&nbsp;(" + book["rating"] + ")");
    borrow_html.push("                    </td>");
    borrow_html.push("                </tr>");
    borrow_html.push("                <tr>");
    borrow_html.push("                    <td  colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    borrow_html.push("                        <i class='fa fa-solid fa-pen-nib'></i>&nbsp;Author(s) : ");
    borrow_html.push(                         book["author"]);
    borrow_html.push("                    </td>");
    borrow_html.push("                </tr>");
    borrow_html.push("                <tr>");
    borrow_html.push("                    <td  colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    borrow_html.push("                        <i class='fa-solid fa-award'></i>&nbsp;Award(s) : ");
    borrow_html.push(                         book["award"]);
    borrow_html.push("                    </td>");
    borrow_html.push("                </tr>");
    borrow_html.push("                <tr>");
    borrow_html.push("                    <td colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    borrow_html.push("                        <i class='fa fa-solid fa-print'></i></i>&nbsp;Publisher(s) : ");
    borrow_html.push(                         book["pub_name"]);
    borrow_html.push("                    </td>");
    borrow_html.push("                </tr>");
    borrow_html.push("                <tr>");
    borrow_html.push("                    <td colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    borrow_html.push("                        <i class='fa-solid fa-masks-theater'></i></i></i>&nbsp;Genre(s) : ");
    borrow_html.push(                         book["genre"]);
    borrow_html.push("                    </td>");
    borrow_html.push("                </tr>");
    borrow_html.push("                <tr>");
    borrow_html.push("                    <td colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    borrow_html.push("                        <i class='fa-regular fa-thumbs-up'></i></i></i></i>&nbsp;Liked by : ");
    borrow_html.push(                         book["likedPercent"] + "%&nbsp;<i>(" + book["numRatings"] + " people rated this book" + ")</i>");
    borrow_html.push("                    </td>");
    borrow_html.push("                </tr>");
    borrow_html.push("            </table>");
    borrow_html.push("        </td>");
    borrow_html.push("    </tr>");
    borrow_html.push("    <tr>");
    borrow_html.push("        <td align = 'center' colspan = '2' style = 'font-weight:bold;line-height:1.6'>");
    borrow_html.push("                 This book will be placed on hold for pick up for the next 2 days. If not picked by then, the hold will be released and the book will be available for others to borrow.");
    borrow_html.push("        </td>");
    borrow_html.push("    </tr>");
    borrow_html.push("    <tr>");
    borrow_html.push("        <td align = 'left' colspan = '2' style = 'line-height:1.6'>");
    borrow_html.push("                 &nbsp;");
    borrow_html.push("        </td>");
    borrow_html.push("    </tr>");
    borrow_html.push("    <tr>");
    borrow_html.push("        <td align = 'left' colspan = '2' style = 'line-height:1.6'>");
    borrow_html.push("                 Pickup at Library by : " + addToToday(2));
    borrow_html.push("        </td>");
    borrow_html.push("    </tr>");
    borrow_html.push("    <tr>");
    borrow_html.push("        <td align = 'left' colspan = '2' style = 'line-height:1.6'>");
    borrow_html.push("                 Return by : " + addToToday(32));
    borrow_html.push("        </td>");
    borrow_html.push("    </tr>");
    borrow_html.push("    <tr>");
    borrow_html.push("        <td align = 'left' colspan = '2' style = 'line-height:1.6'>");
    borrow_html.push("                 Library address : 3400 E Seyburn Dr, Auburn Hills, MI 48326");
    borrow_html.push("        </td>");
    borrow_html.push("    </tr>");
    borrow_html.push("    <tr>");
    borrow_html.push("        <td align = 'center' colspan = '2'>");
    borrow_html.push("            <button type='button' id = 'btnBorrow' class='btn btn-primary' onclick = 'borrowBook(" + book["id"] + ")'>Borrow</button>");
    borrow_html.push("        </td>");
    borrow_html.push("    </tr>");
    borrow_html.push("</table>");
    $("#borrowBookPane").html(borrow_html.join(""));
    lastPane = fromPage;
    togglePanes(3);
}

function addToToday(num_days) {
    var dt = new Date();
    return addToDate(dt, num_days);
}

function addToDate(dt, num_days) {
    dt.setDate(dt.getDate() + num_days);
    return to2Digits(dt.getMonth() + 1) + "/" + to2Digits(dt.getDate()) + "/" + (dt.getYear() + 1900);
}

function to2Digits(val) {
    return (val <= 9 ? "0"+val : val);
}

function viewBookPage(id, fromPage) {
    book = booksLoaded["" + id];
    if (!book) {
        alert("Book Not Found");
        return;
    }
    view_html = new Array();
    view_html.push("<table width = '100%' cellspacing = '5' cellpadding = '5'>");
    view_html.push("    <tr>");
    view_html.push("        <td align = 'right' colspan = '2'>");
    if (book["available_copies"] > 0)
        view_html.push("            <button type='button' class='btn btn-primary btn-sm' onclick = 'borrowBookPage(" + book["id"] + ", 1)'>Borrow</button>");
    view_html.push("            <button type='button' class='btn btn-danger btn-sm' onclick = 'togglePanes(1)'>Close</button>");
    view_html.push("        </td>");
    view_html.push("    </tr>");
    view_html.push("    <tr style = 'border-bottom:5px double lightgray;'>");
    view_html.push("        <td width = '20%'>");
    view_html.push("            <img src = '" + book["coverImg"] + "' width = '200' height = '200' />");
    view_html.push("        </td>");
    view_html.push("        <td width = '80%'>");
    view_html.push("            <table width = '100%' cellspacing = '3' cellpadding = '3'>");
    view_html.push("                <tr>");
    view_html.push("                    <td width = '100%' colspan = '2' class = 'bookTitleView'>");
    view_html.push(                         book["title"]);
    view_html.push("                    </td>");
    view_html.push("                </tr>");
    view_html.push("                <tr>");
    view_html.push("                    <td width = '60%' style = 'text-align:left;padding-left:0px;'>");
    view_html.push("                        <i class='fa-solid fa-language'></i>&nbsp;Language : ");
    view_html.push(                         book["lang"]);
    view_html.push("                    </td>");
    view_html.push("                    <td width = '40%' style = 'text-align:left;padding-left:0px;'>");
    view_html.push("                        <i class='fa-regular fa-star'></i>&nbsp;Rating : ");
    view_html.push(                         getRatingStarsHTML(book["rating"]) + "&nbsp;(" + book["rating"] + ")");
    view_html.push("                    </td>");
    view_html.push("                </tr>");
    view_html.push("                <tr>");
    view_html.push("                    <td  colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    view_html.push("                        <i class='fa fa-solid fa-pen-nib'></i>&nbsp;Author(s) : ");
    view_html.push(                         book["author"]);
    view_html.push("                    </td>");
    view_html.push("                </tr>");
    view_html.push("                <tr>");
    view_html.push("                    <td  colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    view_html.push("                        <i class='fa-solid fa-award'></i>&nbsp;Award(s) : ");
    view_html.push(                         book["award"]);
    view_html.push("                    </td>");
    view_html.push("                </tr>");
    view_html.push("                <tr>");
    view_html.push("                    <td colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    view_html.push("                        <i class='fa fa-solid fa-print'></i></i>&nbsp;Publisher(s) : ");
    view_html.push(                         book["pub_name"]);
    view_html.push("                    </td>");
    view_html.push("                </tr>");
    view_html.push("                <tr>");
    view_html.push("                    <td colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    view_html.push("                        <i class='fa-solid fa-masks-theater'></i></i></i>&nbsp;Genre(s) : ");
    view_html.push(                         book["genre"]);
    view_html.push("                    </td>");
    view_html.push("                </tr>");
    view_html.push("                <tr>");
    view_html.push("                    <td colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    view_html.push("                        <i class='fa-regular fa-thumbs-up'></i></i></i></i>&nbsp;Liked by : ");
    view_html.push(                         book["likedPercent"] + "%&nbsp;<i>(" + book["numRatings"] + " people rated this book" + ")</i>");
    view_html.push("                    </td>");
    view_html.push("                </tr>");
    view_html.push("            </table>");
    view_html.push("        </td>");
    view_html.push("    </tr>");
    view_html.push("    <tr>");
    view_html.push("        <td align = 'left' colspan = '2' style = 'line-height:1.6'>");
    view_html.push(                 book["description"]);
    view_html.push("        </td>");
    view_html.push("    </tr>");
    view_html.push("    <tr>");
    view_html.push("        <td align = 'right' colspan = '2'>");
    if (book["available_copies"] > 0)
        view_html.push("            <button type='button' class='btn btn-primary btn-sm' onclick = 'borrowBookPage(" + book["id"] + ", 1)'>Borrow</button>");
    view_html.push("            <button type='button' class='btn btn-danger btn-sm' onclick = 'togglePanes(1)'>Close</button>");
    view_html.push("        </td>");
    view_html.push("    </tr>");
    view_html.push("</table>");
    $("#viewBookPane").html(view_html.join(""));
    lastPane = fromPage;
    togglePanes(2);
}

function newSearch(id, limit) {
    if (id == 1) {
        search = $("#txtSearch").val().trim();
        $("#hidSearch").val(search);
    }

    langId = "" + $("#selLang").val();
    order = $("#selOrder").val();
    $("#hidLang").val(langId);
    $("#hidOrder").val(order);
    $("#startRow").val(0);

    booksLoaded = [];
    booksCount = 0;
    bookLoadAlertShown = false;
    $("#booksPane").html("");
    if (id == 2) searchBooks(limit);
    else searchBooks(-1);
}


function truncateStr(data, length, minLength) {
    if (data.length > length)
        return data.substring(0, length) + "...";
    if (data.length < minLength) {
        data = data + "<span style = 'color:white'>";
        for (k = 0; k < (minLength - data.length); k++) {
            data = data + "-";
        }
        data = data + "</span>";
        return data;
    }
    return data;
}

function memberBooksFetched(books) {
    books_html = new Array()
    booksCount += books.length;
    for (i = 0; i < books.length; i++) {
        book = books[i];
        borrowFunctions = getBorrowFunctions(book["borrow_date"], book["return_date"], book["borrow_status_id"]);
        booksLoaded["" + book["book_id"]] = book;
        books_html.push("<tr id = 'row_" + book["book_id"] + "'>");
        books_html.push("   <td style = 'text-align:left; padding-bottom:5px;border-bottom:5px double lightgray;cursor:hand;'>");
        books_html.push("       <table width = '100%' cellpadding = '5' cellspacing = '2'>");
        books_html.push("          <tr>");
        books_html.push("              <td rowspan = '3' align = 'left' width = '125'>");
        books_html.push("                <img src = '" + book["coverImg"] + "' width = '100' height = '100' />");
        books_html.push("              </td>");
        books_html.push("              <td style = 'text-align:left;left-padding:10px;' class = 'bookTitleList'>");
        books_html.push(                  book["title"] + "&nbsp;(" + book["lang"] + ")");
        books_html.push("              </td>");
        books_html.push("          </tr>");
        books_html.push("          <tr>");
        books_html.push("              <td width = '100%'>");
        books_html.push("                   <table width = '100%' cellpadding = '2' cellspacing = '2'>");
        books_html.push("                       <tr>");
        books_html.push("                           <td width = '50%'>");
        books_html.push(                                borrowFunctions["msg"]);
        books_html.push("                           </td>");
        books_html.push("                           <td width = '50%' align = 'right'>");
        if (borrowFunctions["function"] != null) {
            books_html.push("                           <button type='button' id = 'btn_" + book["id"] + "' class='btn " + borrowFunctions["btnClass"] + " btn-sm' onclick = '" + borrowFunctions["function"]+ "(" + book["book_copy_id"] + ", " + book["book_id"] +")'>" + borrowFunctions["label"] + "</button>&nbsp;");
        }
        books_html.push("                           </td>");
        books_html.push("                       </tr>");
        books_html.push("                   </table>");
        books_html.push("               </td>");
        books_html.push("           </tr>");
        books_html.push("           <tr>");
        books_html.push("              <td width = '100%'>");
        books_html.push("                   <table width = '100%' cellpadding = '2' cellspacing = '2'>");
        books_html.push("                       <tr>");
        books_html.push("                           <td width = '40%'>");
        books_html.push("                               <i class='fa-regular fa-calendar-days'></i>&nbsp;Borrow Date&nbsp;:&nbsp;");
        if (book["borrow_status_id"] == 2 && borrowFunctions["overdue"].length > 0) {
            books_html.push("                                <span style = 'color:red'>" + book["borrow_date"] + "</span>");
        } else {
            books_html.push("                                <span>" + book["borrow_date"] + "</span>");
        }
        books_html.push("                           </td>");
        books_html.push("                           <td width = '40%'>");
        books_html.push("                               <i class='fa-regular fa-calendar-days'></i>&nbsp;Return Date&nbsp;:&nbsp;");
        if ((book["borrow_status_id"] == 3 ||  book["borrow_status_id"] == 4) && borrowFunctions["overdue"].length > 0) {
            books_html.push("                                <span style = 'color:red'>" + book["return_date"] + "</span>");
        } else {
            books_html.push("                                <span>" + book["return_date"] + "</span>");
        }
        books_html.push("                           </td>");
        books_html.push("                           <td width = '20%'>");
        if (borrowFunctions["overdue"].length > 0) {
            books_html.push("                                <span style = 'color:red'>" + borrowFunctions["overdue"] + "</span>");
        } else {
            books_html.push("                                &nbsp;");
        }
        books_html.push("                           </td>");
        books_html.push("                       </tr>");
        books_html.push("                   </table>");
        books_html.push("               </td>");
        books_html.push("           </tr>");
        books_html.push("       </table>");
        books_html.push("<tr>");
        books_html.push("   <td>&nbsp;</td>");
        books_html.push("</tr>");
    }
    $("#booksPane").html(books_html.join(""));
}

function isOverdue(date, compareToDate) {
    try {
        date = new Date(date);
        c2Date = new Date(compareToDate);
        return date.getTime() > c2Date.getTime();
    } catch (ex) { return false; }
}

function getBorrowFunctions(borrowDate, returnDate, borrowStatusId) {
    if (borrowStatusId == 2) {
        pickupDate = "";
        try {
            pickupDate = addToDate(new Date(borrowDate), 2);
        } catch(ex) { pickupDate = ""; }
        return {"msg": "Borrowed. Pickup by <b>" + pickupDate +"</b>", "label": "Cancel", "btnClass": "btn-danger", "function": "cancelBorrow", "overdue": (isOverdue(new Date(), pickupDate)? "Pickup Overdue": "")};
    } else if (borrowStatusId == 3) {
        return {"msg": "You have it", "label": "Return", "function": "returnBook", "btnClass": "btn-primary", "overdue": (isOverdue(new Date(), returnDate)? "Return Overdue": "")};
    }
    else if (borrowStatusId == 4) {
        returnByDate = "";
        try {
            returnByDate = addToDate(new Date(returnDate), 0);
        } catch(ex) { returnByDate = ""; }
        return {"msg": "Return Ready. Return by <b>" + returnByDate + "</b>", "label": "Return", "btnClass": "btn-info", "function": null, "overdue": (isOverdue(new Date(), returnByDate)? "Return Overdue": "")};
    }
}

function booksFetched(books) {
    if (booksCount == 0 && books.length == 0) {
        $("#booksPane").html("<center><b>No books matching the search criteria found</b></center>");
    } else {
        books_html = new Array()
        booksCount += books.length;
        for (i = 0; i < books.length; i++) {
            book = books[i];
            booksLoaded["" + book["id"]] = book;
            books_html.push("<tr id = 'row_" + book["id"] + "'>");
            books_html.push("   <td style = 'text-align:left; padding-bottom:5px;border-bottom:5px double lightgray;cursor:hand;'>");
            books_html.push("       <table width = '100%' cellpadding = '5' cellspacing = '2'>");
            books_html.push("          <tr>");
            books_html.push("              <td rowspan = '4' align = 'left' width = '125'>");
            books_html.push("                <img src = '" + book["coverImg"] + "' width = '100' height = '100' />");
            books_html.push("              </td>");
            books_html.push("              <td style = 'text-align:left;left-padding:10px;' class = 'bookTitleList'>");
            books_html.push(                  truncateStr(book["title"], 55, 20) + "&nbsp;(" + book["lang"] + ")");
            if (book["available_copies"] > 0)
                books_html.push("              <sup class = 'lblAvailable'>Available</sup>");
            else
                books_html.push("              <sup class = 'lblNotAvailable'>Not Available</sup>");
            books_html.push("              </td>");
            books_html.push("              <td align = 'right'>");
            books_html.push("                  <button type='button' id = 'btn_" + book["id"] + "' class='btn btn-info btn-xs' onclick = 'viewBookPage(" + book["id"] + ", 1)'>View</button>&nbsp;");
            if (book["available_copies"] > 0)
                books_html.push("                  <button type='button' class='btn btn-primary btn-xs' onclick = 'borrowBookPage(" + book["id"] + ", 1)'>Borrow</button>");
            books_html.push("               </td>");
            books_html.push("           </tr>");
            books_html.push("           <tr>");
            books_html.push("              <td colspan = '2' width = '100%' style = 'text-align:left;left-padding:10px;' class = 'descriptionList'>");
            books_html.push(                     truncateStr(book["description"], 250, 249));
            books_html.push("               </td>");
            books_html.push("           </tr>");
            books_html.push("           <tr>");
            books_html.push("               <td colspan = '2'>");
            books_html.push("                  <table width = '100%'>");
            books_html.push("                      <tr>");
            books_html.push("                          <td width = '50%' style = 'text-align:left;padding-left:0px;' class = 'textList'>");
            books_html.push("                               <i class='fa fa-solid fa-pen-nib'></i>&nbsp;");
            books_html.push(                                truncateStr(book["author"], 150, 1));
            books_html.push("                           </td>");
            books_html.push("                          <td width = '20%' style = 'text-align:center;padding-left:0px;' class = 'textList'>");
            books_html.push("                                &nbsp;" + getRatingStarsHTML(book["rating"]) + "&nbsp;(" + book["rating"] + ")");
            books_html.push("                           </td>");
            books_html.push("                           <td width = '30%' style = 'text-align:left;padding-right:10px;' class = 'textList'>");
            books_html.push("                               <i class='fa fa-solid fa-print'></i>&nbsp;");
            books_html.push(                                truncateStr(book["pub_name"], 150, 1));
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
    }
    $("#startRow").val(parseInt($("#startRow").val()) + 20);
    fetching = false;
    if (doScrollTo) {
        document.getElementById("btn_" + scrollToElementId).scrollIntoView({block: "center", inline: "nearest"});
        doScrollTo = false;
    }
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

function booksFetchFailed() {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Failed to fetch books list");
    fetching = false;
}

function memberBooksFetchFailed() {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Failed to fetch borrowed books list");
    fetching = false;
}

function fetchData(url, input, success_callback, error_callback) {
    if (fetching && url == '/getbooks') {
        return;
    }
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

function booksListScrolled(div) {
    if(div.scrollTop + div.clientHeight >= div.scrollHeight - 20) {
        if (booksCount >= 250) {
            if (!bookLoadAlertShown) {
                bookLoadAlertShown = true;
                showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Load Books", "Cannot load more books. Please refine your search criteria.");
            }
            return;
        }
        searchBooks(-1);
    }
}



