function doLogin() {
    if ($('#txt_user').val().trim() == "" || $('#txt_pwd').val().trim() == "") {
        $("#modalTitle").html("<i class='fa fa-solid fa-circle-xmark faicon' style = 'color:red'></i> User / Password");
        $("#modalBody").html("User Name and Password cannot be blank.");
        $('#appModal').modal();
        return false;
    }
    document.login_form.submit();
}

function showPane(paneId, message) {
    $("#" + paneId).html(message);
    $("#" + paneId).show();
}

function hidePane(paneId) {
    $("#" + paneId).hide();
}

function fetch_data(url, input, success_callback, error_callback) {
    $.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        data: input,
        success: function(data){
            alert("Success :" + data);
            //success_callback
        },
        error: function(error){
             alert("Error " + error);
        }
    });
}


