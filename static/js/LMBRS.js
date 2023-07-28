fetching = false;
booksLoaded = [];
booksCount = 0;
bookLoadAlertShown = false;
lastPane = 1;
scrollToElementId = "";
doScrollTo = false;
isRecommended = false;

function setPageTitle(iconClasses, title) {
    $("#spnPageTitle").html("<i class='" + iconClasses + "' style = 'font-size:18pt;'></i>&nbsp;&nbsp;" + title);
}

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

function clearSearch(id) {
    $("#txtSearch").val("");
    if (id == 1) newSearch(1);
    else newSearchABAdmin(1);
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

function showMembers() {
    document.members_form.submit();
}

function listMembers() {
    fetchData("/getmembers", {}, listMembersSuccess, listMembersFailed);
}

function listMembersSuccess(members) {
    if (members.length == 0) {
        $("#membersPane").html("<center><b>No members found</b></center>");
    } else {
        member_html = new Array();
        member_html.push("       <table width = '100%' cellpadding = '7' cellspacing = '2'>");
        member_html.push("          <tr style = 'border-bottom:1px double lightgray;'>");
        member_html.push("              <th>Name</th>");
        member_html.push("              <th>Email</th>");
        member_html.push("              <th>Logon Id</th>");
        member_html.push("              <th>Status</th>");
        member_html.push("              <th>&nbsp;</th>");
        member_html.push("              <th>&nbsp;</th>");
        member_html.push("          </tr>");
        for (i = 0; i < members.length; i++) {
            member = members[i];
            member_html.push("       <tr style = 'border-bottom:1px solid lightgray;'>");
            member_html.push("            <td>");
            member_html.push(               member["f_name"] + ", " + member["l_name"]);
            member_html.push("            </td>");
            member_html.push("            <td>");
            member_html.push(               member["email"]);
            member_html.push("            </td>");
            member_html.push("            <td>");
            member_html.push(               member["logon_id"]);
            member_html.push("            </td>");
            member_html.push("            <td>");
            member_html.push(               member["status"]);
            member_html.push("            </td>");
            member_html.push("            <td>");
            member_html.push("              <form name = 'member_books_admin_form_" +member["id"]+ "' action = '/memberbooksadmin' method = 'POST'>");
            member_html.push("                  <input type = 'hidden' value = '" + member["id"] + "' name = 'memberId' />");
            member_html.push("                  <a href = 'javascript:void();' onclick = 'showMembersBooksAdmin(" + member["id"] + ");' ");
            member_html.push("                      <i class='fa-solid fa-book-open' style = 'color:blue'></i>");
            member_html.push("                  </a>");
            member_html.push("              </form>");
            member_html.push("            </td>");
            member_html.push("            <td>");
            member_html.push("               <a href = 'javascript:void();'  onclick = 'editMember(" + member["id"] + ");' ");
            member_html.push("               <i class='fa-solid fa-pencil' style = 'color:blue'></i>");
            member_html.push("            </td>");
            member_html.push("       </tr>");
        }
         member_html.push("       </table>");
        $("#membersPane").html(member_html.join(""));
    }
}

function showMembersBooksAdmin(memberId) {
    document.all["member_books_admin_form_" + memberId].submit();
}

function showAllBorrowalsAdmin() {
    document.all_members_borrowals_form.submit();
}

function editMemberAdmin(memberId) {
    alert(memberId);
}

function listMembersFailed(data) {
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

function checkEnter(id) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13') {
        if (id == 1) newSearchABAdmin(1);
        else newSearch(1);
    }
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

function updatePickedup(bookCopyId, bookId, memberId) {
    if (confirm("Please confirm pick up by the borrower - '" + booksLoaded["" + bookId]["title"] + "'")) {
        fetchData("/updatebookcopyavailability", {"book_copy_id": bookCopyId, "book_status": 3, "member_id": memberId}, updatePickedupSuccess, updatePickedupFailed);
    }
}

function updatePickedupSuccess(data) {
    if (data["success"] == true) {
        memberId = data["member_id"];
        getMemberBooksAdmin(memberId);
    } else {
        showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Error while attempting to update pick up.");
    }
}

function updatePickedupFailed(data) {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Error while attempting to update pick up.");
}

function updateReturned(bookCopyId, bookId, memberId) {
    if (confirm("Please confirm return by the borrower - '" + booksLoaded["" + bookId]["title"] + "'")) {
        fetchData("/updatebookcopyavailability", {"book_copy_id": bookCopyId, "book_status": 1, "member_id": memberId}, updateReturnedSuccess, updateReturnedFailed);
    }
}

function updateReturnedSuccess(data) {
    if (data["success"] == true) {
        getMemberBooksAdmin(memberId);
    } else {
        showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Error while attempting to update return.");
    }
}

function updateReturnedFailed(data) {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Error while attempting to update return.");
}

function getRecommendedBooks(id) {
    if (id) {
        scrollToElementId = id;
        doScrollTo = true;
    }
    fetchData("/getrecommendedbooks", {}, recommendedBooksFetched, recommendedBooksFetchFailed);
}

function searchBooks(limit) {
    togglePanes(1);
    search = $("#hidSearch").val();
    langId = "" + $("#hidLang").val();
    order = $("#hidOrder").val();
    $("#txtSearch").val(search);
    start = $("#startRow").val();
    fetchData("/getbooks", {"start": start, "lang_id": langId, "order": order, "search": search, "limit": limit, "recommended": false},
                        booksFetched, booksFetchFailed);
}

function searchBooksABAdmin(limit) {
    search = $("#hidSearch").val();
    borrowStatus = $("#hidBorrowStatus").val();
    $("#txtSearch").val(search);
    start = $("#startRow").val();
    fetchData("/getallmembersborrowalsadmin", {"start": start, "search": search, "borrow_status": borrowStatus, "limit": limit},
                        allMembersBorrowalsAdminFetched, allMembersBorrowalsAdminFetchFailed);
}


function getMemberBooks() {
    booksLoaded = [];
    booksCount = 0;
    fetchData("/getmemberbooks", {}, memberBooksFetched, memberBooksFetchFailed);
}

function getMemberBooksAdmin(memberId, limit) {
    booksLoaded = [];
    booksCount = 0;
    fetchData("/getmemberbooksadmin", {"member_id": memberId}, memberBooksAdminFetched, memberBooksAdminFetchFailed);
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
        $("#viewBookPane").hide();
        $("#borrowBookPane").hide();
        $("#searchPane").show();
        $("#booksPane").show();
    } else if (func == 2) { //Show View Book
        $("#searchPane").hide();
        $("#borrowBookPane").hide();
        $("#booksPane").hide();
        $("#viewBookPane").show();
    } else if (func == 3) { //Show Borrow Book
        $("#searchPane").hide();
        $("#booksPane").hide();
        $("#viewBookPane").hide();
        $("#borrowBookPane").show();
    } else if (func == 4) { //Show Add Copies
        $("#searchPane").hide();
        $("#booksPane").hide();
        $("#borrowBookPane").hide();
        $("#addCopiesPane").show();
    } else if (func == 5) { //Show Borrow Book
        $("#addCopiesPane").hide();
        $("#borrowBookPane").hide();
        $("#searchPane").show();
        $("#booksPane").show();
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
    if (isRecommended)
        borrow_html.push("            <button type='button' class='btn btn-danger btn-sm' onclick = 'getRecommendedBooks(" + book["id"] + ");'>Close</button>");
    else
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

function addCopiesPage(id) {
    book = booksLoaded["" + id];
    if (!book) {
        alert("Book Not Found");
        return;
    }

    add_copies_html = new Array();
    add_copies_html.push("<table width = '100%' cellspacing = '5' cellpadding = '5'>");
    add_copies_html.push("    <tr>");
    add_copies_html.push("        <td align = 'right' colspan = '2'>");
    add_copies_html.push("            &nbsp;<select id = 'selCopies'>");
    add_copies_html.push("              <option value = '0' selected>0</option><option value = '1'>1</option><option value = '2'>2</option><option value = '3'>3</option><option value = '4'>4</option><option value = '5'>5</option>");
    add_copies_html.push("              <option value = '6'>6</option><option value = '7'>7</option><option value = '8'>8</option><option value = '9'>9</option><option value = '10'>10</option>");
    add_copies_html.push("            </select>");
    add_copies_html.push("            &nbsp;<button type='button' class='btn btn-primary btn-sm' onclick = 'addCopies(" + book["id"] + ")'>Add Copies</button>");
    add_copies_html.push("            &nbsp;<button type='button' class='btn btn-danger btn-sm' onclick = 'refreshSearch(" + book["id"] + ");'>Close</button>");
    add_copies_html.push("        </td>");
    add_copies_html.push("    </tr>");
    add_copies_html.push("    <tr style = 'border-bottom:5px double lightgray;'>");
    add_copies_html.push("        <td width = '20%'>");
    add_copies_html.push("            <img src = '" + book["coverImg"] + "' width = '200' height = '200' />");
    add_copies_html.push("        </td>");
    add_copies_html.push("        <td width = '80%'>");
    add_copies_html.push("            <table width = '100%' cellspacing = '3' cellpadding = '3'>");
    add_copies_html.push("                <tr>");
    add_copies_html.push("                    <td width = '100%' colspan = '2' class = 'bookTitleView'>");
    add_copies_html.push(                         book["title"]);
    add_copies_html.push("                    </td>");
    add_copies_html.push("                </tr>");
    add_copies_html.push("                <tr>");
    add_copies_html.push("                    <td width = '60%' style = 'text-align:left;padding-left:0px;'>");
    add_copies_html.push("                        <i class='fa-solid fa-language'></i>&nbsp;Language : ");
    add_copies_html.push(                         book["lang"]);
    add_copies_html.push("                    </td>");
    add_copies_html.push("                    <td width = '40%' style = 'text-align:left;padding-left:0px;'>");
    add_copies_html.push("                        <i class='fa-regular fa-star'></i>&nbsp;Rating : ");
    add_copies_html.push(                         getRatingStarsHTML(book["rating"]) + "&nbsp;(" + book["rating"] + ")");
    add_copies_html.push("                    </td>");
    add_copies_html.push("                </tr>");
    add_copies_html.push("                <tr>");
    add_copies_html.push("                    <td  colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    add_copies_html.push("                        <i class='fa fa-solid fa-pen-nib'></i>&nbsp;Author(s) : ");
    add_copies_html.push(                         book["author"]);
    add_copies_html.push("                    </td>");
    add_copies_html.push("                </tr>");
    add_copies_html.push("                <tr>");
    add_copies_html.push("                    <td  colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    add_copies_html.push("                        <i class='fa-solid fa-award'></i>&nbsp;Award(s) : ");
    add_copies_html.push(                         book["award"]);
    add_copies_html.push("                    </td>");
    add_copies_html.push("                </tr>");
    add_copies_html.push("                <tr>");
    add_copies_html.push("                    <td colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    add_copies_html.push("                        <i class='fa fa-solid fa-print'></i></i>&nbsp;Publisher(s) : ");
    add_copies_html.push(                         book["pub_name"]);
    add_copies_html.push("                    </td>");
    add_copies_html.push("                </tr>");
    add_copies_html.push("                <tr>");
    add_copies_html.push("                    <td colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    add_copies_html.push("                        <i class='fa-solid fa-masks-theater'></i></i></i>&nbsp;Genre(s) : ");
    add_copies_html.push(                         book["genre"]);
    add_copies_html.push("                    </td>");
    add_copies_html.push("                </tr>");
    add_copies_html.push("                <tr>");
    add_copies_html.push("                    <td colspan = '2' style = 'text-align:left;padding-left:0px;'>");
    add_copies_html.push("                        <i class='fa-regular fa-thumbs-up'></i></i></i></i>&nbsp;Liked by : ");
    add_copies_html.push(                         book["likedPercent"] + "%&nbsp;<i>(" + book["numRatings"] + " people rated this book" + ")</i>");
    add_copies_html.push("                    </td>");
    add_copies_html.push("                </tr>");
    add_copies_html.push("            </table>");
    add_copies_html.push("        </td>");
    add_copies_html.push("    </tr>");
    add_copies_html.push("    <tr>");
    add_copies_html.push("        <td align = 'left' colspan = '2' style = 'line-height:1.6'>");
    add_copies_html.push(                 book["description"]);
    add_copies_html.push("        </td>");
    add_copies_html.push("    </tr>");
    add_copies_html.push("</table>");
    $("#addCopiesPane").html(add_copies_html.join(""));
    togglePanes(4);
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

function newSearchABAdmin(id, limit) {
    if (id == 1) {
        search = $("#txtSearch").val().trim();
        $("#hidSearch").val(search);
    }
    $("#hidBorrowStatus").val($("#selBorrowStatus").val());
    $("#startRow").val(0);
    booksLoaded = [];
    booksCount = 0;
    bookLoadAlertShown = false;
    $("#booksPane").html("");
    if (id == 2) searchBooksABAdmin(limit);
    else searchBooksABAdmin(-1);
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

function memberBooksAdminFetched(books) {
    books_html = new Array()
    booksCount += books.length;
    if (booksCount == 0 && books.length == 0) {
        $("#booksPane").html("<center><b>No books found</b></center>");
    } else {
        books_html.push("<table width = '100%'>");
        for (i = 0; i < books.length; i++) {
            book = books[i];
            borrowFunctions = getBorrowFunctions(book["borrow_date"], book["return_date"], book["borrow_status_id"], true);
            booksLoaded["" + book["book_id"]] = book;
            books_html.push("<tr id = 'row_" + book["book_id"] + "' style = 'width:100%;'>");
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
                for (j = 0; j < borrowFunctions["label"].length; j++) {
                    books_html.push("                           &nbsp;<button type='button' id = 'btn_" + i + "_" + book["id"] + "' class='btn " + borrowFunctions["btnClass"][j] + " btn-sm' onclick = '" + borrowFunctions["function"][j] + "(" + book["book_copy_id"] + ", " + book["book_id"] +", " + book["person_id"] + ")'>" + borrowFunctions["label"][j] + "</button>&nbsp;");
                }
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
            books_html.push("                           <td width = '40%' nowrap>");
            books_html.push("                               <i class='fa-regular fa-calendar-days'></i>&nbsp;Borrow Date&nbsp;:&nbsp;");
            if (book["borrow_status_id"] == 2 && borrowFunctions["overdue"].length > 0) {
                books_html.push("                                <span style = 'color:red'>" + book["borrow_date"] + "</span>");
            } else {
                books_html.push("                                <span>" + book["borrow_date"] + "</span>");
            }
            books_html.push("                           </td>");
            books_html.push("                           <td width = '40%' nowrap>");
            books_html.push("                               <i class='fa-regular fa-calendar-days'></i>&nbsp;Return Date&nbsp;:&nbsp;");
            if ((book["borrow_status_id"] == 3 ||  book["borrow_status_id"] == 4) && borrowFunctions["overdue"].length > 0) {
                books_html.push("                                <span style = 'color:red'>" + book["return_date"] + "</span>");
            } else {
                books_html.push("                                <span>" + book["return_date"] + "</span>");
            }
            books_html.push("                           </td>");
            books_html.push("                           <td width = '20%' nowrap>");
            if (borrowFunctions["overdue"].length > 0) {
                books_html.push("                                <span style = 'color:red'>" + borrowFunctions["overdue"] + "</span>");
            } else {
                books_html.push("                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
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
        books_html.push("</table>");
        $("#booksPane").html(books_html.join(""));
        fetching = false;
    }
}

function memberBooksFetched(books) {
    books_html = new Array()
    booksCount += books.length;
    if (booksCount == 0 && books.length == 0) {
        $("#booksPane").html("<center><b>No books found</b></center>");
    } else {
        books_html.push("<table width = '100%'>");
        for (i = 0; i < books.length; i++) {
            book = books[i];
            borrowFunctions = getBorrowFunctions(book["borrow_date"], book["return_date"], book["borrow_status_id"], false);
            booksLoaded["" + book["book_id"]] = book;
            books_html.push("<tr id = 'row_" + book["book_id"] + "' style = 'width:100%;'>");
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
            books_html.push("                           <td width = '40%' nowrap>");
            books_html.push("                               <i class='fa-regular fa-calendar-days'></i>&nbsp;Borrow Date&nbsp;:&nbsp;");
            if (book["borrow_status_id"] == 2 && borrowFunctions["overdue"].length > 0) {
                books_html.push("                                <span style = 'color:red'>" + book["borrow_date"] + "</span>");
            } else {
                books_html.push("                                <span>" + book["borrow_date"] + "</span>");
            }
            books_html.push("                           </td>");
            books_html.push("                           <td width = '40%' nowrap>");
            books_html.push("                               <i class='fa-regular fa-calendar-days'></i>&nbsp;Return Date&nbsp;:&nbsp;");
            if ((book["borrow_status_id"] == 3 ||  book["borrow_status_id"] == 4) && borrowFunctions["overdue"].length > 0) {
                books_html.push("                                <span style = 'color:red'>" + book["return_date"] + "</span>");
            } else {
                books_html.push("                                <span>" + book["return_date"] + "</span>");
            }
            books_html.push("                           </td>");
            books_html.push("                           <td width = '20%' nowrap>");
            if (borrowFunctions["overdue"].length > 0) {
                books_html.push("                                <span style = 'color:red'>" + borrowFunctions["overdue"] + "</span>");
            } else {
                books_html.push("                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
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
        books_html.push("</table>");
        $("#booksPane").html(books_html.join(""));
    }
}

function isOverdue(date, compareToDate) {
    try {
        date = new Date(date);
        c2Date = new Date(compareToDate);
        return date.getTime() > c2Date.getTime();
    } catch (ex) { return false; }
}

function getBorrowFunctions(borrowDate, returnDate, borrowStatusId, isAdmin) {
    if (borrowStatusId == 2) {
        pickupDate = "";
        try {
            pickupDate = addToDate(new Date(borrowDate), 2);
        } catch(ex) { pickupDate = ""; }
        return {"msg": "Borrowed. " + ((isAdmin)?"To be picked up ":"Pickup by ") + "<b>" + pickupDate +"</b>", "label": ((isAdmin)?["Picked Up", "Cancel"]:"Cancel"), "btnClass": ((isAdmin)?["btn-primary", "btn-danger"]:"btn-danger"), "function": ((isAdmin)?["updatePickedup", "cancelBorrow"]:"cancelBorrow"), "overdue": (isOverdue(new Date(), pickupDate)? "Pickup Overdue": "")};
    } else if (borrowStatusId == 3) {
        return {"msg": ((isAdmin)?"Member has it":"You have it"), "label": ((isAdmin)?["Returned"]:"Return"), "function": ((isAdmin)?["updateReturned"]:"returnBook"), "btnClass": ((isAdmin)?["btn-info"]:"btn-info"), "overdue": (isOverdue(new Date(), returnDate)? "Return Overdue": "")};
    } else if (borrowStatusId == 4) {
        returnByDate = "";
        try {
            returnByDate = addToDate(new Date(returnDate), 0);
        } catch(ex) { returnByDate = ""; }
        return {"msg": "Return Ready. " + ((isAdmin)?"To be returned by ":"Return by ") + "<b>" + returnByDate + "</b>", "label": ((isAdmin)?["Returned"]:"Return"), "btnClass": ((isAdmin)?["btn-info"]:"btn-info"), "function": ((isAdmin)?["updateReturned"]:null), "overdue": (isOverdue(new Date(), returnByDate)? "Return Overdue": "")};
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
            if (isAdmin && isAdmin == "True") {
                if (book["available_copies"] > 0)
                    books_html.push("              <sup class = 'lblAvailable'>" + book["available_copies"] + " / " + book["total_copies"] + " available</sup>");
                else
                    books_html.push("              <sup class = 'lblNotAvailable'>" + book["available_copies"] + " / " + book["total_copies"] + " available</sup>");
            } else {
                if (book["available_copies"] > 0)
                    books_html.push("              <sup class = 'lblAvailable'>Available</sup>");
                else
                    books_html.push("              <sup class = 'lblNotAvailable'>Not Available</sup>");
            }

            books_html.push("              </td>");
            books_html.push("              <td align = 'right'>");
            if (isAdmin && isAdmin == "True") {
                books_html.push("                  <button type='button' id = 'btn_" + book["id"] + "' class='btn btn-primary btn-xs' onclick = 'addCopiesPage(" + book["id"] + ")'>Add Copies</button>");
            } else {
                books_html.push("                  <button type='button' id = 'btn_" + book["id"] + "' class='btn btn-info btn-xs' onclick = 'viewBookPage(" + book["id"] + ", 1)'>View</button>&nbsp;");
                if (book["available_copies"] > 0)
                    books_html.push("                  <button type='button' class='btn btn-primary btn-xs' onclick = 'borrowBookPage(" + book["id"] + ", 1)'>Borrow</button>");
            }
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
    if (isAdmin && isAdmin == "True") togglePanes(5);
    else togglePanes(1);
    if (doScrollTo) {
        document.getElementById("btn_" + scrollToElementId).scrollIntoView({block: "center", inline: "nearest"});
        doScrollTo = false;
    }
}

function recommendedBooksFetched(books) {
    if (booksCount == 0 && books.length == 0) {
        $("#booksPane").html("<center><b>No recommended books found</b></center>");
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
            if (isAdmin && isAdmin == "True") {
                if (book["available_copies"] > 0)
                    books_html.push("              <sup class = 'lblAvailable'>" + book["available_copies"] + " / " + book["total_copies"] + " available</sup>");
                else
                    books_html.push("              <sup class = 'lblNotAvailable'>" + book["available_copies"] + " / " + book["total_copies"] + " available</sup>");
            } else {
                if (book["available_copies"] > 0)
                    books_html.push("              <sup class = 'lblAvailable'>Available</sup>");
                else
                    books_html.push("              <sup class = 'lblNotAvailable'>Not Available</sup>");
            }

            books_html.push("              </td>");
            books_html.push("              <td align = 'right'>");
            if (isAdmin && isAdmin == "True") {
                books_html.push("                  <button type='button' id = 'btn_" + book["id"] + "' class='btn btn-primary btn-xs' onclick = 'addCopiesPage(" + book["id"] + ")'>Add Copies</button>");
            } else {
                books_html.push("                  <button type='button' id = 'btn_" + book["id"] + "' class='btn btn-info btn-xs' onclick = 'viewBookPage(" + book["id"] + ", 1)'>View</button>&nbsp;");
                if (book["available_copies"] > 0)
                    books_html.push("                  <button type='button' class='btn btn-primary btn-xs' onclick = 'borrowBookPage(" + book["id"] + ", 1)'>Borrow</button>");
            }
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
        $("#booksPane").html(books_html.join(""));
    }
    fetching = false;
    togglePanes(1);
    if (doScrollTo) {
        document.getElementById("btn_" + scrollToElementId).scrollIntoView({block: "center", inline: "nearest"});
        doScrollTo = false;
    }
}



function allMembersBorrowalsAdminFetched(books) {
    books_html = new Array()
    booksCount += books.length;
    if (booksCount == 0 && books.length == 0) {
        $("#booksPane").html("<center><b>No books found</b></center>");
    } else {
        books_html.push("<table width = '100%'>");
        for (i = 0; i < books.length; i++) {
            book = books[i];
            borrowFunctions = getBorrowFunctions(book["borrow_date"], book["return_date"], book["borrow_status_id"], true);
            booksLoaded["" + book["book_id"]] = book;
            books_html.push("<tr id = 'row_" + book["book_id"] + "' style = 'width:100%;'>");
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
            books_html.push("                           <td colspan = '2'>");
            books_html.push("                                  Member&nbsp;:&nbsp;<span style = 'color:blue'>" + book["f_name"] + ", " + book["l_name"]);
            books_html.push("                           </td>");
            books_html.push("                       </tr>");
            books_html.push("                       <tr>");
            books_html.push("                           <td width = '50%'>");
            books_html.push(                                borrowFunctions["msg"]);
            books_html.push("                           </td>");
            books_html.push("                           <td width = '50%' align = 'right'>");
            if (borrowFunctions["function"] != null) {
                for (j = 0; j < borrowFunctions["label"].length; j++) {
                    books_html.push("                           &nbsp;<button type='button' id = 'btn_" + i + "_" + book["id"] + "' class='btn " + borrowFunctions["btnClass"][j] + " btn-sm' onclick = '" + borrowFunctions["function"][j] + "(" + book["book_copy_id"] + ", " + book["book_id"] +", " + book["person_id"] + ")'>" + borrowFunctions["label"][j] + "</button>&nbsp;");
                }
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
            books_html.push("                           <td width = '40%' nowrap>");
            books_html.push("                               <i class='fa-regular fa-calendar-days'></i>&nbsp;Borrow Date&nbsp;:&nbsp;");
            if (book["borrow_status_id"] == 2 && borrowFunctions["overdue"].length > 0) {
                books_html.push("                                <span style = 'color:red'>" + book["borrow_date"] + "</span>");
            } else {
                books_html.push("                                <span>" + book["borrow_date"] + "</span>");
            }
            books_html.push("                           </td>");
            books_html.push("                           <td width = '40%' nowrap>");
            books_html.push("                               <i class='fa-regular fa-calendar-days'></i>&nbsp;Return Date&nbsp;:&nbsp;");
            if ((book["borrow_status_id"] == 3 ||  book["borrow_status_id"] == 4) && borrowFunctions["overdue"].length > 0) {
                books_html.push("                                <span style = 'color:red'>" + book["return_date"] + "</span>");
            } else {
                books_html.push("                                <span>" + book["return_date"] + "</span>");
            }
            books_html.push("                           </td>");
            books_html.push("                           <td width = '20%' nowrap>");
            if (borrowFunctions["overdue"].length > 0) {
                books_html.push("                                <span style = 'color:red'>" + borrowFunctions["overdue"] + "</span>");
            } else {
                books_html.push("                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
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
        books_html.push("</table>");
        $("#booksPane").html($("#booksPane").html() + books_html.join(""));
    }
    $("#startRow").val(parseInt($("#startRow").val()) + 20);
    fetching = false;
    if (doScrollTo) {
        document.getElementById("btn_" + scrollToElementId).scrollIntoView({block: "center", inline: "nearest"});
        doScrollTo = false;
    }
}

function addCopies(bookId) {
    copies = $("#selCopies").val();
    if (copies == "0") {
        alert("Please select the number of copies to add");
        return;
    }
    fetchData("/adminaddcopies", {"book_id": bookId, "num_copies": copies}, addCopiesSuccess, addCopiesFailed);
}

function addCopiesSuccess(data) {
    fetching = false;
    if (data["status"] == true) {
        showPane("successPane", data["num_copies"] + " copies of the book added successfully");
    } else {
        showPane("errorPane", "Error adding copies of the book");
    }
}

function addCopiesFailed(data) {
    fetching = false;
    showPane("errorPane", "Error adding copies of the book");
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

function recommendedBooksFetchFailed() {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Failed to fetch recommended books list");
    fetching = false;
}

function allMembersBorrowalsAdminFetchFailed() {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Failed to fetch borrowals list");
    fetching = false;
}

function memberBooksFetchFailed() {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Failed to fetch borrowed books list");
    fetching = false;
}

function memberBooksAdminFetchFailed() {
    showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Error", "Failed to fetch borrowed books list");
    fetching = false;
}

function fetchData(url, input, success_callback, error_callback) {
    if (fetching && (url == '/getbooks' || url == '/getallmembersborrowalsadmin')) {
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

function checkLimit(div) {
    if (booksCount >= 250) {
        if (!bookLoadAlertShown) {
            bookLoadAlertShown = true;
            showModal("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> Load Books", "Cannot load more books. Please refine your search criteria.");
        }
        return true;
    }

    return false;
}

function booksListScrolled(div) {
    if(div.scrollTop + div.clientHeight >= div.scrollHeight - 20) {
        if (checkLimit(div)) return;
        searchBooks(-1);
    }
}

function booksListScrolledABAdmin(div) {
    if(div.scrollTop + div.clientHeight >= div.scrollHeight - 20) {
        if (checkLimit(div)) return;
        searchBooksABAdmin(-1);
    }
}



