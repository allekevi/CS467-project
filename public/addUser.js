function addUser(id){
    var formdata = new FormData(document.getElementById("add-profile"));
    $.ajax({
        url: '/userHome/addProfile/' + id,
        type: 'PUT',
        data: formdata,
        success: function(result){
           window.location.replace('./')
        },
        contentType: false,
        processData: false
    })
};
